from fastapi import FastAPI;
from fastapi.middleware.cors import CORSMiddleware;
from utils.db import ( Base, engine )
from utils.init_db import init_db;
from utils.routers_loader import load_routers;
import os;
from pathlib import Path;
from utils.env import BASE_DIR, LOG_DIR, MEDIA_DIR;

def lifespan(app:FastAPI):
    init_db();
    
    os.makedirs(LOG_DIR, exist_ok=True);
    os.makedirs(MEDIA_DIR, exist_ok=True);
    yield
    
app = FastAPI(lifespan=lifespan);

load_routers(app, "routers");

origins = ["http://localhost:5172","http://127.0.0.1:5172","http://0.0.0.0:5172"];

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
);