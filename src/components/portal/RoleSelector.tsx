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
      <div className="text-center mb-8 animate-fade-in-up">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="px-3.5 py-1 rounded-full bg-[#fff7ed] text-[#9c4124] text-xs font-black tracking-wider uppercase border border-[#fed7aa] shadow-2xs">
            {language === 'hi' ? 'कारीगर डिजिटल प्रवेश' : language === 'te' ? 'కళాకారుల డిజిటల్ ప్రవేశం' : 'Artisan Digital Onboarding'}
          </span>
          {onSpeak && (
            <button
              onClick={() => onSpeak(t.roleArtisanTitle + '. ' + t.roleArtisanDesc + '. ' + t.roleArtisanPoints.join('. '))}
              className="p-1.5 rounded-xl bg-white hover:bg-[#faf7f2] text-[#9c4124] border border-[#eadfd4] hover:border-[#c85a32] transition-all text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
              title={t.voiceListen}
            >
              <Volume2 className="w-3.5 h-3.5 text-[#9c4124]" />
              <span className="hidden sm:inline font-semibold">{t.voiceListen}</span>
            </button>
          )}
        </div>

        <h2 id="artisan-gateway-heading" className="text-2xl sm:text-4xl font-black text-[#262220] mb-3 tracking-tight font-['Rozha_One',serif]">
          {t.roleArtisanTitle}
        </h2>
        <p className="text-base sm:text-lg font-medium text-[#57534e] max-w-xl mx-auto leading-relaxed">
          {t.roleArtisanDesc}
        </p>
      </div>

      {/* DEDICATED ARTISAN PORTAL CARD (NO BUYER PORTAL) */}
      <div className="max-w-2xl mx-auto animate-scale-in">
        <div
          tabIndex={0}
          role="button"
          onClick={onSelectArtisan}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectArtisan(); } }}
          className="group relative rounded-3xl border border-[#eadfd4] bg-white p-6 sm:p-10 hover:border-[#c85a32] hover:shadow-[0_16px_36px_-8px_rgba(156,65,36,0.14)] transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between focus:outline-none focus:ring-4 focus:ring-[#c85a32]/20 shadow-[0_2px_12px_-3px_rgba(38,34,32,0.06)]"
        >
          <div>
            {/* Big Icon & Badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="w-18 h-18 rounded-2xl bg-[#9c4124] text-white flex items-center justify-center text-4xl shadow-md shadow-[#9c4124]/20 group-hover:scale-105 transition-transform">
                🧑‍🎨
              </div>
              <span className="px-3.5 py-1.5 rounded-full bg-[#fff7ed] text-[#9c4124] text-xs font-extrabold border border-[#fed7aa] shadow-2xs">
                {t.roleArtisanBadge}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-[#262220] mb-3 leading-tight font-['Rozha_One',serif]">
              {language === 'hi' ? 'अपनी हस्तशिल्प दुकान शुरू करें' : language === 'te' ? 'మీ చేతివృత్తి దుకాణాన్ని ప్రారంభించండి' : 'Start Your Handcrafted Digital Shop'}
            </h3>
            <p className="text-[#57534e] text-base sm:text-lg font-medium mb-6 leading-relaxed">
              "{t.roleArtisanDesc}"
            </p>

            {/* Key Value Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {t.roleArtisanPoints.map((pt, i) => (
                <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-[#faf7f2] border border-[#eadfd4] text-[#262220] text-sm font-semibold shadow-2xs">
                  <CheckCircle2 className="w-4.5 h-4.5 text-[#15803d] shrink-0" />
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
            className="w-full min-h-[56px] py-4 px-8 rounded-2xl font-bold text-lg text-white bg-[#9c4124] hover:bg-[#83341b] artisan-btn-glow transition-all duration-200 flex items-center justify-center gap-3 shadow-md shadow-[#9c4124]/25 active:scale-[0.98] cursor-pointer"
          >
            <span>{t.roleArtisanCta}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};
