import json
import os
# Correction de l'import pour Pydantic V2
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # --- Paramètres Statiques (Variables d'environnement) ---
    APP_NAME: str = "Horizon AI Core"
    APP_VERSION: str = "1.0.0"
    
    # CORS settings
    # Ajout du port 5173 (Vite) et 3000 (React classique)
    CORS_ORIGINS: list = ["http://localhost", "http://localhost:3000", "http://localhost:5173"]
    
    # Ollama settings
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_DEFAULT_MODEL: str = "qwen2.5:7b"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Initialisation des paramètres système
settings = Settings()

# --- Gestion des Paramètres Utilisateur (Dynamiques) ---
# Ce fichier sera créé dans le dossier 'data' à la racine de ton projet
USER_SETTINGS_PATH = "data/user_settings.json"

def get_default_user_settings():
    """Paramètres par défaut au premier lancement."""
    return {
        "language": "fr",
        "internetAccess": False,
        "runAtStartup": False,
        "userName": "Admin",
        "autoUpdate": True
    }

def load_user_settings():
    """Charge les réglages depuis le JSON ou renvoie les défauts."""
    # Création du chemin absolu pour éviter les erreurs de dossier
    if not os.path.exists(USER_SETTINGS_PATH):
        os.makedirs(os.path.dirname(USER_SETTINGS_PATH), exist_ok=True)
        save_user_settings(get_default_user_settings())
        return get_default_user_settings()
    
    try:
        with open(USER_SETTINGS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return get_default_user_settings()

def save_user_settings(data: dict):
    """Sauvegarde les réglages modifiés par l'utilisateur."""
    # S'assurer que le dossier existe avant de sauvegarder
    os.makedirs(os.path.dirname(USER_SETTINGS_PATH), exist_ok=True)
    with open(USER_SETTINGS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)