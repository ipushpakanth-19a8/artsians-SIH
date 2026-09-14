import React from 'react';
import { Mic, Volume2, Square, Sparkles } from 'lucide-react';
import { LanguageCode } from '../../types';

interface VoiceAssistBannerProps {
  language: LanguageCode;
  isListening: boolean;
  isSpeaking: boolean;
  activeFieldKey: string | null;
  statusMessage: string;
  transcript: string;
  onStop: () => void;
}

export const VoiceAssistBanner: React.FC<VoiceAssistBannerProps> = ({
  language,
  isListening,
  isSpeaking,
  statusMessage,
  transcript,
  onStop,
}) => {
  if (!isListening && !isSpeaking && !statusMessage) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border-2 border-amber-400/80 rounded-2xl p-3 sm:p-3.5 mb-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Pulsing indicator */}
          <div className="relative shrink-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md transition-colors ${
                isListening
                  ? 'bg-red-500 animate-pulse ring-4 ring-red-300/60'
                  : isSpeaking
                  ? 'bg-amber-600 animate-bounce'
                  : 'bg-amber-600'
              }`}
            >
              {isListening ? (
                <Mic className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </div>
            {isListening && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md">
                {isListening
                  ? language === 'hi'
                    ? '🎙️ सुन रहे हैं... (बोलिए)'
                    : language === 'te'
                    ? '🎙️ వింటున్నాము... (చెప్పండి)'
                    : '🎙️ Listening... (Speak Now)'
                  : isSpeaking
                  ? language === 'hi'
                    ? '🔊 सहायक बोल रहा है...'
                    : language === 'te'
                    ? '🔊 అసిస్టెంట్ మాట్లాడుతోంది...'
                    : '🔊 Assistant Speaking...'
                  : '✨ Voice Assist'}
              </span>
            </div>

            <p className="text-xs sm:text-sm font-extrabold text-stone-900 mt-1 truncate">
              {statusMessage}
            </p>

            {transcript && (
              <p className="text-[11px] sm:text-xs font-semibold text-stone-600 mt-0.5 italic truncate bg-white/70 px-2 py-0.5 rounded border border-amber-200">
                "{transcript}"
              </p>
            )}
          </div>
        </div>

        {/* Stop button */}
        <button
          type="button"
          onClick={onStop}
          className="shrink-0 px-2.5 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:text-red-700 hover:border-red-300 transition-all cursor-pointer"
          title="Stop Voice Assistant"
        >
          <Square className="w-3 h-3 fill-current text-red-600" />
          <span>{language === 'hi' ? 'रोकें' : language === 'te' ? 'ఆపు' : 'Stop'}</span>
        </button>
      </div>

      {/* Real-time audio waveform animation simulation */}
      {isListening && (
        <div className="flex items-center justify-center gap-1 mt-2 pt-2 border-t border-amber-200/60">
          <span className="w-1 h-3 bg-red-500 rounded-full animate-pulse [animation-delay:0ms]"></span>
          <span className="w-1 h-5 bg-red-500 rounded-full animate-pulse [animation-delay:150ms]"></span>
          <span className="w-1 h-2 bg-red-500 rounded-full animate-pulse [animation-delay:75ms]"></span>
          <span className="w-1 h-6 bg-red-600 rounded-full animate-pulse [animation-delay:225ms]"></span>
          <span className="w-1 h-3 bg-red-500 rounded-full animate-pulse [animation-delay:300ms]"></span>
          <span className="w-1 h-4 bg-red-500 rounded-full animate-pulse [animation-delay:180ms]"></span>
          <span className="text-[10px] font-bold text-red-700 ml-1.5">
            {language === 'hi' ? 'माइक चालू है' : language === 'te' ? 'మైక్ ఆన్ ఉంది' : 'Mic Active'}
          </span>
        </div>
      )}
    </div>
  );
};
