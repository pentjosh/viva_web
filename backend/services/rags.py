import psycopg2;
from vertexai.language_models import TextEmbeddingModel, TextEmbeddingInput
from utils.logger import logger
from utils.env import (DB_HOST, DB_NAME, DB_PWD, DB_UNM, GOOGLE_EMBEDDING_MODEL, DB_PORT, GOOGLE_VERTEX_CREDENTIAL,GOOGLE_PROJECT_ID, GOOGLE_VERTEX_LOCATION);
from google.oauth2 import service_account;
import vertexai;
from utils.enc import ( encrypt, decrypt );

credentials = service_account.Credentials.from_service_account_file(GOOGLE_VERTEX_CREDENTIAL)
vertexai.init(credentials=credentials, project=GOOGLE_PROJECT_ID, location=GOOGLE_VERTEX_LOCATION);

embed_model = TextEmbeddingModel.from_pretrained(GOOGLE_EMBEDDING_MODEL);

def get_embed_text(text: str, task_type:str = "RETRIEVAL_DOCUMENT") -> list[float]:
    text_input = TextEmbeddingInput(text, task_type=task_type);
    embedding = embed_model.get_embeddings([text_input], output_dimensionality=3072);
    text_embedded = embedding[0].values;
    return text_embedded;

def retrieve_context_from_db(embedding: list[float], doc_type: int, top_n=25) -> str:
    if not embedding:
        return None;
    try:
        conn = psycopg2.connect(
            dbname = DB_NAME,
            user = DB_UNM,
            password = decrypt(DB_PWD),
            host = DB_HOST,
            port = DB_PORT
        );
        cursor = conn.cursor();
        query = """
            SELECT doc_chunk_data
            FROM rag_documents
            WHERE doc_type = %s
            ORDER BY doc_embedded <=> %s::vector
            LIMIT %s;
        """;
        cursor.execute(query, (doc_type, embedding, top_n));
        results = cursor.fetchall();
        
        if not results:
            return None
        
        context_text = "\n---\n".join(doc[0] for doc in results);
        return context_text;
    
    except Exception as e:
        logger.warning(f"Database retrieval error : {e}");
        return None;
    finally:
        if conn: conn.close();
        if cursor: cursor.close();