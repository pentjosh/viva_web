from fastapi import APIRouter, Depends, HTTPException, status, Query;
from models.chats import ( ChatRequest, ChatResponse, ChatSummary );
from services.auths import ( get_current_user );
from services.chats import ( chat_handler, get_all_chats_by_user_id, get_chat_by_id, delete_chat_by_id );
from typing import List;
from utils.constants import ERROR_MESSAGES;
import uuid;

router = APIRouter();

@router.post("/chat/generate", response_model=ChatResponse)
async def generate_chat(request: ChatRequest, user = Depends(get_current_user)) -> ChatResponse:
    chat = await chat_handler(user_id=user.id, 
                        content = request.content, 
                        chat_id = request.chat_id,
                        chat_type = request.chat_type,
                        file_ids = request.file_ids,
                        web_search = request.web_search);
    if not chat:
        raise HTTPException(status_code=500, detail="An error occurred while processing your request.");
    return chat;

@router.get("/chat/summary", response_model=List[ChatSummary])
async def get_user_chat_history(skip:int = Query(0, ge=0),limit:int = Query(5, ge=1),user = Depends(get_current_user)) -> List[ChatSummary]:
    history = get_all_chats_by_user_id(user.id, skip=skip, limit=limit);
    if history is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ERROR_MESSAGES.NOT_FOUND,
            headers={"WWW-Authenticate": "Bearer"},
        );
    return history;

@router.get("/chat/{chat_id}", response_model=ChatResponse)
async def get_user_chat_by_id(chat_id: uuid.UUID, user = Depends(get_current_user)) -> ChatResponse:
    chat = get_chat_by_id(chat_id=chat_id, user_id=user.id);
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ERROR_MESSAGES.NOT_FOUND,
            headers={"WWW-Authenticate": "Bearer"},
        );
    return chat;

@router.delete("/chat/delete/{chat_id}", response_model=bool)
async def delete_user_chat_by_id(chat_id: uuid.UUID, user = Depends(get_current_user)) -> bool:
    return delete_chat_by_id(chat_id=chat_id, user_id=user.id);