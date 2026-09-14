import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, 
  Volume2, 
  CheckCircle2, 
  Sparkles, 
  Edit3, 
  RotateCcw, 
  ArrowRight, 
  AlertCircle,
  HelpCircle,
  Check,
  Clock,
  DollarSign,
  Package,
  MapPin,
  Layers,
  Tag
} from 'lucide-react';
import { LanguageCode } from '../../types';
import { normalizeSpokenDigits } from '../../lib/useVoiceFormAssistant';

export interface CollectedProductDetails {
  title: string;
  craftType: string;
  material: string;
  category: string;
  region: string;
  laborHours: number;
  materialCost: number;
}

interface VoiceProductFormAssistantProps {
  language: LanguageCode;
  initialValues?: Partial<CollectedProductDetails>;
  onComplete: (details: CollectedProductDetails) => void;
  onCancel?: () => void;
}

type AssistantState = 
  | 'IDLE' 
  | 'SPEAKING_QUESTION' 
  | 'LISTENING' 
  | 'PROCESSING' 
  | 'FIELD_FILLED' 
  | 'CONFIRMING' 
  | 'ERROR';

interface QuestionConfig {
  key: keyof CollectedProductDetails;
  label: string;
  icon: string;
  prompts: {
    en: string;
    hi: string;
    te: string;
  };
}

const QUESTIONS: QuestionConfig[] = [
  {
    key: 'title',
    label: 'Product Name',
    icon: '🏷️',
    prompts: {
      en: 'What is the name of your handicraft?',
      hi: 'आपके हस्तशिल्प का नाम क्या है?',
      te: 'మీ చేతివృత్తి వస్తువు పేరు ఏమిటి?',
    },
  },
  {
    key: 'craftType',
    label: 'Craft Type',
    icon: '🎨',
    prompts: {
      en: 'What type of craft is it?',
      hi: 'यह किस प्रकार का शिल्प है?',
      te: 'ఇది ఏ రకమైన కళ లేదా చేతివృత్తి?',
    },
  },
  {
    key: 'material',
    label: 'Material',
    icon: '🧵',
    prompts: {
      en: 'What material is used?',
      hi: 'इसमें किस सामग्री का उपयोग किया गया है?',
      te: 'దీని తయారీలో ఏ మెటీరియల్ ఉపయోగించారు?',
    },
  },
  {
    key: 'category',
    label: 'Category',
    icon: '📦',
    prompts: {
      en: 'What is the product category?',
      hi: 'इसकी उत्पाद श्रेणी क्या है?',
      te: 'ఉత్పత్తి కేటగిరీ ఏమిటి?',
    },
  },
  {
    key: 'region',
    label: 'Region / Tradition',
    icon: '📍',
    prompts: {
      en: 'Which region or craft tradition is it associated with?',
      hi: 'यह किस क्षेत्र या शिल्प परंपरा से जुड़ा है?',
      te: 'ఇది ఏ ప్రాంతం లేదా కళా సంప్రదాయానికి చెందినది?',
    },
  },
  {
    key: 'laborHours',
    label: 'Labor Hours',
    icon: '⏱️',
    prompts: {
      en: 'How many hours did you spend making it?',
      hi: 'इसे बनाने में आपको कितने घंटे लगे?',
      te: 'దీన్ని తయారు చేయడానికి మీకు ఎన్ని గంటలు పట్టింది?',
    },
  },
  {
    key: 'materialCost',
    label: 'Material Cost',
    icon: '💰',
    prompts: {
      en: 'How much did the raw material cost?',
      hi: 'कच्चे माल पर आपकी कितनी लागत आई?',
      te: 'ముడి పదార్థాలకు ఎంత ఖర్చు అయింది?',
    },
  },
];

