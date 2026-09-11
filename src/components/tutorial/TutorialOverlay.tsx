import React, { useState, useEffect, useRef } from 'react';
import { useTutorial } from './TutorialContext';
import { useLanguage } from '../../lib/LanguageContext';
import { Volume2, ChevronRight, ChevronLeft, Pause, X, Sparkles, CheckCircle2 } from 'lucide-react';

export const TutorialOverlay: React.FC = () => {
  const {
    isActive,
    isPaused,
    currentMission,
    currentLevel,
    completeCurrentMission,
    pauseJourney,
    skipJourney,
    prevLevel,
    listenCurrentMission,
  } = useTutorial();

  const { language } = useLanguage();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const observerRef = useRef<MutationObserver | null>(null);

  // Track window resizing
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, []);

  // Locate active target element
  useEffect(() => {
    if (!isActive || isPaused) {
      setTargetRect(null);
      return;
    }

    const updateRect = () => {
      const targetEl = document.querySelector(`[data-tutorial="${currentMission.targetId}"]`);
      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        setTargetRect(rect);
        // Scroll into view if needed
        const isOutOfView = rect.top < 80 || rect.bottom > window.innerHeight - 80;
        if (isOutOfView) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    const interval = setInterval(updateRect, 400);

    // DOM Mutation observer to catch dynamically rendered elements
    observerRef.current = new MutationObserver(updateRect);
    observerRef.current.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearInterval(interval);
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [isActive, isPaused, currentMission]);

  // Handle clicking on target directly to progress tutorial
  useEffect(() => {
    if (!isActive || isPaused) return;

    const handleGlobalClick = (e: MouseEvent) => {
      const targetEl = document.querySelector(`[data-tutorial="${currentMission.targetId}"]`);
      if (targetEl && (targetEl === e.target || targetEl.contains(e.target as Node))) {
        // User clicked the actual target element! Automatically complete current mission step after slight delay
        setTimeout(() => {
          completeCurrentMission();
        }, 500);
      }
    };

    window.addEventListener('click', handleGlobalClick, true);
    return () => {
      window.removeEventListener('click', handleGlobalClick, true);
    };
  }, [isActive, isPaused, currentMission, completeCurrentMission]);

  if (!isActive || isPaused) return null;

  const missionTitle =
    language === 'hi' ? currentMission.titleHi : language === 'te' ? currentMission.titleTe : currentMission.titleEn;
  const saathiText =
    language === 'hi' ? currentMission.saathiHi : language === 'te' ? currentMission.saathiTe : currentMission.saathiEn;

  // Calculate tooltip placement (above or below target)
  const pad = 8;
  const targetTop = targetRect ? targetRect.top - pad : windowSize.height / 2 - 100;
  const targetLeft = targetRect ? targetRect.left - pad : windowSize.width / 2 - 200;
  const targetWidth = targetRect ? targetRect.width + pad * 2 : 400;
  const targetHeight = targetRect ? targetRect.height + pad * 2 : 200;

  // Decision: if target is in bottom half of screen, put Saathi above target. Otherwise, below target.
  const isNearBottom = targetRect ? targetRect.top > windowSize.height * 0.45 : false;
  const tooltipWidth = Math.min(windowSize.width - 32, 440);

  let tooltipTop = 0;
  let tooltipLeft = Math.max(16, Math.min(windowSize.width - tooltipWidth - 16, (targetRect ? targetRect.left + targetRect.width / 2 : windowSize.width / 2) - tooltipWidth / 2));

  if (targetRect) {
    if (isNearBottom) {
      tooltipTop = Math.max(80, targetRect.top - 240);
    } else {
      tooltipTop = Math.min(windowSize.height - 240, targetRect.bottom + 16);
    }
  } else {
    // Fallback if target not in DOM yet
    tooltipTop = windowSize.height / 2 - 120;
    tooltipLeft = (windowSize.width - tooltipWidth) / 2;
  }

  const handleSpeak = () => {
    setIsSpeaking(true);
    listenCurrentMission();
    setTimeout(() => setIsSpeaking(false), 4500);
  };

  return (
    <div className="fixed inset-0 z-[9990] pointer-events-none transition-all duration-300">
      {/* SVG Mask Spotlight cutout */}
      <svg className="w-full h-full absolute inset-0 pointer-events-auto" style={{ fillRule: 'evenodd' }}>
        <defs>
          <mask id="tutorial-spotlight-mask">
            {/* White area is opaque (blocks outside) */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black hole reveals the target component beneath and allows clicking */}
            {targetRect && (
              <rect
                x={targetLeft}
                y={targetTop}
                width={targetWidth}
                height={targetHeight}
                rx="14"
                ry="14"
                fill="black"
              />
            )}
          </mask>
        </defs>

        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.72)"
          mask="url(#tutorial-spotlight-mask)"
        />
      </svg>

      {/* Target Focus Ring & Pulse */}
      {targetRect && (
        <div
          className="absolute rounded-2xl pointer-events-none border-2 border-amber-400 ring-4 ring-amber-400/40 animate-pulse shadow-[0_0_35px_rgba(245,158,11,0.5)] transition-all duration-300"
          style={{
            top: `${targetTop}px`,
            left: `${targetLeft}px`,
            width: `${targetWidth}px`,
            height: `${targetHeight}px`,
          }}
        >
          {/* Subtle bouncing hand indicator pointing to target */}
          <div
            className={`absolute ${
              isNearBottom ? 'bottom-[-36px] left-1/2 -translate-x-1/2' : 'top-[-36px] left-1/2 -translate-x-1/2'
            } flex items-center gap-1.5 bg-amber-500 text-white font-black text-xs px-3 py-1 rounded-full shadow-lg border border-amber-300 animate-bounce whitespace-nowrap`}
          >
            <span>👉</span>
            <span>{language === 'hi' ? 'यहाँ टैप करें' : language === 'te' ? 'ఇక్కడ నొక్కండి' : 'Tap here'}</span>
          </div>
        </div>
      )}

      {/* Artisan Saathi Guidance Card */}
      <div
        className="absolute pointer-events-auto transition-all duration-300 ease-out"
        style={{
          top: `${tooltipTop}px`,
          left: `${tooltipLeft}px`,
          width: `${tooltipWidth}px`,
        }}
      >
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-amber-400 p-5 relative overflow-hidden ring-1 ring-slate-900/10">
          {/* Top Decorative Banner */}
          <div className="flex items-center justify-between pb-3 border-b border-amber-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 text-white flex items-center justify-center text-lg shadow-md ring-2 ring-amber-200">
                🤝
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {language === 'hi' ? 'कला साथी' : language === 'te' ? 'కళా సాథీ' : 'Artisan Saathi'}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">
                    {currentLevel} / 8
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mt-0.5">{missionTitle}</h4>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleSpeak}
                className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                  isSpeaking
                    ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                }`}
                title="Read aloud"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">{language === 'hi' ? 'सुनें' : language === 'te' ? 'వినండి' : 'Listen'}</span>
              </button>

              <button
                onClick={pauseJourney}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                title="Pause Tutorial"
              >
                <Pause className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={skipJourney}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                title="Exit Tutorial"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Saathi Speech Bubble */}
          <div className="py-3">
            <p className="text-slate-800 text-sm font-medium leading-relaxed">
              {saathiText}
            </p>
          </div>

          {/* Bottom Action Row */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div className="flex items-center gap-1">
              {currentLevel > 1 && (
                <button
                  onClick={prevLevel}
                  className="px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft className="w-3 h-3" />
                  {language === 'hi' ? 'पिछला' : language === 'te' ? 'మునుపటి' : 'Back'}
                </button>
              )}
              <span className="text-[11px] text-amber-800 font-bold bg-amber-50 px-2 py-1 rounded-md border border-amber-200/60">
                +{currentMission.points} Pts
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={completeCurrentMission}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all transform active:scale-95"
              >
                <span>{language === 'hi' ? 'समझ गया / अगला' : language === 'te' ? 'అర్థమైంది / తరువాత' : 'Got It / Next'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
