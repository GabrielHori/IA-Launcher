import React, { useState, useEffect } from 'react';
import { Wifi, Rocket, User, Save, Languages, Loader2, HardDrive, Search } from 'lucide-react';
import { translations } from '../constants/translations';
import { useTheme } from '../contexts/ThemeContext';
import { open } from '@tauri-apps/plugin-dialog';

export default function Settings({ userName, setUserName, language, setLanguage }) {
  const { isDarkMode } = useTheme();
  
  const [settings, setSettings] = useState({
    userName: userName || "Horizon",
    language: language || "en",
    internetAccess: false,
    runAtStartup: false,
    autoUpdate: true,
    ollama_models_path: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modelsPath, setModelsPath] = useState("");

  const t = translations[settings.language] || translations.en;

  useEffect(() => {
    fetch("http://localhost:11451/api/v1/settings")
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        if (data.ollama_models_path) setModelsPath(data.ollama_models_path);
        if (data.userName) setUserName(data.userName);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("http://localhost:11451/api/v1/settings", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setUserName(settings.userName);
        setLanguage(settings.language);
        alert(t.settings.success);
      }
    } catch (err) {
      alert(t.settings.error);
    } finally {
      setIsSaving(false);
    }
  };

  const selectFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Sélectionner le dossier des modèles Ollama"
      });
      if (selected && !Array.isArray(selected)) {
        setModelsPath(selected); // Mise à jour visuelle
        
        // Sauvegarde immédiate dans le backend
        await fetch("http://localhost:11451/api/v1/settings", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ollama_models_path: selected })
        });
        
        // Alert traduite
        alert("Dossier des modèles mis à jour. Relancez l'application pour appliquer le changement.");
      }
    } catch (err) {
      console.error("Erreur dossier:", err);
    }
  };

  if (loading) return <div className={`p-20 opacity-20 animate-pulse font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>INITIALIZING...</div>;

  return (
    <div className={`p-12 w-full h-full overflow-y-auto animate-page-entry transition-colors duration-500 ${isDarkMode ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* HEADER */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-1 w-12 bg-indigo-500 rounded-full"></div>
            <span className="text-indigo-500 font-black text-[10px] uppercase tracking-[0.4em]">{t.settings.subtitle}</span>
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-tight">
            {t.settings.title} <span className={`${isDarkMode ? 'opacity-30' : 'opacity-10'} italic font-light`}>Horizon</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* INTERFACE */}
          <SectionContainer title={t.settings.interface_title} icon={Languages} isDarkMode={isDarkMode}>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isDarkMode ? 'opacity-60' : 'text-slate-500'}`}>{t.settings.lang_label}</span>
                <div className={`flex p-1 rounded-xl border ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
                  {['fr', 'en'].map((lang) => (
                    <button 
                      key={lang} 
                      onClick={() => setSettings({...settings, language: lang})}
                      className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${settings.language === lang ? 'bg-indigo-600 text-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
                <div className="flex items-center gap-3">
                  <Wifi size={16} className={settings.internetAccess ? "text-emerald-500" : "opacity-20"} />
                  <span className="text-xs font-bold">{t.settings.internet_label}</span>
                </div>
                <Toggle active={settings.internetAccess} onClick={() => toggleSetting('internetAccess')} color="bg-emerald-500" />
              </div>
            </div>
          </SectionContainer>

          {/* INITIALIZATION */}
          <SectionContainer title={t.settings.init_title} icon={Rocket} isDarkMode={isDarkMode}>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold">{t.settings.startup_label}</p>
                    <p className={`text-[9px] uppercase mt-1 ${isDarkMode ? 'opacity-40' : 'text-slate-400'}`}>{t.settings.startup_sub}</p>
                </div>
                <Toggle active={settings.runAtStartup} onClick={() => toggleSetting('runAtStartup')} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold">{t.settings.update_label}</p>
                    <p className={`text-[9px] uppercase mt-1 ${isDarkMode ? 'opacity-40' : 'text-slate-400'}`}>{t.settings.update_sub}</p>
                </div>
                <Toggle active={settings.autoUpdate} onClick={() => toggleSetting('autoUpdate')} />
              </div>
            </div>
          </SectionContainer>

          {/* --- STOCKAGE (MODIFIÉ POUR TRADUCTION) --- */}
          <SectionContainer title={t.settings.storage_title} icon={HardDrive} isDarkMode={isDarkMode}>
            <div className="space-y-4">
              <p className={`text-xs ${isDarkMode ? 'opacity-60' : 'text-slate-500'}`}>{t.settings.storage_desc}</p>
              
              <div className="flex items-center gap-3">
                <input 
                    type="text" 
                    readOnly
                    value={modelsPath} 
                    placeholder={t.settings.storage_placeholder}
                    className={`flex-1 p-3 rounded-xl border text-xs font-mono uppercase outline-none ${isDarkMode ? 'bg-black/40 border-white/5 text-white/40' : 'bg-white border-slate-200 text-slate-400'}`}
                />
                <button 
                   onClick={selectFolder}
                   className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95"
                >
                   <Search size={16} />
                   {t.settings.storage_browse}
                </button>
              </div>
            </div>
          </SectionContainer>

          {/* IDENTITY */}
          <div className={`md:col-span-2 p-8 rounded-[32px] border transition-all ${isDarkMode ? 'bg-[#0A0A0A] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center gap-4 mb-8">
              <User className="text-indigo-500" size={22} />
              <h2 className="text-sm font-black uppercase tracking-widest">{t.settings.identity_title}</h2>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 items-end">
              <div className="flex-1 w-full">
                <label className={`text-[9px] font-black uppercase tracking-[0.2em] mb-3 block ${isDarkMode ? 'opacity-40' : 'text-slate-400'}`}>{t.settings.name_label}</label>
                <input 
                  type="text" 
                  value={settings.userName} 
                  onChange={(e) => setSettings({...settings, userName: e.target.value})}
                  className={`w-full border rounded-2xl px-6 py-4 font-bold outline-none focus:border-indigo-500 transition-all ${isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} 
                />
              </div>
              <button 
                onClick={saveSettings} 
                disabled={isSaving} 
                className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 min-w-[200px] justify-center shadow-lg shadow-indigo-600/20 active:scale-95"
              >
                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {isSaving ? t.settings.syncing : t.settings.save_btn}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Composants internes utilitaires
const SectionContainer = ({ children, title, icon: Icon, isDarkMode }) => (
  <div className={`p-8 rounded-[32px] border transition-all ${isDarkMode ? 'bg-[#0A0A0A] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
    <div className="flex items-center gap-4 mb-8">
      <Icon className="text-indigo-500" size={22} />
      <h2 className="text-sm font-black uppercase tracking-widest">{title}</h2>
    </div>
    {children}
  </div>
);

const Toggle = ({ active, onClick, color = "bg-indigo-600" }) => (
  <button 
    onClick={onClick} 
    className={`w-12 h-6 rounded-full transition-all relative ${active ? color : 'bg-slate-300 dark:bg-gray-700'}`}
  >
    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${active ? 'left-7' : 'left-1'}`}></div>
  </button>
);