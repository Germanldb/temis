import React, { useState, useRef, useEffect } from 'react';

const ChatIsla = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy Temis, tu asistente jurídico. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (error) {
      console.error('Error in chat:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error al procesar tu consulta. Inténtalo de nuevo.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto rounded-3xl border border-[#f0f0f0]/20 shadow-2xl overflow-hidden" style={{ backgroundColor: '#2a2a2a' }}>
      {/* Header */}
      <div className="p-6 flex items-center gap-4" style={{ background: 'linear-gradient(to right, #5c120e, #921E16, #c43a30)' }}>
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
          <span className="text-2xl">⚖️</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#f0f0f0] tracking-tight">Temis IA</h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-xs text-[#f0f0f0]/80 font-medium uppercase tracking-wider">Asistente Jurídico Online</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(240,240,240,0.2) transparent' }}
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] px-5 py-4 rounded-2xl shadow-sm ${
                msg.role === 'user' 
                  ? 'rounded-br-none text-[#f0f0f0]' 
                  : 'rounded-bl-none text-[#f0f0f0] border border-[#f0f0f0]/10'
              }`}
              style={{ backgroundColor: msg.role === 'user' ? '#921E16' : '#333333' }}
            >
              <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-pulse">
            <div className="px-6 py-4 rounded-2xl rounded-bl-none text-[#f0f0f0]/60 text-sm font-medium" style={{ backgroundColor: '#333333' }}>
              Temis está analizando...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[#f0f0f0]/10" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe tu situación legal o cita una ley..."
            className="w-full rounded-2xl px-6 py-4 text-[#f0f0f0] placeholder-[#f0f0f0]/40 outline-none transition-all pr-16 border-0"
            style={{ backgroundColor: '#383838', caretColor: '#efb810' }}
            onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #921E16'}
            onBlur={(e) => e.target.style.boxShadow = 'none'}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-2 p-3 text-[#f0f0f0] rounded-xl transition-all disabled:opacity-40"
            style={{ backgroundColor: '#921E16' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="mt-3 text-[10px] text-center text-[#f0f0f0]/50 font-medium">
          Las respuestas de Temis son informativas y no sustituyen la asesoría legal profesional.
        </p>
      </div>
    </div>
  );
};

export default ChatIsla;
