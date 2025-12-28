import sys
import os
from pathlib import Path
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List

# --- CONFIGURATION DES CHEMINS ---
current_file = Path(__file__).resolve()
backend_dir = current_file.parent.parent 
sys.path.append(str(backend_dir))

from app.services.ollama_service import ollama_service
from app.services.monitoring_service import get_monitoring_info
from app.services.search_service import search_service
from app.services.system_service import system_service
from app.core.config import load_user_settings, save_user_settings 

app = FastAPI(title="Horizon AI")

# Configuration CORS pour autoriser la communication avec le Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ROOT_DIR = backend_dir.parent
DATA_DIR = backend_dir / "data"
STATIC_DIR = ROOT_DIR / "static"

DATA_DIR.mkdir(exist_ok=True)

class ChatRequest(BaseModel):
    model: str
    prompt: str
    chat_id: Optional[str] = None

# --- ROUTES API ---

@app.get("/api/v1/monitoring")
async def get_stats():
    try: 
        return get_monitoring_info()
    except: 
        return {"cpu_usage": 0, "ram_usage": 0}

@app.get("/api/v1/settings")
async def get_settings():
    """Récupère tous les réglages (Nom, Langue, Startup, Internet)"""
    try:
        settings = load_user_settings()
        # Valeurs par défaut si le fichier est vide
        default = {
            "userName": "Horizon", 
            "language": "fr", 
            "internetAccess": False, 
            "runAtStartup": False, 
            "autoUpdate": True
        }
        if not settings:
            return default
        # Fusionne pour être sûr qu'aucune clé ne manque
        return {**default, **settings}
    except:
        return {"userName": "Horizon", "language": "fr"}

@app.post("/api/v1/settings")
async def update_settings(new_settings: dict):
    """Sauvegarde et applique les paramètres système"""
    try:
        save_user_settings(new_settings)
        # Applique le lancement au démarrage si on est sur Windows
        if sys.platform == "win32":
            run_at_startup = new_settings.get("runAtStartup", False)
            system_service.manage_startup(run_at_startup)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/chat")
async def chat(request: ChatRequest):
    user_config = load_user_settings()
    final_prompt = request.prompt
    if user_config.get("internetAccess"):
        web_context = search_service.search_web(request.prompt)
        final_prompt = f"Infos web: {web_context}\n\nQuestion: {request.prompt}"

    return StreamingResponse(
        ollama_service.chat_stream(request.model, final_prompt, request.chat_id), 
        media_type="text/event-stream"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=11451)