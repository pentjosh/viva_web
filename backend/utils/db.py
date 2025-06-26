from .env import DATABASE_URL;
from fastapi import Depends;
from sqlalchemy import create_engine;
from sqlalchemy.ext.declarative import declarative_base;
from sqlalchemy.orm import scoped_session, sessionmaker, Session;
from contextlib import contextmanager;
from typing import Annotated;

engine = create_engine(DATABASE_URL);
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, expire_on_commit=False);
Base = declarative_base();
Session = scoped_session(SessionLocal);

def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close();
        
get_db_context = contextmanager(get_session);
