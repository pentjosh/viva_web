from models.files import ( Files, FilesEmbedding );
from uuid import UUID;
import uuid;
from utils.db import get_db_context;
from fastapi import UploadFile;
from typing import Tuple;
from utils.env import ( MEDIA_DIR );
import hashlib;
import os;
import aiofiles;
from utils.logger import logger;
import tempfile;
from docx2pdf import convert;
from fpdf import FPDF;
from google import genai;
from google.genai.types import EmbedContentConfig;
from google.api_core.client_options import ClientOptions;
from google.cloud import documentai;
from langchain_text_splitters import RecursiveCharacterTextSplitter;
import fitz;
import json;
from utils.env import ( 
    GOOGLE_VERTEX_CREDENTIAL, 
    GOOGLE_CHAT_MODEL, 
    GOOGLE_VERTEX_LOCATION, 
    GOOGLE_PROJECT_ID
);
from typing import List;
from utils.excel_extractor import ExcelExtractor;

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GOOGLE_VERTEX_CREDENTIAL;

processor_location = "us";
project_id = GOOGLE_PROJECT_ID;
location = GOOGLE_VERTEX_LOCATION;
processor_id = "35f704f81dc28477";

def create_new_file(file_id: UUID, user_id: UUID, filename: str, filehash: str, filetype: str, filesize: int):
    with get_db_context() as db:
        new_file = Files(
            id = file_id,
            user_id = user_id,
            name = filename,
            hash = filehash,
            type = filetype,
            size = filesize,
            status = "Processing"
        );
        db.add(new_file);
        db.commit();
        db.refresh(new_file);
        
        return new_file;

async def get_content_file(file: UploadFile, user_id: UUID) -> Tuple[str, bytes]:
    content = await file.read();
    _, ext = os.path.splitext(file.filename);
    new_id = uuid.uuid4();
    new_filename = f"{new_id}{ext}";

    upload_folder = f"{MEDIA_DIR}/{user_id}/upload";
    os.makedirs(upload_folder, exist_ok=True);
    file_path = f"{upload_folder}/{new_filename}";
    filehash = hashlib.sha256(content).hexdigest();
    
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content);
        
    return filehash, new_id, content;

def get_files_by_userid(user_id: UUID):
    with get_db_context() as db:
        files = db.query(Files).filter(Files.user_id == user_id).order_by(Files.updated_at.desc()).all();
        
        if not files:
            return None;
        
        return files;

def delete_file_by_id(user_id: UUID, id: UUID) -> bool:
    with get_db_context() as db:
        try:
            file = db.query(Files).filter_by(id=id, user_id=user_id).first();
            if not file:
                print("1")
                return False;
            file_path = f"{MEDIA_DIR}/{user_id}/upload/{file.id}.{file.type}";
            
            if not os.path.exists(file_path):
                db.delete(file);
                db.commit();
                return True;
            
            db.delete(file);
            os.remove(file_path);
            db.commit();
            
            return True;
        except Exception as error:
            logger.error(f"Failed to delete file with id = {id}");
            db.rollback();
            print(f"Error : {str(error)}")
            return False;

def convert_docx_to_pdf(file_bytes: bytes) -> bytes:
    with tempfile.TemporaryDirectory() as temp_dir:
        docx_path = os.path.join(temp_dir, "input.docx")
        pdf_path = os.path.join(temp_dir, "output.pdf")

        with open(docx_path, "wb") as f:
            f.write(file_bytes)

        convert(docx_path, pdf_path)

        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()

    return pdf_bytes;

def convert_txt_to_pdf(file_bytes: bytes) -> bytes:
    pdf = FPDF();
    pdf.add_page();
    pdf.set_font("helvetica", size=10);
    
    try:
        content = file_bytes.decode("utf-8");
    except UnicodeDecodeError:
        content = file_bytes.decode("latin-1");
    
    pdf.multi_cell(0,10,text=content);
    pdf_bytes = pdf.output();
    return pdf_bytes;

def split_pdf_pages(pdf_bytes:bytes) -> None:
    pdf = fitz.open(stream=pdf_bytes);
    pages = [];

    for page in pdf:
        single_pdf = fitz.open()
        single_pdf.insert_pdf(pdf, from_page=page.number, to_page=page.number)
        page_bytes = single_pdf.tobytes()
        pages.append(page_bytes)

    return pages;

async def docai_process_by_page(page_content: bytes):
    docai_client = documentai.DocumentProcessorServiceClient(client_options=ClientOptions(
        api_endpoint=f"{processor_location}-documentai.googleapis.com"
    ));

    processor_name = docai_client.processor_path(project_id, processor_location, processor_id);

    process_options = documentai.ProcessOptions(
        layout_config=documentai.ProcessOptions.LayoutConfig(
            chunking_config=documentai.ProcessOptions.LayoutConfig.ChunkingConfig(
                chunk_size=500,
                include_ancestor_headings=True,
            )
        )
    );
    raw_document = documentai.RawDocument(content=page_content, mime_type="application/pdf");
    request = documentai.ProcessRequest(name=processor_name, raw_document=raw_document, process_options=process_options);
    result = docai_client.process_document(request=request);
    return result.document;

async def embedding_text(text):
    genai_client = genai.Client(
            vertexai=True,
            project=project_id,
            location=location
        );
    
    embed_config = EmbedContentConfig(
        task_type="RETRIEVAL_DOCUMENT", 
        output_dimensionality=3072
    );
    response = genai_client.models.embed_content(
                            model="gemini-embedding-001",
                            contents=text,
                            config=embed_config);
    return response.embeddings[0].values;

def insert_vector_data(files_id: UUID, user_id: UUID, chunks: str, vector: List[float] = None):
    with get_db_context() as db:
        vdb = FilesEmbedding(
            files_id = files_id,
            user_id = user_id,
            chunks = chunks,
            vector = vector
        );
        db.add(vdb);
        db.commit();
        db.refresh(vdb);

async def save_file_storage(file_id: UUID, user_id: UUID, content: bytes, type: str) :
    new_filename = f"{file_id}{type}";

    upload_folder = f"{MEDIA_DIR}/{user_id}/upload";
    os.makedirs(upload_folder, exist_ok=True);
    file_path = f"{upload_folder}/{new_filename}";
    
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content);

async def process_documents(file_id: UUID, user_id: UUID, filename: str, filehash: str, filetype: str, filesize: int, content: bytes):
    if type == 'xlsx':
        excel_extractor = ExcelExtractor(file_bytes=content, file_name=filename);
        data_extracted = excel_extractor.generate_json_from_excel();
    
    create_new_file(
        id = file_id,
        user_id = user_id, 
        filename = filename,
        filehash = filehash,
        filetype = filetype,
        filesize = filesize);
    
    save_file_storage(
        id = file_id,
        user_id=user_id,
        content=content,
        type=filetype
    );
    
    