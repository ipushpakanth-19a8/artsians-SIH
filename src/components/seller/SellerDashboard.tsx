import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, CheckCircle, ShoppingCart, TrendingUp, Clock, PlusCircle,
  BarChart3, Camera, Sparkles, DollarSign, ArrowRight, Eye, Volume2,
  Building2, Award, ExternalLink, HelpCircle, ChevronRight, Info
} from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { useAuth } from '../../lib/AuthContext';
import { translations, speakText } from '../../lib/i18n';
import { formatINR } from '../../lib/billingService';
import { DailyMiniMissionsCard } from '../tutorial/DailyMiniMissionsCard';
import { ShowMeButton } from '../tutorial/ContextualHelp';

export function SellerDashboard() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const t = translations[language];

  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedScheme, setSelectedScheme] = useState<number>(0);

  const artisanName = user?.name || 'Rameshwar Rao';

  useEffect(() => {
    fetch('/api/v1/artisans/art-01/dashboard')
      .then(r => r.json())
      .then(d => { setDashData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleListenSummary = () => {
    const text = language === 'hi'
      ? `नमस्ते ${artisanName} जी। आपके पास ${dashData?.productsCount || 8} उत्पाद सूचीबद्ध हैं, ${dashData?.ordersCount || 14} कुल ऑर्डर्स आए हैं, और इस महीने आपकी सीधी कमाई ₹${dashData?.totalOrderRevenue || 28450} रही है। तीन नए ऑर्डर्स भेजने के लिए तैयार हैं।`
      : language === 'te'
      ? `నమస్కారం ${artisanName} గారు. మీకు ${dashData?.productsCount || 8} ఉత్పత్తులు లిస్ట్ చేయబడ్డాయి, ${dashData?.ordersCount || 14} ఆర్డర్లు వచ్చాయి, మరియు ఈ నెల మీ ఆదాయం ₹${dashData?.totalOrderRevenue || 28450}. మూడు కొత్త ఆర్డర్లు పంపడానికి సిద్ధంగా ఉన్నాయి.`
      : `Good morning ${artisanName}. You have ${dashData?.productsCount || 8} products listed, ${dashData?.ordersCount || 14} total orders received, and your direct earnings this month are ₹${dashData?.totalOrderRevenue || 28450}. 3 pending orders are waiting to be packed and shipped.`;
    speakText(text, language);
  };

  // Support Opportunities / Government Schemes
  const supportSchemes = [
    {
      id: 'vishwakarma',
      title: 'PM Vishwakarma Yojana',
      badge: 'Govt. of India Scheme',
      tag: '5% Interest Loan + ₹15,000 Kit',
      what: 'Collateral-free enterprise credit up to ₹3,00,000 at a subsidized 5% interest rate, plus ₹15,000 modern toolkit grant.',
      who: 'Traditional artisans and craftspeople working with hands and tools in 18 recognized trades (Weavers, Potters, Carpenters, Sculptors).',
      needs: 'Aadhaar Card, Active Mobile number linked to bank account, Artisan trade declaration.',
      apply: 'Free biometric verification at nearest Common Service Center (CSC) or visit pmvishwakarma.gov.in.',
    },
    {
      id: 'mudra',
      title: 'MUDRA Artisan Micro-Loan (Shishu / Kishor)',
      badge: 'Financial Support',
      tag: 'Loans up to ₹5 Lakhs',
      what: 'Affordable working capital finance to purchase raw materials (silk yarn, clay, brass, natural dyes) without mortgage.',
      who: 'Self-employed artisans, weaver families, and village micro-enterprises.',
      needs: 'Artisan Pehchan Card or Handicraft certificate, 6 months bank statement, basic business address proof.',
      apply: 'Direct application at any rural or nationalized bank branch (SBI, PNB, Canara) or via udyamimitra.in portal.',
    },
    {
      id: 'exhibitions',
      title: 'National Craft Fairs & ONDC Stalls',
      badge: 'Exhibition Grant',
      tag: 'Free Stall + Travel Allowance',
      what: '100% subsidized stall allocation at Dastkar, Surajkund Mela, SARAS fairs, and zero-fee digital onboarding to ONDC network.',
      who: 'Registered master craftsmen, National Awardees, and State Heritage Artisans.',
      needs: 'Pehchan Artisan ID card, photos of recent craft samples, and bank passbook copy.',
      apply: 'Apply through your regional District Industries Centre (DIC) or the Ministry of Textiles handicraft development office.',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#eadfd4] border-t-[#9c4124] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-stone-500 text-sm font-medium">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ================================================== */}
      {/* 1. TOP SECTION: HUMAN WARM GREETING + AUDIO LISTEN */}
      {/* ================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eadfd4] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fdf2e9] text-[#9c4124] text-xs font-black uppercase tracking-wider mb-2 border border-[#f8d7c2]">
            <span>{language === 'hi' ? 'डिजिटल व्यापार सहायक' : language === 'te' ? 'డిజిటల్ వ్యాపార సహాయకుడు' : 'Digital Business Assistant'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#262220] font-['Rozha_One',serif] tracking-tight">
            {language === 'hi'
              ? `शुभ प्रभात, ${artisanName} जी 👋`
              : language === 'te'
              ? `శుభోదయం, ${artisanName} గారు 👋`
              : `Good morning, ${artisanName} 👋`}
          </h1>
          <p className="text-sm text-stone-600 font-medium mt-1">
            {language === 'hi'
              ? 'यहाँ आपकी आज की दुकान का विवरण और मुख्य कार्य उपलब्ध हैं।'
              : language === 'te'
              ? 'ఇక్కడ మీ నేటి వ్యాపార వివరాలు మరియు ముఖ్యమైన పనులు ఉన్నాయి.'
              : 'Here is your artisan business snapshot and quick actions for today.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <ShowMeButton missionId="meet-shop" />
          <button
            onClick={handleListenSummary}
            className="artisan-listen-btn cursor-pointer py-2 px-3.5 text-xs shadow-xs"
            title="Listen to your business summary"
          >
            <Volume2 className="w-4 h-4" />
            <span>{language === 'hi' ? 'आज का विवरण सुनें 🔊' : language === 'te' ? 'నేటి సారాంశం వినండి 🔊' : 'Listen to Summary 🔊'}</span>
          </button>
        </div>
      </div>

      {/* ================================================== */}
      {/* 2. BUSINESS SNAPSHOT (5 Simple Action Cards) */}
      {/* ================================================== */}
      <div data-tutorial="dashboard-snapshot">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#262220] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#9c4124]" />
            <span>{language === 'hi' ? 'व्यापार का हाल' : language === 'te' ? 'వ్యాపార స్థితి' : 'Business Snapshot'}</span>
          </h2>
          <span className="text-xs text-stone-500 font-semibold">
            {language === 'hi' ? 'सीधी बिक्री • 0% कमीशन' : language === 'te' ? 'ప్రత్యక్ష అమ్మకాలు' : 'Direct Sales • Zero Commission'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* 1. Products Listed */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#eadfd4] shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#9c4124] flex items-center justify-center mb-2.5 font-bold">
              <Package className="w-5 h-5" />
            </div>
            <p className="text-xs text-stone-500 font-bold">{language === 'hi' ? 'दर्ज उत्पाद' : language === 'te' ? 'ఉత్పత్తులు' : 'Products Listed'}</p>
            <p className="text-xl sm:text-2xl font-black text-[#262220] mt-0.5">{dashData?.productsCount || 8}</p>
            <span className="text-[10px] text-emerald-700 font-bold mt-1 block">Active online</span>
          </div>

          {/* 2. Orders Received */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#eadfd4] shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-2.5 font-bold">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <p className="text-xs text-stone-500 font-bold">{language === 'hi' ? 'कुल ऑर्डर्स' : language === 'te' ? 'మొత్తం ఆర్డర్లు' : 'Total Orders'}</p>
            <p className="text-xl sm:text-2xl font-black text-[#262220] mt-0.5">{dashData?.ordersCount || 14}</p>
            <span className="text-[10px] text-blue-700 font-bold mt-1 block">All fulfilled directly</span>
          </div>

          {/* 3. Direct Revenue */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#eadfd4] shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-2.5 font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <p className="text-xs text-stone-500 font-bold">{language === 'hi' ? 'सीधी कमाई' : language === 'te' ? 'ప్రత్యక్ష ఆదాయం' : 'Net Revenue'}</p>
            <p className="text-xl sm:text-2xl font-black text-purple-900 mt-0.5">{formatINR(dashData?.totalOrderRevenue || 28450)}</p>
            <span className="text-[10px] text-emerald-700 font-bold mt-1 block">100% bank settled</span>
          </div>

          {/* 4. Pending Orders */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-orange-200 bg-orange-50/30 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center mb-2.5 font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-xs text-orange-950 font-bold">{language === 'hi' ? 'बाकी ऑर्डर्स' : language === 'te' ? 'పెండింగ్ ఆర్డర్లు' : 'Pending Orders'}</p>
            <p className="text-xl sm:text-2xl font-black text-orange-800 mt-0.5">3</p>
            <span className="text-[10px] text-orange-700 font-bold mt-1 block">Pack & dispatch</span>
          </div>

          {/* 5. Product Views */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#eadfd4] shadow-xs col-span-2 sm:col-span-1">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5 font-bold">
              <Eye className="w-5 h-5" />
            </div>
            <p className="text-xs text-stone-500 font-bold">{language === 'hi' ? 'उत्पाद देखे गए' : language === 'te' ? 'వీక్షణలు' : 'Product Views'}</p>
            <p className="text-xl sm:text-2xl font-black text-[#262220] mt-0.5">482</p>
            <span className="text-[10px] text-emerald-700 font-bold mt-1 block">+18% this week</span>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* 3. DAILY MINI MISSIONS & ARTISAN JOURNEY WIDGET */}
      {/* ================================================== */}
      <DailyMiniMissionsCard />

      {/* ================================================== */}
      {/* 4. QUICK ACTIONS (Large, Touch-Friendly Buttons) */}
      {/* ================================================== */}
      <div>
        <h2 className="text-lg font-bold text-[#262220] mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#c85a32]" />
          <span>{language === 'hi' ? 'त्वरित कार्य' : language === 'te' ? 'శీఘ్ర చర్యలు' : 'Quick Actions'}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Action 1: Add Product */}
          <button
            data-tutorial="action-add-product"
            onClick={() => navigate('/seller/add')}
            className="p-5 rounded-2xl bg-[#9c4124] text-white flex items-center gap-4 text-left shadow-sm hover:bg-[#83341b] transition-all active:scale-[0.98] cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <PlusCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-extrabold text-base leading-tight">
                {language === 'hi' ? '+ नया उत्पाद जोड़ें' : language === 'te' ? '+ ఉత్పత్తిని జోడించండి' : '+ Add Product'}
              </h3>
              <p className="text-xs text-amber-100/90 mt-0.5">
                {language === 'hi' ? 'फ़ोटो खींचकर AI से विवरण बनाएं' : language === 'te' ? 'ఫోటో తీసి AI తో జాబితా చేయండి' : '4-step guided AI photo listing flow'}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Action 2: Scan Product */}
          <button
            onClick={() => navigate('/seller/add?action=scan')}
            className="p-5 rounded-2xl bg-white border border-[#eadfd4] text-[#262220] flex items-center gap-4 text-left shadow-xs hover:border-[#c85a32] hover:bg-[#fdfbf7] transition-all active:scale-[0.98] cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#fdf2e9] text-[#9c4124] flex items-center justify-center shrink-0">
              <Camera className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-extrabold text-base leading-tight">
                {language === 'hi' ? '📷 उत्पाद स्कैन करें' : language === 'te' ? '📷 ఉత్పత్తిని స్కాన్ చేయండి' : '📷 Scan Product'}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {language === 'hi' ? 'मोबाइल कैमरे से सीधे फ़ोटो लें' : language === 'te' ? 'కెమెరాతో నేరుగా ఫోటో తీయండి' : 'Capture instant mobile photo'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Action 3: Improve Photo */}
          <button
            onClick={() => navigate('/seller/add?step=2')}
            className="p-5 rounded-2xl bg-white border border-[#eadfd4] text-[#262220] flex items-center gap-4 text-left shadow-xs hover:border-[#c85a32] hover:bg-[#fdfbf7] transition-all active:scale-[0.98] cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#c85a32] flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-extrabold text-base leading-tight">
                {language === 'hi' ? '✨ फ़ोटो बेहतर बनाएं' : language === 'te' ? '✨ ఫోటోను మెరుగుపరచండి' : '✨ Improve Photo'}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {language === 'hi' ? 'स्टूडियो रोशनी व बैकग्राउंड साफ़' : language === 'te' ? 'స్టూడియో లైటింగ్ & క్లీన్ బ్యాక్‌గ్రౌండ్' : 'Before/After Studio enhancer'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Action 4: Check Fair Price */}
          <button
            onClick={() => navigate('/seller/market-analysis')}
            className="p-5 rounded-2xl bg-white border border-[#eadfd4] text-[#262220] flex items-center gap-4 text-left shadow-xs hover:border-emerald-600 hover:bg-[#fdfbf7] transition-all active:scale-[0.98] cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-extrabold text-base leading-tight">
                {language === 'hi' ? '💰 सही मूल्य जानें' : language === 'te' ? '💰 సరసమైన ధర తెలుసుకోండి' : '💰 Check Fair Price'}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {language === 'hi' ? 'मजदूरी + लागत का सच्चा हिसाब' : language === 'te' ? 'శ్రమ వేతనం & వ్యయం లెక్కింపు' : 'What Should I Charge? Calculator'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Action 5: Manage Orders */}
          <button
            onClick={() => navigate('/seller/orders')}
            className="p-5 rounded-2xl bg-white border border-[#eadfd4] text-[#262220] flex items-center gap-4 text-left shadow-xs hover:border-blue-600 hover:bg-[#fdfbf7] transition-all active:scale-[0.98] cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-extrabold text-base leading-tight">
                {language === 'hi' ? '📦 ऑर्डर्स प्रबंधित करें' : language === 'te' ? '📦 ఆర్డర్లను నిర్వహించండి' : '📦 Manage Orders'}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {language === 'hi' ? '3 ऑर्डर्स पैकिंग व डिलीवरी हेतु तैयार' : language === 'te' ? '3 ఆర్డర్లు పంపడానికి సిద్ధంగా ఉన్నాయి' : 'Track visual delivery timeline'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Action 6: View Earnings */}
          <button
            onClick={() => navigate('/seller/sales')}
            className="p-5 rounded-2xl bg-white border border-[#eadfd4] text-[#262220] flex items-center gap-4 text-left shadow-xs hover:border-purple-600 hover:bg-[#fdfbf7] transition-all active:scale-[0.98] cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-extrabold text-base leading-tight">
                {language === 'hi' ? '📊 मेरी कमाई देखें' : language === 'te' ? '📊 ఆదాయం చూడండి' : '📊 View Earnings'}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {language === 'hi' ? 'बिचौलियों के बिना मुनाफ़ा व बिल' : language === 'te' ? 'దళారులు లేని లాభం & బిల్లులు' : 'Monthly trajectory & invoice bills'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* ================================================== */}
      {/* 4. SMART MARKET INSIGHTS: "What Customers Like" */}
      {/* ================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#eadfd4] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-3 border-b border-[#eadfd4]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[#262220]">
                {language === 'hi' ? 'ग्राहकों की पसंद • बाज़ार का रुझान' : language === 'te' ? 'వినియోగదారుల ఆసక్తి • మార్కెట్ ట్రెండ్స్' : 'What Customers Are Looking For'}
              </span>
              <span className="text-[10px] font-extrabold bg-[#fdf2e9] text-[#9c4124] border border-[#f8d7c2] px-2 py-0.5 rounded-full uppercase">
                Live Trend
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {language === 'hi'
                ? 'यह रुझान कारीगरों को यह तय करने में मदद करता है कि अगला क्या बनाएं।'
                : language === 'te'
                ? 'తదుపరి ఏ వస్తువులు తయారు చేయాలో నిర్ణయించడంలో ఇది సహాయపడుతుంది.'
                : 'Actionable demand trends so you know what crafts will sell best this season.'}
            </p>
          </div>

          <div className="inline-flex items-center gap-1 text-[11px] text-stone-500 bg-[#faf7f2] px-2.5 py-1 rounded-lg border border-[#eadfd4]">
            <Info className="w-3.5 h-3.5 text-stone-400" />
            <span>Simulated Market Intelligence</span>
          </div>
        </div>

        {/* 4 Insight Chips / Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#eadfd4]">
            <span className="text-[11px] font-extrabold text-[#9c4124] uppercase">Trending Category</span>
            <p className="text-sm font-black text-[#262220] mt-1">Handmade Home Decor</p>
            <p className="text-xs text-stone-600 mt-1">
              <strong>+32% more interest</strong> this month across pottery, wall hangings & brass bells.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#eadfd4]">
            <span className="text-[11px] font-extrabold text-[#c85a32] uppercase">Popular Colors</span>
            <p className="text-sm font-black text-[#262220] mt-1">Terracotta & Indigo</p>
            <p className="text-xs text-stone-600 mt-1">
              Natural clay earthy tones and indigo resist dyes have the highest buyer search volume.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#eadfd4]">
            <span className="text-[11px] font-extrabold text-emerald-800 uppercase">Fast-Selling Price</span>
            <p className="text-sm font-black text-emerald-950 mt-1">₹850 — ₹1,800</p>
            <p className="text-xs text-stone-600 mt-1">
              Items within this range sell within 48 hours as festive gifts and ethical home decor.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#eadfd4]">
            <span className="text-[11px] font-extrabold text-purple-800 uppercase">Seasonal Demand</span>
            <p className="text-sm font-black text-purple-950 mt-1">Festive Handloom</p>
            <p className="text-xs text-stone-600 mt-1">
              Cotton Ikat sarees and linen dupattas receiving <strong>45% higher bulk enquiries</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* 5. GOVERNMENT / SUPPORT OPPORTUNITIES */}
      {/* ================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#eadfd4] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-3 border-b border-[#eadfd4]">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#9c4124]" />
              <h2 className="text-lg font-bold text-[#262220]">
                {language === 'hi' ? 'आपके लिए सरकारी एवं संस्थागत सहायता' : language === 'te' ? 'మీ కోసం అందుబాటులో ఉన్న మద్దతు & పథకాలు' : 'Support Available For You'}
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {language === 'hi'
                ? 'कारीगरों के लिए सरल भाषा में सरकारी योजनाएं, ऋण व प्रदर्शनी स्टॉल।'
                : language === 'te'
                ? 'కళాకారుల కోసం సులభమైన భాషలో ప్రభుత్వ పథకాలు, రుణాలు మరియు స్టాళ్లు.'
                : 'Government schemes, subsidized credit and fair exhibition grants explained simply.'}
            </p>
          </div>

          {/* Scheme selector pills */}
          <div className="flex items-center gap-1.5 bg-[#faf7f2] p-1 rounded-xl border border-[#eadfd4]">
            {supportSchemes.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setSelectedScheme(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedScheme === idx
                    ? 'bg-[#9c4124] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {idx === 0 ? 'PM Vishwakarma' : idx === 1 ? 'MUDRA Loan' : 'Craft Fairs'}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Scheme Detail Card */}
        {(() => {
          const current = supportSchemes[selectedScheme];
          return (
            <div className="p-5 rounded-2xl bg-[#faf7f2] border border-[#eadfd4] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9c4124] bg-[#fdf2e9] px-2.5 py-0.5 rounded-full border border-[#f8d7c2]">
                    {current.badge}
                  </span>
                  <h3 className="text-lg font-black text-[#262220] mt-1">{current.title}</h3>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full self-start sm:self-center">
                  {current.tag}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-white p-3.5 rounded-xl border border-[#eadfd4]">
                  <strong className="block text-stone-900 font-bold mb-1">
                    {language === 'hi' ? 'यह क्या है?' : language === 'te' ? 'ఇది ఏమిటి?' : 'What is it?'}
                  </strong>
                  <p className="text-stone-600 leading-relaxed">{current.what}</p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#eadfd4]">
                  <strong className="block text-stone-900 font-bold mb-1">
                    {language === 'hi' ? 'कौन आवेदन कर सकता है?' : language === 'te' ? 'ఎవరు దరఖాస్తు చేసుకోవచ్చు?' : 'Who can apply?'}
                  </strong>
                  <p className="text-stone-600 leading-relaxed">{current.who}</p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#eadfd4]">
                  <strong className="block text-stone-900 font-bold mb-1">
                    {language === 'hi' ? 'क्या दस्तावेज़ चाहिए?' : language === 'te' ? 'ఏ పత్రాలు అవసరం?' : 'What do you need?'}
                  </strong>
                  <p className="text-stone-600 leading-relaxed">{current.needs}</p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#eadfd4]">
                  <strong className="block text-stone-900 font-bold mb-1">
                    {language === 'hi' ? 'आवेदन कैसे करें?' : language === 'te' ? 'ఎలా దరఖాస్తు చేయాలి?' : 'How to apply?'}
                  </strong>
                  <p className="text-stone-600 leading-relaxed">{current.apply}</p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ================================================== */}
      {/* 6. ARTISAN SAATHI QUICK ASSISTANT PREVIEW */}
      {/* ================================================== */}
      <div className="bg-gradient-to-br from-[#9c4124] to-[#7d2f16] rounded-3xl p-6 sm:p-7 text-white shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg font-['Rozha_One',serif]">
                Artisan Saathi • कला साथी AI
              </h3>
              <p className="text-xs text-amber-100">
                {language === 'hi'
                  ? 'आपके व्यापार का सच्चा साथी — पूछें कोई भी सवाल'
                  : language === 'te'
                  ? 'మీ వ్యాపార మిత్రుడు — ఏ ప్రశ్ననైనా అడగండి'
                  : 'Your practical craft business companion — tap any question below:'}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/seller/customer-care')}
            className="px-4 py-2 rounded-xl bg-white text-[#9c4124] text-xs font-extrabold hover:bg-amber-50 transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Open Full Saathi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Actionable Prompt Chips */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'How much should I charge?', query: 'How much should I charge for my craft?' },
            { label: 'How can I sell more?', query: 'How can I reach more customers and sell throughout the year?' },
            { label: 'Which photo is better for selling?', query: 'How do I take better photos of my craft on mobile?' },
            { label: 'How do I pack fragile craft?', query: 'How should I pack fragile pottery and woodcraft for courier delivery?' },
            { label: 'How do I prepare for an exhibition?', query: 'How do I prepare my products and pricing for a handicraft exhibition?' },
          ].map((chip, i) => (
            <button
              key={i}
              onClick={() => navigate(`/seller/customer-care?q=${encodeURIComponent(chip.query)}`)}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-semibold text-white transition-all text-left cursor-pointer"
            >
              💬 {chip.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
