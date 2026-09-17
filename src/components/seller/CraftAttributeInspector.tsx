import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Volume2,
  Mic,
  MicOff,
  CheckCircle2,
  AlertCircle,
  Edit3,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  ShieldCheck,
  Eye,
  Sliders,
  Terminal,
  RefreshCw,
} from 'lucide-react';
import { LanguageCode } from '../../types';
import { getRecognitionLocale, getSpeechLocale } from '../../config/languages';
import { speakText, stopSpeaking } from '../../lib/i18n';
import {
  getCraftAttributeLabels,
  CraftLabelSet,
} from '../../lib/craftAttributeLabels';

export interface CraftAttributes {
  craftCategory: string | null;
  craftName: string | null;
  productType: string | null;
  material: string | null;
  technique: string | null;
  motif: string | null;
  colors: string[];
  region: string | null;
  description: string | null;
  culturalContext: string | null;
  visualFeatures: string[];
  confidence: number;
  uncertainAttributes: string[];
}

export interface AIDebugInfo {
  provider: 'Gemini' | 'Demo Heuristic';
  model: string;
  imageReceived: boolean;
  imageMime: string;
  imageDimensions?: { width: number; height: number };
  imageSizeBytes?: number;
  selectedLanguage: LanguageCode;
  locale: string;
  rawResponseStatus: 'success' | 'fallback' | 'error';
  structuredValidation: 'passed' | 'failed';
  confidenceScore: number;
  uncertainCount: number;
  translationStatus: 'success' | 'fallback' | 'passthrough';
  voiceSupported: boolean;
  lastCorrectionApplied?: {
    field: string;
    original: string;
    corrected: string;
    timestamp: string;
  };
  latencyMs: number;
}

export interface CraftInspectionResult {
  success: boolean;
  language: LanguageCode;
  locale: string;
  canonicalAttributes: CraftAttributes;
  localizedAttributes: CraftAttributes;
  confidence: number;
  uncertainAttributes: string[];
  aiProvider: 'gemini' | 'demo-heuristic';
  modelUsed: string;
  isFallback: boolean;
  notice?: string;
  debug: AIDebugInfo;
}

interface CraftAttributeInspectorProps {
  inspectionResult: CraftInspectionResult;
  imageUrl: string;
  language: LanguageCode;
  onConfirm: (canonical: CraftAttributes, localized: CraftAttributes) => void;
  onRetake: () => void;
}

export type VoiceState =
  | 'idle'
  | 'speaking'
  | 'awaitingConfirmation'
  | 'listening'
  | 'processing'
  | 'correction'
  | 'confirmed'
  | 'error';

interface CorrectionPending {
  field: keyof CraftAttributes;
  originalCanonical: string;
  originalLocalized: string;
  correctedCanonical: string;
  correctedLocalized: string;
}

