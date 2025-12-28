import subprocess
import os
import time
import sys
import webbrowser

def start_horizon():
    # Chemins racine
    root_dir = os.path.dirname(os.path.abspath(__file__))
    ollama_bin = os.path.join(root_dir, "bin", "ollama.exe")
    models_dir = os.path.join(root_dir, "data", "models")
    backend_dir = os.path.join(root_dir, "backend")
    venv_python = os.path.join(backend_dir, ".venv", "Scripts", "python.exe")

    # Configuration du stockage portable d'Ollama
    os.environ["OLLAMA_MODELS"] = models_dir
    if not os.path.exists(models_dir):
        os.makedirs(models_dir)

    print("--- HORIZON AI : DEMARRAGE DU SYSTEME ---")

    # 1. Lancement d'Ollama (sans fenêtre)
    if os.path.exists(ollama_bin):
        print("[OLLAMA] Initialisation du moteur IA...")
        subprocess.Popen(
            [ollama_bin, "serve"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0
        )
        time.sleep(2)
    else:
        print("[ERREUR] ollama.exe non trouvé dans /bin/")
        sys.exit(1)

    # 2. Lancement du Backend (qui sert le Frontend sur le port 11451)
    print("[SERVER] Démarrage de l'interface sur http://localhost:11451")
    # On spécifie le cwd pour que les chemins relatifs dans main.py fonctionnent
    backend_proc = subprocess.Popen([venv_python, "app/main.py"], cwd=backend_dir)

    # 3. Ouverture du navigateur après une courte attente
    time.sleep(4)
    webbrowser.open("http://localhost:11451")

    print("\n[OK] Horizon AI est prêt !")
    print("Gardez cette fenêtre ouverte pour maintenir les services actifs.")
    
    try:
        backend_proc.wait()
    except KeyboardInterrupt:
        print("\n[STOP] Fermeture des services...")
        backend_proc.terminate()

if __name__ == "__main__":
    start_horizon()