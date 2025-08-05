from utils.db import Base;
from pydantic import BaseModel, ConfigDict;
from sqlalchemy import Boolean, Column, String, Text, DateTime;
from sqlalchemy.dialects.postgresql import UUID;
import uuid;
from datetime import datetime, timezone;
from typing import Optional;

class Auth(Base):
    __tablename__ = "auths";
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4);
    email = Column(String, unique=True);
    password = Column(Text);
    active = Column(Boolean, default=True);
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc));
    updated_at = Column(DateTime(timezone=True), nullable=True, onupdate=lambda: datetime.now(timezone.utc));
    
class AuthModel(BaseModel):
    model_config = ConfigDict(from_attributes=True);
    id: uuid.UUID;
    email: str;
    password: Optional[str] = None;
    active: bool;
    created_at: Optional[datetime] = None;
    updated_at: Optional[datetime] = None;
    
class Token(BaseModel):
    access_token: str
    token_type: str
    
class SigninRequest(BaseModel):
    email: str
    password: str