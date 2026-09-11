import React from 'react';
import { useTutorial } from './TutorialContext';
import { useLanguage } from '../../lib/LanguageContext';
import { Play, Sparkles, X, Check, FastForward } from 'lucide-react';

export const WelcomeJourneyModal: React.FC = () => {
  const { showWelcomeModal, startJourney, startDemoJourney, skipJourney, closeWelcomeModal } = useTutorial();
  const { language } = useLanguage();

  if (!showWelcomeModal) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border-2 border-amber-300 shadow-2xl relative overflow-hidden">
        {/* Top Close Button */}
        <button
          onClick={closeWelcomeModal}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Saathi Welcome Avatar */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 text-white flex items-center justify-center text-3xl shadow-lg ring-4 ring-amber-100">
            🤝
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                {language === 'hi' ? 'कला साथी' : language === 'te' ? 'కళా సాథీ' : 'Artisan Saathi'}
              </span>
              <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {language === 'hi' ? 'शुरुआती गाइड' : language === 'te' ? 'గైడ్' : 'Interactive Guide'}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
              {language === 'hi'
                ? 'शिल्पसेतु में आपका स्वागत है 👋'
                : language === 'te'
                ? 'శిల్పసేతుకు స్వాగతం 👋'
                : 'Welcome to Artisans 👋'}
            </h2>
          </div>
        </div>

        {/* Subtitle & Concept */}
        <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-amber-200/70 mb-5">
          <p className="text-sm font-semibold text-slate-800 leading-relaxed">
            {language === 'hi'
              ? 'अपनी डिजिटल दुकान साथ मिलकर तैयार करें! आप केवल 8 सरल मिशनों में पूरा ऐप सीख जाएंगे।'
              : language === 'te'
              ? 'మీ డిజిటల్ దుకాణాన్ని కలిసి ఏర్పాటు చేద్దాం! 8 సులభమైన దశలలో ప్రతిదీ నేర్చుకోండి.'
              : "Let's set up your digital shop together. You'll learn everything by interacting with the real features in 8 simple steps."}
          </p>
        </div>

        {/* 4 Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6 text-left">
          <div className="flex items-start gap-2 text-xs font-medium text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{language === 'hi' ? 'फ़ोटो लें और AI से संवारें' : language === 'te' ? 'ఫోటోలు & AI ఎన్హాన్స్' : 'Snap & AI Photo Studio'}</span>
          </div>
          <div className="flex items-start gap-2 text-xs font-medium text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{language === 'hi' ? 'AI विरासत कहानी लेखन' : language === 'te' ? 'AI స్టోరీ వివరాలు' : 'AI Craft Story Listing'}</span>
          </div>
          <div className="flex items-start gap-2 text-xs font-medium text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{language === 'hi' ? 'सम्मानजनक उचित मूल्य कैलकुलेटर' : language === 'te' ? 'సరసమైన ధర క్యాలిక్యులేటర్' : 'Fair Living-Wage Pricing'}</span>
          </div>
          <div className="flex items-start gap-2 text-xs font-medium text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{language === 'hi' ? '0% कमीशन ऑर्डर ट्रैकिंग' : language === 'te' ? '0% కమిషన్ ఆర్డర్లు' : 'Direct Order Management'}</span>
          </div>
        </div>

        {/* Primary and Secondary CTA Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={startJourney}
            className="w-full py-3.5 px-5 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {language === 'hi'
                ? '🌱 अपनी शिल्प यात्रा शुरू करें'
                : language === 'te'
                ? '🌱 శిల్ప యాత్ర ప్రారంభించండి'
                : '🌱 Start My Artisan Journey'}
            </span>
          </button>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={startDemoJourney}
              className="text-xs font-black text-amber-900 hover:text-amber-950 flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-100/70 hover:bg-amber-100 border border-amber-300 transition-colors shadow-2xs"
            >
              <span>🎮</span>
              <span>{language === 'hi' ? '🎮 2-मिनट जज डेमो' : language === 'te' ? '🎮 2-నిమిషాల డెమో' : '🎮 Try the 2-Minute Demo'}</span>
            </button>

            <button
              onClick={skipJourney}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 py-1 px-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {language === 'hi' ? 'बाद में करें (छोड़ें)' : language === 'te' ? 'తరువాత చేయండి' : 'Skip for now'}
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 text-center mt-3">
          {language === 'hi'
            ? '💡 आप इसे कभी भी साइडबार या टॉप मेनू से फिर से शुरू कर सकते हैं।'
            : language === 'te'
            ? '💡 మీరు దీన్ని ఎప్పుడైనా సైడ్‌బార్ నుండి పునఃప్రారంభించవచ్చు.'
            : '💡 You can restart the journey anytime from your artisan profile or top menu.'}
        </p>
      </div>
    </div>
  );
};
