import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  HardDrive,
  MemoryStick,
  Activity,
  ShieldCheck,
  Search,
  XCircle,
  Play,
  Terminal,
  Download,
  Loader2
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Console from '../components/Console';
import { translations } from '../constants/translations';
import { Command } from '@tauri-apps/plugin-shell';

const Dashboard = ({ systemStats, language, healthStatus = 'loading' }) => {
  const { isDarkMode } = useTheme();
  const canvasRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [isStartingBackend, setIsStartingBackend] = useState(false);
  const [customModelName, setCustomModelName] = useState("");
  
  // --- ÉTATS POUR LES MODÈLES ---
  const [installedModels, setInstalledModels] = useState([]);
  const [downloadingModels, setDownloadingModels] = useState(new Set()); // Suivi statut
  const [downloadProgress, setDownloadProgress] = useState({}); // Stocke le % pour chaque modèle
  const [isLoadingModels, setIsLoadingModels] = useState(true);

  const t = translations[language] || translations.en;

  // --- LANCEMENT AUTOMATIQUE DU BACKEND ---
  useEffect(() => {
    const startBackend = async () => {
      setIsStartingBackend(true);
      try {
        const { Command } = await import('@tauri-apps/plugin-shell');
        await Command.create(
          "powershell",
          ["-NoProfile", "-Command", "Start-Process backend.exe"]
        ).spawn();
        setTimeout(() => setIsStartingBackend(false), 3000);
      } catch (err) {
        console.error("Erreur lancement backend:", err);
        alert("Impossible de lancer le backend.exe");
        setIsStartingBackend(false);
      }
    };
    startBackend();
  }, []);

  

  // --- LOGIQUE DU FOND DE PARTICULES ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrame;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.5,
      dx: (Math.random() - 0.5) * 0.2, dy: (Math.random() - 0.5) * 0.2
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)";
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });
      animationFrame = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animationFrame); window.removeEventListener("resize", resize); };
  }, [isDarkMode]);

  const formatVal = val => (typeof val === 'object' && val !== null ? val.usage_percent ?? val.percent ?? 0 : val ?? 0);
  const vramPercent = systemStats?.vramTotal > 0 ? (systemStats.vramUsed / systemStats.vramTotal) * 100 : formatVal(systemStats?.gpu);

  // --- DONNÉES ---
  const suggestedModels = [
    { name: 'llama3.2:3b', size: '2.0GB', descKey: 'llama_desc', descDefault: 'Versatile AI' },
    { name: 'mistral', size: '4.1GB', descKey: 'mistral_desc', descDefault: 'Balanced Performance' },
    { name: 'deepseek-r1:7b', size: '4.7GB', descKey: 'deepseek_desc', descDefault: 'Advanced Reasoning' },
    { name: 'phi3:mini', size: '2.3GB', descKey: 'phi_desc', descDefault: 'Lightweight' },
    { name: 'qwen2.5:7b', size: '4.7GB', descKey: 'qwen_desc', descDefault: 'Coding Expert' },
    { name: 'codellama', size: '3.8GB', descKey: 'code_desc', descDefault: 'Dev Assistant' }
  ];

  const mergedModels = [
    ...suggestedModels,
    ...installedModels
      .filter(name => !suggestedModels.find(m => m.name === name))
      .map(name => ({ name, size: 'Unknown', descKey: 'custom_desc', descDefault: 'User Installed', isInstalled: true }))
  ];

  // --- FONCTION TÉLÉCHARGER (AVEC SIMULATION PROGRESS) ---
  const downloadModel = async (modelName) => {
    if (downloadingModels.has(modelName)) return;

    // 1. Initialiser les états
    setDownloadingModels(prev => new Set(prev).add(modelName));
    setDownloadProgress(prev => ({ ...prev, [modelName]: 0 })); // Commence à 0%

    try {
      // 2. Lancer la commande Backend
      await fetch("http://localhost:11451/api/v1/models/pull", {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `model_name=${encodeURIComponent(modelName)}`
      });

      // 3. Simulation de la barre de progression (0% -> 95%)
      // On utilise un timer local pour ce modèle
      const timer = setInterval(() => {
        setDownloadProgress(prev => {
          const current = prev[modelName] || 0;
          if (current < 95) {
            return { ...prev, [modelName]: current + 1 }; // Monte doucement
          }
          return prev;
        });
      }, 300); // Update toutes les 300ms

      // 4. Vérification réelle (Est-ce que c'est fini ?)
      const checkInterval = setInterval(async () => {
        try {
          const r = await fetch("http://localhost:11451/api/v1/models");
          const d = await r.json();
          const names = d.models ? d.models.map(m => m.name) : [];
          
          // Si le modèle est dans la liste, il est téléchargé !
          if (names.includes(modelName)) {
            // Arrêt des timers
            clearInterval(timer);
            clearInterval(checkInterval);

            // Fin : 100% pendant 2 secondes
            setDownloadProgress(prev => ({ ...prev, [modelName]: 100 }));
            
            setTimeout(() => {
               // Nettoyage des états
               setDownloadingModels(prev => {
                 const next = new Set(prev);
                 next.delete(modelName);
                 return next;
               });
               setDownloadProgress(prev => {
                 const { [modelName]: _, ...rest } = prev;
                 return rest; // Supprime la progression
               });
            }, 2000);
          }
        } catch (e) { console.log("Attente fin DL..."); }
      }, 3000); // Vérification toutes les 3 secondes

    } catch (e) {
      console.error("Erreur téléchargement:", e);
      alert(t.dash?.error || "Error downloading model");
      // Reset en cas d'erreur
      setDownloadingModels(prev => { const next = new Set(prev); next.delete(modelName); return next; });
    }
  };

  const handleCustomDownload = (e) => {
    e.preventDefault();
    if (!customModelName.trim()) return;
    downloadModel(customModelName.trim());
    setCustomModelName("");
  };

  // --- FILTRAGE ---
  const filteredModels = mergedModels.map(m => ({
    ...m,
    isInstalled: installedModels.includes(m.name),
    displayDesc: t.dash?.[m.descKey] || m.descDefault,
    isDownloading: downloadingModels.has(m.name),
    progress: downloadProgress[m.name] || 0 // Ajout du %
  })).filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.displayDesc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`relative w-full h-full overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-30" />

      <div className="relative z-10 p-8 h-full overflow-y-auto custom-scrollbar pb-24 space-y-8">
        
        {/* HEADER */}
        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">
          {t.dash?.title || "DASHBOARD"}
        </h1>

        {/* ALERT BACKEND */}
        {(healthStatus === 'degraded' || healthStatus === 'unreachable') && (
          <div className="p-6 rounded-3xl border bg-red-500/5 border-red-500/20 flex justify-between items-center">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/10 rounded-full border border-red-500/30 text-red-500">
                    <Terminal size={20} />
                </div>
                <div>
                   <h3 className="text-lg font-black text-red-500 uppercase tracking-wider mb-1">Neural Core Offline</h3>
                   <p className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>Backend process not detected.</p>
                </div>
             </div>
             <button 
                onClick={() => {}} 
                className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
             >
                <Play size={14} /> Start Core
             </button>
          </div>
        )}

        {/* SYSTEM STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MiniStatCard label={t.dash?.cpu || "CPU"} value={formatVal(systemStats?.cpu)} Icon={Cpu} isDarkMode={isDarkMode} color="indigo" />
          <MiniStatCard label={t.dash?.ram || "RAM"} value={formatVal(systemStats?.ram)} Icon={MemoryStick} isDarkMode={isDarkMode} color="blue" />
          <MiniStatCard label={t.dash?.vram || "VRAM"} value={vramPercent} Icon={HardDrive} isDarkMode={isDarkMode} color="emerald" />
        </div>

        {/* BLOC MODÈLES + RECHERCHE + CUSTOM ADD */}
        <div className="p-8 border rounded-[40px] shadow-2xl transition-all bg-white/[0.02] border-white/5">
           

           {/* CUSTOM ADD */}
           <div className={`p-4 rounded-2xl border mb-6 flex flex-col md:flex-row gap-3 ${isDarkMode ? 'bg-indigo-500/5 border-indigo-500/10' : 'bg-indigo-50 border-indigo-200'}`}>
              <div className="flex-1">
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>{t.dash?.custom_title || "ADD CUSTOM MODEL"}</p>
                  <p className={`text-[9px] ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>{t.dash?.custom_desc || "Download any model from Ollama Hub."}</p>
              </div>
              <form onSubmit={handleCustomDownload} className="flex items-center gap-2 w-full md:w-auto">
                 <input type="text" value={customModelName} onChange={e => setCustomModelName(e.target.value)} placeholder={t.dash?.custom_placeholder || "ex: llama3.2:3b"} className={`flex-1 w-full md:w-64 px-4 py-3 rounded-xl border text-xs font-bold outline-none transition-all ${isDarkMode ? 'bg-black/40 border-white/10 text-white focus:border-indigo-500' : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'}`} />
                 <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95"><Download size={14} /> {t.dash?.btn_add || "DOWNLOAD"}</button>
              </form>
           </div>
           
           {/* LISTE DES MODÈLES */}
           {filteredModels.length === 0 ? (
              <div className={`text-center py-12 rounded-3xl border border-dashed border-white/5 text-white/10`}>
                 {t.dash?.noModelsFound || "No models found matching"} "{searchTerm}"
              </div>
           ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {filteredModels.map(m => (
                  <ModelCard 
                    key={m.name} 
                    model={m} 
                    displayDesc={m.displayDesc} 
                    isDarkMode={isDarkMode} 
                    t={t} 
                    isInstalled={m.isInstalled} 
                    isDownloading={m.isDownloading}
                    progress={m.progress}
                    onDownload={downloadModel} 
                  />
                ))}
              </div>
           )}

           {/* RECHERCHE EN BAS (PLEINE LARGEUR) */}
           <div className="mt-8 flex items-center gap-4 p-3 border rounded-[24px] focus-within:border-indigo-500/50 transition-all w-full bg-black/40 border-white/10">
              <Search size={24} className="text-white/20" />
              <input className="flex-1 bg-transparent py-4 text-sm font-bold uppercase outline-none placeholder:opacity-30 tracking-widest text-white" placeholder={t.dash?.searchPlaceholder || "SEARCH UNIT..."} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              {searchTerm && (<button onClick={() => setSearchTerm('')} className="p-1 hover:bg-white/10 rounded-full transition-colors"><XCircle size={20} className="text-white/50" /></button>)}
           </div>
        </div>

        {/* CONSOLE */}
        <div className="h-[300px] w-full"><Console isDarkMode={isDarkMode} /></div>
      </div>
    </div>
  );
};

