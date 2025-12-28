# 🌌 Horizon AI - Neural Interface

**Horizon AI** est une interface de contrôle avancée et élégante pour la gestion de modèles de langage (LLM) locaux via **Ollama**. Conçue avec une esthétique "Cyberpunk/Futuriste", elle permet de monitorer les ressources système en temps réel et d'interagir avec diverses unités d'intelligence artificielle.

## ✨ Caractéristiques

- 🖥️ **Dashboard Futuriste** : Monitoring CPU, RAM et VRAM avec animations de particules réactives.
- 🌓 **Mode Jour/Nuit** : Interface adaptative supportant un mode sombre profond et un mode clair épuré.
- 🤖 **Gestion des Modèles** : Téléchargement et initialisation facilités des modèles (Llama 3.2, Mistral, DeepSeek, etc.).
- 🛠️ **Configuration Système** : Paramétrage de l'identité de l'opérateur, de la langue et des accès réseau.
- ⚡ **Stack Moderne** : Propulsé par React (Vite) pour le frontend et Python (FastAPI/Flask) pour le backend.

## 🏗️ Structure du Projet

```text
IA-LAUNCHER/
├── backend/             # Logique API Python & Services (Ollama, Hardware)
├── frontend/            # Interface React & Design System (Tailwind CSS)
├── static/              # Fichiers statiques pour la distribution
└── start_horizon.py     # Script de lancement unifié

🚀 Installation
Prérequis
Node.js (v18+)

Python (3.10+)

Ollama (installé et configuré)

Configuration du Backend
Accédez au dossier backend : cd backend

Créez un environnement virtuel : python -m venv .venv

Activez-le :

Windows : .venv\Scripts\activate

Linux/Mac : source .venv/bin/activate

Installez les dépendances : pip install -r requirements.txt

Configuration du Frontend
Accédez au dossier frontend : cd frontend

Installez les paquets : npm install

Lancez le mode développement : npm run dev

🛠️ Technologies Utilisées
Frontend : React, Vite, Tailwind CSS, Lucide React (Icônes).

Backend : Python, API REST pour la communication avec les sondes matérielles.

Thème : Context API pour la gestion dynamique du Dark/Light mode.