export const VoiceProductFormAssistant: React.FC<VoiceProductFormAssistantProps> = ({
  language,
  initialValues,
  onComplete,
  onCancel,
}) => {
  const [details, setDetails] = useState<CollectedProductDetails>({
    title: initialValues?.title || '',
    craftType: initialValues?.craftType || '',
    material: initialValues?.material || '',
    category: initialValues?.category || 'Handloom',
    region: initialValues?.region || 'Telangana',
    laborHours: initialValues?.laborHours || 15,
    materialCost: initialValues?.materialCost || 800,
  });

  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [assistantState, setAssistantState] = useState<AssistantState>('IDLE');
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [lastFeedback, setLastFeedback] = useState<string>('');
  const [isEditingField, setIsEditingField] = useState<keyof CollectedProductDetails | null>(null);

  const recognitionRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  const currentQ = QUESTIONS[currentQIndex];

  const getQuestionText = (q: QuestionConfig) => {
    if (language === 'hi') return q.prompts.hi;
    if (language === 'te') return q.prompts.te;
    return q.prompts.en;
  };

  // Text-To-Speech with safety
  const speakText = useCallback(
    (text: string, onEnd?: () => void) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        onEnd?.();
        return;
      }

      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      setAssistantState('SPEAKING_QUESTION');

      const utterance = new SpeechSynthesisUtterance(text);
      if (language === 'hi') utterance.lang = 'hi-IN';
      else if (language === 'te') utterance.lang = 'te-IN';
      else utterance.lang = 'en-IN';

      utterance.rate = 0.92;
      utterance.pitch = 1.02;

      utterance.onend = () => {
        if (isMountedRef.current) {
          onEnd?.();
        }
      };

      utterance.onerror = () => {
        if (isMountedRef.current) {
          onEnd?.();
        }
      };

      try {
        window.speechSynthesis.speak(utterance);
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch {
        onEnd?.();
      }
    },
    [language]
  );

  // Stop speech synthesis and recognition
  const stopAll = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
  }, []);

  // Web Speech Recognition: WAITS until user speaks
  const startListening = useCallback(
    (onSpeechReceived: (text: string) => void, onSpeechError: () => void) => {
      if (typeof window === 'undefined') return;

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setAssistantState('ERROR');
        setLastFeedback('Microphone / Speech Recognition unavailable. Please use manual inputs.');
        return;
      }

      stopAll();

      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN';

        recognition.onstart = () => {
          if (isMountedRef.current) {
            setAssistantState('LISTENING');
            setLiveTranscript('');
          }
        };

        recognition.onresult = (event: any) => {
          let current = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            current += event.results[i][0].transcript;
          }
          if (isMountedRef.current) {
            setLiveTranscript(current);
          }

          if (event.results?.[0]?.isFinal) {
            const final = event.results[0][0].transcript.trim();
            if (final) {
              setAssistantState('PROCESSING');
              onSpeechReceived(final);
            }
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition error:', e?.error);
          if (isMountedRef.current) {
            onSpeechError();
          }
        };

        recognition.onend = () => {
          // Handled via onresult or error
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.warn('Recognition start exception:', err);
        onSpeechError();
      }
    },
    [language, stopAll]
  );

  // Parse natural compound speech or single field values
  const processSpokenAnswer = useCallback(
    (spoken: string) => {
      const lower = spoken.toLowerCase();

      // Compound speech check: e.g. "cotton saree made in telangana 15 hours 800 rupees"
      const isCompound =
        (lower.includes('saree') || lower.includes('shawl') || lower.includes('pot') || lower.includes('toy')) &&
        (lower.includes('hours') || lower.includes('rupees') || lower.includes('cost') || lower.includes('cotton') || lower.includes('silk'));

      if (isCompound) {
        // Extract compound fields
        const newDetails = { ...details };
        if (lower.includes('saree')) newDetails.title = 'Handcrafted Silk Saree';
        if (lower.includes('cotton')) newDetails.material = '100% Organic Cotton';
        if (lower.includes('silk')) newDetails.material = 'Pure Mulberry Silk';
        if (lower.includes('telangana')) newDetails.region = 'Telangana';
        if (lower.includes('pochampally')) {
          newDetails.craftType = 'Pochampally Ikat Weave';
          newDetails.region = 'Pochampally, Telangana';
        }

        const norm = normalizeSpokenDigits(spoken);
        const hoursMatch = norm.match(/(\d+)\s*(hour|hours|ghante|gantalu)/i);
        if (hoursMatch) newDetails.laborHours = Number(hoursMatch[1]);

        const costMatch = norm.match(/(\d+)\s*(rupee|rupees|rs|inr)/i) || norm.match(/(cost|material)\s*(?:is|was)?\s*(\d+)/i);
        if (costMatch) newDetails.materialCost = Number(costMatch[1] || costMatch[2]);

        setDetails(newDetails);
        setAssistantState('CONFIRMING');
        speakText(
          language === 'hi'
            ? 'मैंने ये सभी विवरण समझ लिए हैं। क्या आप इन्हें सहेजना चाहते हैं?'
            : language === 'te'
            ? 'నేను ఈ వివరాలను అర్థం చేసుకున్నాను. మీరు వీటిని సేవ్ చేయాలనుకుంటున్నారా?'
            : 'I understood these details. Would you like to save them?'
        );
        return;
      }

      // Single question extraction
      const currentField = currentQ.key;
      const newDetails = { ...details };

      if (currentField === 'laborHours') {
        const norm = normalizeSpokenDigits(spoken);
        const digits = norm.replace(/\D/g, '');
        const num = Number(digits) || 12;
        newDetails.laborHours = num;
        setLastFeedback(`✓ ${num} hours`);
      } else if (currentField === 'materialCost') {
        const norm = normalizeSpokenDigits(spoken);
        const digits = norm.replace(/\D/g, '');
        const cost = Number(digits) || 800;
        newDetails.materialCost = cost;
        setLastFeedback(`✓ ₹${cost}`);
      } else {
        // Text field
        const cleaned = spoken.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim();
        (newDetails as any)[currentField] = cleaned;
        setLastFeedback(`✓ ${cleaned}`);
      }

      setDetails(newDetails);
      setAssistantState('FIELD_FILLED');

      // Advance to next question or confirm
      setTimeout(() => {
        if (currentQIndex < QUESTIONS.length - 1) {
          setCurrentQIndex((prev) => prev + 1);
        } else {
          // All fields collected -> Confirming state!
          setAssistantState('CONFIRMING');
          speakText(
            language === 'hi'
              ? 'मैंने ये सभी विवरण समझ लिए हैं। क्या आप इन्हें सहेजना चाहते हैं?'
              : language === 'te'
              ? 'నేను ఈ వివరాలను అర్థం చేసుకున్నాను. మీరు వీటిని సేవ్ చేయాలనుకుంటున్నారా?'
              : 'I understood these details. Would you like to save them?'
          );
        }
      }, 700);
    },
    [currentQ, currentQIndex, details, language, speakText]
  );

  // Ask current question and wait
  const askCurrentQuestion = useCallback(() => {
    if (currentQIndex >= QUESTIONS.length) {
      setAssistantState('CONFIRMING');
      return;
    }

    const q = QUESTIONS[currentQIndex];
    const text = getQuestionText(q);

    speakText(text, () => {
      // WAIT FOR USER SPEECH
      startListening(
        (spoken) => {
          processSpokenAnswer(spoken);
        },
        () => {
          // If speech is unclear: repeat question without skipping
          const repeatMsg =
            language === 'hi'
              ? 'मुझे समझ नहीं आया। कृपया दोबारा बोलें।'
              : language === 'te'
              ? 'నాకు స్పష్టంగా వినిపించలేదు. దయచేసి మళ్ళీ చెప్పండి.'
              : "I didn't understand that. Please say it again.";

          setLastFeedback(repeatMsg);
          speakText(repeatMsg, () => {
            // Re-listen on the same field
            startListening(
              (spokenAgain) => processSpokenAnswer(spokenAgain),
              () => {
                setAssistantState('IDLE');
                setLastFeedback('Tap microphone to speak or type in the box.');
              }
            );
          });
        }
      );
    });
  }, [currentQIndex, getQuestionText, speakText, startListening, processSpokenAnswer, language]);

  // Trigger question when currentQIndex changes
  useEffect(() => {
    isMountedRef.current = true;
    if (assistantState !== 'CONFIRMING') {
      const timer = setTimeout(() => {
        askCurrentQuestion();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentQIndex, askCurrentQuestion, assistantState]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      stopAll();
    };
  }, [stopAll]);

  // Restart questionnaire
  const handleRestart = () => {
    stopAll();
    setCurrentQIndex(0);
    setAssistantState('IDLE');
    setLastFeedback('');
    askCurrentQuestion();
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-stone-50 rounded-3xl border-2 border-amber-400 p-5 sm:p-7 shadow-xl">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 text-white flex items-center justify-center text-xl shadow-xs">
            🎙️
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-stone-900 font-['Rozha_One',serif]">
              {language === 'hi'
                ? 'आवाज़ से उत्पाद विवरण भरें'
                : language === 'te'
                ? 'వాయిస్ ఉత్పత్తి సహాయకుడు'
                : 'Voice Product Questionnaire'}
            </h3>
            <p className="text-xs text-stone-600 font-medium">
              Step-by-step voice guidance • No typing needed
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black">
          {assistantState === 'CONFIRMING'
            ? 'Summary'
            : `${currentQIndex + 1} / ${QUESTIONS.length}`}
        </span>
      </div>

      {/* Voice Status Indicator Banner */}
      <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-400/60 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs shrink-0">
            {assistantState === 'LISTENING' ? (
              <Mic className="w-5 h-5 animate-ping text-white" />
            ) : assistantState === 'SPEAKING_QUESTION' ? (
              <Volume2 className="w-5 h-5 animate-bounce text-white" />
            ) : assistantState === 'PROCESSING' ? (
              <Sparkles className="w-5 h-5 animate-spin text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-black text-amber-950 block truncate">
              {assistantState === 'SPEAKING_QUESTION' && '🔊 Asking question...'}
              {assistantState === 'LISTENING' && '🎙️ Listening... Please speak now'}
              {assistantState === 'PROCESSING' && '⚙️ Processing what you said...'}
              {assistantState === 'FIELD_FILLED' && '✓ Got it! Moving to next field...'}
              {assistantState === 'CONFIRMING' && '✓ All details collected! Review below'}
              {assistantState === 'IDLE' && '🎙️ Ready to speak'}
              {assistantState === 'ERROR' && '⚠️ Microphone notice'}
            </span>
            <span className="text-[11px] text-amber-800 font-semibold block truncate">
              {liveTranscript ? `Heard: "${liveTranscript}"` : lastFeedback || 'Speaking one question at a time'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => askCurrentQuestion()}
          className="p-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-xs shrink-0 cursor-pointer"
          title="Repeat Question"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* ========================================================== */}
      {/* ACTIVE QUESTION VIEW (When not in confirming stage)        */}
      {/* ========================================================== */}
      {assistantState !== 'CONFIRMING' && currentQ && (
        <div className="space-y-4 mb-6">
          <div className="p-5 rounded-2xl bg-white border-2 border-amber-300 shadow-sm text-center">
            <span className="text-3xl mb-1 block">{currentQ.icon}</span>
            <span className="text-[11px] font-black text-amber-800 uppercase tracking-wider block mb-1">
              {currentQ.label}
            </span>
            <h4 className="text-lg sm:text-xl font-black text-stone-900 leading-snug font-['Rozha_One',serif]">
              "{getQuestionText(currentQ)}"
            </h4>
          </div>

          {/* Current Live Extracted Value or Fallback Input */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-stone-600 flex items-center gap-1.5">
                <span>{currentQ.label} (Current Value)</span>
              </label>
              <span className="text-[10px] text-amber-700 font-extrabold uppercase">
                Tap to edit manually
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type={currentQ.key === 'laborHours' || currentQ.key === 'materialCost' ? 'number' : 'text'}
                value={(details as any)[currentQ.key]}
                onChange={(e) => {
                  const val = currentQ.key === 'laborHours' || currentQ.key === 'materialCost' 
                    ? Number(e.target.value) 
                    : e.target.value;
                  setDetails({ ...details, [currentQ.key]: val });
                }}
                className="flex-1 px-4 py-2.5 rounded-xl border-2 border-amber-300 bg-amber-50/30 text-stone-900 font-extrabold text-base focus:border-amber-600 focus:bg-white"
                placeholder={`Speak or type ${currentQ.label}`}
              />

              <button
                type="button"
                onClick={() => {
                  setAssistantState('FIELD_FILLED');
                  if (currentQIndex < QUESTIONS.length - 1) {
                    setCurrentQIndex(prev => prev + 1);
                  } else {
                    setAssistantState('CONFIRMING');
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-xs cursor-pointer flex items-center gap-1"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* FINAL CONFIRMATION SUMMARY CARD (Section 9)                */}
      {/* ========================================================== */}
      {assistantState === 'CONFIRMING' && (
        <div className="space-y-5 mb-6">
          <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-1" />
            <h4 className="text-base sm:text-lg font-black text-stone-900 font-['Rozha_One',serif]">
              {language === 'hi'
                ? 'उत्पाद विवरण सारांश'
                : language === 'te'
                ? 'ఉత్పత్తి వివరాల సారాంశం'
                : 'PRODUCT DETAILS SUMMARY'}
            </h4>
            <p className="text-xs text-stone-600 font-medium">
              {language === 'hi'
                ? 'मैंने ये विवरण समझ लिए हैं। क्या आप इन्हें सहेजना चाहते हैं?'
                : language === 'te'
                ? 'ఈ వివరాలను సరిచూసుకొని ఆమోదించండి'
                : 'I understood these details. Would you like to save them?'}
            </p>
          </div>

          {/* Structured Values Table */}
          <div className="p-4 bg-white rounded-2xl border-2 border-stone-200 divide-y divide-stone-100 shadow-sm text-sm">
            <div className="py-2 flex items-center justify-between">
              <span className="text-stone-500 font-bold flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-amber-600" /> Product Name:
              </span>
              <span className="font-extrabold text-stone-900">{details.title || 'Handmade Craft'}</span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <span className="text-stone-500 font-bold flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-600" /> Craft Type:
              </span>
              <span className="font-extrabold text-stone-900">{details.craftType || 'Traditional Craft'}</span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <span className="text-stone-500 font-bold flex items-center gap-1.5">
                <span>🧵</span> Material:
              </span>
              <span className="font-extrabold text-stone-900">{details.material || 'Natural Materials'}</span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <span className="text-stone-500 font-bold flex items-center gap-1.5">
                <Package className="w-4 h-4 text-amber-600" /> Category:
              </span>
              <span className="font-extrabold text-stone-900">{details.category}</span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <span className="text-stone-500 font-bold flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-600" /> Region:
              </span>
              <span className="font-extrabold text-stone-900">{details.region}</span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <span className="text-stone-500 font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" /> Labor Hours:
              </span>
              <span className="font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                {details.laborHours} hrs
              </span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <span className="text-stone-500 font-bold flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" /> Material Cost:
              </span>
              <span className="font-black text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md">
                ₹{details.materialCost}
              </span>
            </div>
          </div>

          {/* Action Confirmation Buttons (Section 9) */}
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => onComplete(details)}
              className="py-3.5 px-3 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-98 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>✓ Yes, Save</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentQIndex(0)}
              className="py-3.5 px-3 rounded-2xl font-black text-xs text-stone-800 bg-stone-200 hover:bg-stone-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <Edit3 className="w-4 h-4" />
              <span>✏️ Edit</span>
            </button>

            <button
              type="button"
              onClick={handleRestart}
              className="py-3.5 px-3 rounded-2xl font-black text-xs text-amber-950 bg-amber-200 hover:bg-amber-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <RotateCcw className="w-4 h-4" />
              <span>🔄 Speak Again</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      {onCancel && (
        <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onCancel}
            className="text-stone-500 hover:text-stone-800 font-bold cursor-pointer"
          >
            Cancel & Return
          </button>
          <span className="text-stone-400 font-medium">
            Voice-First Handicraft Assistant
          </span>
        </div>
      )}
    </div>
  );
};
