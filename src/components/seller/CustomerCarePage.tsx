import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sparkles, Send, Volume2, ArrowRight, DollarSign, Camera,
  Package, ShoppingBag, Award, HelpCircle, CheckCircle2, User, Mic
} from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { translations, speakText } from '../../lib/i18n';
import { sendChatMessage } from '../../lib/aiCustomerCareService';
import { PageHeader } from './ui/PageHeader';
import { useVoiceForm } from '../../lib/useVoiceForm';
import { LanguageCode } from '../../types';

interface SaathiMessage {
  id: string;
  sender: 'user' | 'saathi';
  text: string;
  actionCta?: { label: string; path: string };
  timestamp: string;
}

const ACTION_PROMPTS = [
  {
    label: '💰 How much should I charge?',
    query: 'How much should I charge for my craft?',
    reply: 'To price fairly, use our Cost-Plus Living Wage formula: (Raw Material Cost + Labor Hours × ₹85/hr + Packaging + Courier) ÷ (1 - Margin). For example, if materials are ₹450 and you spend 10 hours, your suggested price is ₹1,249 with ₹489 direct profit. Never sell below your minimum cost to protect your artisan livelihood.',
    action: { label: 'Open Fair Price Calculator →', path: '/seller/market-analysis' },
  },
  {
    label: '📈 How can I sell more?',
    query: 'How can I sell more throughout the year?',
    reply: 'Three proven steps to sell throughout the year: 1) Keep your online catalog updated with 5+ items; 2) Add photos showing your hands making the craft—buyers love the authentic maker story; 3) Share your verified Artisans product links on WhatsApp with returning exhibition patrons.',
    action: { label: 'View My Products →', path: '/seller/handicrafts' },
  },
  {
    label: '📷 Which photo is better?',
    query: 'Which photo is better for selling?',
    reply: 'The best photo has natural diffused daylight, shows the entire craft centered with clean borders, and has no messy background clutter. In Step 2 of our product creator, AI will automatically clean your workshop background and balance lighting so your craft looks like a studio catalogue piece.',
    action: { label: 'Open AI Image Studio →', path: '/seller/add?step=2' },
  },
  {
    label: '🎨 What should I make next?',
    query: 'What should I make next?',
    reply: 'Current market demand indicates: 1) Handcrafted tableware and terracotta kulhars are up 32%; 2) Natural earthy terracotta and indigo dyed textiles are top searched colors; 3) Compact gift items priced between ₹850 and ₹1,800 sell fastest.',
    action: { label: 'Explore What Customers Like →', path: '/seller' },
  },
  {
    label: '📦 How do I package this?',
    query: 'How do I package fragile craft for delivery?',
    reply: 'For pottery, terracotta, or delicate woodcraft: 1) Double wrap the item in recycled corrugated paper or bubble sheet; 2) Fill any hollow spaces with paper balls so walls cannot cave in; 3) Leave at least 2 inches between the craft and the outer shipping box; 4) Affix a bold "FRAGILE - HANDLE WITH CARE" label.',
    action: { label: 'View Pending Orders →', path: '/seller/orders' },
  },
  {
    label: '🎪 How to prepare for an exhibition?',
    query: 'How do I prepare my product for an exhibition?',
    reply: 'For craft fairs like Dastkar, Surajkund, or SARAS: 1) Carry printed Artisans price tags with QR codes for UPI scan-and-pay; 2) Group crafts by price tier (e.g. ₹500 gifts table, ₹2000 heritage table); 3) Display a small photo of your loom or pottery wheel to prove handmade authenticity.',
    action: { label: 'Create Printed Bills & Tags →', path: '/seller/create-bill' },
  },
];

