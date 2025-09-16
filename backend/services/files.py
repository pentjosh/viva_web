from fastapi.concurrency import run_in_threadpool;
from models.files import ( Files, FilesEmbedded, ContentType );
from uuid import UUID;
import uuid;
from utils.db import get_db_context;
from utils.env import ( MEDIA_DIR );
import os;
import aiofiles;
from utils.logger import logger;
from docx2pdf import convert;
from fpdf import FPDF;
import json;
from typing import List, Optional;
from utils.excel_extractor import generate_json_from_excel;
from utils.logger import logger;
import tempfile;
import fitz;
from google import genai;
from google.genai.types import EmbedContentConfig;
from google.api_core.client_options import ClientOptions;
from google.cloud import documentai;
from utils.env import ( GOOGLE_PROJECT_ID );
from langchain_text_splitters import RecursiveCharacterTextSplitter;
from collections import defaultdict
   
processor_location = "us";
processor_id = "bc10c236807ccdf0";
project_id = GOOGLE_PROJECT_ID;
location = "us-central1";

premium_features = documentai.OcrConfig.PremiumFeatures(
                                        compute_style_info=True,
                                        enable_math_ocr=False,
                                        enable_selection_mark_detection=True,
                                    );
ocr_config = documentai.OcrConfig(enable_native_pdf_parsing=True,
                                    enable_image_quality_scores=True,
                                    enable_symbol=True,
                                    premium_features=premium_features);

docai_client = documentai.DocumentProcessorServiceClient(client_options=ClientOptions(
    api_endpoint=f"{processor_location}-documentai.googleapis.com"
));

genai_client = genai.Client(
    vertexai=True,
    project=project_id,
    location=location
);

def create_file_in_db(file_id: UUID, user_id: UUID, filename: str, filehash: str, filetype: str, filesize: int) -> bool:
    try:
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
    except Exception as error:
        logger.error(f"Failed to create new file for user {user_id} with id {file_id}. Reason: {str(error)}");
        return False;

async def save_file_into_storage(file_id: UUID, user_id: UUID, content: bytes, ext: str) -> bool:
    try:
        store_filename = f"{file_id}.{ext}";
        upload_folder = f"{MEDIA_DIR}/{user_id}/upload";
        os.makedirs(upload_folder, exist_ok=True);
        file_path = f"{upload_folder}/{store_filename}";
        
        async with aiofiles.open(file_path, "wb") as f:
            await f.write(content);
        return True;
    except Exception as error:
        logger.error(f"Failed to save file for user {user_id} with id {file_id}. Reason: {str(error)}");
        return False;
    
async def get_file_by_id(file_id: UUID, user_id: UUID) -> Optional[Files]:
    with get_db_context() as db:
        file = db.query(Files).filter(Files.id == file_id, Files.user_id == user_id).first();
        
        if not file:
            return None;
        
        return file;

async def get_files_by_ids(file_ids: List[UUID], user_id: UUID) -> Optional[Files]:
    with get_db_context() as db:
        files = db.query(Files).filter(Files.id.in_(file_ids), Files.user_id == user_id).all();
        
        if not files:
            return [];
        
        return files;

async def get_files_completed_by_userid(user_id: UUID):
    with get_db_context() as db:
        files = db.query(Files).filter(Files.user_id == user_id, Files.status == "Completed").order_by(Files.updated_at.desc()).all();
        
        if not files:
            return [];
    
    return files;
    
async def get_files_by_userid(user_id: UUID):
    def db_query():
        with get_db_context() as db:
            files = db.query(Files).filter(Files.user_id == user_id).order_by(Files.updated_at.desc()).all();
            
            if not files:
                return [];
        
        return files;
    return await run_in_threadpool(db_query);

async def delete_file_by_id(user_id: UUID, id: UUID) -> bool:
    with get_db_context() as db:
        try:
            file = db.query(Files).filter_by(id=id, user_id=user_id).first();
            if not file:
                return False;
            file_path = f"{MEDIA_DIR}/{user_id}/upload/{file.id}.{file.extension}";
            
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
        
