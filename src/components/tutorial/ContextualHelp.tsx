import React, { useState } from 'react';
import { useTutorial } from './TutorialContext';
import { useLanguage } from '../../lib/LanguageContext';
import { HelpCircle, Eye, Info, Sparkles } from 'lucide-react';

interface ShowMeButtonProps {
  missionId?: string;
  className?: string;
}

export const ShowMeButton: React.FC<ShowMeButtonProps> = ({ missionId, className = '' }) => {
  const { showMe } = useTutorial();
  const { language } = useLanguage();

  return (
    <button
      onClick={() => showMe(missionId)}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs font-bold transition-all shadow-2xs cursor-pointer ${className}`}
      title="Show interactive guidance"
    >
      <Eye className="w-3.5 h-3.5 text-amber-700" />
      <span>{language === 'hi' ? '👀 मुझे दिखाएं' : language === 'te' ? '👀 నాకు చూపించు' : '👀 Show Me'}</span>
    </button>
  );
};

interface InfoTooltipProps {
  textEn: string;
  textHi: string;
  textTe: string;
  titleEn?: string;
  titleHi?: string;
  titleTe?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  textEn,
  textHi,
  textTe,
  titleEn = 'How this works',
  titleHi = 'यह कैसे काम करता है',
  titleTe = 'ఇది ఎలా పనిచేస్తుంది',
}) => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const title = language === 'hi' ? titleHi : language === 'te' ? titleTe : titleEn;
  const text = language === 'hi' ? textHi : language === 'te' ? textTe : textEn;

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="p-1 text-stone-400 hover:text-[#9c4124] transition-colors rounded-full hover:bg-stone-100 cursor-pointer"
        aria-label="Information"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white rounded-2xl shadow-xl border border-amber-400/30 text-xs transition-all pointer-events-none">
          <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
            <Sparkles className="w-3 h-3" />
            <span>{title}</span>
          </div>
          <p className="text-slate-200 text-[11px] leading-relaxed">{text}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
};
