import React, { useState, useEffect, useRef } from 'react';
import { Cpu, HardDrive, MemoryStick, Activity, Zap, ShieldCheck, Search } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Dashboard = ({ systemStats, language }) => {
  const { isDarkMode } = useTheme();
  const canvasRef = useRef(null);

  // --- LOGIQUE DU FOND DE PARTICULES ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < 80; i++) particles.push(new Particle());
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Couleur adaptable
      ctx.fillStyle = isDarkMode ? 'rgba(99, 102, 241, 0.15)' : 'rgba(79, 70, 229, 0.1)';
      ctx.strokeStyle = isDarkMode ? 'rgba(99, 102, 241, 0.05)' : 'rgba(79, 70, 229, 0.05)';
      ctx.lineWidth = 0.5;

      particles.forEach((p, i) => {
        p.update();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });
      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    init();
    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [isDarkMode]); // Dépendance ajoutée pour changer la couleur des particules

  const formatVal = (val) => {
    if (typeof val === 'object' && val !== null) return val.usage_percent ?? val.percent ?? 0;
    return val ?? 0;
  };

  const vramPercent = systemStats.vramTotal > 0 
    ? (systemStats.vramUsed / systemStats.vramTotal) * 100 
    : formatVal(systemStats.gpu);

  const suggestedModels = [
    { name: 'llama3.2:3b', size: '2.0GB', desc: 'Versatile AI' },
    { name: 'mistral', size: '4.1GB', desc: 'Balanced Performance' },
    { name: 'deepseek-r1:7b', size: '4.7GB', desc: 'Advanced Reasoning' },
    { name: 'phi3:mini', size: '2.3GB', desc: 'Lightweight' },
    { name: 'qwen2.5:7b', size: '4.7GB', desc: 'Coding Expert' },
    { name: 'codellama', size: '3.8GB', desc: 'Dev Assistant' }
  ];

  return (
    <div className={`relative w-full h-full overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* CANVAS DE PARTICULES */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-40" />

      {/* CONTENU PRINCIPAL */}
      <div className="relative z-10 p-8 w-full h-full overflow-y-auto custom-scrollbar">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">DASHBOARD</h1>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.4em] mt-1 italic">Horizon Forge Neural Interface</p>
          </div>
          
          <div className={`flex items-center gap-6 p-4 rounded-[28px] border backdrop-blur-xl shadow-2xl transition-all ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-white border-slate-200'}`}>
              <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">Core Status</span>
                  <span className={`text-[9px] font-bold uppercase tracking-tighter mt-1 ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>Ready for Compute</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Activity size={20} className="text-emerald-500 animate-pulse" />
              </div>
          </div>
        </div>

        {/* MONITORING BAR */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 p-2 border rounded-[32px] transition-all ${isDarkMode ? 'bg-white/[0.03] border-white/5' : 'bg-slate-200/50 border-slate-200'}`}>
          <CompactStat label="Processor" value={formatVal(systemStats.cpu)} color="indigo" icon={Cpu} isDarkMode={isDarkMode} />
          <CompactStat label="Memory" value={formatVal(systemStats.ram)} color="blue" icon={MemoryStick} isDarkMode={isDarkMode} />
          <CompactStat label="Neural VRAM" value={vramPercent} color="emerald" icon={HardDrive} isDarkMode={isDarkMode} />
        </div>

        {/* SUGGESTED MODELS */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-6 opacity-30">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] italic whitespace-nowrap">Suggested Units</h2>
              <div className={`h-[1px] w-full bg-gradient-to-r ${isDarkMode ? 'from-white/20' : 'from-slate-400/50'} to-transparent`}></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {suggestedModels.map((m) => (
              <div key={m.name} className={`group relative overflow-hidden p-6 rounded-[32px] border transition-all duration-500 ${isDarkMode ? 'bg-white/[0.03] border-white/5 hover:border-indigo-500/40' : 'bg-white border-slate-200 hover:border-indigo-500 shadow-sm hover:shadow-xl'}`}>
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[9px] font-black bg-indigo-600/10 text-indigo-500 px-2.5 py-1 rounded-md border border-indigo-500/20 uppercase">{m.size}</span>
                    <ShieldCheck size={16} className={`${isDarkMode ? 'text-emerald-500/30' : 'text-emerald-500/50'} group-hover:text-emerald-500 transition-colors`} />
                  </div>
                  <h4 className="text-xl font-black uppercase italic mb-1 tracking-tight">{m.name}</h4>
                  <p className={`text-[9px] font-bold uppercase tracking-widest mb-6 ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>{m.desc}</p>
                  
                  <button className={`w-full py-3.5 rounded-2xl border text-[10px] font-black uppercase transition-all shadow-sm ${isDarkMode ? 'bg-white/[0.03] border-white/10 hover:bg-indigo-600 hover:text-white' : 'bg-slate-50 border-slate-200 hover:bg-indigo-600 hover:text-white'}`}>
                    Initialize Forge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CONSOLE SEARCH */}
        <div className={`p-8 border rounded-[40px] shadow-2xl transition-all ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-200'}`}>
           <div className={`flex items-center gap-4 p-2 border rounded-[24px] focus-within:border-indigo-500/50 transition-all ${isDarkMode ? 'bg-black/40 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <Search size={22} className={`ml-4 ${isDarkMode ? 'text-white/10' : 'text-slate-300'}`} />
              <input className="flex-1 bg-transparent py-4 text-xs font-bold uppercase outline-none placeholder:opacity-30 tracking-widest" placeholder="SEARCH UNIT..." />
              <button className="px-10 py-4 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all">Pull Model</button>
           </div>
        </div>
      </div>
    </div>
  );
};

const CompactStat = ({ label, value, color, icon: Icon, isDarkMode }) => {
  const colorClass = color === 'indigo' ? 'bg-indigo-500' : color === 'blue' ? 'bg-blue-500' : 'bg-emerald-500';
  const textColor = color === 'indigo' ? 'text-indigo-500' : color === 'blue' ? 'text-blue-500' : 'text-emerald-500';

  return (
    <div className={`relative overflow-hidden p-5 rounded-[28px] border flex items-center gap-5 transition-all group ${isDarkMode ? 'bg-black/40 border-white/5 hover:bg-white/[0.03]' : 'bg-white border-slate-100 hover:bg-slate-50'}`}>
      <div className={`p-4 rounded-2xl border flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ${isDarkMode ? 'bg-white/[0.02] border-white/5 shadow-xl' : 'bg-slate-50 border-slate-200'}`}>
        <Icon size={20} className={textColor} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-end mb-2">
          <span className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-white/20' : 'text-slate-400'}`}>{label}</span>
          <span className="text-xl font-black italic">{Math.round(value)}%</span>
        </div>
        <div className={`w-full h-[3.5px] rounded-full overflow-hidden ${isDarkMode ? 'bg-white/5' : 'bg-slate-200'}`}>
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${colorClass}`}
            style={{ width: `${value}%`, boxShadow: isDarkMode ? `0 0 15px ${colorClass === 'bg-indigo-500' ? '#6366f1' : '#10b981'}` : 'none' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;