export const CraftAttributeInspector: React.FC<CraftAttributeInspectorProps> = ({
  inspectionResult,
  imageUrl,
  language,
  onConfirm,
  onRetake,
}) => {
  const labels: CraftLabelSet = getCraftAttributeLabels(language);
  const recognitionLocale = getRecognitionLocale(language);

  // Attributes state (canonical for DB, localized for display)
  const [canonical, setCanonical] = useState<CraftAttributes>(
    inspectionResult.canonicalAttributes
  );
  const [localized, setLocalized] = useState<CraftAttributes>(
    inspectionResult.localizedAttributes
  );

  // 8-State voice assistant state machine
  const [voiceState, setVoiceState] = useState<VoiceState>('speaking');
  const [activeCorrectionField, setActiveCorrectionField] = useState<keyof CraftAttributes | null>(null);
  const [spokenFeedback, setSpokenFeedback] = useState<string>('');
  const [voiceSupported, setVoiceSupported] = useState<boolean>(true);
  const [pendingCorrection, setPendingCorrection] = useState<CorrectionPending | null>(null);

  // Manual editing modal / inline state
  const [editingField, setEditingField] = useState<keyof CraftAttributes | null>(null);
  const [editInputValue, setEditInputValue] = useState<string>('');

  // Debug telemetry panel
  const [showDebugPanel, setShowDebugPanel] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<AIDebugInfo>(inspectionResult.debug);

  const recognitionRef = useRef<any>(null);
  const hasSpokenIntroRef = useRef<boolean>(false);

  // Initialize browser speech recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = recognitionLocale;

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleVoiceInput(transcript);
      };

      rec.onerror = (event: any) => {
        console.warn('Speech recognition event note:', event.error);
        setVoiceState('idle');
      };

      rec.onend = () => {
        if (voiceState === 'listening') {
          setVoiceState('idle');
        }
      };

      recognitionRef.current = rec;
    } catch {
      setVoiceSupported(false);
    }

    return () => {
      stopSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [language, recognitionLocale]);

  // Voice read of detected details on initial load
  const speakDetectedSummary = useCallback(() => {
    const craft = localized.craftName || canonical.craftName || '';
    const mat = localized.material || canonical.material || '';
    const tech = localized.technique || canonical.technique || '';

    let text = '';
    if (language === 'te') {
      text = `నేను ఈ హస్తకళ వివరాలను గుర్తించాను. క్రాఫ్ట్: ${craft}. పదార్థం: ${mat}. తయారీ విధానం: ${tech}. ఈ వివరాలు సరైనవేనా?`;
    } else if (language === 'hi') {
      text = `मैंने ये विवरण पहचाने हैं। शिल्प: ${craft}, सामग्री: ${mat}, तकनीक: ${tech}। क्या ये विवरण सही हैं?`;
    } else if (language === 'ta') {
      text = `நான் இந்த கைவினை விவரங்களைக் கண்டறிந்துள்ளேன். பெயர்: ${craft}, பொருள்: ${mat}. இந்த விவரங்கள் சரியானவையா?`;
    } else {
      text = `I detected these craft details. Craft: ${craft}, Material: ${mat}, Technique: ${tech}. Are these details correct?`;
    }

    setVoiceState('speaking');
    setSpokenFeedback(text);

    speakText(text, language);

    // After finishing speech, transition to awaitingConfirmation
    setTimeout(() => {
      setVoiceState('awaitingConfirmation');
    }, 4500);
  }, [localized, canonical, language]);

  // Read summary once when entering detected screen
  useEffect(() => {
    if (!hasSpokenIntroRef.current) {
      hasSpokenIntroRef.current = true;
      const timer = setTimeout(() => {
        speakDetectedSummary();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [speakDetectedSummary]);

  // Start listening for artisan speech
  const startListening = () => {
    stopSpeaking();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = recognitionLocale;
        recognitionRef.current.start();
        setVoiceState('listening');
        setSpokenFeedback('Listening for your voice...');
      } catch {
        setVoiceState('listening');
      }
    } else {
      setVoiceState('error');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setVoiceState('idle');
  };

  // Process voice transcript from artisan
  const handleVoiceInput = async (transcript: string) => {
    setVoiceState('processing');
    setSpokenFeedback(`"${transcript}"`);

    try {
      const res = await fetch('/api/v1/ai/voice-correct-attribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          language,
          currentAttributes: canonical,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.canonicalValue === 'CONFIRMED') {
          // Artisan confirmed verbally
          setVoiceState('confirmed');
          handleConfirm();
          return;
        }

        if (data.canonicalValue === 'AWAITING_FIELD') {
          // User said "No" / "Wrong"
          setVoiceState('correction');
          setActiveCorrectionField(null);
          const askField =
            language === 'te'
              ? 'మీరు ఏ వివరాలను సవరించాలనుకుంటున్నారు? ఉదాహరణకు: మెటీరియల్, క్రాఫ్ట్ పేరు లేదా రకం.'
              : language === 'hi'
              ? 'आप कौन सा विवरण सुधारना चाहते हैं? जैसे: सामग्री, शिल्प नाम या प्रकार।'
              : language === 'ta'
              ? 'எந்த விவரத்தை மாற்ற விரும்புகிறீர்கள்? பொருள் அல்லது கைவினைப் பெயர்.'
              : 'Which detail would you like to correct? For example: material, craft name, or product type.';
          setSpokenFeedback(askField);
          speakText(askField, language);
          return;
        }

        if (data.canonicalValue === 'AWAITING_VALUE' && data.field) {
          // User stated a specific field to correct
          const targetField = data.field as keyof CraftAttributes;
          setActiveCorrectionField(targetField);
          setVoiceState('correction');
          const askVal =
            language === 'te'
              ? `సరైన ${targetField} ఏమిటి?`
              : language === 'hi'
              ? `सही ${targetField} क्या है?`
              : `What is the correct ${targetField}?`;
          setSpokenFeedback(askVal);
          speakText(askVal, language);
          return;
        }

        if (data.canonicalValue && (data.field || activeCorrectionField)) {
          const targetField = (data.field || activeCorrectionField || 'material') as keyof CraftAttributes;
          const origCan = String(canonical[targetField] || '');
          const origLoc = String(localized[targetField] || '');
          const newCan = String(data.canonicalValue);
          const newLoc = String(data.localizedValue || data.canonicalValue);

          setPendingCorrection({
            field: targetField,
            originalCanonical: origCan,
            originalLocalized: origLoc,
            correctedCanonical: newCan,
            correctedLocalized: newLoc,
          });

          setVoiceState('correction');

          const confirmSpoken =
            language === 'te'
              ? `${targetField} ని ${newLoc} గా మార్చమంటారా?`
              : language === 'hi'
              ? `क्या आप ${targetField} को ${newLoc} करना चाहते हैं?`
              : `Did you mean to update ${targetField} to ${newLoc}?`;

          setSpokenFeedback(confirmSpoken);
          speakText(confirmSpoken, language);
          return;
        }

        setVoiceState('awaitingConfirmation');
      } else {
        setVoiceState('idle');
      }
    } catch {
      setVoiceState('error');
    }
  };

  // Apply the pending correction
  const applyCorrection = () => {
    if (!pendingCorrection) return;

    const { field, correctedCanonical, correctedLocalized, originalCanonical } =
      pendingCorrection;

    setCanonical((prev) => ({
      ...prev,
      [field]: correctedCanonical,
    }));

    setLocalized((prev) => ({
      ...prev,
      [field]: correctedLocalized,
    }));

    setDebugInfo((prev) => ({
      ...prev,
      lastCorrectionApplied: {
        field,
        original: originalCanonical,
        corrected: correctedCanonical,
        timestamp: new Date().toLocaleTimeString(),
      },
    }));

    setPendingCorrection(null);
    setActiveCorrectionField(null);
    setVoiceState('awaitingConfirmation');

    const doneMsg =
      language === 'te'
        ? 'వివరాలు నవీకరించబడ్డాయి. ఈ వివరాలు సరైనవేనా?'
        : language === 'hi'
        ? 'विवरण अपडेट कर दिया गया है। क्या अब सभी विवरण सही हैं?'
        : 'Attribute updated. Are all details correct now?';

    setSpokenFeedback(doneMsg);
    speakText(doneMsg, language);
  };

  // Manual inline edit handlers
  const openManualEdit = (field: keyof CraftAttributes) => {
    setEditingField(field);
    setEditInputValue(String(localized[field] || canonical[field] || ''));
  };

  const saveManualEdit = () => {
    if (!editingField) return;

    const field = editingField;
    const value = editInputValue.trim();

    setLocalized((prev) => ({
      ...prev,
      [field]: value,
    }));

    setCanonical((prev) => ({
      ...prev,
      [field]: value,
    }));

    setDebugInfo((prev) => ({
      ...prev,
      lastCorrectionApplied: {
        field,
        original: String(canonical[field] || ''),
        corrected: value,
        timestamp: new Date().toLocaleTimeString(),
      },
    }));

    setEditingField(null);
  };

  // Final confirmation
  const handleConfirm = () => {
    setVoiceState('confirmed');
    speakText(labels.confirmedSpeech, language);
    onConfirm(canonical, localized);
  };

  const confidencePct = Math.round((canonical.confidence || 0.85) * 100);
  const isHighConfidence = confidencePct >= 80;

  return (
    <div className="space-y-6">
      {/* Top Banner: Confidence & AI Provider Badge */}
      <div className="bg-white rounded-3xl p-5 border border-[#eadfd4] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm ${
              isHighConfidence
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            {confidencePct}%
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-[#262220] font-['Rozha_One',serif]">
                {labels.craftDetailsHeading}
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                  inspectionResult.isFallback
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : 'bg-[#fdf2e9] text-[#9c4124] border-[#f8d7c2]'
                }`}
              >
                {inspectionResult.isFallback ? labels.demoBadge : labels.geminiBadge}
              </span>
            </div>
            <p className="text-xs text-stone-500">
              {isHighConfidence ? labels.highConfidence : labels.needsConfirmation} •{' '}
              {canonical.uncertainAttributes.length > 0
                ? `${canonical.uncertainAttributes.length} details need artisan check`
                : 'All visual attributes clear'}
            </p>
          </div>
        </div>

        {/* Listen / Voice Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={speakDetectedSummary}
            className="artisan-listen-btn cursor-pointer"
            title="Voice read-out"
          >
            <Volume2 className="w-4 h-4" />
            <span>{labels.voiceReadBtn}</span>
          </button>

          {voiceSupported && (
            <button
              type="button"
              onClick={voiceState === 'listening' ? stopListening : startListening}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                voiceState === 'listening'
                  ? 'bg-red-600 text-white animate-pulse shadow-md'
                  : 'bg-[#9c4124] text-white hover:bg-[#83341b]'
              }`}
            >
              {voiceState === 'listening' ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>Listening...</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>{labels.correctWithVoiceBtn}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Spoken voice feedback indicator */}
      {spokenFeedback && (
        <div className="bg-[#fdfbf7] border border-[#eadfd4] rounded-2xl p-3 flex items-center gap-2.5 text-xs text-stone-700 animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-[#9c4124] animate-ping shrink-0" />
          <span className="font-semibold text-[#9c4124]">Assistant:</span>
          <span className="italic">{spokenFeedback}</span>
        </div>
      )}

      {/* Before / After Correction Card (Builds trust) */}
      {pendingCorrection && (
        <div className="bg-amber-50 rounded-3xl p-5 border-2 border-amber-300 shadow-sm space-y-3 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Correction Detected from Voice
            </span>
            <span className="text-[10px] font-bold bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-full">
              Field: {pendingCorrection.field}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-amber-200">
            <div>
              <span className="text-[11px] font-bold text-stone-400 block mb-0.5">
                {labels.aiDetectedLabel}
              </span>
              <p className="text-sm font-semibold text-stone-600 line-through">
                {pendingCorrection.originalLocalized || pendingCorrection.originalCanonical}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-700 block mb-0.5">
                {labels.yourCorrectionLabel}
              </span>
              <p className="text-base font-black text-emerald-950">
                {pendingCorrection.correctedLocalized || pendingCorrection.correctedCanonical}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setPendingCorrection(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={applyCorrection}
              className="px-5 py-2 rounded-xl text-xs font-extrabold text-white bg-emerald-700 hover:bg-emerald-800 shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{labels.useCorrectionBtn}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Photo + Craft Attributes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product Photo & Retake */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-3xl p-3 border border-[#eadfd4] shadow-xs">
            <div className="aspect-4/3 rounded-2xl overflow-hidden bg-stone-100 relative">
              <img
                src={imageUrl}
                alt="Captured Craft"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[11px] p-2 rounded-xl text-center">
                📷 {labels.photoGuidance}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onRetake}
                className="w-full py-2 rounded-xl text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{labels.retakePhotoBtn}</span>
              </button>
            </div>
          </div>

          {/* Anti-Hallucination Authenticity Notice */}
          <div className="bg-amber-50/60 rounded-2xl p-3.5 border border-amber-200/80 text-[11px] text-amber-950 space-y-1">
            <div className="font-extrabold flex items-center gap-1.5 text-amber-900">
              <ShieldCheck className="w-3.5 h-3.5 text-[#9c4124]" />
              <span>Authenticity & GI Protection</span>
            </div>
            <p className="text-stone-600 leading-relaxed">{labels.uncertainAlert}</p>
          </div>
        </div>

        {/* Right Column: Detected Attributes Grid with Manual Edit ✏️ */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-[#eadfd4] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#eadfd4]">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-[#9c4124] tracking-wider">
                Language: {language.toUpperCase()} ({recognitionLocale})
              </span>
              <h4 className="text-lg font-black text-[#262220] font-['Rozha_One',serif]">
                {localized.craftName || canonical.craftName || 'Artisan Handicraft'}
              </h4>
            </div>
            <span className="text-xs font-bold text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
              {localized.productType || canonical.productType || 'Handmade Craft'}
            </span>
          </div>

          {/* 6 Core Craft Attribute Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Craft Category */}
            <div className="p-3.5 rounded-2xl bg-[#faf7f2] border border-[#eadfd4] flex items-start justify-between group">
              <div>
                <span className="text-[10px] font-extrabold text-[#9c4124] uppercase block mb-0.5">
                  {labels.category}
                </span>
                <p className="text-sm font-bold text-[#262220]">
                  {localized.craftCategory || canonical.craftCategory || 'Handicraft'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openManualEdit('craftCategory')}
                className="opacity-60 group-hover:opacity-100 text-stone-400 hover:text-[#9c4124] p-1 cursor-pointer transition-opacity"
                title="Edit Category"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 2. Craft Name */}
            <div className="p-3.5 rounded-2xl bg-[#faf7f2] border border-[#eadfd4] flex items-start justify-between group">
              <div>
                <span className="text-[10px] font-extrabold text-[#9c4124] uppercase block mb-0.5">
                  {labels.craftName}
                </span>
                <p className="text-sm font-bold text-[#262220]">
                  {localized.craftName || canonical.craftName || 'Traditional Craft'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openManualEdit('craftName')}
                className="opacity-60 group-hover:opacity-100 text-stone-400 hover:text-[#9c4124] p-1 cursor-pointer transition-opacity"
                title="Edit Craft Name"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3. Primary Material */}
            <div className="p-3.5 rounded-2xl bg-[#faf7f2] border border-[#eadfd4] flex items-start justify-between group">
              <div>
                <span className="text-[10px] font-extrabold text-[#9c4124] uppercase block mb-0.5">
                  {labels.material}
                </span>
                <p className="text-sm font-bold text-[#262220]">
                  {localized.material || canonical.material || 'Natural Craft Materials'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openManualEdit('material')}
                className="opacity-60 group-hover:opacity-100 text-stone-400 hover:text-[#9c4124] p-1 cursor-pointer transition-opacity"
                title="Edit Material"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 4. Craft Technique */}
            <div className="p-3.5 rounded-2xl bg-[#faf7f2] border border-[#eadfd4] flex items-start justify-between group">
              <div>
                <span className="text-[10px] font-extrabold text-[#9c4124] uppercase block mb-0.5">
                  {labels.technique}
                </span>
                <p className="text-sm font-bold text-[#262220]">
                  {localized.technique || canonical.technique || 'Handmade Technique'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openManualEdit('technique')}
                className="opacity-60 group-hover:opacity-100 text-stone-400 hover:text-[#9c4124] p-1 cursor-pointer transition-opacity"
                title="Edit Technique"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 5. Motif / Design */}
            <div className="p-3.5 rounded-2xl bg-[#faf7f2] border border-[#eadfd4] flex items-start justify-between group">
              <div>
                <span className="text-[10px] font-extrabold text-[#9c4124] uppercase block mb-0.5">
                  {labels.motif}
                </span>
                <p className="text-sm font-bold text-[#262220]">
                  {localized.motif || canonical.motif || 'Traditional Heritage Patterns'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openManualEdit('motif')}
                className="opacity-60 group-hover:opacity-100 text-stone-400 hover:text-[#9c4124] p-1 cursor-pointer transition-opacity"
                title="Edit Motif"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 6. Region */}
            <div className="p-3.5 rounded-2xl bg-[#faf7f2] border border-[#eadfd4] flex items-start justify-between group">
              <div>
                <span className="text-[10px] font-extrabold text-[#9c4124] uppercase block mb-0.5">
                  {labels.region}
                </span>
                <p className="text-sm font-bold text-[#262220]">
                  {localized.region || canonical.region || 'India'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openManualEdit('region')}
                className="opacity-60 group-hover:opacity-100 text-stone-400 hover:text-[#9c4124] p-1 cursor-pointer transition-opacity"
                title="Edit Region"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Colors Tag List */}
          <div className="p-3.5 rounded-2xl bg-[#faf7f2] border border-[#eadfd4]">
            <span className="text-[10px] font-extrabold text-[#9c4124] uppercase block mb-1.5">
              {labels.colors}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(localized.colors && localized.colors.length ? localized.colors : canonical.colors).map(
                (c, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-white text-stone-800 rounded-lg text-xs font-bold border border-stone-200 shadow-2xs"
                  >
                    {c}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Description & Story */}
          <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#eadfd4] space-y-1.5 relative group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-[#9c4124] uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#c85a32]" />
                {labels.description}
              </span>
              <button
                type="button"
                onClick={() => openManualEdit('description')}
                className="text-stone-400 hover:text-[#9c4124] p-1 cursor-pointer"
                title="Edit Description"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              {localized.description || canonical.description}
            </p>
          </div>

          {/* Bottom Confirmation Action Buttons */}
          <div className="pt-4 border-t border-[#eadfd4] flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onRetake}
              className="text-xs font-bold text-stone-600 hover:text-stone-900 cursor-pointer self-start sm:self-auto"
            >
              ← {labels.retakePhotoBtn}
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => openManualEdit('craftName')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 cursor-pointer"
              >
                {labels.editManuallyBtn}
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 sm:flex-initial artisan-btn-primary cursor-pointer flex items-center justify-center gap-2 px-6 py-2.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{labels.confirmDetailsBtn}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Edit Inline Dialog / Modal */}
      {editingField && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#eadfd4] shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="text-base font-black text-[#262220]">
                {labels.manualEditTitle}: {editingField}
              </h4>
              <button
                type="button"
                onClick={() => setEditingField(null)}
                className="text-stone-400 hover:text-stone-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#9c4124] uppercase mb-1">
                Value ({language.toUpperCase()})
              </label>
              {editingField === 'description' ? (
                <textarea
                  rows={4}
                  value={editInputValue}
                  onChange={(e) => setEditInputValue(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-300 text-sm font-medium text-stone-900 focus:ring-2 focus:ring-[#9c4124] focus:outline-none"
                />
              ) : (
                <input
                  type="text"
                  value={editInputValue}
                  onChange={(e) => setEditInputValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 focus:ring-2 focus:ring-[#9c4124] focus:outline-none"
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingField(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 cursor-pointer"
              >
                {labels.cancelBtn}
              </button>
              <button
                type="button"
                onClick={saveManualEdit}
                className="px-5 py-2 rounded-xl text-xs font-extrabold text-white bg-[#9c4124] hover:bg-[#83341b] cursor-pointer"
              >
                {labels.saveFieldBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEV-ONLY AI DEBUG TELEMETRY PANEL */}
      <div className="bg-stone-900 text-stone-200 rounded-2xl border border-stone-700 overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setShowDebugPanel(!showDebugPanel)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-mono font-bold bg-stone-800/80 hover:bg-stone-800 text-stone-300 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>🛠️ DEV AI Craft Inspection Telemetry ({debugInfo.provider} / {debugInfo.model})</span>
          </div>
          {showDebugPanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showDebugPanel && (
          <div className="p-4 text-[11px] font-mono space-y-3 bg-stone-950/90 text-stone-300 border-t border-stone-800">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-stone-500 block">AI Provider:</span>
                <span className="font-bold text-emerald-400">{debugInfo.provider}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Model:</span>
                <span className="text-amber-300">{debugInfo.model}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Image Received:</span>
                <span className="text-emerald-400">Yes ({debugInfo.imageMime})</span>
              </div>
              <div>
                <span className="text-stone-500 block">Image Size:</span>
                <span>{debugInfo.imageSizeBytes ? `${Math.round(debugInfo.imageSizeBytes / 1024)} KB` : 'N/A'}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Selected Language:</span>
                <span className="text-amber-300">{debugInfo.selectedLanguage} ({debugInfo.locale})</span>
              </div>
              <div>
                <span className="text-stone-500 block">Raw Status:</span>
                <span className={debugInfo.rawResponseStatus === 'success' ? 'text-emerald-400' : 'text-amber-400'}>
                  {debugInfo.rawResponseStatus}
                </span>
              </div>
              <div>
                <span className="text-stone-500 block">Structured Validation:</span>
                <span className="text-emerald-400 font-bold">{debugInfo.structuredValidation}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Confidence:</span>
                <span className="text-emerald-400">{debugInfo.confidenceScore}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Translation:</span>
                <span className="text-blue-300">{debugInfo.translationStatus}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Voice Support:</span>
                <span className={voiceSupported ? 'text-emerald-400' : 'text-red-400'}>
                  {voiceSupported ? 'Active (SpeechSynthesis + STT)' : 'Unsupported Browser'}
                </span>
              </div>
              <div>
                <span className="text-stone-500 block">Latency:</span>
                <span>{debugInfo.latencyMs} ms</span>
              </div>
              <div>
                <span className="text-stone-500 block">Voice State:</span>
                <span className="text-amber-300">{voiceState}</span>
              </div>
            </div>

            {debugInfo.lastCorrectionApplied && (
              <div className="pt-2 border-t border-stone-800 text-[10px]">
                <span className="text-stone-500">Last Correction: </span>
                <span className="text-amber-300">{debugInfo.lastCorrectionApplied.field}: </span>
                <span className="line-through text-stone-500">
                  {debugInfo.lastCorrectionApplied.original}
                </span>{' '}
                → <span className="text-emerald-400">{debugInfo.lastCorrectionApplied.corrected}</span>{' '}
                <span className="text-stone-600">({debugInfo.lastCorrectionApplied.timestamp})</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
