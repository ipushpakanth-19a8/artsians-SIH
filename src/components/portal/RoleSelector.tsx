import React from 'react';
import { Store, ArrowRight, CheckCircle2, Volume2, Sparkles, ShieldCheck } from 'lucide-react';
import { LanguageCode } from '../../types';
import { PORTAL_TRANSLATIONS } from '../../lib/portalI18n';

interface RoleSelectorProps {
  language: LanguageCode;
  onSelectArtisan: () => void;
  onSelectBuyer?: () => void;
  onSpeak?: (text: string) => void;
  isSpeaking?: boolean;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  language,
  onSelectArtisan,
  onSpeak,
  isSpeaking = false,
}) => {
  const t = PORTAL_TRANSLATIONS[language];

  return (
    <section aria-labelledby="artisan-gateway-heading" className="w-full max-w-4xl mx-auto">
      {/* Title & Speech helper */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="px-3.5 py-1 rounded-full bg-amber-100 text-amber-950 text-xs font-black tracking-wider uppercase border border-amber-300">
            {language === 'hi' ? 'कारीगर डिजिटल प्रवेश' : language === 'te' ? 'కళాకారుల డిజిటల్ ప్రవేశం' : 'Artisan Digital Onboarding'}
          </span>
          {onSpeak && (
            <button
              onClick={() => onSpeak(t.roleArtisanTitle + '. ' + t.roleArtisanDesc + '. ' + t.roleArtisanPoints.join('. '))}
              className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
              title={t.voiceListen}
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">{t.voiceListen}</span>
            </button>
          )}
        </div>

        <h2 id="artisan-gateway-heading" className="text-2xl sm:text-4xl font-black text-stone-900 mb-3 tracking-tight font-['Rozha_One',serif]">
          {t.roleArtisanTitle}
        </h2>
        <p className="text-base sm:text-lg font-medium text-stone-600 max-w-xl mx-auto">
          {t.roleArtisanDesc}
        </p>
      </div>

      {/* DEDICATED ARTISAN PORTAL CARD (NO BUYER PORTAL) */}
      <div className="max-w-2xl mx-auto">
        <div
          tabIndex={0}
          role="button"
          onClick={onSelectArtisan}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectArtisan(); } }}
          className="group relative rounded-3xl border-2 border-amber-300 bg-gradient-to-b from-amber-50 via-white to-orange-50/50 p-6 sm:p-10 hover:shadow-2xl hover:border-amber-500 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between focus:outline-none focus:ring-4 focus:ring-amber-400"
        >
          <div>
            {/* Big Icon & Badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center text-4xl shadow-lg shadow-amber-600/30 group-hover:scale-105 transition-transform">
                🧑‍🎨
              </div>
              <span className="px-3.5 py-1.5 rounded-full bg-amber-200/80 text-amber-950 text-xs font-extrabold border border-amber-300 shadow-xs">
                {t.roleArtisanBadge}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-stone-900 mb-3 leading-tight font-['Rozha_One',serif]">
              {language === 'hi' ? 'अपनी हस्तशिल्प दुकान शुरू करें' : language === 'te' ? 'మీ చేతివృత్తి దుకాణాన్ని ప్రారంభించండి' : 'Start Your Handcrafted Digital Shop'}
            </h3>
            <p className="text-stone-700 text-base sm:text-lg font-bold mb-6 leading-relaxed">
              "{t.roleArtisanDesc}"
            </p>

            {/* Key Value Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {t.roleArtisanPoints.map((pt, i) => (
                <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/80 border border-amber-200/70 text-stone-800 text-sm font-semibold shadow-2xs">
                  <CheckCircle2 className="w-4.5 h-4.5 text-amber-600 shrink-0" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectArtisan();
            }}
            className="w-full min-h-[56px] py-4 px-8 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-amber-900/20 active:scale-98 cursor-pointer"
          >
            <span>{t.roleArtisanCta}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};
