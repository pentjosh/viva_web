from services.files import (get_files_by_userid,
                            delete_file_by_id,
                            upload_save_file,
                            process_file_to_embed,
                            get_files_completed_by_userid);
from services.auths import ( get_current_user );
from models.files import ( FilesModel, Files );
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status, Form;
from utils.db import get_db_context;
from utils.constants import ERROR_MESSAGES;
from typing import List, Optional;
import os;
import uuid;
import json;
import hashlib;
from utils.scheduler import get_scheduler;
from utils.env import ALLOWED_FILE_EXTENSIONS;

router = APIRouter();

@router.get("/files", response_model=List[FilesModel])
async def get_files_by_user(user=Depends(get_current_user)):
    files = await get_files_by_userid(user_id=user.id);
    if not files:
        return []
    return files;

@router.get("/files/completed", response_model=List[FilesModel])
async def get_files_completed_by_user(user=Depends(get_current_user)):
    files = await get_files_completed_by_userid(user_id=user.id);
    if not files:
        return []
    return files;

@router.post("/files/upload", response_model=FilesModel)
async def upload_file(file: UploadFile = File(...), user = Depends(get_current_user), scheduler=Depends(get_scheduler)):
    content = await file.read();
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ERROR_MESSAGES.FILE_EMPTY,
            headers={"WWW-Authenticate": "Bearer"},
        );
    
    file_id = uuid.uuid4();
    filename = file.filename;
    sanitized_filename = os.path.basename(filename);
    filehash = hashlib.sha256(content).hexdigest();
    filesize = file.size;
    fileext = os.path.splitext(file.filename)[1].lstrip(".").lower();
    
    if fileext not in ALLOWED_FILE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=ERROR_MESSAGES.FILE_EXTENSION_NOT_ALLOWED,
            headers={"WWW-Authenticate": "Bearer"},
        );
    
    with get_db_context() as db:
            existing_file = db.query(Files).filter(Files.user_id==user.id, Files.hash==filehash).first();
            if existing_file:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=ERROR_MESSAGES.FILE_EXISTS,
                    headers={"WWW-Authenticate": "Bearer"},
                );
                
    uploaded_file = await upload_save_file(
        file_id = file_id,
        user_id = user.id,
        sanitized_filename = sanitized_filename,
        filehash = filehash,
        fileext = fileext,
        filesize = filesize,
        content = content
    );
    
    if not uploaded_file:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.FILE_UPLOAD_FAILED,
            headers={"WWW-Authenticate": "Bearer"},
        );
    
    scheduler.add_job(process_file_to_embed, args=[file_id, user.id]);
    return uploaded_file;

@router.delete("/files/delete/{file_id}")
async def delete_file(file_id:uuid.UUID, user = Depends(get_current_user)) -> bool:
    return await delete_file_by_id(user_id=user.id, id=file_id);

@router.post("/files/process/{file_id}")
async def process_file(file_id: uuid.UUID, user = Depends(get_current_user), scheduler=Depends(get_scheduler)):
    with get_db_context() as db:
        file = db.query(Files).filter(Files.id==file_id, Files.user_id==user.id).first();
        if not file:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=ERROR_MESSAGES.NOT_FOUND,
                headers={"WWW-Authenticate": "Bearer"},
            );
    
    scheduler.add_job(process_file_to_embed, args=[file_id, user.id]);
    return {"message": "File processing started."};