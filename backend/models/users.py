from utils.db import Base;
from sqlalchemy import Column, String, Text, BigInteger, DateTime, ForeignKey;
from sqlalchemy.dialects.postgresql import UUID;
from sqlalchemy.orm import relationship;
from pydantic import BaseModel, ConfigDict;
from typing import Optional;
from datetime import datetime, timezone;
from typing import Optional, Union;
import uuid;

class User(Base):
    __tablename__ = "user";
    id = Column(UUID(as_uuid=True), ForeignKey("auths.id", ondelete="CASCADE"), primary_key=True, default=uuid.uuid4);
    first_name = Column(String);
    last_name = Column(String, nullable=True);
    role = Column(BigInteger);
    profile_image_url = Column(Text, nullable=True);
    last_active_at = Column(BigInteger, nullable=True);
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc));
    updated_at = Column(DateTime(timezone=True), nullable=True, onupdate=lambda: datetime.now(timezone.utc));
    
    auth = relationship("Auth", uselist=False);
    
    
class UserRole(Base):
    __tablename__ = "user_role";
    id = Column(BigInteger, primary_key=True, autoincrement=True);
    name = Column(Text, nullable=False);
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc));
    updated_at = Column(DateTime(timezone=True), nullable=True, onupdate=lambda: datetime.now(timezone.utc));

class UserModel(BaseModel): 
    id: uuid.UUID;
    email: str;
    first_name: str;
    last_name: str;
    role: int;
    profile_image_url: Optional[str] = None;
    last_active_at: Optional[datetime] = None;
    created_at: Optional[datetime] = None;
    updated_at: Optional[datetime] = None;
    
    model_config = ConfigDict(from_attributes=True);

class UserSession(BaseModel):
    access_token: str
    token_type: str
    id: uuid.UUID;
    email: str;
    first_name: str;
    last_name: str;
    role: int;
    profile_image_url: Optional[str] = None;
    last_active_at: Optional[datetime] = None;
    created_at: Optional[datetime] = None;
    updated_at: Optional[datetime] = None;
    