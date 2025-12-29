import httpx
import json
import base64
from app.core.logger import logger

class OllamaService:
    def __init__(self):
        self.base_url = "http://127.0.0.1:11434" 
        self.timeout = httpx.Timeout(60.0)

    async def check_connection(self):
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                if response.status_code == 200:
                    return True
        except Exception as e:
            logger.warning(f"Ollama non joignable : {e}")
            return False
        return False

    async def list_models(self):
        url = f"{self.base_url}/api/tags"
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(url)
                return response.json()
            except Exception as e:
                logger.error(f"Erreur connexion Ollama (list): {e}")
                return {"models": []}

    async def get_detailed_models(self):
        url = f"{self.base_url}/api/tags"
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(url)
                if response.status_code == 200:
                    models = response.json().get("models", [])
                    for m in models:
                        m["size_gb"] = round(m.get("size", 0) / (1024**3), 2)
                    return models
            except Exception as e:
                logger.error(f"Erreur connexion Ollama (detailed): {e}")
            return []

    async def pull_model(self, model_name: str):
        url = f"{self.base_url}/api/pull"
        async with httpx.AsyncClient(timeout=None) as client:
            try:
                async with client.stream("POST", url, json={"name": model_name}) as response:
                    async for line in response.aiter_lines():
                        if line:
                            yield f"data: {line}\n\n"
            except Exception as e:
                logger.error(f"Erreur pull model: {e}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

    async def delete_model(self, model_name: str) -> bool:
        url = f"{self.base_url}/api/delete"
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.request("DELETE", url, json={"name": model_name})
                return response.status_code == 200
            except Exception as e:
                logger.error(f"Erreur delete service: {e}")
                return False

    async def chat_stream(self, model, prompt, chat_id=None, image=None):
        url = f"{self.base_url}/api/generate"
        
        payload = {
            "model": model, 
            "prompt": prompt, 
            "stream": True
        }

        if image:
            payload["images"] = [image]

        async with httpx.AsyncClient(timeout=None) as client:
            try:
                async with client.stream("POST", url, json=payload) as response:
                    async for line in response.aiter_lines():
                        if line:
                            yield f"data: {line}\n\n"
            except Exception as e:
                logger.error(f"Erreur chat stream: {e}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

ollama_service = OllamaService()