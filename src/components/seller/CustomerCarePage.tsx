import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sparkles, Send, Volume2, ArrowRight, DollarSign, Camera,
  Package, ShoppingBag, Award, HelpCircle, CheckCircle2, User
} from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { translations, speakText } from '../../lib/i18n';
import { sendChatMessage } from '../../lib/aiCustomerCareService';

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
    reply: 'Three proven steps to sell throughout the year: 1) Keep your online catalog updated with 5+ items; 2) Add short videos or photos showing your hands making the craft—buyers love the authentic maker story; 3) Share your ShilpSetu product links on WhatsApp with returning exhibition patrons.',
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
    reply: 'For pottery, terracotta, or delicate woodcraft: 1) Double wrap the item in recycled corrugated paper or bubble sheet; 2) Fill any hollow spaces (like mugs or bowls) with paper balls so walls cannot cave in; 3) Leave at least 2 inches between the craft and the outer shipping box; 4) Affix a bold "FRAGILE - HANDLE WITH CARE" label.',
    action: { label: 'View Pending Orders →', path: '/seller/orders' },
  },
  {
    label: '🎪 How to prepare for an exhibition?',
    query: 'How do I prepare my product for an exhibition?',
    reply: 'For craft fairs like Dastkar, Surajkund, or SARAS: 1) Carry printed ShilpSetu price tags with QR codes for UPI scan-and-pay; 2) Group crafts by price tier (e.g. ₹500 gifts table, ₹2000 heritage table); 3) Display a small photo of your loom or pottery wheel to prove handmade authenticity.',
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
      text: language === 'hi'
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (initialQuery) {
      handleSelectPrompt(initialQuery);
    }
  }, [initialQuery]);

  const handleSelectPrompt = async (queryText: string) => {
    const matched = ACTION_PROMPTS.find(p => p.query.toLowerCase() === queryText.toLowerCase() || p.label.includes(queryText));

    const userMsg: SaathiMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: 'Just now',
    };

    if (matched) {
      setMessages(prev => [
        ...prev,
        userMsg,
        {
          id: `s-${Date.now()}`,
          sender: 'saathi',
          text: matched.reply,
          actionCta: matched.action,
          timestamp: 'Just now',
        }
      ]);
    } else {
      setMessages(prev => [...prev, userMsg]);
      setLoading(true);
      try {
        const reply = await sendChatMessage(queryText, 'seller', language, []);
        setMessages(prev => [
          ...prev,
          {
            id: `s-${Date.now()}`,
            sender: 'saathi',
            text: reply,
            timestamp: 'Just now',
          }
        ]);
      } catch {
        setMessages(prev => [
          ...prev,
          {
            id: `s-${Date.now()}`,
            sender: 'saathi',
            text: 'I am here to help you manage your artisan stall, calculate fair prices, and answer customer queries. Feel free to tap one of the suggested buttons below.',
            timestamp: 'Just now',
          }
        ]);
      }
      setLoading(false);
    }
  };

  const handleSendCustom = () => {
    if (!inputText.trim()) return;
    const q = inputText;
    setInputText('');
    handleSelectPrompt(q);
  };

  const handleListen = (text: string) => {
    speakText(text, language);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eadfd4] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#9c4124] text-white flex items-center justify-center font-black shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-[#262220] font-['Rozha_One',serif]">
                Artisan Saathi • कला साथी AI
              </h1>
              <span className="text-[10px] font-extrabold bg-[#fdf2e9] text-[#9c4124] border border-[#f8d7c2] px-2 py-0.5 rounded-full uppercase">
                Business Mentor
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              Practical answers for pricing, photography, safe packing, and exhibition sales.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleListen(messages[messages.length - 1]?.text || 'Welcome to Artisan Saathi.')}
          className="artisan-listen-btn cursor-pointer py-2 px-3.5 text-xs self-start sm:self-center shadow-xs"
        >
          <Volume2 className="w-4 h-4" />
          <span>Listen to Answer 🔊</span>
        </button>
      </div>

      {/* Actionable Prompt Chips Bar */}
      <div className="bg-white rounded-3xl p-5 border border-[#eadfd4] shadow-xs space-y-2">
        <span className="text-xs font-bold text-stone-700 block">
          Frequently asked by artisans (tap to ask):
        </span>
        <div className="flex flex-wrap gap-2">
          {ACTION_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPrompt(p.query)}
              className="px-3.5 py-2 rounded-xl bg-[#faf7f2] hover:bg-[#fdf2e9] border border-[#eadfd4] hover:border-[#9c4124] text-xs font-bold text-stone-800 hover:text-[#9c4124] transition-all cursor-pointer text-left"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div className="bg-white rounded-3xl p-6 border border-[#eadfd4] shadow-xs space-y-4 min-h-[380px] max-h-[500px] overflow-y-auto">
        {messages.map((m) => {
          const isSaathi = m.sender === 'saathi';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isSaathi ? 'justify-start' : 'justify-end'}`}
            >
              {isSaathi && (
                <div className="w-9 h-9 rounded-xl bg-[#9c4124] text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isSaathi
                    ? 'bg-[#faf7f2] text-stone-800 border border-[#eadfd4]'
                    : 'bg-[#9c4124] text-white font-medium'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1.5">
                  <span className={`text-[10px] font-extrabold uppercase ${isSaathi ? 'text-[#9c4124]' : 'text-amber-200'}`}>
                    {isSaathi ? 'Artisan Saathi' : 'You'}
                  </span>
                  {isSaathi && (
                    <button
                      onClick={() => handleListen(m.text)}
                      className="text-[#9c4124] hover:text-[#83341b] flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Listen</span>
                    </button>
                  )}
                </div>

                <p>{m.text}</p>

                {/* Optional Action CTA Button */}
                {m.actionCta && (
                  <div className="mt-3 pt-2.5 border-t border-[#eadfd4]">
                    <button
                      onClick={() => navigate(m.actionCta!.path)}
                      className="artisan-btn-primary py-1.5 px-3.5 text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>{m.actionCta.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {!isSaathi && (
                <div className="w-9 h-9 rounded-xl bg-stone-800 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-stone-500 text-xs italic pl-12">
            <div className="w-4 h-4 border-2 border-stone-300 border-t-[#9c4124] rounded-full animate-spin" />
            <span>Saathi is thinking...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <div className="bg-white rounded-2xl p-2.5 border border-[#eadfd4] shadow-xs flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSendCustom(); }}
          placeholder="Ask Artisan Saathi (e.g. How do I get government craft grant?)..."
          className="flex-1 px-3 py-2 text-xs sm:text-sm text-stone-900 bg-transparent focus:outline-none"
        />
        <button
          onClick={handleSendCustom}
          disabled={!inputText.trim() || loading}
          className="artisan-btn-primary py-2 px-4 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