// MINI STAT CARD
const MiniStatCard = ({ label, value, Icon, color, isDarkMode }) => {
  const colorClass = color === 'indigo' ? 'bg-indigo-500' : color === 'blue' ? 'bg-blue-500' : 'bg-emerald-500';
  const textColor = color === 'indigo' ? 'text-indigo-500' : color === 'blue' ? 'text-blue-500' : 'text-emerald-500';
  return (
    <div className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-white border-slate-200'}`}>
      <div className={`p-3 rounded-xl border flex items-center justify-center ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-200'}`}><Icon size={20} className={textColor} /></div>
      <div className="flex-1">
        <div className="flex justify-between items-end mb-1">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/20' : 'text-slate-400'}`}>{label}</span>
          <span className="text-lg font-black italic">{Math.round(value)}%</span>
        </div>
        <div className={`w-full h-[4px] rounded-full overflow-hidden ${isDarkMode ? 'bg-white/5' : 'bg-slate-200'}`}>
          <div className={`h-full rounded-full transition-all duration-1000 ${colorClass}`} style={{ width: `${value}%`, boxShadow: isDarkMode ? `0 0 10px ${colorClass === 'bg-indigo-500' ? '#6366f1' : '#10b981'}` : 'none' }} />
        </div>
      </div>
    </div>
  );
};

