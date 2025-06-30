from pydantic import BaseModel, Field;
from utils.db import Base;
from sqlalchemy import Column, String, Text, DateTime, Integer;
from pgvector.sqlalchemy import Vector;
from sqlalchemy.dialects.postgresql import UUID, JSONB;
import uuid;
from datetime import datetime, timezone;

class RAG_DOC(Base):
    __tablename__ = "rag_documents";
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4);
    doc_name = Column(Text);
    doc_page = Column(Integer);
    doc_page_data = Column(Text);
    doc_chunk_number = Column(Integer);
    doc_chunk_data = Column(Text);
    doc_embedded = Column(Vector(3072));
    doc_type = Column(Integer);
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc));
