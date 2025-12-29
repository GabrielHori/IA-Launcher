import React, { useState, useEffect, useRef } from 'react';
import { Terminal, X, Copy, Check } from 'lucide-react';

const Console = ({ isDarkMode }) => {
  const [logs, setLogs] = useState([]);
  const [copied, setCopied] = useState(false);
  
  // CHANGEMENT ICI : On référence le CONTENEUR du scroll, pas la fin du texte
  const containerRef = useRef(null);

  const API_URL = "http://localhost:11451/api/v1/system/logs";

  const fetchLogs = async () => {
    try {
      const response = await fetch(`${API_URL}?limit=100`);
      const data = await response.json();
      if (Array.isArray(data.logs)) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  // CHANGEMENT ICI : Logique de scroll "sécurisée"
  useEffect(() => {
    // Si le conteneur existe, on le force à aller tout en bas (scrollHeight)
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]); // Se déclenche quand les logs changent

  const copyLogs = () => {
    const textToCopy = logs.join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`h-full w-full rounded-3xl border overflow-hidden flex flex-col shadow-2xl transition-all duration-500 ${isDarkMode ? 'bg-zinc-900/90 border-white/10' : 'bg-white/90 border-black/10'}`}>
      
      {/* Header de la Console */}
      <div className={`h-14 flex items-center justify-between px-6 border-b flex-shrink-0 ${isDarkMode ? 'border-white/5 bg-black/20' : 'border-black/5 bg-gray-50'}`}>
        <div className="flex items-center gap-3">
          <Terminal size={18} className="text-indigo-500" />
          <span className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            System Logs
          </span>
        </div>
        <button 
          onClick={copyLogs}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border transition-all hover:scale-105 active:scale-95"
        >
          {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} className={isDarkMode ? 'text-white/50' : 'text-slate-400'} />}
          <span className={isDarkMode ? 'text-white/70' : 'text-slate-600'}>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Zone de défilement des logs */}
      {/* CHANGEMENT ICI : On attache la ref (containerRef) à ce div */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-6 custom-scrollbar font-mono text-xs leading-6"
      >
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full opacity-30 text-[10px] uppercase tracking-widest">
            Waiting for system events...
          </div>
        ) : (
          logs.map((line, index) => {
            let lineClass = isDarkMode ? 'text-gray-300' : 'text-slate-600';
            if (line.includes('ERROR')) lineClass = 'text-red-400 font-bold';
            if (line.includes('WARNING')) lineClass = 'text-yellow-400';
            if (line.includes('INFO')) lineClass = 'text-indigo-300';

            return (
              <div key={index} className={`whitespace-pre-wrap break-all ${lineClass} mb-1`}>
                {line}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Console;