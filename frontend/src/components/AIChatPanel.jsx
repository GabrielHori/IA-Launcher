import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, MessageSquare, Plus, Cpu, ChevronLeft, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../constants/translations';

const AIChatPanel = ({ selectedModel, chatId, setSelectedChatId, language }) => {
  const { isDarkMode } = useTheme();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const scrollRef = useRef(null);

  const t = translations[language] || translations.en;

  // --- LOGIQUE DE DONNÉES ---
  useEffect(() => { fetchConversations(); }, [selectedModel]);
  useEffect(() => {
    if (chatId) { loadSpecificConversation(chatId); } 
    else { setMessages([]); }
  }, [chatId]);

  const fetchConversations = async () => {
    try {
      const res = await fetch("http://localhost:11451/api/v1/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(Array.isArray(data) ? data : []);
      }
    } catch (err) { setConversations([]); }
  };

  const loadSpecificConversation = async (id) => {
    try {
      const res = await fetch(`http://localhost:11451/api/v1/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) { console.error(err); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedModel || isTyping) return;
    const currentChatId = chatId || `chat_${Date.now()}`;
    if (!chatId) setSelectedChatId(currentChatId);
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage, { role: 'assistant', content: '' }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:11451/api/v1/chat", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: selectedModel, prompt: input, chat_id: currentChatId }),
      });
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(line.replace('data: ', ''));
              acc += parsed.response || parsed.content || "";
              setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1] = { role: 'assistant', content: acc };
                return newMsgs;
              });
            } catch (e) {}
          }
        }
      }
      fetchConversations();
    } catch (error) { console.error(error); } finally { setIsTyping(false); }
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  return (
    <div className="flex h-full w-full overflow-hidden bg-transparent">
      
      {/* SIDEBAR HISTORIQUE */}
      <div className={`relative h-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] 
        ${isHistoryOpen ? 'w-80' : 'w-0'}`}>
        
        {/* CONTENU SIDEBAR */}
        <div className={`h-full w-80 p-6 flex flex-col transition-all duration-300 border-r
          ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-white/60 border-slate-200'}
          ${isHistoryOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 pointer-events-none'}`}>
          
          <div className="flex items-center mb-10 px-2 mt-4">
            <div className="flex flex-col">
              <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                Database
              </span>
              <span className={`text-[8px] font-bold uppercase tracking-[0.2em] opacity-40 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Flux de données
              </span>
            </div>
          </div>

          <button 
            onClick={() => { setSelectedChatId(null); setMessages([]); }} 
            className="group w-full py-4 mb-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Plus size={14} /> 
            Initialiser session
          </button>

          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
            {conversations.filter(c => c.model === selectedModel).map((conv) => (
              <button 
                key={conv.id} 
                onClick={() => setSelectedChatId(conv.id)}
                className={`w-full text-left px-4 py-4 rounded-xl text-[10px] font-bold truncate flex items-center gap-3 transition-all border
                  ${chatId === conv.id 
                    ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-500' 
                    : (isDarkMode ? 'border-transparent text-white/30 hover:bg-white/5 hover:text-white' : 'border-transparent text-slate-400 hover:bg-black/5 hover:text-slate-900')
                  }`}
              >
                <MessageSquare size={13} className="opacity-40" /> 
                <span className="truncate tracking-tight">{conv.title || "Session Stored"}</span>
              </button>
            ))}
          </div>
        </div>

        {/* --- LEVIER DE RÉTRACTATION (ULTRA-DESIGN) --- */}
        <div 
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          className={`absolute -right-3 top-0 h-full w-6 z-50 cursor-pointer group flex items-center justify-center`}
        >
          {/* Ligne verticale réactive */}
          <div className={`h-[30%] w-[2px] rounded-full transition-all duration-500 group-hover:h-[50%]
            ${isDarkMode ? 'bg-white/10 group-hover:bg-indigo-500' : 'bg-slate-300 group-hover:bg-indigo-500'}`} 
          />
          
          {/* Bouton central flottant */}
          <div className={`absolute top-1/2 -translate-y-1/2 w-5 h-10 rounded-full border flex items-center justify-center transition-all duration-300
            ${isDarkMode ? 'bg-[#0f0f0f] border-white/10' : 'bg-white border-slate-200 shadow-sm'}
            ${isHistoryOpen ? 'translate-x-0' : 'translate-x-2'}`}>
            {isHistoryOpen ? 
              <ChevronLeft size={12} className={isDarkMode ? 'text-white/40' : 'text-slate-400'} /> : 
              <ChevronRight size={12} className="text-indigo-500" />
            }
          </div>
        </div>
      </div>

      {/* ZONE DE CHAT PRINCIPALE */}
      <div className="flex-1 flex flex-col relative min-w-0 h-full">
        
        {/* ZONE MESSAGES */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-12 space-y-10 custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-30 select-none">
               <Sparkles size={40} className="text-indigo-500 mb-6 animate-pulse" />
               <div className="text-center space-y-2">
                 <p className={`font-black uppercase tracking-[0.6em] text-[10px] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Système en attente</p>
                 <p className="text-[8px] font-medium tracking-[0.2em] opacity-50">Liaison neuronale établie avec {selectedModel}</p>
               </div>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
              <div className={`max-w-[85%] md:max-w-[75%] p-7 rounded-[32px] border transition-all ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-2xl shadow-indigo-600/20' 
                  : (isDarkMode 
                      ? 'bg-white/[0.02] border-white/5 text-gray-200 shadow-inner' 
                      : 'bg-white border-slate-200 text-slate-800 shadow-sm')
              }`}>
                <div className={`prose ${isDarkMode ? 'prose-invert' : 'prose-slate'} prose-sm max-w-none font-medium leading-relaxed`}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex items-center gap-4 ml-6">
               <div className="flex gap-1.5">
                 <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                 <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                 <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
               </div>
               <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-500/60 italic">Processing flux...</span>
            </div>
          )}
        </div>

        {/* INPUT BAR (STYLE FORGE INCRUSTÉ) */}
        <div className={`px-6 md:px-12 pb-12 pt-2 transition-all duration-500`}>
          <div className="max-w-5xl mx-auto">
            <form 
              onSubmit={handleSendMessage} 
              className={`relative flex items-center transition-all duration-500 rounded-[24px] border group
                ${isDarkMode 
                  ? 'bg-[#060606] border-white/5 shadow-[inset_0_4px_20px_rgba(0,0,0,1)] focus-within:border-indigo-500/30' 
                  : 'bg-slate-50 border-slate-200 shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] focus-within:border-indigo-500/50'}`}
            >
              <div className="pl-7">
                <Cpu size={18} className={`${isTyping ? 'text-indigo-500 animate-pulse' : 'text-indigo-500/30'} transition-colors`} />
              </div>

              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={language === 'fr' ? "ENTRER UNE REQUÊTE SYSTÈME..." : "ENTER SYSTEM REQUEST..."}
                className={`w-full bg-transparent px-6 py-7 text-[11px] font-black tracking-[0.25em] uppercase outline-none
                  ${isDarkMode ? 'text-indigo-50 text-white placeholder:text-white/5' : 'text-slate-900 placeholder:text-slate-300'}`}
              />

              <div className="pr-4">
                <button 
                  type="submit" 
                  disabled={isTyping || !input.trim()}
                  className={`flex items-center gap-3 px-8 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all
                    ${isTyping || !input.trim() 
                      ? 'opacity-10 grayscale cursor-not-allowed' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-400 shadow-[0_10px_25px_-5px_rgba(99,102,241,0.5)] active:scale-95'}`}
                >
                  <span>{language === 'fr' ? 'Exécuter' : 'Execute'}</span>
                  <Send size={14} />
                </button>
              </div>
            </form>
            
            {/* FOOTER BARRE */}
            <div className="mt-4 px-8 flex justify-between items-center select-none">
              <div className="flex gap-6">
                <span className="text-[7px] font-black uppercase tracking-[0.4em] opacity-20">{selectedModel}</span>
                <span className="text-[7px] font-black uppercase tracking-[0.4em] opacity-20 text-indigo-500">Latency: 24ms</span>
              </div>
              <span className="text-[7px] font-black uppercase tracking-[0.4em] opacity-20 italic">Terminal v4.0.2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatPanel;