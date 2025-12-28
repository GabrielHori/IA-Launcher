// G:/IA-Launcher/frontend/src/components/MainPanel.jsx
import React, { useState } from "react";
import AppLayout from "../Layouts/AppLayout";

export default function MainPanel() {
  // État de la navigation
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // États partagés pour l'IA (Modèle et Chat)
  // On les place ici pour qu'ils survivent au changement d'onglet
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [selectedModel, setSelectedModel] = useState("");

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* On transmet TOUS les états et leurs fonctions de modification à AppLayout */}
      <AppLayout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        selectedChatId={selectedChatId}
        setSelectedChatId={setSelectedChatId}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
      />
    </div>
  );
}