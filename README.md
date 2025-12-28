IA‑Launcher / Horizon AI

Horizon AI is an advanced launcher for interacting with local language models via Ollama, featuring a futuristic dashboard to monitor system resources and manage AI in real time.
This documentation is designed for humans and AI: it explains the logic, structure, endpoints, and data flows.

1️⃣ Overview

Purpose: Provide a simple, visually appealing interface to use local AI models and monitor system resources.

Tech stack:

Frontend: React + Vite + Tailwind CSS

Backend: Python (FastAPI or Flask)

AI: Ollama (local models)

Key Features:

Interactive dashboard (CPU / RAM / VRAM)

Day/night UI mode

AI model management (load, prompt, response)

User settings and configuration
```text
2️⃣ Overall Architecture
IA-LAUNCHER/
├── backend/             # Python API, AI communication, system monitoring
│   ├── app.py           # Main backend entry point
│   ├── routes/          # API endpoints
│   ├── services/        # Ollama integration and monitoring logic
│   └── config.py        # Parameters and configuration
├── frontend/            # User interface
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Screens / pages
│   │   ├── services/    # API calls
│   │   ├── state/       # React context / hooks
│   │   └── styles/      # Tailwind config
├── static/              # Static assets, images
├── start_horizon.py     # Unified launcher script (backend + frontend)
└── README.md

```

User → AI Flow

User opens Horizon AI.

The frontend initializes the UI and fetches system info via API.

The backend receives requests, prepares prompts, and communicates with Ollama.

Ollama generates the response and returns it to the backend.

Backend forwards the response to the frontend for display.

3️⃣ Installation
Prerequisites

Node.js v18+

Python 3.10+

```text
cd frontend
npm install
```
```text
ollama serve
```
```text
cd frontend
npm run tauri:dev
```


4️⃣ API Endpoints (Examples)
POST /api/ask

Description: Sends a prompt to Ollama and retrieves the response.
```text
Payload:

{
  "prompt": "string"
}


Response:

{
  "response": "string",
  "usage": {
    "tokens": 123,
    "model": "llama-3.2"
  }
}


Possible Errors:

400: missing prompt

500: Ollama unavailable

GET /api/status
```

Description: Returns current system status and available AI models.
```text
Response:

{
  "cpu": "23%",
  "ram": "45%",
  "vram": "67%",
  "models_available": ["llama-3.2", "mistral-7B", "deepseek"]
}
```

5️⃣ Frontend — Key Components
Folder / File	Purpose
components/	Reusable UI elements (buttons, cards, modals)
pages/	Main screens: Dashboard, AI Chat, Settings
services/	API call functions
state/	React context for app-wide state (dark/light mode, AI session)
styles/	Tailwind CSS configuration and custom styling
6️⃣ Backend — Key Modules
Folder / File	Purpose
app.py	Main entry point for backend server
routes/	Defines all API endpoints for AI interaction and monitoring
services/	Handles communication with Ollama and system monitoring logic
config.py	Stores configuration, such as available models and user settings
7️⃣ Recommendations & Notes

Keep business logic, AI logic, and UI separate for maintainability.

Document all endpoints using Swagger/OpenAPI for auto-generation.

Use React Query or similar for frontend API calls to simplify state management.

Maintain README files per folder for easy onboarding of new developers or AI.

8️⃣ AI-Ready Notes

This documentation is intended for an AI to understand the project structure, logic, and data flow:

Clearly defines all folders and roles

Lists all API endpoints, payloads, and responses

Explains frontend component interactions

Shows backend-to-Ollama communication

Contains launch instructions for human or automated agents
