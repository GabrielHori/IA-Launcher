# IA-Launcher 🚀

IA-Launcher is a desktop application that allows users to **run, manage, and interact with local AI models** through a clean and user-friendly interface.

The project focuses on **local-first AI**, leveraging tools like **Ollama**, with a Python backend and a modern React frontend, packaged as a desktop application using **Tauri**.

---

## 🧠 Project Vision

The goal of IA-Launcher is to:
- Make **local AI models accessible** to non-technical users
- Provide a **simple UI** to manage AI models and servers
- Avoid cloud dependency and protect user privacy
- Serve as a base for future AI-related tools (plugins, automation, monitoring)

This project is designed to be:
- Developer-friendly
- AI-agent-friendly
- Easily extensible

---

## 🏗️ Architecture Overview

```
IA-Launcher/
│
├── frontend/          # React + Vite + Tailwind UI
│
├── backend/           # Python backend (FastAPI)
│   ├── api/           # API routes
│   ├── services/      # Ollama / AI services logic
│   ├── models/        # Data models & schemas
│   └── main.py        # Backend entry point
│
├── data/              # Runtime data (models, cache, logs)
│
├── start_horizon.py   # Main launcher script
│
└── README.md
```

### 🔄 Data Flow
1. The frontend UI sends requests to the backend API
2. The backend communicates with **Ollama**
3. Ollama runs local AI models
4. Responses are returned to the UI

---

## ⚙️ Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- JavaScript / JSX

### Backend
- Python 3.10+
- FastAPI
- Uvicorn
- Ollama (local AI runtime)

### Desktop
- Tauri

---

## 📋 Requirements

### System
- Windows / Linux (macOS optional)
- Minimum 8GB RAM recommended
- GPU optional (CPU supported)

### Software
- Node.js >= 18
- Python >= 3.10
- Ollama installed and available in PATH

## ▶️ How to Run the Project (Development)

### 1️⃣ Clone the repository
```bash
git clone https://github.com/GabrielHori/IA-Launcher.git
cd IA-Launcher
```



### 3️⃣ Frontend + Tauri + Backend
```bash
cd frontend
npm run dev
```

---

## 🧪 Testing (Planned)

- Backend: pytest
- Frontend: Jest / React Testing Library
- CI: GitHub Actions

(Currently under development)

---

## 🔐 Security Notes

- No cloud data storage
- No telemetry by default
- All AI processing is local
- No API keys required

---

## 📈 Roadmap

### Core
- [x] Local AI execution via Ollama
- [x] Desktop app via Tauri
- [ ] Model manager (install/remove models)
- [ ] AI server status dashboard
- [ ] Logs & history viewer

### Advanced
- [ ] Plugin system
- [ ] GPU/CPU usage monitoring
- [ ] Multiple AI backends
- [ ] Auto-start with OS
- [ ] Language selector

---

## 🧠 AI-Agent Friendly Notes

This project is structured to be easily understood by AI agents:
- Clear folder responsibilities
- Explicit entry points
- Minimal magic
- Descriptive naming

AI agents can:
- Modify frontend independently
- Extend backend services
- Add plugins or APIs
- Generate tests & documentation

---

## 🛠️ Contributing

Contributions are welcome!

1. Fork the project
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

Please keep code clean and documented.

---

## 📄 License

MIT License

---

## 👤 Author

**Gabriel (Horizon)**  
Developer & Creator of IA-Launcher

GitHub: https://github.com/GabrielHori

