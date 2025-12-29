import logging
import sys
import os
from logging.handlers import RotatingFileHandler

# Définir le chemin du dossier de logs relatif à ce fichier
# Remonte de 'backend/app/core/' vers la racine 'backend/' puis 'data/logs'
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LOG_DIR = os.path.join(BASE_DIR, "data", "logs")

# Créer le dossier si inexistant
os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE = os.path.join(LOG_DIR, "app.log")

def setup_logger(name: str = "HorizonAI"):
    """Configure et retourne un logger prêt à l'emploi."""
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)

    # Éviter les doublons si appelé plusieurs fois
    if logger.handlers:
        return logger

    # 1. Formatage des logs
    formatter = logging.Formatter(
        fmt='%(asctime)s | %(levelname)-8s | %(name)s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    # 2. Handler Fichier (Rotation : 5 fichiers de 1Mo max)
    file_handler = RotatingFileHandler(LOG_FILE, maxBytes=1024*1024, backupCount=5, encoding='utf-8')
    file_handler.setFormatter(formatter)
    file_handler.setLevel(logging.DEBUG) # Tout écrire dans le fichier

    # 3. Handler Console (Sortie standard)
    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setFormatter(formatter)
    stream_handler.setLevel(logging.INFO) # Only INFO/WARNING/ERROR en console

    logger.addHandler(file_handler)
    logger.addHandler(stream_handler)

    return logger

# Export par défaut
logger = setup_logger()