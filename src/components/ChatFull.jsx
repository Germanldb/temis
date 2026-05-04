import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatFull = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState([]); 
  const scrollRef = useRef(null);
  const textAreaRef = useRef(null);

  // 1. Cargar historial al iniciar
  useEffect(() => {
    const savedMessages = localStorage.getItem('temis_current_messages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      setMessages([
        { 
          role: 'assistant', 
          content: 'Saludos. Soy **Temis**, tu asistente jurídico experto en la legislación venezolana. Con gusto atenderé tu consulta sobre los pilares de nuestro ordenamiento jurídico, como el debido proceso, el derecho a la defensa y cualquier otra duda legal que desees consultar en nuestra base de datos.' 
        }
      ]);
    }

    // Cargar lista de sesiones previas (simulada por ahora)
    const savedChats = localStorage.getItem('temis_chat_sessions');
    if (savedChats) {
      setChats(JSON.parse(savedChats));
    }
  }, []);

  // 2. Guardar automáticamente cuando cambian los mensajes
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem('temis_current_messages', JSON.stringify(messages));
      
      // Actualizar el título del chat en la barra lateral basado en la primera pregunta
      const firstUserMsg = messages.find(m => m.role === 'user');
      if (firstUserMsg && chats.length === 0) {
        const newChat = { 
            id: Date.now(), 
            title: firstUserMsg.content.substring(0, 30) + '...', 
            date: 'Hoy' 
        };
        const updatedChats = [newChat];
        setChats(updatedChats);
        localStorage.setItem('temis_chat_sessions', JSON.stringify(updatedChats));
      }
    }
  }, [messages]);

  const handleNewChat = () => {
    localStorage.removeItem('temis_current_messages');
    setMessages([
      { 
        role: 'assistant', 
        content: 'Saludos. Soy **Temis**, tu asistente jurídico experto en la legislación venezolana. ¿En qué nueva materia legal puedo asesorarte?' 
      }
    ]);
  };

  // Auto-resize textarea logic
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentInput })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Error desconocido');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (error) {
      console.error('Error in chat:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ Error de Temis: ${error.message}. Por favor, verifica tu conexión o la configuración de leyes.` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('temis_admin_logged');
      window.location.href = '/';
    } catch (err) {
      console.error('Error logging out:', err);
      window.location.href = '/';
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#1e1e1e] text-[#f0f0f0] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 bg-[#151515] border-r border-white/5 flex flex-col hidden md:flex">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">⚖️</span>
            <span className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#921E16] to-[#efb810]">
              Temis Admin
            </span>
          </div>

          <button 
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-[#921E16]/10 border border-[#921E16]/30 hover:bg-[#921E16]/20 py-3 rounded-xl transition-all text-[#efb810] font-medium mb-8"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Consulta
          </button>

          <div className="space-y-1">
            <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4 px-2">Historial</h3>
            {chats.length > 0 ? (
                chats.map(chat => (
                    <button key={chat.id} className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 transition-all group flex items-center justify-between border border-transparent hover:border-white/10 mb-2">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#efb810]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            <span className="text-sm text-white/70 truncate group-hover:text-white font-medium">{chat.title}</span>
                        </div>
                    </button>
                ))
            ) : (
                <div className="p-12 text-center text-white/10">
                    <p className="text-[10px] uppercase tracking-tighter">Sin consultas recientes</p>
                </div>
            )}
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-white/5">
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#921E16] to-[#efb810] flex items-center justify-center font-bold">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">Administrador</p>
              <p className="text-xs text-white/40 truncate">admin@temis.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative">
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#1e1e1e]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <div className="md:hidden text-2xl">⚖️</div>
            <h2 className="text-sm font-bold text-white/80">Gemini 3.0 Flash <span className="text-[#efb810] ml-2 text-[10px] bg-[#efb810]/10 px-2 py-0.5 rounded-full uppercase tracking-widest">Experimental</span></h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-white/40 hover:text-white transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            <div className="h-4 w-px bg-white/10"></div>
            <button className="text-xs font-bold text-[#F0F0F0] hover:text-[#921E16]/80 transition-all" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        </header>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-8 max-w-4xl mx-auto w-full"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
        >
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-sm shadow-2xl ${msg.role === 'user' ? 'bg-gradient-to-br from-[#921E16] to-[#6b1610]' : 'bg-gradient-to-br from-[#333] to-[#222]'
                }`}>
                {msg.role === 'user' ? 'U' : '⚖️'}
              </div>
              <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div 
                  className={`px-6 py-5 rounded-2xl shadow-2xl overflow-hidden ${msg.role === 'user'
                      ? 'bg-[#921E16]/10 border border-[#921E16]/30 text-white rounded-tr-none' 
                      : 'bg-[#252525] border border-white/5 text-white/90 rounded-tl-none prose prose-invert prose-sm max-w-none'
                    }`}
                >
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                            h1: ({node, ...props}) => <h1 className="text-xl font-bold text-[#efb810] mb-4 border-b border-[#efb810]/20 pb-2" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-lg font-bold text-[#efb810]/90 mb-3" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-md font-bold text-white/90 mb-2 underline decoration-[#921E16]" {...props} />,
                            p: ({node, ...props}) => <p className="mb-4 text-white/80 leading-relaxed" {...props} />,
                            strong: ({node, ...props}) => <strong className="text-[#efb810] font-bold" {...props} />,
                            li: ({node, ...props}) => <li className="mb-1 text-white/70" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-4" {...props} />,
                            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[#921E16] pl-4 italic bg-white/5 py-2 pr-2 rounded-r-lg mb-4" {...props} />
                        }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
                <span className="text-[10px] text-white/20 mt-3 font-bold uppercase tracking-[2px]">
                  {msg.role === 'user' ? 'Tú' : 'Temis Legal AI'} • Justo ahora
                </span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-6 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-[#333] flex-shrink-0 flex items-center justify-center shadow-2xl">
                ⚖️
              </div>
              <div className="px-6 py-5 rounded-2xl bg-[#252525] border border-white/5 rounded-tl-none shadow-xl">
                <div className="flex gap-2">
                  <span className="w-2 h-2 bg-[#efb810] rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-[#efb810] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-[#efb810] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-8 max-w-4xl mx-auto w-full relative">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#921E16]/30 to-[#efb810]/30 rounded-3xl blur opacity-25 group-focus-within:opacity-100 transition duration-1000 group-focus-within:duration-200"></div>
            <div className="relative flex items-center">
              <textarea
                ref={textAreaRef}
                rows="1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Consulta sobre la Constitución o leyes cargadas..."
                className="w-full bg-[#252525] border border-white/10 rounded-2xl px-6 py-5 text-white placeholder-white/20 focus:outline-none focus:border-[#efb810]/30 transition-all resize-none pr-16 max-h-60 overflow-y-auto shadow-2xl"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="absolute right-3 p-3 bg-gradient-to-br from-[#921E16] to-[#6b1610] hover:scale-105 active:scale-95 text-white rounded-xl transition-all disabled:opacity-20 shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
          <p className="mt-4 text-[9px] text-center text-white/10 font-bold uppercase tracking-[4px]">
            Justicia Asistida por Inteligencia Artificial
          </p>
        </div>
      </main>
    </div>
  );
};

export default ChatFull;
