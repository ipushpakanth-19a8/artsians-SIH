import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Square, Play, Pause, RefreshCw, Sparkles, CheckCircle2, Globe } from 'lucide-react';
import { LanguageCode, SUPPORTED_LANGUAGES } from '../../types';

interface AudioVoiceNoteRecorderProps {
  onTranscriptionComplete: (data: {
    transcript: string;
    detectedLanguage: string;
    englishSummary?: string;
    keywords?: string[];
  }) => void;
  defaultLanguage?: LanguageCode;
}

export const AudioVoiceNoteRecorder: React.FC<AudioVoiceNoteRecorderProps> = ({
  onTranscriptionComplete,
  defaultLanguage = 'hi',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(defaultLanguage);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [audioUrl]);

  // Start Hardware Voice Note Recording
  const startRecording = async () => {
    setErrorMessage(null);
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Determine supported mimeType
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/ogg';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      recorder.start(250); // collect in 250ms chunks
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access error:', err);
      setErrorMessage(
        err.name === 'NotAllowedError'
          ? 'Microphone permission was denied. Please grant permission in browser settings.'
          : 'Could not access microphone hardware. Please check your audio inputs.'
      );
      setIsRecording(false);
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
  };

  // Audio Playback Preview
  const togglePreview = () => {
    if (!audioUrl) return;

    if (!audioElementRef.current) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlayingPreview(false);
      audioElementRef.current = audio;
    }

    if (isPlayingPreview) {
      audioElementRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioElementRef.current.play();
      setIsPlayingPreview(true);
    }
  };

  // Transcribe Recorded Voice Note via Backend
  const submitTranscription = async () => {
    if (!audioBlob) return;
    setIsTranscribing(true);
    setErrorMessage(null);

    try {
      // Convert Blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(audioBlob);
      const audioBase64 = await base64Promise;

      const res = await fetch('/api/v1/audio/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio_data: audioBase64,
          mime_type: audioBlob.type || 'audio/webm',
          language_hint: selectedLanguage,
        }),
      });

      const data = await res.json();
      if (res.ok && data.transcript) {
        onTranscriptionComplete({
          transcript: data.transcript,
          detectedLanguage: data.detected_language || selectedLanguage,
          englishSummary: data.english_summary,
          keywords: data.keywords,
        });
      } else {
        setErrorMessage(data.error || 'Speech transcription failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Transcription error:', err);
      setErrorMessage('Network error communicating with speech recognition pipeline.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  return (
    <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
            <Mic className="w-4 h-4 text-amber-600" />
            <span>Multilingual Voice Note Studio</span>
          </h4>
          <p className="text-stone-500 text-xs mt-0.5">
            Artisans can record in any regional tongue; AI will transcribe and generate multi-language catalogs.
          </p>
        </div>

        {/* Configurable Regional Language Selector */}
        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-stone-300 shadow-sm shrink-0">
          <Globe className="w-3.5 h-3.5 text-stone-500" />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as LanguageCode)}
            className="text-xs font-bold text-stone-800 bg-transparent border-none focus:outline-none cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.native} ({lang.label})
              </option>
            ))}
          </select>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 mb-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium">
          {errorMessage}
        </div>
      )}

      {/* Recording Status & Controls */}
      <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isRecording ? (
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 animate-ping absolute" />
              <button
                type="button"
                onClick={stopRecording}
                className="w-12 h-12 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center relative z-10 transition-colors shadow-md"
                title="Stop Recording"
              >
                <Square className="w-5 h-5 fill-current" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={startRecording}
              className="w-12 h-12 rounded-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center transition-colors shadow-md"
              title="Record Voice Note"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-900">
                {isRecording
                  ? 'Recording voice note...'
                  : audioBlob
                  ? 'Voice note ready'
                  : 'Tap microphone to speak'}
              </span>
              {isRecording && (
                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-[10px] font-black animate-pulse">
                  REC {formatDuration(recordingDuration)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-500">
              {isRecording
                ? 'Speak naturally about the weave, raw materials, or craft history'
                : 'Supports Hindi, Telugu, Tamil, Bengali, Marathi, and 7+ regional languages'}
            </p>
          </div>
        </div>

        {/* Audio Review and Transcription Button */}
        {audioBlob && !isRecording && (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={togglePreview}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              {isPlayingPreview ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlayingPreview ? 'Pause' : 'Listen'}</span>
            </button>

            <button
              type="button"
              onClick={submitTranscription}
              disabled={isTranscribing}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:opacity-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              {isTranscribing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Transcribing with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Transcribe & Auto-Catalog</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