async def delete_file_from_storage(user_id: UUID, file_id: UUID, extension: str):
    file_path = f"{MEDIA_DIR}/{user_id}/upload/{file_id}.{extension}";
    if os.path.exists(file_path):
        os.remove(file_path);
        
async def cleanup_file_embedded(file_id: UUID, user_id: UUID):
    with get_db_context() as db:
        db.query(FilesEmbedded).filter(FilesEmbedded.file_id == file_id, FilesEmbedded.user_id == user_id).delete();
        db.commit();

async def upload_save_file(file_id: UUID, user_id: UUID, sanitized_filename: str, filehash: str, fileext: str, 
                            filesize: int, content: bytes) -> Optional[Files]:
    saved_file_into_storage = await save_file_into_storage(
        file_id = file_id,
        user_id = user_id,
        content = content,
        ext = fileext
    );
    
    if not saved_file_into_storage:
        logger.error(f"Failed to save file into storage for user {user_id} with id {file_id}");
        with get_db_context() as db:
            db.query(Files).filter(Files.id == file_id).delete();
            db.commit();
        return None;

    try:
        with get_db_context() as db:
            new_file = Files(
                id = file_id,
                user_id = user_id,
                name = sanitized_filename,
                hash = filehash,
                extension = fileext,
                size = filesize,
                status = "Processing"
            );
            db.add(new_file);
            db.commit();
            db.refresh(new_file);
            
            return new_file;
    except Exception as error:
        logger.error(f"Failed to create new file for user {user_id} with id {file_id}. Reason: {str(error)}");
        await delete_file_from_storage(user_id=user_id, file_id=file_id, extension=fileext);
        return None;

async def update_status_file(file_id: UUID, status: str):
    with get_db_context() as db:
        file = db.query(Files).filter(Files.id == file_id).first();
        
        file.status = status;
        db.commit();

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

async def save_file_embedded(file_id: UUID, user_id: UUID, content: str, content_type: ContentType, vector: Optional[List[float]]) -> Optional[FilesEmbedded]:
    try:
        with get_db_context() as db:
            new_file_embedded = FilesEmbedded(
                id = uuid.uuid4(),
                file_id = file_id,
                user_id = user_id,
                content = content,
                content_type = content_type,
                vector = vector
            );
            db.add(new_file_embedded);
            db.commit();
            db.refresh(new_file_embedded);
            return new_file_embedded;
    except Exception as error:
        logger.error(f"Failed to save embedded file for user {user_id} with id {file_id}. Reason: {str(error)}");
        return None;
    
def split_pdf_pages(pdf_bytes:bytes) -> None:
    pdf = fitz.open(stream=pdf_bytes);
    pages = [];

    for page in pdf:
        single_pdf = fitz.open()
        single_pdf.insert_pdf(pdf, from_page=page.number, to_page=page.number)
        page_bytes = single_pdf.tobytes()
        pages.append(page_bytes)

    return pages;

def docai_process_by_page(page_content: bytes):
    processor_name = docai_client.processor_path(project_id, processor_location, processor_id);

    process_options = documentai.ProcessOptions(ocr_config=ocr_config);
    raw_document = documentai.RawDocument(content=page_content, mime_type="application/pdf");
    request = documentai.ProcessRequest(name=processor_name, raw_document=raw_document, process_options=process_options);
    result = docai_client.process_document(request=request);
    return result.document;

def chunk_text(text: str):
    splitter = RecursiveCharacterTextSplitter(chunk_size=2000, chunk_overlap=0, length_function=len);
    chunks = splitter.split_text(text);
    return chunks;

def embed_text(text):    
    embed_config = EmbedContentConfig(
        task_type="RETRIEVAL_DOCUMENT", 
        output_dimensionality=3072
    );
    
    response = genai_client.models.embed_content(
                            model="gemini-embedding-001",
                            contents=text,
                            config=embed_config);
    return response.embeddings[0].values;

