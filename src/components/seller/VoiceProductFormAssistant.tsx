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
import { getRecognitionLocale, getSpeechLocale } from '../../config/languages';
import { getVoicePrompts } from '../../config/voicePrompts';
import { normalizeSpokenDigits } from '../../lib/useVoiceFormAssistant';
import { t } from '../../i18n';

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
  labelKey: string;
  icon: string;
  prompts: {
    en: string;
    hi: string;
    te: string;
    ta?: string;
    kn?: string;
    ml?: string;
    mr?: string;
    gu?: string;
    bn?: string;
    or?: string;
    pa?: string;
    as?: string;
    [key: string]: string | undefined;
  };
}

export const CONFIRM_SPEECH: Record<LanguageCode, string> = {
  en: 'I understood these details. Would you like to save them?',
  hi: 'मैंने ये सभी विवरण समझ लिए हैं। क्या आप इन्हें सहेजना चाहते हैं?',
  te: 'నేను ఈ వివరాలను అర్థం చేసుకున్నాను. మీరు వీటిని సేవ్ చేయాలనుకుంటున్నారా?',
  ta: 'நான் இந்த விவரங்களை புரிந்து கொண்டேன். நீங்கள் இவற்றை சேமிக்க விரும்புகிறீர்களா?',
  kn: 'ನಾನು ಈ ವಿವರಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ. ನೀವು ಇವುಗಳನ್ನು ಉಳಿಸಲು ಬಯಸುವಿರಾ?',
  ml: 'ഞാൻ ഈ വിവരങ്ങൾ മനസ്സിലാക്കി. നിങ്ങൾ ഇവ സംരക്ഷിക്കാൻ ആഗ്രഹിക്കുന്നുണ്ടോ?',
  mr: 'मला हे सर्व तपशील समजले आहेत. आपण हे जतन करू इच्छिता?',
  gu: 'મેં આ બધી વિગતો સમજી લીધી છે. શું તમે તેને સાચવવા માંગો છો?',
  bn: 'আমি এই সমস্ত বিবরণ বুঝতে পেরেছি। আপনি কি এগুলো সংরক্ষণ করতে চান?',
  or: 'ମୁଁ ଏହି ସମସ୍ତ ବିବରଣୀ ବୁଝିପାରିଲି। ଆପଣ ଏହାକୁ ସଂରକ୍ଷଣ କରିବାକୁ ଚାହାଁନ୍ତି କି?',
  pa: 'ਮੈਂ ਇਹ ਸਾਰੇ ਵੇਰਵੇ ਸਮਝ ਲਏ ਹਨ। ਕੀ ਤੁਸੀਂ ਇਹਨਾਂ ਨੂੰ ਸੁਰੱਖਿਅਤ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?',
  as: 'মই এই সকলো বিৱৰণ বুজি পালোঁ। আপুনি এইবোৰ সংৰক্ষণ কৰিব বিচাৰে নেকি?',
};

export const ASSISTANT_TITLES: Record<LanguageCode, string> = {
  en: 'Voice Product Questionnaire',
  hi: 'आवाज़ से उत्पाद विवरण भरें',
  te: 'వాయిస్ ఉత్పత్తి సహాయకుడు',
  ta: 'குரல் மூலம் கைவினை விவரங்கள்',
  kn: 'ಧ್ವನಿ ಮೂಲಕ ಉತ್ಪನ್ನ ವಿವರಣೆ',
  ml: 'ശബ്ദം വഴി ഉൽപ്പന്ന വിവരങ്ങൾ',
  mr: 'आवाजाद्वारे उत्पादन तपशील भरा',
  gu: 'અવાજ દ્વારા ઉત્પાદન વિગત ભરો',
  bn: 'কণ্ঠস্বরের মাধ্যমে পণ্যের বিবরণ',
  or: 'ଭଏସ୍ ମାଧ୍ୟମରେ ଉତ୍ପାଦ ବିବରଣୀ',
  pa: 'ਆਵਾਜ਼ ਰਾਹੀਂ ਉਤਪਾਦ ਦੇ ਵੇਰਵੇ',
  as: 'কণ্ঠৰে সামগ্ৰীৰ বিৱৰণ দিয়ক',
};

