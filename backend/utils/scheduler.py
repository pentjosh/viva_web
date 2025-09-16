from apscheduler.schedulers.asyncio import AsyncIOScheduler;
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore;
from .env import DATABASE_URL;


jobstores = {
    'default': SQLAlchemyJobStore(url=DATABASE_URL)
}
scheduler = AsyncIOScheduler(jobstores=jobstores);

def get_scheduler():
    return scheduler;