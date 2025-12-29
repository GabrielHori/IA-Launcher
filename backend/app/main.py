import sys
import os
import json
import time
import base64
import subprocess
import threading
import multiprocessing
from pathlib import Path
from typing import Optional

# --- CORRECTION CRITIQUE POUR PYINSTALLER ET WINDOWS ---
multiprocessing.freeze_support()

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

# --- CONFIGURATION DES CHEMINS ---
current_file = Path(__file__).resolve()

if getattr(sys, 'frozen', False):
    backend_dir = Path(sys.executable).resolve().parent
else:
    backend_dir = current_file.parent.parent

sys.path.append(str(backend_dir))

# --- IMPORTS SERVICES ---
from app.services.ollama_service import ollama_service
from app.services.monitoring_service import get_monitoring_info
from app.services.search_service import search_service
from app.core.config import load_user_settings, save_user_settings
from app.core.logger import logger

app = FastAPI(title="Horizon AI")

# --- DATA DIR ---
DATA_DIR = backend_dir / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================================================
# EVENTS STARTUP / SHUTDOWN
# ======================================================

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Horizon AI Backend démarré.")

    def try_start_ollama():
        try:
            settings = load_user_settings()
            env_vars = os.environ.copy()

            ollama_path = settings.get("ollama_models_path")
            if ollama_path:
                env_vars["OLLAMA_MODELS"] = str(ollama_path)
                logger.info(f"📂 Dossier Ollama personnalisé : {ollama_path}")

            subprocess.Popen(
                ["ollama", "serve"],
                env=env_vars,
                creationflags=subprocess.CREATE_NO_WINDOW
            )

            logger.info("🟢 Ollama lancé")
        except Exception as e:
            logger.warning(f"⚠️ Impossible de lancer Ollama : {e}")

    threading.Thread(target=try_start_ollama, daemon=True).start()


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("🛑 Horizon AI Backend arrêté.")

# ======================================================
# UTILITAIRE HISTORIQUE
# ======================================================

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

# ======================================================
# SYSTEM / SETTINGS / LOGS
# ======================================================

@app.get("/api/v1/settings")
async def get_settings():
    return load_user_settings()


@app.post("/api/v1/settings")
async def update_settings(new_settings: dict):
    save_user_settings(new_settings)
    logger.info("⚙️ Paramètres utilisateur mis à jour")
    return {"message": "Configuration mise à jour"}


@app.get("/api/v1/system/health")
async def health_check():
    is_ollama_alive = await ollama_service.check_connection()
    return {
        "status": "healthy" if is_ollama_alive else "degraded",
        "checks": {
            "backend": "ok",
            "ollama": "ok" if is_ollama_alive else "unreachable"
        }
    }


@app.get("/api/v1/system/logs")
async def get_logs(limit: int = 100):
    from app.core.logger import LOG_FILE

    if not os.path.exists(LOG_FILE):
        return {"logs": ["Log file not found"]}

    try:
        with open(LOG_FILE, "r", encoding="utf-8") as f:
            return {"logs": f.readlines()[-limit:]}
    except Exception as e:
        logger.error(f"Erreur lecture logs: {e}")
        return {"logs": ["Error reading logs"]}

# ======================================================
# CONVERSATIONS
# ======================================================

@app.get("/api/v1/conversations")
async def list_conversations():
    convs = []

    try:
        for file in DATA_DIR.glob("chat_*.json"):
            with open(file, "r", encoding="utf-8") as f:
                data = json.load(f)
                title = data["messages"][0]["content"] if data.get("messages") else "New chat"
                convs.append({
                    "id": file.stem,
                    "title": title[:40] + "...",
                    "model": data.get("model")
                })
        return sorted(convs, key=lambda x: x["id"], reverse=True)
    except Exception as e:
        logger.error(f"Erreur conversations: {e}")
        return []

@app.get("/api/v1/conversations/{chat_id}")
async def get_conversation(chat_id: str):
    file_path = DATA_DIR / f"{chat_id}.json"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Session non trouvée")

    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

# ======================================================
# CHAT
# ======================================================

@app.post("/api/v1/chat")
async def chat(
    model: str = Form(...),
    prompt: str = Form(...),
    chat_id: Optional[str] = Form(None),
    file: UploadFile = File(None)
):
    user_config = load_user_settings()
    current_chat_id = chat_id or f"chat_{int(time.time())}"

    save_to_history(current_chat_id, model, "user", prompt)

    lang = user_config.get("language", "en")
    instructions = {
        "fr": "Tu es Horizon, une IA utile et précise. Réponds toujours en français.",
        "en": "You are Horizon, a helpful and precise AI. Always answer in English."
    }
    system_instruction = instructions.get(lang, instructions["en"])

    image_base64 = None
    web_context = None

    if file:
        contents = await file.read()
        image_base64 = base64.b64encode(contents).decode("utf-8")

    if user_config.get("internetAccess"):
        web_context = search_service.search_web(prompt)

    final_prompt = "\n\n".join(
        [system_instruction] +
        ([f"Contexte Web: {web_context}"] if web_context else []) +
        [f"Question: {prompt}"]
    )

    async def stream_and_save():
        full_response = ""
        async for chunk in ollama_service.chat_stream(
            model, final_prompt, current_chat_id, image=image_base64
        ):
            yield chunk
            if chunk.startswith("data: "):
                try:
                    parsed = json.loads(chunk.replace("data: ", "").strip())
                    full_response += parsed.get("response", "")
                except:
                    pass

        if full_response:
            save_to_history(current_chat_id, model, "assistant", full_response)

    return StreamingResponse(stream_and_save(), media_type="text/event-stream")

# ======================================================
# MODELS
# ======================================================

@app.get("/api/v1/models")
async def get_models():
    return await ollama_service.list_models()


@app.post("/api/v1/models/pull")
async def pull_model(model_name: str = Form(...)):
    try:
        subprocess.Popen(
            ["ollama", "pull", model_name],
            creationflags=subprocess.CREATE_NO_WINDOW
        )
        logger.info(f"📥 Pull lancé : {model_name}")
        return {"status": "downloading"}
    except Exception as e:
        logger.error(f"Erreur pull model: {e}")
        raise HTTPException(status_code=500, detail="Impossible de lancer le pull")

# 🔥🔥🔥 CORRECTION ICI 🔥🔥🔥
@app.delete("/api/v1/models/{model_name}")
async def delete_model(model_name: str):
    try:
        process = subprocess.run(
            ["ollama", "rm", model_name],
            capture_output=True,
            text=True,
            creationflags=subprocess.CREATE_NO_WINDOW
        )

        if process.returncode != 0:
            logger.error(process.stderr)
            raise HTTPException(status_code=500, detail=process.stderr)

        logger.info(f"🗑️ Modèle supprimé : {model_name}")
        return {"message": "Modèle supprimé avec succès"}

    except Exception as e:
        logger.error(f"Erreur suppression modèle: {e}")
        raise HTTPException(status_code=500, detail="Impossible de supprimer le modèle")

# ======================================================
# MONITORING
# ======================================================

@app.get("/api/v1/monitoring")
async def get_stats():
    return get_monitoring_info()

# ======================================================
# MAIN
# ======================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=11451)
