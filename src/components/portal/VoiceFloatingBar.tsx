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
      <div className="bg-[#29221D]/95 text-[#FFFDF8] rounded-2xl p-3 sm:p-3.5 shadow-2xl border border-[#A8462D]/40 backdrop-blur-md flex items-center justify-between gap-2.5">
        {/* Animated Waveform & Status */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-[#A8462D]/20 border border-[#A8462D]/40 flex items-center justify-center text-[#C88732] shrink-0">
            <Volume2 className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold text-[#E8DFC9] truncate">
                {isPaused ? 'Paused' : t.voicePlaying}
              </span>
              {isPlaying && !isPaused && (
                <div className="flex items-end gap-0.5 h-4 ml-1">
                  <span className="w-1 bg-[#C88732] rounded-full animate-wave-1" />
                  <span className="w-1 bg-[#C88732] rounded-full animate-wave-2" />
                  <span className="w-1 bg-[#C88732] rounded-full animate-wave-3" />
                  <span className="w-1 bg-[#C88732] rounded-full animate-wave-4" />
                  <span className="w-1 bg-[#C88732] rounded-full animate-wave-5" />
                </div>
              )}
            </div>
            {currentLabel && (
              <span className="text-[11px] text-[#BFB09A] truncate font-medium">
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
              className="p-2 rounded-xl bg-[#3D3530] hover:bg-[#4d433d] text-[#FFFDF8] border border-[#5A4E47] transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
              title={t.voicePause}
            >
              <Pause className="w-4 h-4 text-[#C88732]" />
              <span className="hidden xs:inline">{t.voicePause}</span>
            </button>
          ) : (
            <button
              onClick={onPlay}
              className="p-2 rounded-xl bg-[#A8462D] hover:bg-[#C5614A] text-[#FFFDF8] font-bold transition-all flex items-center gap-1 text-xs cursor-pointer shadow-xs"
              title={t.voicePlay}
            >
              <Play className="w-4 h-4 fill-[#FFFDF8]" />
              <span className="hidden xs:inline">{t.voicePlay}</span>
            </button>
          )}

          <button
            onClick={onReplay}
            className="p-2 rounded-xl bg-[#3D3530] hover:bg-[#4d433d] text-[#BFB09A] hover:text-[#FFFDF8] border border-[#5A4E47] transition-all cursor-pointer"
            title={t.voiceReplay}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onStop}
            className="p-2 rounded-xl bg-[#3D3530]/80 hover:bg-[#7A3220] text-[#BFB09A] hover:text-[#FFFDF8] border border-[#5A4E47] transition-all cursor-pointer"
            title={t.voiceStop}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
