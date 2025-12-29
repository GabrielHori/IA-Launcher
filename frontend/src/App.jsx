import React, { useState, useEffect } from 'react';
import AppLayout from './Layouts/AppLayout';

function App() {
  const [language, setLanguage] = useState('en');
  const [activeTab, setActiveTab] = useState('assistant');
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [selectedModel, setSelectedModel] = useState("");
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [userName, setUserName] = useState("Admin");
  const [systemStats, setSystemStats] = useState({
    cpu: 0,
    ram: 0,
    gpu: 0,
    vramUsed: 0,
    vramTotal: 0
  });
  const [healthStatus, setHealthStatus] = useState('loading');

  // --- LANCEMENT AUTOMATIQUE DU BACKEND ---
  useEffect(() => {
    const startBackend = async () => {
      try {
        const { Command } = await import("@tauri-apps/plugin-shell");
        await Command.create(
          "powershell",
          [
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-Command",
            `Start-Process "backend.exe"`
          ]
        ).spawn();
        console.log("Backend lancé automatiquement");
      } catch (err) {
        console.error("Impossible de lancer le backend automatiquement :", err);
      }
    };

    startBackend();
  }, []);

  // --- HEALTH CHECK & MONITORING ---
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch("http://localhost:11451/api/v1/system/health");
        const data = await res.json();
        setHealthStatus(data.status);
      } catch {
        setHealthStatus('unreachable');
      }
    };

    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:11451/api/v1/monitoring");
        if (res.ok) {
          const data = await res.json();
          setSystemStats(data);
        }
      } catch (e) {
        console.error("Erreur monitoring:", e);
      }
    };

    fetchHealth();
    fetchStats();
    const healthInterval = setInterval(fetchHealth, 5000);
    const statsInterval = setInterval(fetchStats, 2000);

    return () => {
      clearInterval(healthInterval);
      clearInterval(statsInterval);
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-black overflow-hidden text-white font-sans">
      <AppLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemStats={systemStats}
        selectedChatId={selectedChatId}
        setSelectedChatId={setSelectedChatId}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        isNavOpen={isNavOpen}
        setIsNavOpen={setIsNavOpen}
        userName={userName}
        setUserName={setUserName}
        healthStatus={healthStatus}
        language={language}
        setLanguage={setLanguage}
      />
    </div>
  );
}

export default App;
