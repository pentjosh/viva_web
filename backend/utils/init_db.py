import importlib;
import pkgutil;
import models.auths;
import models.users;
import services.auths
import services.users;
from .db import ( Base, engine, get_db_context );
import models;
import services;
from sqlalchemy import inspect;
from utils.enc import ( encrypt, decrypt );

inspector = inspect(engine);

def init_db():
    try:
        package = models;
        for _, model_name, _ in pkgutil.iter_modules(package.__path__):
            importlib.import_module(f"{package.__name__}.{model_name}");
            
        Base.metadata.create_all(bind=engine);
        
        #This is to initialize the database with the default parameters.
        with get_db_context() as db:
            if db.query(models.users.UserRole).count() == 0:
                services.users.insert_new_role("sysadmin");
                services.users.insert_new_role("admin");
                services.users.insert_new_role("user");
                services.users.insert_new_role("guest");
                
            if db.query(models.auths.Auth).count() == 0:
                services.users.create_new_user("sysadmin", encrypt("sysadmin@123"), "System", "Admin", 1);
        
        print("Database initialized successfully.");
        return True;
    except Exception as e:
        print(f"Error initializing database: {e}");
        return False;