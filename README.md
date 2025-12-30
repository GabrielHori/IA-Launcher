# 🚀 Horizon AI Launcher

Horizon AI Launcher is a modern and ergonomic desktop interface for running local AIs (via Ollama) without any command-line knowledge.  

Built with **React**, **Tauri**, and **Python**, it offers a complete ecosystem: **Chat**, **Model Management**, **Configuration**, and **Console**.

---

## ⚠️ Prerequisites

Before installing, make sure you have these tools installed on your computer:

1. **Python** (Required for the Backend)  
   Download version 3.14 (or newer) from [python.org](https://www.python.org/)  
   ⚠️ Important: Check **Add python.exe to PATH** during installation.

2. **Node.js** (Required for the Frontend)  
   Download the **LTS** (Long Term Support) version from [nodejs.org](https://nodejs.org/)

3. **Ollama** (Required for AI)  
   Download the Windows version from [ollama.ai](https://ollama.ai/)  
   This software will run the AI models locally.

---

## 📦 Project Installation

### 1. Download the Project

If you don’t use Git or just want to test quickly:

- Go to the GitHub repository.
- Click the green **Code** button → **Download ZIP**
- Extract it to your main drive (e.g., `C:\`)
- Rename the folder to `IA-Launcher` (optional but recommended)

You should have this structure:

```
C:\IA-Launcher
├── backend/
├── frontend/
└── ...
```

---

### 2. Install the Backend (Python)

Open **Command Prompt** or **PowerShell** and navigate to:

```
C:\IA-Launcher\backend
```

#### A. Create the Virtual Environment (One time only)

```powershell
python -m venv .venv
```

>This creates a `.venv` folder containing an isolated Python environment for this project.

#### B. Install Dependencies (One time only)

```powershell
.venv\Scripts\pip install fastapi uvicorn aiofiles python-multipart
```

> Wait until everything installs successfully (no red errors).

---

### 3. Install the Frontend (Node.js)

Navigate to:

```
C:\IA-Launcher\frontend
```

Install dependencies:

```powershell
npm install
```

> This may take a few minutes.

---

## ▶️ Launching the Application

Once prerequisites are installed and dependencies are ready:

1. Open a terminal in `C:\IA-Launcher\frontend`
2. Run:

```powershell
npm run dev
```

**What happens:**

- **Backend (Magenta)**: Python + FastAPI starts. You'll see Uvicorn running and 🚀 Horizon AI Backend started.  
- **Frontend (Blue)**: Vite + Tauri launches. The "Horizon AI Core" window opens automatically.  
- **Ollama**: The app tries to launch Ollama automatically.

---

## 🔧 Usage

- **Dashboard**: Manage AI models (Download, Delete, Install)  
- **AI Assistant**: Chat with local AI models  
- **Configuration**: Change language, model storage folder, etc.  
- **Explorer**: View chat files and disk space usage  

---

## ⚙️ Advanced Configuration

- **Storage Folder**: Choose a different hard drive for large models  
- **Language**: Switch between English and French  

---

## 🐛 Troubleshooting

- **Error: `npm` not found** → Node.js is missing. Reinstall.  
- **Error: `python` not found** → Python is missing. Reinstall.  
- **Backend Offline / Buttons not working** → Check Ollama installation and PATH (`ollama --version`).  
- **404 when deleting model** → Restart `npm run dev` to reload the backend.  
- **UnicodeEncodeError (emojis crashing)** → Make sure you have the latest `main.py` version.

---

## 🛠️ Development

- **Frontend (React)**: `frontend/src` → Changes are live with `npm run dev`  
- **Backend (Python)**: `backend/app` → Modify files and restart `npm run dev`  

Enjoy your AI experience! ✨