export const SUMMARY_TITLES: Record<LanguageCode, string> = {
  en: 'PRODUCT DETAILS SUMMARY',
  hi: 'उत्पाद विवरण सारांश',
  te: 'ఉత్పత్తి వివరాల సారాంశం',
  ta: 'தயாரிப்பு விவரங்களின் சுருக்கம்',
  kn: 'ಉತ್ಪನ್ನ ವಿವರಗಳ ಸಾರಾಂಶ',
  ml: 'ഉൽപ്പന്ന വിവര സംഗ്രഹം',
  mr: 'उत्पादन तपशील सारांश',
  gu: 'ઉત્પાદન વિગત સારાંશ',
  bn: 'পণ্যের বিবরণ সংক্ষিপ্তসার',
  or: 'ଉତ୍ପାଦ ବିବରଣୀ ସାରାଂଶ',
  pa: 'ਉਤਪਾਦ ਦੇ ਵੇਰਵੇ ਦਾ ਸਾਰ',
  as: 'সামগ্ৰীৰ বিৱৰণ সাৰাংশ',
};

const QUESTIONS: QuestionConfig[] = [
  {
    key: 'title',
    labelKey: 'productName',
    icon: '🏷️',
    prompts: {
      en: 'What is the name of your handicraft?',
      hi: 'आपके हस्तशिल्प का नाम क्या है?',
      te: 'మీ చేతివృత్తి వస్తువు పేరు ఏమిటి?',
      ta: 'உங்கள் கைவினைப் பொருளின் பெயர் என்ன?',
      kn: 'ನಿಮ್ಮ ಕರಕುಶಲ ವಸ್ತುವಿನ ಹೆಸರು ಏನು?',
      ml: 'നിങ്ങളുടെ കരകൗശല ഉൽപ്പന്നത്തിന്റെ പേര് എന്താണ്?',
      mr: 'आपल्या हस्तकला उत्पादनाचे नाव काय आहे?',
      gu: 'તમારા હસ્તકલા ઉત્પાદનનું નામ શું છે?',
      bn: 'আপনার হস্তশিল্প পণ্যের নাম কী?',
      or: 'ଆପଣଙ୍କ ହସ୍ତଶିଳ୍ପ ଉତ୍ପାଦର ନାମ କ’ଣ?',
      pa: 'ਤੁਹਾਡੇ ਉਤਪਾਦ ਦਾ ਨਾਮ ਕੀ ਹੈ?',
      as: 'আপোনাৰ হস্তশিল্প সামগ্ৰীৰ নাম কি?',
    },
  },
  {
    key: 'craftType',
    labelKey: 'craftType',
    icon: '🎨',
    prompts: {
      en: 'What type of craft is it?',
      hi: 'यह किस प्रकार का शिल्प है?',
      te: 'ఇది ఏ రకమైన కళ లేదా చేతివృత్తి?',
      ta: 'நீங்கள் செய்யும் கைவினைப் பணியின் பெயரைச் சொல்லுங்கள்.',
      kn: 'ನೀವು ಮಾಡುವ ಕರಕುಶಲ ಕೆಲಸದ ಹೆಸರನ್ನು ಹೇಳಿ.',
      ml: 'നിങ്ങൾ ചെയ്യുന്ന കരകൗശല ജോലിയുടെ പേര് പറയുക.',
      mr: 'आपण करत असलेल्या हस्तकलेचे नाव सांगा.',
      gu: 'તમે કરતા હસ્તકલા કામનું નામ કહો.',
      bn: 'আপনি যে হস্তশিল্পের কাজ করেন তার নাম বলুন।',
      or: 'ଆପଣ କରୁଥିବା ହସ୍ତଶିଳ୍ପ କାର୍ଯ୍ୟର ନାମ କୁହନ୍ତୁ।',
      pa: 'ਆਪਣੇ ਦਸਤਕਾਰੀ ਦੇ ਕੰਮ ਦਾ ਨਾਮ ਦੱਸੋ।',
      as: 'আপুনি কৰা হস্তশিল্পৰ কামৰ নাম কওক।',
    },
  },
  {
    key: 'material',
    labelKey: 'material',
    icon: '🧵',
    prompts: {
      en: 'What material is used?',
      hi: 'इसमें किस सामग्री का उपयोग किया गया है?',
      te: 'దీని తయారీలో ఏ మెటీరియల్ ఉపయోగించారు?',
      ta: 'இதைத் தயாரிக்க என்ன பொருள் பயன்படுத்தப்பட்டது?',
      kn: 'ಇದನ್ನು ಮಾಡಲು ಯಾವ ಸಾಮಗ್ರಿ ಬಳಸಲಾಗಿದೆ?',
      ml: 'ഇത് നിർമ്മിക്കാൻ എന്താണ് ഉപയോഗിച്ചത്?',
      mr: 'हे बनवण्यासाठी कोणते साहित्य वापरले आहे?',
      gu: 'આ બનાવવા માટે કઈ સામગ્રી વાપરવામાં આવી છે?',
      bn: 'এটি তৈরিতে কী উপাদান ব্যবহার করা হয়েছে?',
      or: 'ଏହା ତିଆରି କରିବା ପାଇଁ କେଉଁ ସାମଗ୍ରୀ ବ୍ୟବହାର ହୋଇଛି?',
      pa: 'ਇਸਨੂੰ ਬਣਾਉਣ ਲਈ ਕਿਹੜੀ ਸਮੱਗਰੀ ਵਰਤੀ ਗਈ ਹੈ?',
      as: 'এইটো তৈয়াৰ কৰিবলৈ কি সামগ্ৰী ব্যৱহাৰ কৰা হৈছে?',
    },
  },
  {
    key: 'category',
    labelKey: 'productCategory',
    icon: '📦',
    prompts: {
      en: 'What is the product category?',
      hi: 'इसकी उत्पाद श्रेणी क्या है?',
      te: 'ఉత్పత్తి కేటగిరీ ఏమిటి?',
      ta: 'தயாரிப்பு வகை என்ன?',
      kn: 'ಉತ್ಪನ್ನದ ವರ್ಗ ಯಾವುದು?',
      ml: 'ഉൽപ്പന്ന വിഭാഗം ഏതാണ്?',
      mr: 'उत्पादनाची श्रेणी कोणती आहे?',
      gu: 'ઉત્પાદન શ્રેણી કઈ છે?',
      bn: 'পণ্যের বিভাগ কী?',
      or: 'ସାମଗ୍ରୀର ବିଭାଗ କ’ଣ?',
      pa: 'ਉਤਪਾਦ ਦੀ ਸ਼੍ਰੇਣੀ ਕਿਹੜੀ ਹੈ?',
      as: 'সামগ্ৰীৰ বিভাগ কি?',
    },
  },
  {
    key: 'region',
    labelKey: 'regionPrompt',
    icon: '📍',
    prompts: {
      en: 'Which region or craft tradition is it from?',
      hi: 'यह किस क्षेत्र या गाँव से है?',
      te: 'ఈ కళ ఏ ప్రాంతం లేదా గ్రామానికి చెందినది?',
      ta: 'இந்தக் கைவினை எந்தப் பகுதி அல்லது கிராமத்தைச் சேர்ந்தது?',
      kn: 'ಈ ಕರಕುಶಲ ವಸ್ತು ಯಾವ ಪ್ರದೇಶದ್ದು?',
      ml: 'ഇത് ഏത് പ്രദേശത്തെ അല്ലെങ്കിൽ ഗ്രാമത്തിലെ കലയാണ്?',
      mr: 'ही कला कोणत्या भागातील किंवा गावातील आहे?',
      gu: 'આ કળા કયા પ્રદેશ કે ગામની છે?',
      bn: 'এই শিল্পটি কোন অঞ্চলের বা গ্রামের?',
      or: 'ଏହି କଳା କେଉଁ ଅଞ୍ଚଳ କିମ୍ବା ଗ୍ରାମର?',
      pa: 'ਇਹ ਕਲਾ ਕਿਸ ਖੇਤਰ ਜਾਂ ਪਿੰਡ ਦੀ ਹੈ?',
      as: 'এই শিল্প কোন অঞ্চল বা গাঁৱৰ?',
    },
  },
  {
    key: 'laborHours',
    labelKey: 'laborHours',
    icon: '⏱️',
    prompts: {
      en: 'How many hours did you spend making it?',
      hi: 'इसे बनाने में आपको कितने घंटे लगे?',
      te: 'దీన్ని తయారు చేయడానికి మీకు ఎన్ని గంటలు పట్టింది?',
      ta: 'இதை செய்ய எத்தனை மணி நேரம் ஆனது?',
      kn: 'ಇದನ್ನು ಮಾಡಲು ಎಷ್ಟು ಗಂಟೆಗಳು ಬೇಕಾಯಿತು?',
      ml: 'ഇത് ഉണ്ടാക്കാൻ എത്ര മണിക്കൂർ എടുത്തു?',
      mr: 'हे उत्पादन तयार करण्यासाठी किती तास लागले?',
      gu: 'આ ઉત્પાદન બનાવવામાં કેટલા કલાક લાગ્યા?',
      bn: 'এই পণ্য তৈরি করতে কত ঘণ্টা সময় লেগেছে?',
      or: 'ଏହା ତିଆରି କରିବାକୁ କେତେ ଘଣ୍ଟା ଲାଗିଲା?',
      pa: 'ਇਸਨੂੰ ਬਣਾਉਣ ਵਿੱਚ ਕਿੰਨੇ ਘੰਟੇ ਲੱਗੇ?',
      as: 'এই সামগ্ৰী তৈয়াৰ কৰিবলৈ কিমান ঘণ্টা লাগিল?',
    },
  },
  {
    key: 'materialCost',
    labelKey: 'materialCost',
    icon: '💰',
    prompts: {
      en: 'How much did the raw material cost in rupees?',
      hi: 'कच्चे माल पर आपकी कितनी लागत आई?',
      te: 'ముడి పదార్థాలకు ఎంత ఖర్చు అయింది?',
      ta: 'மூலப்பொருள் செலவு எவ்வளவு?',
      kn: 'ಕಚ್ಚಾ ವಸ್ತುಗಳ ವೆಚ್ಚ ಎಷ್ಟು?',
      ml: 'അസംസ്കൃത വസ്തുക്കളുടെ ചെലവ് എത്രയാണ്?',
      mr: 'कच्च्या मालाचा खर्च किती झाला?',
      gu: 'કાચા માલનો ખર્ચ કેટલો થયો?',
      bn: 'কাঁচামালের খরচ কত?',
      or: 'କଞ୍ଚାମାଲ ଖର୍ଚ୍ଚ କେତେ?',
      pa: 'ਕੱਚੇ ਮਾਲ ਦੀ ਲਾਗਤ ਕਿੰਨੀ ਹੈ?',
      as: 'কেঁচামালৰ খৰচ কিমান?',
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

  const getQuestionLabel = (q: QuestionConfig) => {
    const val = t(q.labelKey as any, language);
    if (val && val !== q.labelKey) return val;
    if (q.key === 'title') return 'Product Name';
    if (q.key === 'craftType') return 'Craft Type';
    if (q.key === 'material') return 'Material';
    if (q.key === 'category') return 'Category';
    if (q.key === 'region') return 'Region / Tradition';
    if (q.key === 'laborHours') return 'Labor Hours';
    if (q.key === 'materialCost') return 'Material Cost';
    return q.labelKey;
  };

  const getQuestionText = (q: QuestionConfig) => {
    const prompts = getVoicePrompts(language);
    if (q.key === 'title') return prompts.askProductName || t('productNamePrompt', language);
    if (q.key === 'craftType') return prompts.askCraft || t('craftTypePrompt', language);
    if (q.key === 'material') return t('materialPrompt', language);
    if (q.key === 'category') return t('categoryPrompt', language);
    if (q.key === 'region') return t('regionPrompt', language);
    if (q.key === 'laborHours') return prompts.askLaborHours || t('laborHoursPrompt', language);
    if (q.key === 'materialCost') return prompts.askMaterialCost || t('materialCostPrompt', language);
    return (q.prompts as any)[language] || q.prompts.en;
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
      const targetLocale = getSpeechLocale(language);
      utterance.lang = targetLocale;

      if ('getVoices' in window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        const match = voices.find(
          (v) =>
            v.lang.toLowerCase() === targetLocale.toLowerCase() ||
            v.lang.toLowerCase().replace('_', '-').startsWith(language)
        );
        if (match) utterance.voice = match;
      }

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
        recognition.lang = getRecognitionLocale(language);
        console.log(`[VOICE] Language: ${language}, Recognition Locale: ${recognition.lang}`);

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
        const hoursMatch = norm.match(/(\d+)\s*(hour|hours|ghante|घंटे|gantalu|గంటలు|மணி|நேரம்|mani|gante|ಘಂಟೆ|മണിക്കൂർ|taas|तास|કલાક|klak|ঘণ্টਾ|ghanta|ଘଣ୍ଟା|ਘੰਟੇ)/i);
        if (hoursMatch) newDetails.laborHours = Number(hoursMatch[1]);

        const costMatch = norm.match(/(\d+)\s*(rupee|rupees|rs|inr|रुपये|रूपये|रू|రూపాయలు|రూపాయి|ரூபாய்|roobaai|ರೂಪಾಯಿ|രൂപ|roopa|રૂપિયા|টাকা|taka|ଟଙ୍କା|tanka|ਰੁਪਏ|rupaye|টকা)/i) || norm.match(/(cost|material|kharch|kimat|lagat|dhar|vela|moolya)\s*(?:is|was|=|:)?\s*(\d+)/i);
        if (costMatch) newDetails.materialCost = Number(costMatch[1] || costMatch[2]);

        setDetails(newDetails);
        setAssistantState('CONFIRMING');
        speakText(CONFIRM_SPEECH[language] || CONFIRM_SPEECH.en);
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
          speakText(CONFIRM_SPEECH[language] || CONFIRM_SPEECH.en);
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
          // If speech is unclear: repeat question in user's chosen language without skipping
          const repeatMsg = getVoicePrompts(language).unclearSpeech || "I didn't understand that. Please say it again.";

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
              {ASSISTANT_TITLES[language] || ASSISTANT_TITLES.en}
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
              {getQuestionLabel(currentQ)}
            </span>
            <h4 className="text-lg sm:text-xl font-black text-stone-900 leading-snug font-['Rozha_One',serif]">
              "{getQuestionText(currentQ)}"
            </h4>
          </div>

          {/* Current Live Extracted Value or Fallback Input */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-stone-600 flex items-center gap-1.5">
                <span>{getQuestionLabel(currentQ)}</span>
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
                placeholder={`Speak or type ${getQuestionLabel(currentQ)}`}
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
                <span>{t('next', language) || 'Next'}</span>
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
              {SUMMARY_TITLES[language] || SUMMARY_TITLES.en}
            </h4>
            <p className="text-xs text-stone-600 font-medium">
              {CONFIRM_SPEECH[language] || CONFIRM_SPEECH.en}
            </p>
          </div>

          {/* Structured Values Table */}
          <div className="p-4 bg-white rounded-2xl border-2 border-stone-200 divide-y divide-stone-100 shadow-sm text-sm">
            <div className="py-2 flex items-center justify-between">
              <span className="text-stone-500 font-bold flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-amber-600" /> {t('productName', language) || 'Product Name'}:
              </span>
              <span className="font-extrabold text-stone-900">{details.title || 'Handmade Craft'}</span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <span className="text-stone-500 font-bold flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-600" /> {t('craftType', language) || 'Craft Type'}:
              </span>
              <span className="font-extrabold text-stone-900">{details.craftType || 'Traditional Craft'}</span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <span className="text-stone-500 font-bold flex items-center gap-1.5">
                <span>🧵</span> {t('material', language) || 'Material'}:
              </span>
              <span className="font-extrabold text-stone-900">{details.material || 'Natural Materials'}</span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <span className="text-stone-500 font-bold flex items-center gap-1.5">
                <Package className="w-4 h-4 text-amber-600" /> {t('productCategory', language) || 'Category'}:
              </span>
              <span className="font-extrabold text-stone-900">{details.category}</span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <span className="text-stone-500 font-bold flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-600" /> {t('craftOrigin', language) || 'Region'}:
              </span>
              <span className="font-extrabold text-stone-900">{details.region}</span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <span className="text-stone-500 font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" /> {t('laborHours', language) || 'Labor Hours'}:
              </span>
              <span className="font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                {details.laborHours} hrs
              </span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <span className="text-stone-500 font-bold flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" /> {t('materialCost', language) || 'Material Cost'}:
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
              <span>✓ {t('save', language) || 'Yes, Save'}</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentQIndex(0)}
              className="py-3.5 px-3 rounded-2xl font-black text-xs text-stone-800 bg-stone-200 hover:bg-stone-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <Edit3 className="w-4 h-4" />
              <span>✏️ {t('edit', language) || 'Edit'}</span>
            </button>

            <button
              type="button"
              onClick={handleRestart}
              className="py-3.5 px-3 rounded-2xl font-black text-xs text-amber-950 bg-amber-200 hover:bg-amber-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <RotateCcw className="w-4 h-4" />
              <span>🔄 {t('speakAgain', language) || 'Speak Again'}</span>
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