async def process_file_to_embed(file_id: UUID, user_id: UUID):
    await cleanup_file_embedded(file_id=file_id, user_id=user_id);
    
    file = await get_file_by_id(file_id=file_id, user_id=user_id);
    
    if not file:
        logger.error(f"File with id {file_id} not found in database.");
        await update_status_file(file_id=file_id, status="Failed");
        return;
    
    file_path = f"{MEDIA_DIR}/{file.user_id}/upload/{file.id}.{file.extension}";

    if not os.path.exists(file_path):
        logger.error(f"File with id {file_id} not found in storage at {file_path}.");
        await update_status_file(file_id=file_id, status="Failed");
        return;

    async with aiofiles.open(file_path, "rb") as f:
        file_bytes = await f.read();
        file_name = f.name;
    
    try:
        if file.extension.lower() == "xlsx":
            content = await run_in_threadpool(generate_json_from_excel,file_bytes=file_bytes, file_name=file_name);
        
            filed = await save_file_embedded(
                file_id=file.id, 
                user_id=file.user_id, 
                content=content, 
                content_type=ContentType.JSON, 
                vector=None
            );
            
            if not filed:
                logger.error(f"Failed to save embedded file for user {file.user_id} with id {file.id}.");
                await update_status_file(file_id=file.id, status="Failed");
                await cleanup_file_embedded(file_id=file_id, user_id=user_id);
                return;
            
        if file.extension.lower() in ["docx", "pdf", "txt"]:
            if file.extension.lower() == "docx":
                pdf_bytes = await run_in_threadpool(convert_docx_to_pdf,file_bytes=file_bytes);
            elif file.extension.lower() == "txt":
                pdf_bytes = await run_in_threadpool(convert_txt_to_pdf,file_bytes=file_bytes);
            elif file.extension.lower() == "pdf":
                pdf_bytes = file_bytes;
            
            pages_bytes = await run_in_threadpool(split_pdf_pages,pdf_bytes=pdf_bytes);
            
            all_texts = [];
            for _, page_content in enumerate(pages_bytes):
                document = await run_in_threadpool(docai_process_by_page,page_content=page_content);
                all_texts.append(document.text);
                
            all_texts = "".join(all_texts);
                            
            chunks = await run_in_threadpool(chunk_text,text=all_texts);
            for chunk in chunks:
                # vector = await run_in_threadpool(embed_text,text=chunk);
                filed = await save_file_embedded(
                    file_id=file.id, 
                    user_id=file.user_id, 
                    content=chunk, 
                    content_type=ContentType.TEXT, 
                    vector=None
                );

                if not filed:
                    logger.error(f"Failed to save embedded file for user {file.user_id} with id {file.id}.");
                    await update_status_file(file_id=file.id, status="Failed");
                    await cleanup_file_embedded(file_id=file_id, user_id=user_id);
                    return;
            
        await update_status_file(file_id=file_id, status="Completed");
        print(f"File with id {file_id} processed successfully.");
    except Exception as error:
        logger.error(f"Failed to process file with id {file_id}. Reason: {str(error)}");
        await update_status_file(file_id=file_id, status="Failed");
        await cleanup_file_embedded(file_id=file_id, user_id=user_id);
        return;


async def retrieve_files_content(user_id: UUID, file_ids: List[UUID]):
    with get_db_context() as db:
        files = (db.query(Files.name, FilesEmbedded.content, FilesEmbedded.content_type)
        .join(FilesEmbedded, Files.id == FilesEmbedded.file_id)
        .filter(Files.id.in_(file_ids), Files.user_id == user_id)
        .all());
        #print(files)
        agregrated_rows = defaultdict(str);
        for name, content, content_type in files:
            agregrated_rows[name] += content + "\n";
        
        final_output = [];
        
        for file_name, contents in agregrated_rows.items():
            final_output.append({
                "file_name": file_name,
                "content": contents
            });
        
        return final_output;