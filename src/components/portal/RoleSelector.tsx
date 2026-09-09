import React from 'react';
import { Store, ShoppingBag, ArrowRight, CheckCircle2, Volume2, Sparkles } from 'lucide-react';
import { LanguageCode } from '../../types';
import { PORTAL_TRANSLATIONS } from '../../lib/portalI18n';

interface RoleSelectorProps {
  language: LanguageCode;
  onSelectArtisan: () => void;
  onSelectBuyer: () => void;
  onSpeak?: (text: string) => void;
  isSpeaking?: boolean;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  language,
  onSelectArtisan,
  onSelectBuyer,
  onSpeak,
  isSpeaking = false,
}) => {
  const t = PORTAL_TRANSLATIONS[language];

  return (
    <section aria-labelledby="role-selection-heading" className="w-full max-w-4xl mx-auto">
      {/* Title & Speech helper */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="px-3.5 py-1 rounded-full bg-amber-100 text-amber-950 text-xs font-black tracking-wider uppercase border border-amber-300">
            Step 4 • Role Selection
          </span>
          {onSpeak && (
            <button
              onClick={() => onSpeak(t.roleHeading + '. ' + t.roleSub + '. ' + t.roleSelectionSpeech)}
              className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-all text-xs font-bold flex items-center gap-1"
              title={t.voiceListen}
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">{t.voiceListen}</span>
            </button>
          )}
        </div>

        <h2 id="role-selection-heading" className="text-2xl sm:text-4xl font-black text-stone-900 mb-3 tracking-tight font-['Rozha_One',serif]">
          {t.roleHeading}
        </h2>
        <p className="text-base sm:text-lg font-medium text-stone-600 max-w-lg mx-auto">
          {t.roleSub}
        </p>
      </div>

      {/* TWO LARGE CARDS ONLY — ZERO ADMIN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* CARD 1: ARTISAN */}
        <div
          tabIndex={0}
          role="button"
          onClick={onSelectArtisan}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectArtisan(); } }}
          className="group relative rounded-3xl border-2 border-amber-300 bg-gradient-to-b from-amber-50 via-white to-orange-50/50 p-6 sm:p-8 hover:shadow-2xl hover:border-amber-500 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between focus:outline-none focus:ring-4 focus:ring-amber-400"
        >
          <div>
            {/* Big Icon & Badge */}
            <div className="flex items-center justify-between mb-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center text-3xl shadow-lg shadow-amber-600/30 group-hover:scale-105 transition-transform">
                🧑‍🎨
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-200/80 text-amber-950 text-xs font-extrabold border border-amber-300">
                {t.roleArtisanBadge}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-stone-900 mb-2 leading-tight">
              {t.roleArtisanTitle}
            </h3>
            <p className="text-stone-700 text-base sm:text-lg font-bold mb-6 leading-relaxed">
              "{t.roleArtisanDesc}"
            </p>

            {/* Key Value Points */}
            <ul className="space-y-2.5 mb-8">
              {t.roleArtisanPoints.map((pt, i) => (
                <li key={i} className="flex items-center gap-2.5 text-stone-800 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectArtisan();
            }}
            className="w-full min-h-[52px] py-3.5 px-6 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-amber-900/20 active:scale-98"
          >
            <span>{t.roleArtisanCta}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* CARD 2: BUYER */}
        <div
          tabIndex={0}
          role="button"
          onClick={onSelectBuyer}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectBuyer(); } }}
          className="group relative rounded-3xl border-2 border-emerald-300 bg-gradient-to-b from-emerald-50 via-white to-teal-50/50 p-6 sm:p-8 hover:shadow-2xl hover:border-emerald-500 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between focus:outline-none focus:ring-4 focus:ring-emerald-400"
        >
          <div>
            {/* Big Icon & Badge */}
            <div className="flex items-center justify-between mb-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center text-3xl shadow-lg shadow-emerald-700/30 group-hover:scale-105 transition-transform">
                🛍️
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-200/80 text-emerald-950 text-xs font-extrabold border border-emerald-300">
                {t.roleBuyerBadge}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-stone-900 mb-2 leading-tight">
              {t.roleBuyerTitle}
            </h3>
            <p className="text-stone-700 text-base sm:text-lg font-bold mb-6 leading-relaxed">
              "{t.roleBuyerDesc}"
            </p>

            {/* Key Value Points */}
            <ul className="space-y-2.5 mb-8">
              {t.roleBuyerPoints.map((pt, i) => (
                <li key={i} className="flex items-center gap-2.5 text-stone-800 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectBuyer();
            }}
            className="w-full min-h-[52px] py-3.5 px-6 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 hover:from-emerald-700 hover:to-teal-800 transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-900/20 active:scale-98"
          >
            <span>{t.roleBuyerCta}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};
