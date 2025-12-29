import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, MessageSquare, Plus, Cpu, ChevronLeft, ChevronRight, Image as ImageIcon, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '../contexts/ThemeContext';
// Import des traductions
import { translations } from '../constants/translations';

const AIChatPanel = ({ selectedModel, chatId, setSelectedChatId, language }) => {
  const { isDarkMode } = useTheme();
  
  // --- DÉFINITION DE L'OBJET TRADUCTION ---
  const t = translations[language] || translations.en;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const scrollRef = useRef(null);
  
  // --- ÉTATS POUR LES MÉDIAS ---
  const [selectedFile, setSelectedFile] = useState(null); 
  const [previewUrl, setPreviewUrl] = useState(null);    
  const fileInputRef = useRef(null);                       

  // 1. Reset et rechargement lors du changement de modèle
  useEffect(() => {
    setMessages([]);
    setSelectedChatId(null);
    fetchConversations();
    setSelectedFile(null);
    setPreviewUrl(null);
  }, [selectedModel]);

  // 2. Charger une conversation spécifique
  useEffect(() => {
    if (chatId) {
      loadSpecificConversation(chatId);
    }
  }, [chatId]);

  // --- LOGIQUE DE GESTION DU FICHIER ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch("http://localhost:11451/api/v1/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Erreur historique:", err);
    }
  };

  const loadSpecificConversation = async (id) => {
    try {
      const res = await fetch(`http://localhost:11451/api/v1/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Erreur chargement session:", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || isTyping) return;

    const currentChatId = chatId || `chat_${Date.now()}`;
    if (!chatId) setSelectedChatId(currentChatId);

    const userMsg = { 
      role: 'user', 
      content: input, 
      image: previewUrl 
    };
    
    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '' }]);
    setInput('');
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsTyping(true);

    try {
      const formData = new FormData();
      formData.append('model', selectedModel);
      formData.append('prompt', input);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      formData.append('chat_id', currentChatId);

      const response = await fetch("http://localhost:11451/api/v1/chat", {
        method: 'POST',
        body: formData,
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(line.replace('data: ', ''));
              const content = parsed.response || parsed.content || parsed.message?.content || "";
              acc += content;
              
              setMessages(prev => {
                const updated = [...prev];
                if (updated.length > 0) {
                  updated[updated.length - 1] = { role: 'assistant', content: acc };
                }
                return updated;
              });
            } catch (e) {}
          }
        }
      }
      fetchConversations();
    } catch (err) {
      console.error("Erreur Chat:", err);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="flex h-full w-full overflow-hidden bg-transparent">
      
      {/* SIDEBAR HISTORIQUE */}
      <div className={`relative h-full transition-all duration-500 ${isHistoryOpen ? 'w-80' : 'w-0'}`}>
        <div className={`h-full w-80 p-6 flex flex-col border-r transition-all ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-white/60 border-slate-200'} ${!isHistoryOpen && 'hidden'}`}>
          
          <div className="mb-6 px-2">
            <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{t.chat.database}</span>
            <p className="text-[8px] opacity-40 uppercase font-bold">{selectedModel}</p>
          </div>

          <button 
            onClick={() => { setSelectedChatId(null); setMessages([]); }} 
            className="w-full py-4 mb-8 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-indigo-600/20"
          >
            <Plus size={14} /> {t.chat.new_session}
          </button>

          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
            {conversations
              .filter(c => c.model === selectedModel)
              .map((conv) => (
                <button 
                  key={conv.id} 
                  onClick={() => setSelectedChatId(conv.id)} 
                  className={`w-full text-left px-4 py-4 rounded-xl text-[10px] font-bold truncate flex items-center gap-3 border transition-all ${chatId === conv.id ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-500' : 'border-transparent text-slate-400 hover:bg-black/5'}`}
                >
                  <MessageSquare size={13} className="shrink-0" /> 
                  <span className="truncate">{conv.title}</span>
                </button>
              ))}
          </div>
        </div>

        <div onClick={() => setIsHistoryOpen(!isHistoryOpen)} className="absolute -right-3 top-0 h-full w-6 z-50 cursor-pointer flex items-center justify-center group">
          <div className="w-5 h-10 rounded-full border bg-white flex items-center justify-center shadow-sm transition-transform group-hover:scale-110">
            {isHistoryOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} className="text-indigo-500" />}
          </div>
        </div>
      </div>

      {/* ZONE DE CHAT */}
      <div className="flex-1 flex flex-col min-w-0">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-12 space-y-10 custom-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[75%] p-7 rounded-[32px] border ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white border-indigo-500' 
                  : (isDarkMode ? 'bg-white/[0.03] border-white/10 text-gray-200' : 'bg-white border-slate-200 text-slate-800')
              }`}>
                {/* Affichage de l'image */}
                {msg.image && (
                  <img src={msg.image} alt="User upload" className="rounded-xl mb-4 max-w-full max-h-64 object-cover border border-white/20" />
                )}
                <div className={`prose prose-sm max-w-none ${isDarkMode ? 'prose-invert' : 'prose-slate'}`}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="ml-6 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{t.chat.active_flux}</span>
            </div>
          )}
        </div>

        {/* BARRE D'ENTREE */}
        <div className="px-6 md:px-12 pb-12 relative z-20">
          
          {/* APERÇU IMAGE */}
          {previewUrl && (
            <div className="max-w-5xl mx-auto mb-3 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="relative group">
                <img src={previewUrl} alt="Preview" className="h-20 w-20 object-cover rounded-xl border border-indigo-500/50 shadow-lg" />
                <button 
                  onClick={clearFile}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">{t.chat.image_attached}</span>
            </div>
          )}

          <form onSubmit={handleSendMessage} className={`max-w-5xl mx-auto flex items-center rounded-[24px] border transition-all ${isDarkMode ? 'bg-[#060606] border-white/5 focus-within:border-indigo-500/30' : 'bg-slate-50 border-slate-200 focus-within:border-indigo-500/50'}`}>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />

            <div className="pl-7 text-indigo-500/30"><Cpu size={18} /></div>
            
            {/* BOUTON IMAGE */}
            <button 
              type="button" 
              onClick={() => fileInputRef.current.click()}
              className={`p-2 mr-2 rounded-full hover:bg-white/5 transition-colors ${isDarkMode ? 'text-white/30 hover:text-indigo-400' : 'text-slate-400 hover:text-indigo-600'}`}
              title={t.chat.add_media}
            >
              <ImageIcon size={18} />
            </button>

            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder={selectedFile ? `${t.chat.image_attached} (${t.chat.input_placeholder})` : t.chat.input_placeholder} 
              className="w-full bg-transparent px-6 py-7 text-[11px] font-black uppercase tracking-widest outline-none text-white" 
            />
            <div className="pr-4">
              <button 
                type="submit" 
                disabled={isTyping || (!input.trim() && !selectedFile)} 
                className={`px-8 py-3.5 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-20`}
              >
                {t.chat.execute}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIChatPanel;