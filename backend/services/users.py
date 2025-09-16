from models.users import ( User, UserRole, UserModel );
from datetime import datetime, timezone;
from utils.db import Base, get_db_context;
from typing import Optional;
from models.auths import ( Auth );

def get_user_by_id(id:str) -> Optional[UserModel]:
    try:
        with get_db_context() as db:
            auth = db.query(Auth).filter_by(id=id, active=True).first();
            user = db.query(User).filter_by(id=id).first();
            
            if not auth or not user :
                return None;
            
            return UserModel(
                id=auth.id,
                email=auth.email,
                first_name=user.first_name,
                last_name=user.last_name,
                role=user.role,
                profile_image_url=user.profile_image_url,
                last_active_at=user.last_active_at,
                created_at=user.created_at,
                updated_at=user.updated_at
                );
    except Exception:
        return None;

def insert_new_role(name:str):
    with get_db_context() as db:
        role = UserRole(**{
            "name": name
        });
        db.add(role);
        db.commit();
        db.refresh(role);

def create_new_user(email, password, first_name:str, last_name:str, role:int) :
    with get_db_context() as db:
        
        auth = Auth(email=email, password=password, active=True);
        user = User(first_name=first_name, last_name=last_name, role=role);
        
        user.auth = auth;
        
        db.add(auth);
        db.add(user);
        db.commit();
        db.refresh(auth);
        db.refresh(user);
    