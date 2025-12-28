from fastapi import APIRouter
from app.core.config import load_user_settings, save_user_settings

router = APIRouter()

@router.get("/settings")
async def get_settings():
    return load_user_settings()

@router.post("/settings")
async def update_settings(new_settings: dict):
    save_user_settings(new_settings)
    return {"message": "Configuration mise à jour"}