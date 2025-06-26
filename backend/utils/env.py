from dotenv import find_dotenv, load_dotenv;
from pathlib import Path;
from .enc import ( encrypt, decrypt );
import os;
import json;

BASE_DIR = ((Path(__file__).parent).parent);
LOG_DIR = BASE_DIR / "logs";

try:
    load_dotenv(find_dotenv(str(BASE_DIR / ".env")));
except:
    print("env not found");
   
DB_HOST = os.getenv("DB_HOST");
DB_NAME = os.getenv("DB_NAME");
DB_UNM = os.getenv("DB_UNM");
DB_PWD = os.getenv("DB_PWD");
MY_SEED = os.getenv("MY_SEED");
DATABASE_URL = f"postgresql://{DB_UNM}:" + decrypt(DB_PWD) + f"@{DB_HOST}/{DB_NAME}";

TOKEN_ALGORITHM = os.getenv("TOKEN_ALGORITHM");
ACCESS_SECURITY_KEY = os.getenv("ACCESS_SECURITY_KEY");
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"));
REFRESH_SECURITY_KEY = os.getenv("REFRESH_SECURITY_KEY");
REFRESH_TOKEN_EXPIRE_MINUTES = int(os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES"));

GOOGLE_VERTEX_CREDENTIAL = os.getenv("GOOGLE_VERTEX_CREDENTIAL");
GOOGLE_CHAT_MODEL = os.getenv("GOOGLE_CHAT_MODEL");
GOOGLE_VERTEX_LOCATION = os.getenv("GOOGLE_VERTEX_LOCATION");

with open(GOOGLE_VERTEX_CREDENTIAL, "r") as f:
    data = json.load(f);
    project_id = data["project_id"];

GOOGLE_PROJECT_ID = project_id;