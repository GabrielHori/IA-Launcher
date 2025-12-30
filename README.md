🚀 Horizon AI Launcher
Horizon AI Launcher is a modern and ergonomic desktop interface for running local AIs (via Ollama) without needing any technical command-line skills.

Built with React, Tauri, and Python, it offers a complete ecosystem: Chat, Model Management, Configuration, and Console.

⚠️ Prerequisites (Tools to install BEFORE)
To use this project, you must install these 3 tools on your computer first. Do not launch them yet, just install them.

Python (Required for the Backend)
Download version 3.14 (or newer) from: python.org
IMPORTANT: Check the box Add python.exe to PATH during installation.
Node.js (Required for the Frontend)
Download version LTS (Long Term Support) from: nodejs.org
Ollama (Required for the AI)
Download the Windows version from: ollama.ai
This is the software that will run the artificial intelligence.
📦 Project Installation
1. Download the Project
If you don't use Git or just want to test the application quickly:

Go to the GitHub repository.
Click the green Code button (top right).
Select "Download ZIP".
Extract the downloaded ZIP folder to your main drive (e.g., C:\).
Rename the extracted folder to IA-Launcher (optional but recommended).
You should have this folder structure:
C:\IA-Launcher
├── backend/
├── frontend/
└── ...

2. Install the Backend (Python)
Open a Command Prompt (PowerShell) or File Explorer and go to the folder C:\IA-Launcher\backend.

A. Create the Virtual Environment (One time only)
Inside the backend folder, type this command:

powershell

python -m venv .venv
(This creates a .venv folder containing Python isolated for this project).

B. Install Dependencies (One time only)
Still inside the backend folder, type this command:

powershell

.venv\Scripts\pip install fastapi uvicorn aiofiles python-multipart
Wait for everything to install (no red errors).

3. Install the Frontend (Node.js)
Go to the folder C:\IA-Launcher\frontend.

In this folder, type this command:

powershell

npm install
(This may take a few minutes. Wait for it to finish).

▶️ Launching the Application
Once Ollama, Python, and Node.js are installed, and the dependencies are loaded, you are ready.

Open a terminal in the folder C:\IA-Launcher\frontend.
Simply type:
powershell

npm run dev
What will happen:
Backend (Magenta): The console terminal will launch Python and FastAPI. You will see Uvicorn running... and 🚀 Horizon AI Backend started.
Frontend (Blue): The console terminal will launch Vite and Tauri. The "Horizon AI Core" window will open automatically.
Ollama: The code will try to launch Ollama automatically for you.
🔧 Usage
Dashboard: Manage your AI models (Download, Delete, Install).
AI Assistant: Chat with your local models.
Configuration: Change the language, the folder for model storage, etc.
Explorer: View your chat files and disk space usage.
⚙️ Advanced Configuration
The system automatically manages Ollama on startup, but you can customize parameters in the "Configuration" tab of the app:

Storage Folder: Choose a different hard drive to store large model files (several GB).
Language: Switch between French and English.
🐛 Troubleshooting (Fixing Problems)
Error: npm : command not found
You didn't install Node.js. Retry Step 1. Prerequisites.

Error: python : command not found
You didn't install Python. Retry Step 1. Prerequisites.

The app launches but buttons do nothing ("Backend Offline")
Verify that Ollama is installed and in the PATH (try typing ollama --version in a command prompt).
In the Dashboard, check if the CPU/RAM cards move.
Error: 404 Not Found when deleting a model
It means the Backend file is not up to date. Restart the npm run dev command to reload the Python server.

Error: UnicodeEncodeError (Emojis crashing)
The main.py file already contains the fix for Windows. If you have this issue, make sure you have the latest version of the code.

🛠️ Development
To modify the source code:

Frontend (React): Folder frontend/src. Changes happen in real-time with npm run dev.
Backend (Python): Folder backend/app. Modify files and restart npm run dev.
Enjoy your AI Experience! ✨
