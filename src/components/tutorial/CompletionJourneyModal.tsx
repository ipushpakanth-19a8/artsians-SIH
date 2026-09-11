import React from 'react';
import { useTutorial } from './TutorialContext';
import { useLanguage } from '../../lib/LanguageContext';
import { Trophy, CheckCircle, RotateCcw, ArrowRight, Award, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CompletionJourneyModal: React.FC = () => {
  const { showCompletionModal, closeCompletionModal, resetJourney, journeyPoints, unlockedBadges } = useTutorial();
  const { language } = useLanguage();
  const navigate = useNavigate();

  if (!showCompletionModal) return null;

  const handleGoToShop = () => {
    closeCompletionModal();
    navigate('/seller');
  };

  const skillsLearned = [
    { en: 'Add a handcrafted product', hi: 'हस्तशिल्प उत्पाद जोड़ना', te: 'చేతివృత్తి ఉత్పత్తిని జోడించడం' },
    { en: 'AI Photo Studio enhancement', hi: 'AI फ़ोटो संवर्धन एवं स्टूडियो लाइटिंग', te: 'AI ఫోటో ఎన్హాన్స్మెంట్' },
    { en: 'Heritage storytelling & craft attributes', hi: 'शिल्प कथा एवं विवरण रचना', te: 'కళా కథనం & వివరాలు' },
    { en: 'Living-wage transparent fair pricing', hi: 'उचित पारदर्शी पारिश्रमिक मूल्य', te: 'సరసమైన ధర నిర్ణయం' },
    { en: 'Publishing to digital marketplace', hi: 'डिजिटल बाज़ार में लाइव प्रकाशन', te: 'మార్కెట్‌ప్లేస్‌లో ప్రచురణ' },
    { en: '0% commission order fulfillment', hi: 'शून्य कमीशन ऑर्डर पूर्ति एवं ट्रैकिंग', te: 'ఆర్డర్ నిర్వహణ' },
    { en: 'Track earnings & business growth', hi: 'कमाई व व्यापार वृद्धि ट्रैक करना', te: 'ఆదాయం & వ్యాపార వృద్ధిని ట్రాక్ చేయడం' },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border-2 border-amber-300 shadow-2xl relative text-center overflow-hidden">
        {/* Celebration Trophy */}
        <div className="relative mx-auto w-20 h-20 mb-4">
          <div className="absolute inset-0 bg-amber-400/30 rounded-full animate-ping" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-center text-4xl shadow-xl ring-4 ring-amber-100">
            🏆
          </div>
        </div>

        {/* Title */}
        <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 font-black text-xs px-3 py-1 rounded-full border border-amber-200 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>{language === 'hi' ? 'शिल्प यात्रा सम्पन्न!' : language === 'te' ? 'యాత్ర పూర్తయింది!' : 'Artisan Journey Complete!'}</span>
        </div>

        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          {language === 'hi'
            ? 'आपकी डिजिटल दुकान तैयार है! 🎉'
            : language === 'te'
            ? 'మీ డిజిటల్ దుకాణం సిద్ధమైంది! 🎉'
            : "Your Digital Shop is Ready! 🎉"}
        </h2>

        <p className="text-sm font-medium text-slate-600 mb-5">
          {language === 'hi'
            ? 'बधाई हो! आपने डिजिटल शिल्प व्यापार के सभी प्रमुख चरण सफलतापूर्वक पूरे कर लिए हैं।'
            : language === 'te'
            ? 'అభినందనలు! మీరు డిజిటల్ విక్రయాల అన్ని ముఖ్యమైన దశలను విజయవంతంగా పూర్తి చేశారు.'
            : 'Congratulations! You mastered all digital craft selling skills by doing them yourself.'}
        </p>

        {/* Journey Score Pill */}
        <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-amber-200/80 mb-5 flex items-center justify-around">
          <div>
            <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider block">
              {language === 'hi' ? 'कुल यात्रा अंक' : language === 'te' ? 'మొత్తం పాయింట్లు' : 'Total Points'}
            </span>
            <span className="text-2xl font-black text-amber-900 font-mono">
              {journeyPoints} Pts
            </span>
          </div>

          <div className="w-px h-8 bg-amber-200" />

          <div>
            <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider block">
              {language === 'hi' ? 'अर्जित बैज' : language === 'te' ? 'బ్యాడ్జ్‌లు' : 'Badges Earned'}
            </span>
            <span className="text-2xl font-black text-amber-900 font-mono">
              {unlockedBadges.length} / 6
            </span>
          </div>
        </div>

        {/* Skills Checklist */}
        <div className="text-left bg-slate-50 p-4 rounded-2xl border border-slate-200/70 mb-6 space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            {language === 'hi' ? 'आपने सीखा:' : language === 'te' ? 'మీరు నేర్చుకున్నవి:' : "You've Mastered:"}
          </span>
          {skillsLearned.map((skill, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{language === 'hi' ? skill.hi : language === 'te' ? skill.te : skill.en}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleGoToShop}
            className="w-full py-3.5 px-5 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95"
          >
            <span>{language === 'hi' ? '🚀 मेरी दुकान पर जाएं' : language === 'te' ? '🚀 నా దుకాణానికి వెళ్లండి' : '🚀 Go To My Shop'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={resetJourney}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? '🎮 ट्यूटोरियल दोबारा खेलें' : language === 'te' ? '🎮 ట్యుటోరియల్ మళ్ళీ ఆడండి' : '🎮 Replay Artisan Journey'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
