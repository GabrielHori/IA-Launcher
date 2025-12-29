from fastapi import APIRouter
from app.core.config import load_user_settings, save_user_settings
from app.services.ollama_service import ollama_service
from app.core.logger import logger, LOG_FILE
import os

router = APIRouter()

# --- Settings (Déjà existant, on le garde ici) ---
@router.get("/settings")
async def get_settings():
    return load_user_settings()

@router.post("/settings")
async def update_settings(new_settings: dict):
    save_user_settings(new_settings)
    logger.info("Paramètres utilisateur mis à jour")
    return {"message": "Configuration mise à jour"}

# --- Nouveaux : Health Check & Logs ---

@router.get("/health")
async def health_check():
    """
    Vérifie si Ollama est en ligne.
    Retourne 200 si OK, 503 si Ollama KO.
    """
    is_ollama_alive = await ollama_service.check_connection()
    
    status = "healthy" if is_ollama_alive else "degraded"
    
    return {
        "status": status,
        "checks": {
            "backend": "ok", # Si on répond à cette route, c'est que FastAPI tourne
            "ollama": "ok" if is_ollama_alive else "unreachable"
        }
    }

@router.get("/logs")
async def get_logs(limit: int = 100):
    """
    Retourne les dernières lignes du fichier de log pour la console UI.
    """
    if not os.path.exists(LOG_FILE):
        return {"logs": ["Log file not found yet."]}
        
    try:
        with open(LOG_FILE, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            # On retourne les N dernières lignes
            return {"logs": lines[-limit:]}
    except Exception as e:
        logger.error(f"Erreur lecture logs: {e}")
        return {"logs": ["Error reading logs"]}