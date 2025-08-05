from services.files import ( create_new_file, 
                            get_content_file, 
                            get_files_by_userid,
                            delete_file_by_id,
                            );
from services.auths import ( get_current_user );
from models.files import ( FilesModel, Files );
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status, Form;
from utils.db import get_db_context;
from utils.constants import ERROR_MESSAGES;
from typing import List;
import os;
import uuid;
import json;

router = APIRouter();

@router.post("/files/upload", response_model=FilesModel)
async def upload_file(file: UploadFile = File(...), user = Depends(get_current_user)):
    filehash, new_id, content = await get_content_file(file, user.id);
    
    with get_db_context() as db:
        existing_file = db.query(Files).filter(Files.user_id==user.id, Files.hash==filehash).first();
    
    if existing_file:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ERROR_MESSAGES.FILE_EXISTS,
            headers={"WWW-Authenticate": "Bearer"},
        );
    
    sanitized_filename = os.path.basename(file.filename);
    print(file.filename);
    new_file = create_new_file(
        id = new_id,
        user_id = user.id, 
        filename = sanitized_filename,
        filehash = filehash,
        filetype = os.path.splitext(file.filename)[1].lstrip(".").lower(),
        filesize = file.size
        );
    
    return new_file;

@router.get("/files/", response_model=List[FilesModel])
async def get_files_by_user(user=Depends(get_current_user)):
    files = get_files_by_userid(user_id=user.id);
    if not files:
        return []
    return files;

@router.delete("/files/delete/{file_id}")
async def delete_file(file_id:uuid.UUID, user = Depends(get_current_user)) -> bool:
    return delete_file_by_id(user_id=user.id, id=file_id);


@router.post("/files/upload_test")
async def upload_file_test(file: UploadFile = File(...), user = Depends(get_current_user)):
    content = await file.read();
    filename = file.filename;
    file_id = uuid.uuid4();
    