import React, { useState, useEffect } from 'react';
import AppLayout from './Layouts/AppLayout';

function App() {
  const [language, setLanguage] = useState('en'); // 'en' par défaut ici
  const [activeTab, setActiveTab] = useState('assistant');
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [selectedModel, setSelectedModel] = useState(""); 
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [userName, setUserName] = useState("Admin"); // État global du nom
  const [systemStats, setSystemStats] = useState({ 
    cpu: 0, 
    ram: 0, 
    gpu: 0,
    vramUsed: 0,
    vramTotal: 0 
  });

  // 1. Charger les stats ET les paramètres au démarrage
  useEffect(() => {
    // Charger le nom de l'utilisateur une seule fois
    fetch("http://localhost:11451/api/v1/settings")
      .then(res => res.json())
      .then(data => {
        if (data.userName) setUserName(data.userName);
      })
      .catch(err => console.error("Erreur chargement settings:", err));

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
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
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
        userName={userName} // On passe le nom au layout
        setUserName={setUserName} // On passe la fonction de mise à jour
      />
    </div>
  );
}

export default App;