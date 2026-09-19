import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, CheckCircle, ShoppingCart, TrendingUp, PlusCircle,
  BarChart3, Camera, Sparkles, DollarSign, ArrowRight, Volume2,
  Building2, Award, ChevronRight, HelpCircle
} from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { useAuth } from '../../lib/AuthContext';
import { translations, speakText } from '../../lib/i18n';
import { formatINR } from '../../lib/billingService';
import { MetricCard } from './ui/MetricCard';

export function SellerDashboard() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const t = translations[language];

  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedScheme, setSelectedScheme] = useState<number>(0);

  const artisanName = user?.name || 'Pavan';

  useEffect(() => {
    fetch('/api/v1/artisans/art-01/dashboard')
      .then(r => r.json())
      .then(d => { setDashData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleListenSummary = () => {
    const products = dashData?.productsCount || 8;
    const orders = dashData?.ordersCount || 14;
    const revenue = dashData?.totalOrderRevenue || 28450;

    const summaryMap: Record<string, string> = {
      hi: `नमस्ते ${artisanName} जी। आपके पास ${products} उत्पाद सूचीबद्ध हैं, ${orders} कुल ऑर्डर्स आए हैं, और इस महीने आपकी सीधी कमाई ₹${revenue} रही है। तीन नए ऑर्डर्स भेजने के लिए तैयार हैं।`,
      te: `నమస్కారం ${artisanName} గారు. మీకు ${products} ఉత్పత్తులు లిస్ట్ చేయబడ్డాయి, ${orders} ఆర్డర్లు వచ్చాయి, మరియు ఈ నెల మీ ఆదాయం ₹${revenue}. మూడు కొత్త ఆర్డర్లు పంపడానికి సిద్ధంగా ఉన్నాయి.`,
      ta: `வணக்கம் ${artisanName} அவர்களே. உங்களிடம் ${products} கைவினைப் பொருட்கள் பட்டியலிடப்பட்டுள்ளன, ${orders} ஆர்டர்கள் வந்துள்ளன, மற்றும் இந்த மாத வருமானம் ₹${revenue}. 3 புதிய ஆர்டர்கள் அனுப்ப தயாராக உள்ளன.`,
      kn: `ನಮಸ್ಕಾರ ${artisanName} ಅವರೇ. ನಿಮ್ಮಲ್ಲಿ ${products} ಕರಕುಶಲ ವಸ್ತುಗಳು ಪಟ್ಟಿಯಾಗಿವೆ, ${orders} ಒಟ್ಟು ಆದೇಶಗಳು ಬಂದಿವೆ, ಮತ್ತು ಈ ತಿಂಗಳ ಆದಾಯ ₹${revenue}. 3 ಹೊಸ ಆದೇಶಗಳು ರವಾನೆಗೆ ಸಿದ್ಧವಾಗಿವೆ.`,
      ml: `നമസ്കാരം ${artisanName}. നിങ്ങളുടെ ${products} ഉൽപ്പന്നങ്ങൾ ലിസ്റ്റ് ചെയ്തിട്ടുണ്ട്, ${orders} ഓർഡറുകൾ ലഭിച്ചു, ഈ മാസത്തെ വരുമാനം ₹${revenue}. 3 പുതിയ ഓർഡറുകൾ അയക്കാൻ തയ്യാറാണ്.`,
      mr: `नमस्कार ${artisanName} जी. तुमची ${products} हस्तकला उत्पादने सूचीबद्ध आहेत, ${orders} एकूण मागण्या आल्या आहेत, आणि या महिन्याची कमाई ₹${revenue} आहे. 3 नवीन मागण्या पाठवण्यासाठी सज्ज आहेत.`,
      gu: `નમસ્તે ${artisanName} જી. તમારા ${products} ઉત્પાદનો સૂચિબદ્ધ છે, ${orders} કુલ ઓર્ડર મળ્યા છે, અને આ મહિનાની કમાણી ₹${revenue} છે. 3 નવા ઓર્ડર મોકલવા તૈયાર છે.`,
      bn: `নমস্কার ${artisanName} বাবু। আপনার ${products}টি হস্তশিল্প তালিকাভুক্ত রয়েছে, ${orders}টি মোট অর্ডার এসেছে, এবং এই মাসের উপার্জন ₹${revenue}। ৩টি নতুন অর্ডার পাঠানোর জন্য প্রস্তুত রয়েছে।`,
      or: `ନମସ୍କାର ${artisanName} ବାବୁ। ଆପଣଙ୍କର ${products} ଟି ହସ୍ତଶିଳ୍ପ ତାଲିକାଭୁକ୍ତ ହୋଇଛି, ${orders} ଟି ଅର୍ଡର ମିଳିଛି, ଏବଂ ଏହି ମାସର ଆୟ ₹${revenue}। ୩ଟି ନୂଆ ଅର୍ଡର ପଠାଇବା ପାଇଁ ପ୍ରସ୍ତୁତ।`,
      pa: `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ${artisanName} ਜੀ। ਤੁਹਾਡੇ ${products} ਉਤਪਾਦ ਸੂਚੀਬੱਧ ਹਨ, ${orders} ਕੁੱਲ ਆਰਡਰ ਪ੍ਰਾਪਤ ਹੋਏ ਹਨ, ਅਤੇ ਇਸ ਮਹੀਨੇ ਦੀ ਕਮਾਈ ₹${revenue} ਹੈ। 3 ਨਵੇਂ ਆਰਡਰ ਭੇਜਣ ਲਈ ਤਿਆਰ ਹਨ।`,
      as: `নমস্কাৰ ${artisanName} ডাঙৰীয়া। আপোনাৰ ${products} টা হস্তশিল্প তালিকাভুক্ত কৰা হৈছে, ${orders} টা অৰ্ডাৰ লাভ কৰিছে, আৰু এই মাহৰ উপাৰ্জন ₹${revenue}। ৩টা নতুন অৰ্ডাৰ প্ৰেৰণৰ বাবে সাজু হৈছে।`,
      en: `Good morning ${artisanName}. You have ${products} products listed, ${orders} total orders received, and your direct earnings this month are ₹${revenue}. 3 pending orders are waiting to be packed and shipped.`
    };

    const text = summaryMap[language] || summaryMap.en;
    speakText(text, language);
  };

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
          <div className="w-10 h-10 border-3 border-[#D9CEB8] border-t-[#A8462D] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#7A6E65] text-sm font-medium">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ================================================== */}
      {/* 1. WELCOME HEADER (Warm, Elegant, Editorial)       */}
      {/* ================================================== */}
      <div className="relative overflow-hidden rounded-2xl bg-[#FFFDF8] border border-[#D9CEB8] p-6 sm:p-8 shadow-xs">
        {/* Heritage top gradient border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#A8462D] via-[#C88732] to-[#273B59]" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A8462D]/10 text-[#A8462D] border border-[#A8462D]/20 text-[10px] font-bold uppercase tracking-[0.18em]">
              <Sparkles className="w-3 h-3 text-[#C88732]" />
              <span>✦ {t.digitalBusinessAssistant || 'Artisan Digital Studio'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#29221D] font-serif tracking-tight">
              Good morning, {artisanName} 👋
            </h1>
            <p className="text-xs sm:text-sm text-[#7A6E65] font-medium">
              Your craft business overview for today.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center">
            <button
              onClick={handleListenSummary}
              className="py-2.5 px-4 text-xs font-bold rounded-full bg-[#FFFDF8] text-[#A8462D] border border-[#D9CEB8] hover:bg-[#F7F2E8] hover:border-[#A8462D] shadow-2xs inline-flex items-center gap-2 transition-all group cursor-pointer active:scale-95"
              title="Listen to your business summary"
            >
              <Volume2 className="w-4 h-4 text-[#A8462D] group-hover:scale-110 transition-transform" />
              <span>{t.listenToSummary || 'Listen Summary'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* 2. BUSINESS SNAPSHOT (Clean 6 Metric Cards)        */}
      {/* ================================================== */}
      <div data-tutorial="dashboard-snapshot" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#29221D] font-serif flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#A8462D]" />
            <span>{t.businessSnapshot || 'Business Snapshot'}</span>
          </h2>
          <span className="text-[11px] text-[#7A6E65] font-semibold bg-[#F7F2E8] border border-[#D9CEB8] px-3 py-1 rounded-full">
            {t.directSalesZeroCommission || '100% Direct to Artisan'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* 1. Products */}
          <MetricCard
            icon={Package}
            iconColor="text-[#A8462D]"
            iconBg="bg-[#A8462D]/10 border-[#A8462D]/20"
            label="Products"
            value={dashData?.productsCount ?? 42}
            badgeText={`${dashData?.publishedCount ?? 38} Published`}
            badgeVariant="terracotta"
            onClick={() => navigate('/seller/handicrafts')}
          />

          {/* 2. Orders */}
          <MetricCard
            icon={ShoppingCart}
            iconColor="text-[#273B59]"
            iconBg="bg-[#273B59]/10 border-[#273B59]/20"
            label="Orders"
            value={dashData?.ordersCount ?? 21}
            badgeText={`${dashData?.paidOrdersCount ?? 18} Fulfilled`}
            badgeVariant="indigo"
            onClick={() => navigate('/seller/orders')}
          />

          {/* 3. Available Stock */}
          <MetricCard
            icon={CheckCircle}
            iconColor="text-[#C88732]"
            iconBg="bg-[#C88732]/10 border-[#C88732]/20"
            label="Available Stock"
            value={dashData?.availableStock ?? 244}
            badgeText="In Stock"
            badgeVariant="gold"
            onClick={() => navigate('/seller/handicrafts')}
          />

          {/* 4. B2B Enquiries */}
          <MetricCard
            icon={Building2}
            iconColor="text-[#A8462D]"
            iconBg="bg-[#FDF6F0] border-[#D9CEB8]"
            label="B2B Enquiries"
            value={dashData?.b2bEnquiriesCount ?? dashData?.enquiriesCount ?? 6}
            badgeText="Corporate"
            badgeVariant="terracotta"
          />

          {/* 5. Net Revenue */}
          <MetricCard
            icon={DollarSign}
            iconColor="text-[#4A7A52]"
            iconBg="bg-[#4A7A52]/10 border-[#4A7A52]/20"
            label="Net Revenue"
            value={formatINR(dashData?.totalOrderRevenue ?? 262246)}
            badgeText="0% Commission"
            badgeVariant="success"
            onClick={() => navigate('/seller/sales')}
          />

          {/* 6. QR Provenance */}
          <MetricCard
            icon={Award}
            iconColor="text-[#7A3220]"
            iconBg="bg-[#7A3220]/10 border-[#7A3220]/20"
            label="QR Provenance"
            value={dashData?.publishedCount ?? 19}
            badgeText="Active Tags"
            badgeVariant="muted"
          />
        </div>
      </div>

      {/* ================================================== */}
      {/* 3. QUICK ACTIONS                                   */}
      {/* ================================================== */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-[#29221D] font-serif flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#C88732]" />
          <span>{t.quickActions || 'Quick Actions'}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Action 1: Add Product (Hero Terracotta) */}
          <button
            data-tutorial="action-add-product"
            onClick={() => navigate('/seller/add')}
            className="p-5 rounded-2xl bg-[#A8462D] text-[#FFFDF8] flex items-center gap-4 text-left shadow-sm hover:bg-[#8E3822] hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-6 h-6 text-[#FFFDF8]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base leading-tight font-serif">
                {t.addProductAction || '+ Add Handicraft'}
              </h3>
              <p className="text-xs text-[#E8DFC9] mt-0.5 truncate">
                {t.addProductDesc || 'Photograph craft, auto-generate AI catalog'}
              </p>
            </div>
            <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform shrink-0">
              <ArrowRight className="w-4 h-4 text-white" />
            </span>
          </button>

          {/* Action 2: Scan Product */}
          <button
            onClick={() => navigate('/seller/add?action=scan')}
            className="p-5 rounded-2xl bg-[#FFFDF8] border border-[#D9CEB8] text-[#29221D] flex items-center gap-4 text-left shadow-2xs hover:border-[#A8462D] hover:bg-[#FDF6F0] hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#A8462D]/10 text-[#A8462D] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-[#A8462D]/20">
              <Camera className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base leading-tight font-serif">
                {t.scanProduct || 'Scan Craft Sample'}
              </h3>
              <p className="text-xs text-[#7A6E65] mt-0.5 truncate">
                {t.scanProductDesc || 'Instant visual GI check and materials scan'}
              </p>
            </div>
            <span className="w-8 h-8 rounded-full bg-[#F7F2E8] border border-[#D9CEB8] flex items-center justify-center group-hover:translate-x-1 transition-transform shrink-0">
              <ChevronRight className="w-4 h-4 text-[#A8462D]" />
            </span>
          </button>

          {/* Action 3: Improve Photo */}
          <button
            onClick={() => navigate('/seller/add?step=2')}
            className="p-5 rounded-2xl bg-[#FFFDF8] border border-[#D9CEB8] text-[#29221D] flex items-center gap-4 text-left shadow-2xs hover:border-[#C88732] hover:bg-[#F7F2E8] hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#C88732]/10 text-[#C88732] flex items-center justify-center shrink-0 border border-[#C88732]/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base leading-tight font-serif">
                {t.improvePhoto || 'AI Image Studio'}
              </h3>
              <p className="text-xs text-[#7A6E65] mt-0.5 truncate">
                {t.improvePhotoDesc || 'Remove clutter, add heritage backdrop'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#BFB09A] group-hover:translate-x-1 transition-transform shrink-0" />
          </button>

          {/* Action 4: Check Fair Price */}
          <button
            onClick={() => navigate('/seller/market-analysis')}
            className="p-5 rounded-2xl bg-[#FFFDF8] border border-[#D9CEB8] text-[#29221D] flex items-center gap-4 text-left shadow-2xs hover:border-[#4A7A52] hover:bg-[#F7F2E8] hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#4A7A52]/10 text-[#4A7A52] flex items-center justify-center shrink-0 border border-[#4A7A52]/20">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base leading-tight font-serif">
                {t.checkFairPrice || 'Fair Price Assistant'}
              </h3>
              <p className="text-xs text-[#7A6E65] mt-0.5 truncate">
                {t.checkFairPriceDesc || 'Calculate living wage pricing formula'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#BFB09A] group-hover:translate-x-1 transition-transform shrink-0" />
          </button>

          {/* Action 5: Manage Orders */}
          <button
            onClick={() => navigate('/seller/orders')}
            className="p-5 rounded-2xl bg-[#FFFDF8] border border-[#D9CEB8] text-[#29221D] flex items-center gap-4 text-left shadow-2xs hover:border-[#273B59] hover:bg-[#F7F2E8] hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#273B59]/10 text-[#273B59] flex items-center justify-center shrink-0 border border-[#273B59]/20">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base leading-tight font-serif">
                {t.manageOrdersAction || 'Customer Orders'}
              </h3>
              <p className="text-xs text-[#7A6E65] mt-0.5 truncate">
                {t.manageOrdersDesc || 'Track shipments and buyer payments'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#BFB09A] group-hover:translate-x-1 transition-transform shrink-0" />
          </button>

          {/* Action 6: View Earnings */}
          <button
            onClick={() => navigate('/seller/sales')}
            className="p-5 rounded-2xl bg-[#FFFDF8] border border-[#D9CEB8] text-[#29221D] flex items-center gap-4 text-left shadow-2xs hover:border-[#A8462D] hover:bg-[#F7F2E8] hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#A8462D]/10 text-[#A8462D] flex items-center justify-center shrink-0 border border-[#A8462D]/20">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base leading-tight font-serif">
                {t.viewEarnings || 'Earnings & Sales'}
              </h3>
              <p className="text-xs text-[#7A6E65] mt-0.5 truncate">
                {t.viewEarningsDesc || 'Monthly profit report & direct payouts'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#BFB09A] group-hover:translate-x-1 transition-transform shrink-0" />
          </button>
        </div>
      </div>

      {/* ================================================== */}
      {/* 5. ARTISAN WELFARE & GOVERNMENT SCHEMES            */}
      {/* ================================================== */}
      <div className="bg-[#FFFDF8] rounded-2xl p-6 sm:p-7 border border-[#D9CEB8] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#D9CEB8]">
          <div>
            <span className="text-[10px] font-bold text-[#A8462D] uppercase tracking-[0.16em] block">
              Government Support & Grants
            </span>
            <h3 className="text-lg font-bold text-[#29221D] font-serif">
              Artisan Schemes & Working Capital
            </h3>
          </div>
          <span className="text-xs text-[#7A6E65] font-semibold bg-[#F7F2E8] px-3 py-1 rounded-full border border-[#D9CEB8] self-start sm:self-auto">
            Zero Paperwork Guidance
          </span>
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap gap-2">
          {supportSchemes.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setSelectedScheme(idx)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedScheme === idx
                  ? 'bg-[#A8462D] text-[#FFFDF8] shadow-xs'
                  : 'bg-[#F7F2E8] text-[#7A6E65] hover:text-[#29221D] hover:bg-[#E8DFC9]/60 border border-[#D9CEB8]'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Selected Scheme Card */}
        {supportSchemes[selectedScheme] && (
          <div className="p-5 rounded-xl bg-[#F7F2E8]/60 border border-[#D9CEB8] space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#A8462D] uppercase tracking-wider">
                {supportSchemes[selectedScheme].badge}
              </span>
              <span className="text-xs font-bold text-[#4A7A52] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                {supportSchemes[selectedScheme].tag}
              </span>
            </div>
            <p className="text-sm font-semibold text-[#29221D]">
              {supportSchemes[selectedScheme].what}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#7A6E65] pt-2 border-t border-[#D9CEB8]/50">
              <div>
                <span className="font-bold text-[#29221D] block">Who can apply:</span>
                <span>{supportSchemes[selectedScheme].who}</span>
              </div>
              <div>
                <span className="font-bold text-[#29221D] block">Required Documents:</span>
                <span>{supportSchemes[selectedScheme].needs}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
