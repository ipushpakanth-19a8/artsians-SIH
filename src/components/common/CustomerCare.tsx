import React, { useState, useRef, useEffect } from 'react';
import { Send, Headphones, Bot, User as UserIcon, Sparkles, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { useAuth } from '../../lib/AuthContext';
import { translations } from '../../lib/i18n';
import { CustomerCareMessage } from '../../types';
import { sendChatMessage } from '../../lib/aiCustomerCareService';

interface CustomerCareProps {
  defaultRole?: 'seller' | 'buyer' | 'admin';
  embedded?: boolean;
}

export function CustomerCare({ defaultRole = 'seller', embedded = false }: CustomerCareProps) {
  const { language } = useLanguage();
  const { role } = useAuth();
  const t = translations[language];
  const activeRole = role || defaultRole;

  const [messages, setMessages] = useState<CustomerCareMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: language === 'hi'
        ? 'नमस्ते! मैं KALAtech का AI ग्राहक सेवा सहायक हूं। हस्तशिल्प मूल्य निर्धारण, बिलिंग, या ऑर्डर के बारे में आप क्या जानना चाहते हैं?'
        : language === 'te'
        ? 'నమస్కారం! నేను KALAtech AI కస్టమర్ కేర్ అసిస్టెంట్. ధర నిర్ణయం, బిల్లింగ్ లేదా ఆర్డర్ల గురించి నేను మీకు ఎలా సహాయపడగలను?'
        : 'Hello! I am your KALAtech AI Support Assistant. How can I help you with handicraft pricing, bill generation, orders, or marketplace navigation today?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = language === 'hi' ? [
    'हस्तशिल्प की सही कीमत कैसे तय करें?',
    'नया बिल कैसे बनाएं?',
    'मार्केट प्राइस विश्लेषण क्या है?',
    'ऑर्डर कैसे ट्रैक करें?',
  ] : language === 'te' ? [
    'చేతివృత్తులకు సరైన ధర ఎలా నిర్ణయించాలి?',
    'కొత్త బిల్లు ఎలా తయారు చేయాలి?',
    'మార్కెట్ ధరల విశ్లేషణ ఎలా పనిచేస్తుంది?',
    'ఆర్డర్ ఎలా ట్రాక్ చేయాలి?',
  ] : [
    'How do I price my craft fairly?',
    'How do I create an invoice/bill?',
    'How does market price comparison work?',
    'How can I track my order?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isTyping) return;

    const userMsg: CustomerCareMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const reply = await sendChatMessage(query, activeRole, language, [...messages, userMsg]);
      const botMsg: CustomerCareMessage = {
        id: 'bot-' + Date.now(),
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errorMsg: CustomerCareMessage = {
        id: 'bot-err-' + Date.now(),
        role: 'assistant',
        content: 'Apologies, I encountered a temporary issue. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`flex flex-col bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden ${embedded ? 'h-full min-h-[500px]' : 'max-w-3xl mx-auto h-[650px]'}`}>
      {/* Chat Header */}
      <div className="p-4 bg-stone-900 text-stone-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              {t.customerCare}
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </h2>
            <p className="text-[11px] text-amber-400 font-medium">Multilingual AI Handicraft Advisor</p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 'init-' + Date.now(),
                role: 'assistant',
                content: language === 'hi' ? 'चैट रीसेट कर दी गई है। मैं आपकी क्या मदद कर सकता हूँ?' : language === 'te' ? 'చాట్ రీసెట్ చేయబడింది. నేను మీకు ఎలా సహాయపడగలను?' : 'Chat reset. How may I assist you now?',
                timestamp: new Date().toISOString(),
              }
            ]);
          }}
          className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          title="Reset conversation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-stone-50/50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                m.role === 'user'
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-800 text-amber-300'
              }`}
            >
              {m.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                m.role === 'user'
                  ? 'bg-amber-600 text-white rounded-tr-xs'
                  : 'bg-white text-stone-800 border border-stone-200 rounded-tl-xs'
              }`}
            >
              <p className="whitespace-pre-line">{m.content}</p>
              <span
                className={`text-[9px] block mt-1 ${
                  m.role === 'user' ? 'text-amber-200 text-right' : 'text-stone-400'
                }`}
              >
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-stone-400 text-xs pl-2">
            <div className="w-6 h-6 rounded-full bg-stone-800 text-amber-300 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-white border border-stone-200 rounded-xl px-3 py-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      <div className="px-4 py-2 bg-white border-t border-stone-100 flex gap-2 overflow-x-auto no-scrollbar">
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSend(qp)}
            className="whitespace-nowrap px-3 py-1 bg-stone-100 hover:bg-amber-50 hover:text-amber-900 border border-stone-200 rounded-full text-[11px] font-medium text-stone-600 transition-colors"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-white border-t border-stone-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              language === 'hi'
                ? 'अपना प्रश्न यहां लिखें...'
                : language === 'te'
                ? 'మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి...'
                : 'Ask anything about pricing, bills, orders, or handicrafts...'
            }
            className="flex-1 px-4 py-2.5 border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <span>{t.submit}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
