from fastapi import APIRouter, Depends, HTTPException, status;
from models.chats import ( ChatRequest, ChatModel );
from services.auths import ( get_current_user );
from services.chats import ( chat_handler, get_chats_by_user_id );
from typing import List;
from utils.constants import ERROR_MESSAGES;

router = APIRouter();

@router.post("/chat/generate", response_model=ChatModel)
async def generate_chat(request: ChatRequest, user = Depends(get_current_user)) -> ChatModel:
    chat = chat_handler(user_id=user.id, 
                        content=request.content, 
                        chat_id=request.chat_id);
    if not chat:
        raise HTTPException(status_code=500, detail="An error occurred while processing your request.");
    return chat;

@router.get("/chat/history", response_model=List[ChatModel])
async def get_user_chat_history(user = Depends(get_current_user)) -> List[ChatModel]:

    history = get_chats_by_user_id(user.id);
    
    if history is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ERROR_MESSAGES.NOT_FOUND,
            headers={"WWW-Authenticate": "Bearer"},
        );

    return history;

# @router.get("/chat/history", response_model=List[ChatHistory])
# async def get_user_chat_history(user = Depends(get_current_user)):
#     with get_db_context() as db:
#         chats = db.query(Chat).filter_by(user_id=user.id,archived=False).order_by(Chat.updated_at.desc()).all();
#         return chats;
