import React from 'react';
import { Volume2, Play, Pause, RotateCcw, X, Sparkles } from 'lucide-react';
import { LanguageCode } from '../../types';
import { PORTAL_TRANSLATIONS } from '../../lib/portalI18n';

interface VoiceFloatingBarProps {
  language: LanguageCode;
  isPlaying: boolean;
  isPaused: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReplay: () => void;
  onStop: () => void;
  currentLabel?: string;
}

export const VoiceFloatingBar: React.FC<VoiceFloatingBarProps> = ({
  language,
  isPlaying,
  isPaused,
  onPlay,
  onPause,
  onReplay,
  onStop,
  currentLabel,
}) => {
  const t = PORTAL_TRANSLATIONS[language];

  if (!isPlaying && !isPaused) return null;

  return (
    <aside aria-label="Voice instructions player" className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-stone-950/95 text-stone-100 rounded-2xl p-3 sm:p-3.5 shadow-2xl border-2 border-amber-500/50 backdrop-blur-md flex items-center justify-between gap-2.5">
        {/* Animated Waveform & Status */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Volume2 className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold text-amber-300 truncate">
                {isPaused ? 'Paused' : t.voicePlaying}
              </span>
              {isPlaying && !isPaused && (
                <div className="flex items-end gap-0.5 h-4 ml-1">
                  <span className="w-1 bg-amber-400 rounded-full animate-wave-1" />
                  <span className="w-1 bg-amber-400 rounded-full animate-wave-2" />
                  <span className="w-1 bg-amber-400 rounded-full animate-wave-3" />
                  <span className="w-1 bg-amber-400 rounded-full animate-wave-4" />
                  <span className="w-1 bg-amber-400 rounded-full animate-wave-5" />
                </div>
              )}
            </div>
            {currentLabel && (
              <span className="text-[11px] text-stone-300 truncate font-medium">
                {currentLabel}
              </span>
            )}
          </div>
        </div>

        {/* Playback Controls: Play/Pause, Replay, Stop */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isPlaying && !isPaused ? (
            <button
              onClick={onPause}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-all flex items-center gap-1 text-xs font-bold"
              title={t.voicePause}
            >
              <Pause className="w-4 h-4 text-amber-400" />
              <span className="hidden xs:inline">{t.voicePause}</span>
            </button>
          ) : (
            <button
              onClick={onPlay}
              className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition-all flex items-center gap-1 text-xs"
              title={t.voicePlay}
            >
              <Play className="w-4 h-4 fill-stone-950" />
              <span className="hidden xs:inline">{t.voicePlay}</span>
            </button>
          )}

          <button
            onClick={onReplay}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-all"
            title={t.voiceReplay}
          >
            <RotateCcw className="w-4 h-4 text-stone-300" />
          </button>

          <button
            onClick={onStop}
            className="p-2 rounded-xl bg-stone-800/80 hover:bg-rose-900/60 text-stone-400 hover:text-rose-200 border border-stone-700 transition-all"
            title={t.voiceStop}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
