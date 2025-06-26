from models.auths import ( SigninRequest, Token );
from models.users import ( UserSession );
from services.auths import ( authenticate_user, create_access_token, create_refresh_token, decode_access_token, get_current_user );
from fastapi import APIRouter, Depends, HTTPException, status, Request;
from utils.constants import ERROR_MESSAGES;
from fastapi.responses import Response;
from utils.env import ( ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_MINUTES );
from datetime import datetime, timezone;
from utils.logger import logger;

router = APIRouter();

@router.post("/auth/signin", response_model=UserSession)
async def signin(request: SigninRequest, response: Response):
    user = authenticate_user(request.email, request.password);
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ERROR_MESSAGES.INVALID_TOKEN,
            headers={"WWW-Authenticate": "Bearer"},
        );
    
    access_token = create_access_token(data={"sub": str(user.id)});
    refresh_token = create_refresh_token(data={"sub": str(user.id)});
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        secure=False
    );
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_MINUTES * 60,
        secure=False
    );
    
    return UserSession(
        access_token=access_token,
        token_type="bearer",
        **user.model_dump()
    );
    
@router.get("/auth", response_model=UserSession)
async def get_session_user(request: Request, response: Response, user = Depends(get_current_user)):
    token = request.cookies.get("access_token");
    payload = decode_access_token(token) if token else None; 
    expires_at = payload["exp"] if payload else None;
    
    if not payload or not expires_at or expires_at < int(datetime.now(timezone.utc).timestamp()):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ERROR_MESSAGES.INVALID_TOKEN,
            headers={"WWW-Authenticate": "Bearer"},
        );
        
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        secure=False
    )
    
    return UserSession(
        access_token=token,
        token_type="bearer",
        **user.model_dump()
    );
    
@router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token");
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ERROR_MESSAGES.INVALID_REFRESH_TOKEN,
            headers={"WWW-Authenticate": "Bearer"},
        );
    
    try:
        payload = decode_access_token(token);
        user_id = payload.get("sub");
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=ERROR_MESSAGES.INVALID_REFRESH_TOKEN,
                headers={"WWW-Authenticate": "Bearer"},
            );
        
        access_token = create_access_token(data={"sub": user_id});
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            samesite="Lax",
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            secure=False
        );
        
        return Token(
            access_token=access_token,
            token_type="bearer"
        );
    
    except Exception as e:
        logger.warning(str(e));
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ERROR_MESSAGES.INVALID_REFRESH_TOKEN,
            headers={"WWW-Authenticate": "Bearer"},
        );


@router.post("/auth/signout")
async def signout(response: Response):
    response.delete_cookie("access_token");
    response.delete_cookie("refresh_token");
    return {"message": "Successfully signed out."};


