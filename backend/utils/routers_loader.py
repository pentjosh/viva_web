import importlib
import pkgutil
from fastapi import FastAPI

def load_routers(app: FastAPI, package: str):
    package_module = importlib.import_module(package)
    
    for _, module_name, is_pkg in pkgutil.iter_modules(package_module.__path__):
        if is_pkg:
            continue

        full_module_name = f"{package}.{module_name}"
        module = importlib.import_module(full_module_name)

        if hasattr(module, "router"):
            app.include_router(module.router, prefix="/api")
