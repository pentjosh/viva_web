from pydantic import BaseModel, Field;
from pydantic import ConfigDict;
from utils.db import Base;
from typing import Literal, List;
from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey;
from sqlalchemy.dialects.postgresql import UUID, JSONB;
from sqlalchemy.orm import relationship;
import uuid;
from datetime import datetime, timezone;
from typing import Optional, Union;

class Chat(Base):
    __tablename__ = "chats";
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4);
    user_id = Column(UUID(as_uuid=True), ForeignKey("auth.id", ondelete="CASCADE"));
    title = Column(Text);
    meta = Column(JSONB);
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc));
    updated_at = Column(DateTime(timezone=True), nullable=True, onupdate=lambda: datetime.now(timezone.utc));
    archived = Column(Boolean, default=False);
    pinned = Column(Boolean, default=False, nullable=True);
    
    auth = relationship("Auth", uselist=False);
    
    @property
    def messages(self) -> list['ChatMessage']:
        if self.meta and "messages" in self.meta:
            #return [ChatMessage(**msg) for msg in self.meta.get("messages", [])];
            return self.meta['messages'];
        return [];
    
class ChatMessage(BaseModel):
    role: Literal['user','model'];
    content: str;
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc));
    
class ChatModel(BaseModel):
    id: uuid.UUID;
    user_id: uuid.UUID;
    title: str;
    messages: List[ChatMessage];
    created_at: Optional[datetime] = None;
    updated_at: Optional[datetime] = None;
    archived: bool=False;
    pinned: Optional[bool]=False;
    
    model_config = ConfigDict(from_attributes=True);
    
class ChatRequest(BaseModel):
    content: str = Field(..., min_length=1);
    chat_id: Optional[uuid.UUID] = None;
    
