import sys
import os
import json
import time
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

# --- GESTION DU DOSSIER DATA ---
# On s'assure que le dossier 'data' existe à la racine du projet
DATA_DIR = backend_dir / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

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

# --- FONCTION DE SAUVEGARDE ---
def save_to_history(chat_id: str, model: str, role: str, content: str):
    file_path = DATA_DIR / f"{chat_id}.json"
    if file_path.exists():
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        data = {"id": chat_id, "model": model, "messages": []}
    
    data["messages"].append({"role": role, "content": content})
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

# --- ROUTES API ---

@app.get("/api/v1/conversations")
async def list_conversations():
    convs = []
    try:
        for file in DATA_DIR.glob("chat_*.json"):
            with open(file, "r", encoding="utf-8") as f:
                data = json.load(f)
                first_msg = data["messages"][0]["content"] if data.get("messages") else "Nouveau Chat"
                convs.append({
                    "id": file.stem,
                    "title": first_msg[:40] + "...",
                    "model": data.get("model")
                })
        return sorted(convs, key=lambda x: x['id'], reverse=True)
    except Exception as e:
        print(f"Erreur list_conversations: {e}")
        return []

@app.get("/api/v1/conversations/{chat_id}")
async def get_conversation(chat_id: str):
    file_path = DATA_DIR / f"{chat_id}.json"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Session non trouvée")
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

@app.post("/api/v1/chat")
async def chat(request: ChatRequest):
    user_config = load_user_settings()
    chat_id = request.chat_id or f"chat_{int(time.time())}"
    
    # Sauvegarde message utilisateur
    save_to_history(chat_id, request.model, "user", request.prompt)
    
    final_prompt = request.prompt
    if user_config.get("internetAccess"):
        web_context = search_service.search_web(request.prompt)
        final_prompt = f"Context Web: {web_context}\n\nQuestion: {request.prompt}"

    async def stream_and_save():
        full_response = ""
        async for chunk in ollama_service.chat_stream(request.model, final_prompt, chat_id):
            yield chunk
            if chunk.startswith("data: "):
                try:
                    raw = chunk.replace("data: ", "").strip()
                    parsed = json.loads(raw)
                    content = parsed.get("response") or parsed.get("message", {}).get("content", "")
                    full_response += content
                except: pass
        
        if full_response:
            save_to_history(chat_id, request.model, "assistant", full_response)

    return StreamingResponse(stream_and_save(), media_type="text/event-stream")

# Autres routes (models, monitoring...)
@app.get("/api/v1/models")
async def get_models():
    return await ollama_service.list_models()

@app.get("/api/v1/monitoring")
async def get_stats():
    return get_monitoring_info()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=11451)