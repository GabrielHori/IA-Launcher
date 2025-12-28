import os
import sys
from pathlib import Path

class SystemService:
    def __init__(self):
        self.startup_folder = Path(os.getenv('APPDATA')) / "Microsoft" / "Windows" / "Start Menu" / "Programs" / "Startup"
        self.shortcut_path = self.startup_folder / "HorizonAI.bat"

    def manage_startup(self, enable: bool):
        """Active ou désactive le lancement au démarrage via un fichier .bat"""
        try:
            if enable:
                # Chemin vers ton script de lancement (on suppose un lanceur à la racine)
                root_dir = Path(__file__).resolve().parent.parent.parent.parent
                launcher_path = root_dir / "run_horizon.bat"
                
                # Création d'un petit script .bat dans le dossier de démarrage
                with open(self.shortcut_path, "w") as f:
                    f.write(f'@echo off\ncd /d "{root_dir}"\nstart "" "python" -m app.main')
                print("✅ Startup activé")
            else:
                if self.shortcut_path.exists():
                    os.remove(self.shortcut_path)
                    print("❌ Startup désactivé")
        except Exception as e:
            print(f"Erreur Startup : {e}")

system_service = SystemService()