export function CustomerCarePage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const t = translations[language];

  const initialQuery = searchParams.get('q') || '';

  const [messages, setMessages] = useState<SaathiMessage[]>([
    {
      id: 'm-0',
      sender: 'saathi',
      text:
        language === 'hi'
          ? 'नमस्ते कारीगर साथी! मैं आपका व्यापार सहायक "कला साथी" हूँ। मूल्य निर्धारण, फ़ोटो सुधारने, बिक्री बढ़ाने या सरकारी योजनाओं के बारे में नीचे दिए गए विकल्पों में से चुनें या कोई भी सवाल पूछें।'
          : language === 'te'
          ? 'నమస్కారం! నేను మీ డిజిటల్ వ్యాపార మిత్రుడు "కళా సాథీ". ధర నిర్ణయించడం, ఫోటోలు మెరుగుపరచడం లేదా అమ్మకాలు పెంచడం గురించి ఏదైనా ప్రశ్న అడగండి.'
          : 'Good morning! I am Artisan Saathi, your dedicated craft business companion. Ask me anything about fair pricing, photo tips, packing, exhibitions, or government support.',
      timestamp: 'Just now',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Optional Voice Input
  const { listen, stopAll, isListening } = useVoiceForm((language as LanguageCode) || 'en');

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (initialQuery) {
      handleSelectPrompt(initialQuery);
    }
  }, [initialQuery]);

  const handleSelectPrompt = async (queryText: string) => {
    const matched = ACTION_PROMPTS.find(
      p => p.query.toLowerCase() === queryText.toLowerCase() || p.label.includes(queryText)
    );

    const userMsg: SaathiMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: 'Just now',
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    setTimeout(async () => {
      if (matched) {
        setMessages(prev => [
          ...prev,
          {
            id: `s-${Date.now()}`,
            sender: 'saathi',
            text: matched.reply,
            actionCta: matched.action,
            timestamp: 'Just now',
          },
        ]);
        setLoading(false);
      } else {
        try {
          const chatHistory = messages.map(m => ({
            id: m.id,
            role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
            content: m.text,
            timestamp: new Date().toISOString(),
          }));
          const replyText = await sendChatMessage(queryText, 'seller', language, chatHistory);
          setMessages(prev => [
            ...prev,
            {
              id: `s-${Date.now()}`,
              sender: 'saathi',
              text: replyText,
              timestamp: 'Just now',
            },
          ]);
        } catch {
          setMessages(prev => [
            ...prev,
            {
              id: `s-${Date.now()}`,
              sender: 'saathi',
              text: 'I am currently checking our artisan database. For immediate assistance with fair pricing, please visit the Fair Price Assistant or check your active orders.',
              actionCta: { label: 'Open Fair Price Assistant →', path: '/seller/market-analysis' },
              timestamp: 'Just now',
            },
          ]);
        } finally {
          setLoading(false);
        }
      }
    }, 450);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;
    const text = inputText.trim();
    setInputText('');
    handleSelectPrompt(text);
  };

  const handleToggleVoice = () => {
    if (isListening) {
      stopAll();
      return;
    }
    listen((spoken) => {
      if (spoken.trim()) {
        setInputText(spoken.trim());
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* 1. Page Header */}
      <PageHeader
        eyebrow="ARTISAN SAATHI AI COMPANION"
        title="ASK Artisans"
        description="Expert guidance on fair craft pricing, natural dyeing, studio photography, exhibition applications, and direct market linkage."
      />

      {/* 2. Quick FAQ Topic Buttons */}
      <div className="bg-[#FFFDF8] rounded-2xl border border-[#D9CEB8] p-4 sm:p-5 shadow-2xs space-y-3">
        <span className="text-xs font-bold text-[#7A6E65] uppercase tracking-wider block">
          Frequently Asked Artisan Questions
        </span>
        <div className="flex flex-wrap gap-2">
          {ACTION_PROMPTS.map((prompt) => (
            <button
              key={prompt.label}
              onClick={() => handleSelectPrompt(prompt.query)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#F7F2E8] hover:bg-[#E8DFC9] text-[#29221D] border border-[#D9CEB8] hover:border-[#A8462D] transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              {prompt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Conversation Area */}
      <div className="bg-[#FFFDF8] rounded-2xl border border-[#D9CEB8] shadow-xs flex flex-col h-[520px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-[#A8462D] text-[#FFFDF8]'
                      : 'bg-[#C88732]/20 text-[#A8462D] border border-[#C88732]/40'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-[#C88732]" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl p-4 space-y-2 shadow-2xs ${
                    isUser
                      ? 'bg-[#A8462D] text-[#FFFDF8]'
                      : 'bg-[#F7F2E8]/80 text-[#29221D] border border-[#D9CEB8]'
                  }`}
                >
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {m.text}
                  </p>

                  {/* Audio Listen & CTA Action */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {!isUser && (
                      <button
                        onClick={() => speakText(m.text, language)}
                        className="p-1 text-[#7A6E65] hover:text-[#A8462D] text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                        title="Listen to this message"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-[#A8462D]" />
                        <span>Listen</span>
                      </button>
                    )}

                    {m.actionCta && (
                      <button
                        onClick={() => navigate(m.actionCta!.path)}
                        className="px-3 py-1 rounded-full bg-[#FFFDF8] border border-[#D9CEB8] text-[#A8462D] hover:border-[#A8462D] text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      >
                        <span>{m.actionCta.label}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-[75%] mr-auto">
              <div className="w-8 h-8 rounded-full bg-[#C88732]/20 text-[#A8462D] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-[#C88732] animate-pulse" />
              </div>
              <div className="bg-[#F7F2E8] border border-[#D9CEB8] rounded-2xl p-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#A8462D] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#A8462D] animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-[#A8462D] animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-[#7A6E65] ml-1">Consulting craft knowledge...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* 4. Input Area */}
        <div className="p-3 sm:p-4 border-t border-[#D9CEB8] bg-[#FFFDF8]">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about pricing, photo tips, exhibitions, packaging..."
              className="flex-1 px-4 py-2.5 rounded-full border border-[#D9CEB8] bg-[#F7F2E8]/60 text-xs sm:text-sm text-[#29221D] focus:outline-none focus:border-[#A8462D] placeholder:text-[#9C8F84]"
            />

            {/* Optional Mic Button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-50 text-rose-600 border-rose-300 animate-pulse'
                  : 'bg-[#F7F2E8] text-[#7A6E65] hover:text-[#A8462D] border-[#D9CEB8]'
              }`}
              title={isListening ? 'Listening...' : 'Voice Dictate'}
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="px-5 py-2.5 rounded-full bg-[#A8462D] hover:bg-[#8E3822] disabled:opacity-50 text-[#FFFDF8] text-xs font-bold shadow-xs inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
