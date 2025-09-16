from pydantic import BaseModel, Field, ConfigDict;
from utils.db import Base;
from typing import Literal, List;
from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, Enum;
from sqlalchemy.dialects.postgresql import UUID, JSONB;
from sqlalchemy.orm import relationship;
import uuid;
from datetime import datetime, timezone;
from typing import Optional, Union, TypedDict;
from models.files import FilesModel;
import enum;

class ChatType(str, enum.Enum):
    general = "general";
    audit = "audit";

class Chat(Base):
    __tablename__ = "chats";
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4);
    user_id = Column(UUID(as_uuid=True), ForeignKey("auths.id", ondelete="CASCADE"));
    title = Column(Text);
    type = Column(Enum(ChatType), nullable=False);
    messages = Column(JSONB);
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc));
    updated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc));
    
    auth = relationship("Auth", uselist=False);

class BaseMessage(BaseModel):
    content: str;
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc));

class UserMessage(BaseMessage):
    role: Literal["user"];
    files: Optional[List[FilesModel]] = Field(default_factory=list);

class ModelMessage(BaseMessage):
    role: Literal["model"];

ChatMessage = Union[UserMessage, ModelMessage];
    
class ChatResponse(BaseModel):
    id: uuid.UUID;
    user_id: uuid.UUID;
    title: str;
    type: str;
    messages: List[ChatMessage];
    created_at: Optional[datetime] = None;
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True);
    
class ChatRequest(BaseModel):
    content: str = Field(..., min_length=1);
    chat_id: Optional[uuid.UUID] = None;
    file_ids: Optional[List[uuid.UUID]] = Field(default_factory=list);
    chat_type: Optional[ChatType] = None;
    web_search: Optional[bool] = False;
    
class ChatSummary(BaseModel):
    id: uuid.UUID;
    title: str;
