import React, { useState, useEffect } from 'react';
import { Trash2, RefreshCw, Database, ShieldCheck, Search, Loader2, AlertTriangle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const FileManager = ({ language }) => {
  const [installedModels, setInstalledModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [modelToConfirm, setModelToConfirm] = useState(null);
  const { isDarkMode } = useTheme();

  const fetchModels = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:11451/api/v1/models");
      if (res.ok) {
        const data = await res.json();
        const modelsList = Array.isArray(data) ? data : (data.models || []);
        const formattedModels = modelsList.map(m => ({
          ...m, 
          size_gb: m.size_gb || (m.size / (1024 ** 3)).toFixed(2)
        }));
        setInstalledModels(formattedModels);
      }
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchModels(); }, []);

  const confirmDelete = async () => {
    const modelName = modelToConfirm;
    setShowConfirm(false);
    try {
      const res = await fetch(`http://localhost:11451/api/v1/models/${encodeURIComponent(modelName)}`, { method: 'DELETE' });
      if (res.ok) setInstalledModels(prev => prev.filter(m => m.name !== modelName));
    } catch (err) { alert("Erreur suppression"); }
  };

  const filteredModels = installedModels.filter(m => (m.name || "").toLowerCase().includes(searchTerm.toLowerCase()));
  const totalSize = installedModels.reduce((acc, curr) => acc + parseFloat(curr.size_gb || 0), 0).toFixed(2);

  return (
    <div className="p-8 w-full h-full overflow-y-auto animate-fade-in custom-scrollbar">
      
      {showConfirm && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-lg">
          <div className={`w-full max-w-md border rounded-[32px] p-8 shadow-2xl ${isDarkMode ? 'bg-zinc-900/90 border-white/10 text-white' : 'bg-white/90 border-black/10 text-slate-900'}`}>
            <div className="flex flex-col items-center text-center">
              <AlertTriangle size={40} className="text-red-500 mb-6" />
              <h2 className="text-2xl font-black mb-2 uppercase italic">Action irréversible</h2>
              <p className="text-sm mb-8 opacity-60">Supprimer "{modelToConfirm}" ?</p>
              <div className="grid grid-cols-2 gap-4 w-full">
                <button onClick={() => setShowConfirm(false)} className={`py-4 rounded-2xl border font-black uppercase text-[10px] tracking-widest ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}>Annuler</button>
                <button onClick={confirmDelete} className="py-4 rounded-2xl bg-red-600 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-500/20">Confirmer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className={`text-6xl font-black tracking-tighter italic uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            EXPLORATEUR <span className="opacity-20">DATA</span>
          </h1>
        </div>
        <div className={`p-6 rounded-[32px] border backdrop-blur-xl flex items-center gap-8 ${isDarkMode ? 'bg-white/[0.03] border-white/10 shadow-2xl' : 'bg-black/[0.02] border-black/5 shadow-xl'}`}>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Local Storage</p>
              <p className="text-4xl font-black text-indigo-600 font-mono italic">{totalSize} GB</p>
            </div>
            <div className="p-5 bg-indigo-600 text-white rounded-[24px] shadow-lg shadow-indigo-500/30"><Database size={32} /></div>
        </div>
      </div>

      <div className={`flex items-center gap-4 border px-8 py-5 rounded-full mb-10 backdrop-blur-md transition-all ${isDarkMode ? 'bg-white/[0.03] border-white/10 focus-within:border-indigo-500/50' : 'bg-black/[0.02] border-black/5 focus-within:border-indigo-500/30'}`}>
        <Search size={22} className="text-indigo-600" />
        <input 
          placeholder="Filtrer vos modèles..." 
          className="bg-transparent outline-none w-full font-bold text-xl placeholder:opacity-20" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
        <button onClick={fetchModels} className="text-indigo-600 hover:rotate-180 transition-transform duration-500">
          {isLoading ? <Loader2 size={24} className="animate-spin" /> : <RefreshCw size={24} />}
        </button>
      </div>

      <div className="space-y-4">
        {filteredModels.map((model) => (
          <div key={model.name} className={`group p-6 rounded-[35px] border flex items-center justify-between transition-all backdrop-blur-md hover:-translate-y-1 ${isDarkMode ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10' : 'bg-black/[0.01] border-black/5 hover:bg-black/[0.03] hover:border-black/10'}`}>
            <div className="flex items-center gap-8">
              <div className="w-16 h-16 rounded-[22px] flex items-center justify-center bg-indigo-600 text-white shadow-xl group-hover:rotate-6 transition-transform">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h3 className={`font-black text-2xl tracking-tighter uppercase italic ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{model.name}</h3>
                <span className="text-[9px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 font-black uppercase border border-emerald-500/10">Ready</span>
              </div>
            </div>
            <div className="flex items-center gap-12">
              <p className="text-3xl font-black text-indigo-500 font-mono italic">{model.size_gb} <span className="text-xs opacity-40">GB</span></p>
              <button onClick={() => { setModelToConfirm(model.name); setShowConfirm(true); }} className="w-14 h-14 flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white rounded-[20px] transition-all">
                <Trash2 size={24} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileManager;