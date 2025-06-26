import uuid;
from datetime import datetime, timedelta, timezone;
import services.users;
from utils.db import get_db_context;
from models.auths import ( Auth, AuthModel );
from models.users import ( User, UserModel );
from services.users import ( get_user_by_id );
from utils.env import ( TOKEN_ALGORITHM, ACCESS_SECURITY_KEY, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_SECURITY_KEY, REFRESH_TOKEN_EXPIRE_MINUTES );
from typing import Optional;
import services;
from utils.enc import ( encrypt, decrypt );
from fastapi import Depends, HTTPException, status, Request;
from jose import jwt, JWTError;
from utils.logger import logger;
from utils.constants import ERROR_MESSAGES;
#from fastapi.security import OAuth2PasswordBearer;

#oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token");

def create_access_token(data:dict) -> str:
    payload = data.copy();

    expires_delta = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES);
    payload.update({"exp": expires_delta});
        
    jwt_encoded = jwt.encode(payload, ACCESS_SECURITY_KEY, algorithm=TOKEN_ALGORITHM);
    return jwt_encoded;

def create_refresh_token(data:dict) -> str:
    payload = data.copy();

    expires_delta = datetime.now(timezone.utc) + timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES);
    payload.update({"exp": expires_delta});
        
    jwt_encoded = jwt.encode(payload, REFRESH_SECURITY_KEY, algorithm=TOKEN_ALGORITHM);
    return jwt_encoded;

def decode_access_token(token:str) -> Optional[dict]:
    try:
        decoded = jwt.decode(token, ACCESS_SECURITY_KEY, algorithms=[TOKEN_ALGORITHM]);
        return decoded;
    except JWTError:
        logger.warning(str(JWTError));
        return None;
    
def decode_refresh_token(token:str) -> Optional[dict]:
    try:
        decoded = jwt.decode(token, REFRESH_SECURITY_KEY, algorithms=[TOKEN_ALGORITHM]);
        return decoded;
    except JWTError:
        logger.warning(str(JWTError));
        return None;

def verify_password(plain_password:str, hashed_password:str) -> bool:
    return encrypt(plain_password) == hashed_password;

def authenticate_user(email:str, password:str) :
    try:
        with get_db_context() as db:
            auth = db.query(Auth).filter_by(email=email, active=True).first();
            user = get_user_by_id(auth.id);
            
            if not user:
                return None;
            
            if not verify_password(password, auth.password):
                return None;
            
            return user;
    except Exception:
        return None;
    
def get_current_user(request: Request) -> Optional[UserModel]:
    token = request.cookies.get("access_token");
    
    try:
        if token:
            payload = decode_access_token(token);
            if not payload:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=ERROR_MESSAGES.NOT_FOUND,
                    headers={"WWW-Authenticate": "Bearer"}
                );
                
            userid = payload.get("sub");
            
            if not userid:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=ERROR_MESSAGES.NOT_FOUND,
                    headers={"WWW-Authenticate": "Bearer"}
                );
                
            user = get_user_by_id(userid);
            return user;
    
    except JWTError as e:
        logger.warning(str(e));
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ERROR_MESSAGES.INVALID_TOKEN,
            headers={"WWW-Authenticate": "Bearer"}
        );
    

def insert_new_auth(email:str, password:str, first_name:str, last_name:str, role:int):
    with get_db_context() as db:
        id = str(uuid.uuid4());
        auth_validate = AuthModel(**{
            "id": id,
            "email": email,
            "password": password,
            "active": True
        });
        auth = Auth(**auth_validate.model_dump());
        db.add(auth);
        db.commit();
        db.refresh(auth);
        services.users.insert_new_user(db, id, first_name, last_name, role);
