from pydantic import BaseModel, Field, ConfigDict;
from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Integer, Enum;
from sqlalchemy.dialects.postgresql import UUID, JSONB;
from sqlalchemy.orm import relationship;
from utils.db import Base;
import uuid;
from datetime import datetime, timezone;
from typing import Optional, List;
from pgvector.sqlalchemy import Vector;
import enum;

class Files(Base):
    __tablename__ = "files";
    id = Column(UUID(as_uuid=True), primary_key=True);
    user_id = Column(UUID(as_uuid=True), ForeignKey("auths.id", ondelete="CASCADE"));
    name = Column(String, nullable=False);
    hash = Column(String, unique=True, nullable=False);
    extension = Column(String);
    size = Column(Integer);
    status = Column(String);
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc));
    updated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc));

    auth = relationship("Auth", uselist=False);
    
class FilesModel(BaseModel):
    model_config = ConfigDict(from_attributes=True);
    id : uuid.UUID;
    user_id : uuid.UUID;
    name : str;
    hash : str | None;
    extension : str;
    size: int;
    status : Optional[str] = None;
    created_at : datetime=None;
    updated_at : datetime=None;
    
class ContentType(enum.Enum):
    TEXT = "TEXT";
    JSON = "JSON";
    
class FilesEmbedded(Base):
    __tablename__ = "files_embedded";
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4);
    file_id = Column(UUID(as_uuid=True), ForeignKey("files.id", ondelete="CASCADE"));
    user_id = Column(UUID(as_uuid=True), ForeignKey("auths.id", ondelete="CASCADE"));
    content = Column(Text, nullable=False);
    vector = Column(Vector(3072));
    content_type = Column(Enum(ContentType), nullable=False);
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc));
    updated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc));

class FilesEmbeddedModel(BaseModel):
    model_config = ConfigDict(from_attributes=True);
    id: uuid.UUID;
    file_id: uuid.UUID;
    user_id: uuid.UUID;
    content: str;
    vector: List[float];
    content_type: ContentType;
    created_at: datetime = None;
    updated_at: datetime = None;