// MODEL CARD AVEC BARRE DE PROGRESSION
const ModelCard = ({ model, displayDesc, isDarkMode, t, isInstalled, isDownloading, progress, onDownload }) => {
  return (
    <div className={`p-6 rounded-2xl border flex flex-col gap-3 transition-all ${isDarkMode ? 'bg-black/40 border-white/5 hover:bg-white/[0.03]' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
      <div className="flex justify-between items-center">
        <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-white/20' : 'text-slate-400'}`}>{model.name}</span>
        <div className="flex items-center gap-2">
          {isInstalled && !isDownloading && <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 ${isDarkMode ? 'border border-emerald-500/20' : ''}`}>INSTALLED</span>}
          {isDownloading && <span className="text-[9px] font-bold uppercase text-indigo-500">{progress}%</span>}
          {!isInstalled && !isDownloading && <ShieldCheck size={16} className="opacity-20" />}
        </div>
      </div>
      
      <p className={`text-xs opacity-60 ${isDarkMode ? 'text-white/30' : 'text-slate-500'}`}>{displayDesc}</p>

      {/* BOUTON ET PROGRESSION */}
      <div className="space-y-2">
        <button 
            onClick={() => isInstalled ? null : onDownload(model.name)}
            disabled={isDownloading}
            className={`
              w-full py-2.5 rounded-xl border text-xs font-black uppercase 
              transition-all flex items-center justify-center gap-2
              ${isDownloading ? 'opacity-50 cursor-wait' : 'active:scale-95'}
              ${
                isInstalled 
                ? `${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white' : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-600 hover:text-white'}` 
                : `${isDarkMode ? 'bg-white/[0.03] border-white/10 hover:bg-indigo-600 hover:text-white' : 'bg-slate-50 border-slate-200 hover:bg-indigo-600 hover:text-white'}`
              }
            `}
          >
            {isInstalled && !isDownloading && <Play size={14} />}
            {!isInstalled && !isDownloading && <Download size={14} />}
            {isDownloading && <Loader2 className="animate-spin" size={14} />}
            {isInstalled && !isDownloading ? (t.dash?.initialize || "INITIALIZE") : (t.dash?.download || "DOWNLOAD")}
          </button>

        {/* BARRE DE PROGRESSION VISUELLE */}
        {isDownloading && (
            <div className={`w-full h-[6px] rounded-full overflow-hidden ${isDarkMode ? 'bg-white/5' : 'bg-slate-200'}`}>
                <div 
                    className="h-full bg-indigo-500 transition-all duration-300" 
                    style={{ width: `${progress}%`, boxShadow: isDarkMode ? `0 0 10px #6366f1` : 'none' }} 
                />
            </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;