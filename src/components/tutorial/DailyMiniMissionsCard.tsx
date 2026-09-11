import React, { useState } from 'react';
import { useTutorial } from './TutorialContext';
import { useLanguage } from '../../lib/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Trophy, CheckCircle2, ArrowRight, Camera, FileEdit, DollarSign, Award } from 'lucide-react';

export const DailyMiniMissionsCard: React.FC = () => {
  const { journeyPoints, unlockedBadges, startJourney, resetJourney } = useTutorial();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [completedMissions, setCompletedMissions] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('shilpsetu_daily_missions_completed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleCompleteMission = (id: string, actionRoute: string) => {
    if (!completedMissions.includes(id)) {
      const next = [...completedMissions, id];
      setCompletedMissions(next);
      try {
        localStorage.setItem('shilpsetu_daily_missions_completed', JSON.stringify(next));
      } catch {}
    }
    navigate(actionRoute);
  };

  const dailyMissions = [
    {
      id: 'daily-photo',
      icon: Camera,
      points: 10,
      titleEn: 'Add a clearer photo to one product',
      titleHi: 'एक उत्पाद की अधिक स्पष्ट फ़ोटो लगाएं',
      titleTe: 'ఒక ఉత్పత్తికి స్పష్టమైన ఫోటో జోడించండి',
      descEn: 'High quality images increase buyer interest by 3.2x',
      descHi: 'उच्च गुणवत्ता वाली फ़ोटो से खरीदारों की रुचि 3.2 गुना बढ़ती है',
      descTe: 'మంచి ఫోటోలు కొనుగోలుదారుల ఆసక్తిని 3.2 రెట్లు పెంచుతాయి',
      route: '/seller/add?step=1',
    },
    {
      id: 'daily-story',
      icon: FileEdit,
      points: 10,
      titleEn: 'Review your authentic craft heritage story',
      titleHi: 'अपनी पारंपरिक शिल्प कथा की समीक्षा करें',
      titleTe: 'మీ కళా వారసత్వ కథనాన్ని సమీక్షించండి',
      descEn: 'Authentic artisan stories build trust with cultural collectors',
      descHi: 'सच्ची हस्तशिल्प कथा से खरीदारों का भरोसा गहरा होता है',
      descTe: 'ప్రామాణిక కథనాలు కొనుగోలుదారులలో నమ్మకాన్ని పెంచుతాయి',
      route: '/seller/add?step=4',
    },
    {
      id: 'daily-price',
      icon: DollarSign,
      points: 10,
      titleEn: 'Verify living-wage price calculator',
      titleHi: 'उचित पारिश्रमिक मूल्य कैलकुलेटर जांचें',
      titleTe: 'సరసమైన ధర కాలిక్యులేటర్ తనిఖీ చేయండి',
      descEn: 'Ensure every hour of manual craftwork is priced with dignity',
      descHi: 'सुनिश्चित करें कि आपकी हर घंटे की मेहनत का सम्मानजनक पारिश्रमिक मिले',
      descTe: 'మీ శ్రమకు తగిన న్యాయమైన వేతనం అందుతోందని నిర్ధారించుకోండి',
      route: '/seller/market-analysis',
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#eadfd4] shadow-xs relative overflow-hidden">
      {/* Decorative Warm Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-100/60 to-transparent rounded-bl-full pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#eadfd4]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-[#9c4124] flex items-center justify-center text-xl font-bold border border-amber-200/80 shadow-2xs">
            🌱
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#9c4124] bg-[#fdf2e9] px-2 py-0.5 rounded-md border border-[#f8d7c2]">
                {language === 'hi' ? 'दैनिक शिल्प कार्य' : language === 'te' ? 'నేటి మిషన్లు' : "Today's Artisan Missions"}
              </span>
              <span className="text-xs font-bold text-stone-500">
                {language === 'hi' ? 'व्यापार विकास' : language === 'te' ? 'వ్యాపార వృద్ధి' : 'Business Growth'}
              </span>
            </div>
            <h3 className="text-base font-black text-[#262220] mt-0.5">
              {language === 'hi'
                ? 'सरल दैनिक कार्य पूरा करें और दुकान बढ़ाएं'
                : language === 'te'
                ? 'సులభమైన రోజువారీ పనులు పూర్తి చేయండి'
                : 'Complete Small Tasks to Grow Your Digital Shop'}
            </h3>
          </div>
        </div>

        {/* Journey Score & Replay Trigger */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span className="text-xs font-black text-amber-900 font-mono">{journeyPoints}</span>
            <span className="text-[10px] font-bold text-amber-700 uppercase">Pts</span>
          </div>

          <button
            onClick={startJourney}
            className="px-3 py-1.5 rounded-xl bg-[#9c4124] hover:bg-[#83341b] text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
          >
            <span>{language === 'hi' ? '🎮 गाइड टूर शुरू करें' : language === 'te' ? '🎮 గైడ్ టూర్' : '🎮 Artisan Journey'}</span>
          </button>
        </div>
      </div>

      {/* 3 Daily Mini Missions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4">
        {dailyMissions.map((m) => {
          const isDone = completedMissions.includes(m.id);
          const title = language === 'hi' ? m.titleHi : language === 'te' ? m.titleTe : m.titleEn;
          const desc = language === 'hi' ? m.descHi : language === 'te' ? m.descTe : m.descEn;

          return (
            <div
              key={m.id}
              onClick={() => handleCompleteMission(m.id, m.route)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                isDone
                  ? 'bg-emerald-50/40 border-emerald-200 hover:bg-emerald-50/70'
                  : 'bg-[#faf7f2] border-[#eadfd4] hover:border-[#9c4124] hover:bg-[#fdfbf7]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-[#9c4124] border border-[#eadfd4]'
                  }`}>
                    <m.icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                    isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {isDone ? '✓ Completed' : `+${m.points} Pts`}
                  </span>
                </div>

                <h4 className="text-xs font-extrabold text-[#262220] group-hover:text-[#9c4124] transition-colors line-clamp-2">
                  {title}
                </h4>
                <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                  {desc}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-2 border-t border-stone-200/60 text-xs font-bold text-[#9c4124]">
                <span>{isDone ? 'Reviewed' : 'Start Task'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
