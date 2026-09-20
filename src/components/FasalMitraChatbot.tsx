import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, RefreshCw, Languages, Sprout } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sendFasalMitraMessage } from '../services/api';
import { ChatMessage, SupportedLanguage } from '../types';
import { SUPPORTED_LANGUAGES } from '../data/languages';

export const FasalMitraChatbot: React.FC = () => {
  const { isFasalMitraOpen, setIsFasalMitraOpen, language, setLanguage, currentUser, lots, offers, transporters } = useApp();
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      senderId: 'fasal-mitra-ai',
      senderName: 'Fasal Mitra',
      text: language === 'hi' 
        ? 'नमस्ते! मैं फसल मित्र हूँ 🌾। आप मुझसे आज के मंडी भाव, AI फसल भाव रुझान, खरीदार-विक्रेता खोज, या ट्रांसपोर्ट के बारे में कुछ भी पूछ सकते हैं।'
        : language === 'mr'
        ? 'नमस्कार! मी पीक मित्र आहे 🌾. तुम्ही मला आजचे बाजारभाव, AI दर अंदाज, खरेदीदार-विक्रेता शोध किंवा वाहतुकीबद्दल विचारू शकता.'
        : 'Namaste! I am Fasal Mitra 🌾, your AI agricultural marketplace assistant. Ask me about live Agmarknet mandi prices, 7-day AI price forecasts, finding buyers, or booking trucks.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAi: true,
      suggestedActions: [
        'Today soybean price in Osmanabad',
        'Should I sell Tur now or wait?',
        'Find cotton buyers in Maharashtra',
        'Check transport rate from Osmanabad to Latur'
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isFasalMitraOpen) {
      scrollToBottom();
    }
  }, [messages, isFasalMitraOpen]);

  if (!isFasalMitraOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser?.id || 'guest',
      senderName: currentUser?.name || 'Farmer',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const appData = {
        lots,
        offers,
        transporters,
        currentUserId: currentUser?.id,
        currentUserRole: currentUser?.role,
      };

      const userContext = {
        name: currentUser?.name,
        role: currentUser?.role,
        district: currentUser?.district,
      };

      const data = await sendFasalMitraMessage(text, language, userContext, appData);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        senderId: 'fasal-mitra-ai',
        senderName: 'Fasal Mitra',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAi: true,
        intent: data.intent,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          senderId: 'fasal-mitra-ai',
          senderName: 'Fasal Mitra',
          text: 'Fasal Mitra service is operating in calibrated offline mode. Please check the Mandi Prices tab for verified live rates.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAi: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[95vw] sm:w-[420px] h-[560px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6">
      
      {/* Top Header */}
      <div className="bg-emerald-900 text-white p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="font-bold text-sm leading-tight">Fasal Mitra AI</h3>
              <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full">
                Gemini 2.5
              </span>
            </div>
            <p className="text-[11px] text-emerald-200">Multilingual Agricultural Advisor</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Language toggle inside bot */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
            className="bg-emerald-950 text-emerald-200 text-xs px-2 py-1 rounded-md border border-emerald-700/60 focus:outline-none"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.badge} - {l.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsFasalMitraOpen(false)}
            className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50 text-slate-900 text-xs sm:text-sm">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.isAi ? 'items-start' : 'items-end'}`}
          >
            <div className="flex items-center space-x-1 text-[10px] text-slate-400 mb-1 px-1">
              <span>{m.senderName}</span>
              <span>•</span>
              <span>{m.timestamp}</span>
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-3 shadow-xs leading-relaxed ${
                m.isAi
                  ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  : 'bg-emerald-700 text-white rounded-tr-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>
            </div>

            {m.suggestedActions && m.suggestedActions.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[90%]">
                {m.suggestedActions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s)}
                    className="text-[11px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors text-left"
                  >
                    💡 {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-emerald-700 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200 w-fit text-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Fasal Mitra is analyzing Agmarknet data...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              language === 'hi'
                ? 'फसल भाव, मंडी, या ट्रांसपोर्ट के बारे में पूछें...'
                : language === 'mr'
                ? 'बाजारभाव, पीक दर, किंवा वाहतुकीबद्दल विचारा...'
                : 'Ask about mandi prices, trends, lots, or transport...'
            }
            className="flex-1 px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl shadow-xs transition-transform active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
