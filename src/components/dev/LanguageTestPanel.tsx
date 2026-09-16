import React, { useState, useEffect, useRef } from 'react';
import { Mic, Volume2, Globe, CheckCircle, AlertTriangle, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { 
  SUPPORTED_LANGUAGE_CONFIGS, 
  getLanguageConfig, 
  getRecognitionLocale, 
  getSpeechLocale 
} from '../../config/languages';
import { getVoicePrompts } from '../../config/voicePrompts';
import { translations } from '../../lib/i18n';

export const LanguageTestPanel: React.FC = () => {
  if (!(import.meta as any).env?.DEV) return null;

  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const recognitionRef = useRef<any>(null);

  const activeConfig = getLanguageConfig(language);
  const recognitionLocale = getRecognitionLocale(language);
  const speechLocale = getSpeechLocale(language);

  // Load voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      setAvailableVoices(window.speechSynthesis.getVoices());
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Find matching voice for speechLocale
  const matchedVoice = availableVoices.find(
    (v) =>
      v.lang.toLowerCase() === speechLocale.toLowerCase() ||
      v.lang.toLowerCase().replace('_', '-').startsWith(language)
  );

  // Test Speech Synthesis
  const handleTestTTS = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setStatusMessage('SpeechSynthesis is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    const prompts = getVoicePrompts(language);
    const textToSpeak = prompts.welcomeLanguage(activeConfig.nativeName) || prompts.welcomeState;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = speechLocale;
    if (matchedVoice) utterance.voice = matchedVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setStatusMessage(`🔊 Speaking (${speechLocale}): "${textToSpeak}"`);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setStatusMessage('✓ Speech finished');
    };

    utterance.onerror = (e) => {
      setIsSpeaking(false);
      setStatusMessage(`Speech error: ${e.error}`);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Test Speech Recognition
  const handleTestSTT = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatusMessage('SpeechRecognition is not supported in this browser (Use Chrome or Edge).');
      return;
    }

    if (isListening) {
      recognitionRef.current?.abort();
      setIsListening(false);
      setStatusMessage('Recognition stopped');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = recognitionLocale;

      recognition.onstart = () => {
        setIsListening(true);
        setStatusMessage(`🎙️ Listening in ${activeConfig.nativeName} (${recognitionLocale})...`);
      };

      recognition.onresult = (event: any) => {
        const text = event.results?.[0]?.[0]?.transcript || '';
        setTranscript(text);
        if (event.results?.[0]?.isFinal) {
          setStatusMessage(`✓ Recognized: "${text}"`);
        }
      };

      recognition.onerror = (e: any) => {
        setIsListening(false);
        setStatusMessage(`Recognition error: ${e?.error || 'Unknown'}`);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsListening(false);
      setStatusMessage(`Could not start recognition: ${err}`);
    }
  };

  const isSTTSupported = typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans text-xs shadow-2xl rounded-2xl overflow-hidden border border-stone-700 bg-stone-900 text-stone-100 max-w-sm w-full transition-all">
      {/* Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2.5 bg-stone-800 hover:bg-stone-750 flex items-center justify-between cursor-pointer select-none border-b border-stone-700"
      >
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-amber-300">Multilingual Voice Test Panel</span>
          <span className="bg-amber-900/60 text-amber-300 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
            {language}
          </span>
        </div>
        <button className="text-stone-400 hover:text-white p-0.5">
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="p-4 space-y-3 max-h-[80vh] overflow-y-auto">
          {/* Language Switcher */}
          <div>
            <label className="block text-[11px] text-stone-400 mb-1 font-medium">Select Active Language</label>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value as any);
                setTranscript('');
                setStatusMessage(`Switched to ${e.target.value}`);
              }}
              className="w-full bg-stone-800 border border-stone-600 rounded-lg px-2.5 py-1.5 text-stone-100 focus:outline-none focus:border-amber-400 text-xs"
            >
              {Object.values(SUPPORTED_LANGUAGE_CONFIGS).map((cfg) => (
                <option key={cfg.id} value={cfg.id}>
                  {cfg.nativeName} ({cfg.englishName}) - [{cfg.recognitionLocale}]
                </option>
              ))}
            </select>
          </div>

          {/* Diagnostic Info Table */}
          <div className="bg-stone-950/70 rounded-lg p-2.5 space-y-1.5 border border-stone-800 text-[11px]">
            <div className="flex justify-between">
              <span className="text-stone-400">Current Language:</span>
              <span className="font-mono text-amber-300 font-semibold">{activeConfig.nativeName} ({language})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Recognition Locale:</span>
              <span className="font-mono text-amber-400 font-semibold">{recognitionLocale}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Speech Locale:</span>
              <span className="font-mono text-emerald-400 font-semibold">{speechLocale}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Translation Completeness:</span>
              <span className="text-emerald-400 font-semibold">
                {Object.keys(translations[language] || {}).length} / {Object.keys(translations.en || {}).length} keys ({Math.round((Object.keys(translations[language] || {}).length / Math.max(1, Object.keys(translations.en || {}).length)) * 100)}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Speech Recognition:</span>
              <span className={`font-semibold ${isSTTSupported ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isSTTSupported ? 'Available' : 'Unavailable'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-400">TTS Voice:</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded truncate max-w-[170px] ${
                matchedVoice ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
              }`}>
                {matchedVoice ? `Found (${matchedVoice.name})` : 'Not Found (Browser Fallback)'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleTestTTS}
              disabled={isSpeaking}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-medium transition-colors ${
                isSpeaking 
                  ? 'bg-amber-600 text-white animate-pulse' 
                  : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-800/60'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isSpeaking ? 'Speaking...' : 'Test TTS Voice'}</span>
            </button>

            <button
              onClick={handleTestSTT}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-medium transition-colors ${
                isListening 
                  ? 'bg-red-600 text-white animate-pulse' 
                  : 'bg-stone-800 hover:bg-stone-700 text-emerald-300 border border-emerald-800/60'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{isListening ? 'Stop Mic' : 'Test STT Mic'}</span>
            </button>
          </div>

          {/* Live Transcript Box */}
          {transcript && (
            <div className="bg-stone-800/80 p-2.5 rounded-lg border border-stone-700">
              <div className="text-[10px] text-stone-400 mb-1">Transcript Received:</div>
              <div className="text-stone-100 font-medium break-words">{transcript}</div>
            </div>
          )}

          {/* Status Message */}
          {statusMessage && (
            <div className="text-[11px] text-stone-300 bg-stone-950/40 p-2 rounded border border-stone-800">
              {statusMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
