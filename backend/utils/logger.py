import logging;
from logging.handlers import RotatingFileHandler;
import os;
from .env import LOG_DIR;
import sys;

log_file = os.path.join(LOG_DIR, "app.log");

log_format = logging.Formatter(
    "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
);

logger = logging.getLogger("app_logger");
logger.setLevel(logging.DEBUG);

console_handler = logging.StreamHandler(sys.stdout);
console_handler.setLevel(logging.DEBUG);
console_handler.setFormatter(log_format);

file_handler = RotatingFileHandler(filename=log_file,backupCount=3, maxBytes=5_000_000);
file_handler.setLevel(logging.INFO);
file_handler.setFormatter(log_format);

if not logger.handlers:
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)
