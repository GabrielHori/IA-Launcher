import sys
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional

# --- CONFIGURATION DES CHEMINS ---
current_file = Path(__file__).resolve()
backend_dir = current_file.parent.parent 
sys.path.append(str(backend_dir))

# Imports de tes services
from app.services.ollama_service import ollama_service
from app.services.monitoring_service import get_monitoring_info
from app.services.search_service import search_service
from app.core.config import load_user_settings, save_user_settings 

app = FastAPI(title="Horizon AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    model: str
    prompt: str
    chat_id: Optional[str] = None

# --- ROUTES API ---

@app.get("/api/v1/models")
async def get_models():
    """Appelle list_models() de ton service avec await"""
    try:
        # Comme ton service est async, on doit utiliser await
        return await ollama_service.list_models()
    except Exception as e:
        return {"models": [], "error": str(e)}

@app.get("/api/v1/models/detailed")
async def get_detailed_models():
    """Récupère les modèles avec la taille en GB"""
    return await ollama_service.get_detailed_models()

@app.post("/api/v1/models/pull")
async def pull_model(request: dict):
    """Télécharge un nouveau modèle via streaming"""
    model_name = request.get("name")
    if not model_name:
        raise HTTPException(status_code=400, detail="Nom du modèle requis")
    
    return StreamingResponse(
        ollama_service.pull_model(model_name),
        media_type="text/event-stream"
    )

@app.delete("/api/v1/models/{model_name}")
async def delete_model(model_name: str):
    """Supprime un modèle local"""
    success = await ollama_service.delete_model(model_name)
    if not success:
        raise HTTPException(status_code=500, detail="Erreur lors de la suppression")
    return {"status": "deleted"}

@app.get("/api/v1/monitoring")
async def get_stats():
    # Ton service de monitoring est probablement synchrone (psutil)
    return get_monitoring_info()

@app.post("/api/v1/chat")
async def chat(request: ChatRequest):
    user_config = load_user_settings()
    final_prompt = request.prompt
    
    if user_config.get("internetAccess"):
        # search_service est synchrone dans ton repo
        web_context = search_service.search_web(request.prompt)
        final_prompt = f"Context Web: {web_context}\n\nQuestion: {request.prompt}"

    # Appel async du flux de chat
    return StreamingResponse(
        ollama_service.chat_stream(request.model, final_prompt, request.chat_id), 
        media_type="text/event-stream"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=11451)