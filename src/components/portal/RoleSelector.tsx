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
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="h-7 inline-flex items-center px-3.5 rounded-full bg-[#A8462D]/10 text-[#A8462D] text-xs font-semibold tracking-wider uppercase border border-[#A8462D]/25 shadow-xs">
            ✦ {language === 'hi' ? 'कारीगर डिजिटल प्रवेश' : language === 'te' ? 'కళాకారుల డిజిటల్ ప్రవేశం' : 'ARTISAN DIRECT ONBOARDING'}
          </span>
          {onSpeak && (
            <button
              onClick={() => onSpeak(t.roleArtisanTitle + '. ' + t.roleArtisanDesc + '. ' + t.roleArtisanPoints.join('. '))}
              className="h-7 px-2.5 rounded-full bg-[#FFFDF8] hover:bg-[#F7F2E8] text-[#A8462D] border border-[#D9CEB8] transition-all text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
              title={t.voiceListen}
            >
              <Volume2 className="w-3.5 h-3.5 text-[#A8462D]" />
              <span className="hidden sm:inline font-mono">{t.voiceListen}</span>
            </button>
          )}
        </div>

        <h2 id="artisan-gateway-heading" className="text-2xl sm:text-4xl font-bold text-[#29221D] mb-2 tracking-tight font-['Playfair_Display',serif]">
          {t.roleArtisanTitle}
        </h2>
        <p className="text-base sm:text-lg font-normal text-[#7A6E65] max-w-xl mx-auto leading-relaxed">
          {t.roleArtisanDesc}
        </p>
      </div>

      {/* DEDICATED ARTISAN PORTAL CARD */}
      <div className="max-w-2xl mx-auto animate-scale-in">
        <div
          tabIndex={0}
          role="button"
          onClick={onSelectArtisan}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectArtisan(); } }}
          className="group relative rounded-2xl border border-[#D9CEB8] bg-[#FFFDF8] p-6 sm:p-9 hover:border-[#A8462D] hover:shadow-[0_16px_40px_-8px_rgba(41,34,29,0.12)] transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-[#A8462D]/40 shadow-sm"
        >
          <div>
            {/* Big Icon & Badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 rounded-xl bg-[#A8462D]/10 text-[#A8462D] border border-[#A8462D]/20 flex items-center justify-center text-3xl shadow-sm group-hover:scale-105 transition-transform">
                🧑‍🎨
              </div>
              <span className="px-3 py-1 rounded-full bg-[#A8462D]/10 text-[#A8462D] text-xs font-semibold border border-[#A8462D]/25 shadow-xs">
                {t.roleArtisanBadge}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-[#29221D] mb-2 leading-tight font-['Playfair_Display',serif]">
              {language === 'hi' ? 'अपनी हस्तशिल्प दुकान शुरू करें' : language === 'te' ? 'మీ చేతివృత్తి దుకాణాన్ని ప్రారంభించండి' : 'Start Your Handcrafted Digital Shop'}
            </h3>
            <p className="text-[#7A6E65] text-base font-normal mb-6 leading-relaxed">
              "{t.roleArtisanDesc}"
            </p>

            {/* Key Value Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {t.roleArtisanPoints.map((pt, i) => (
                <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F7F2E8] border border-[#D9CEB8]/70 text-[#29221D] text-sm font-semibold shadow-xs">
                  <CheckCircle2 className="w-4.5 h-4.5 text-[#4A7A52] shrink-0" />
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
            className="w-full h-14 rounded-xl font-bold text-base sm:text-lg text-[#FFFDF8] bg-[#A8462D] hover:bg-[#C5614A] shadow-[0_4px_20px_rgba(168,70,45,0.3)] transition-all duration-200 inline-flex items-center justify-center gap-2.5 active:scale-[0.99] cursor-pointer"
          >
            <span>{t.roleArtisanCta}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-[#FFFDF8]" />
          </button>
        </div>
      </div>
    </section>
  );
};
