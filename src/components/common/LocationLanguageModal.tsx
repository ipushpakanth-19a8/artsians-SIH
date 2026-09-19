import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin,
  Globe,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Check,
  ChevronRight,
  ArrowLeft,
  Navigation,
  AlertCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { LanguageCode, ArtisanLocation } from '../../types';
import { ALL_INDIAN_LANGUAGES, ALL_INDIAN_STATES } from '../../config/indiaLanguages';
import {
  STATE_LANGUAGE_MAP,
  getDistrictsForState,
  getLanguagesForState,
  getPrimaryLanguageForState,
  normalizeStateName
} from '../../config/stateLanguageMap';
import {
  detectLocationAndLanguage,
  LocationDetectionStatus,
  saveLocation,
  saveLanguage
} from '../../services/locationService';
import { speakText, stopSpeaking } from '../../lib/i18n';

interface LocationLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (stateName: string, stateCode: string, langCode: LanguageCode) => void;
  initialMode?: 'auto' | 'manual' | 'language-only';
}

// Localized modal labels for low-literacy artisans
const MODAL_STRINGS: Record<LanguageCode, {
  detecting: string;
  detectedTitle: string;
  suggestedLang: string;
  continueIn: string;
  chooseAnother: string;
  manualLocation: string;
  useEnglish: string;
  voicePrompt: (state: string, langName: string) => string;
  voiceListening: string;
  voiceHeard: string;
  permissionDeniedMsg: string;
  unavailableMsg: string;
  selectState: string;
  selectDistrict: string;
  placePlaceholder: string;
  confirmBtn: string;
  backBtn: string;
}> = {
  te: {
    detecting: 'మీ స్థానాన్ని గుర్తిస్తున్నాము...',
    detectedTitle: 'మీ స్థానం గుర్తించబడింది',
    suggestedLang: 'సిఫార్సు చేయబడిన భాష',
    continueIn: 'తెలుగులో కొనసాగించండి',
    chooseAnother: 'మరొక భాష ఎంచుకోండి',
    manualLocation: 'స్థానాన్ని మాన్యువల్‌గా నమోదు చేయండి',
    useEnglish: 'English ఉపయోగించండి',
    voicePrompt: (state, lang) => `మీరు ${state} లో ఉన్నట్లు గుర్తించాము. మీరు ${lang} ను ఎంచుకోవాలనుకుంటున్నారా?`,
    voiceListening: 'వినబడుతోంది... "అవును" లేదా "కాదు" అని చెప్పండి',
    voiceHeard: 'గుర్తించబడింది: ',
    permissionDeniedMsg: 'లొకేషన్ యాక్సెస్ తిరస్కరించబడింది. దయచేసి క్రింద మీ రాష్ట్రాన్ని ఎంచుకోండి.',
    unavailableMsg: 'స్థానం అందుబాటులో లేదు. మాన్యువల్‌గా ఎంచుకోండి.',
    selectState: 'రాష్ట్రాన్ని ఎంచుకోండి',
    selectDistrict: 'జిల్లాను ఎంచుకోండి',
    placePlaceholder: 'గ్రామం లేదా పట్టణం పేరు (ఐచ్ఛికం)',
    confirmBtn: 'ధృవీకరించండి మరియు కొనసాగించండి',
    backBtn: 'వెనుకకు'
  },
  hi: {
    detecting: 'आपके स्थान का पता लगाया जा रहा है...',
    detectedTitle: 'आपका स्थान मिल गया',
    suggestedLang: 'अनुशंसित भाषा',
    continueIn: 'हिंदी में आगे बढ़ें',
    chooseAnother: 'अन्य भाषा चुनें',
    manualLocation: 'स्थान मैन्युअल रूप से चुनें',
    useEnglish: 'English चुनें',
    voicePrompt: (state, lang) => `हमने पाया कि आप ${state} में हैं। क्या आप ${lang} में जारी रखना चाहते हैं?`,
    voiceListening: 'सुन रहे हैं... "हाँ" या "नहीं" कहें',
    voiceHeard: 'पहचाना गया: ',
    permissionDeniedMsg: 'स्थान अनुमति अस्वीकृत। कृपया नीचे अपना राज्य चुनें।',
    unavailableMsg: 'स्थान उपलब्ध नहीं है। कृपया मैन्युअल रूप से चुनें।',
    selectState: 'राज्य चुनें',
    selectDistrict: 'ज़िला चुनें',
    placePlaceholder: 'गाँव या शहर का नाम (वैकल्पिक)',
    confirmBtn: 'पुष्टि करें और आगे बढ़ें',
    backBtn: 'वापस'
  },
  ta: {
    detecting: 'உங்கள் இருப்பிடம் கண்டறியப்படுகிறது...',
    detectedTitle: 'உங்கள் இருப்பிடம் கண்டறியப்பட்டது',
    suggestedLang: 'பரிந்துரைக்கப்பட்ட மொழி',
    continueIn: 'தமிழில் தொடரவும்',
    chooseAnother: 'வேறு மொழியைத் தேர்ந்தெடுக்கவும்',
    manualLocation: 'இருப்பிடத்தை கைமுறையாக மாற்றவும்',
    useEnglish: 'English பயன்படுத்தவும்',
    voicePrompt: (state, lang) => `நீங்கள் ${state} மாநிலத்தில் உள்ளீர்கள். ${lang} மொழியில் தொடர விரும்புகிறீர்களா?`,
    voiceListening: 'கேட்கிறது... "ஆம்" அல்லது "இல்லை" என்று சொல்லுங்கள்',
    voiceHeard: 'அறியப்பட்டது: ',
    permissionDeniedMsg: 'இருப்பிட அணுகல் மறுக்கப்பட்டது. உங்கள் மாநிலத்தைத் தேர்ந்தெடுக்கவும்.',
    unavailableMsg: 'இருப்பிடம் கிடைக்கவில்லை. கைமுறையாகத் தேர்ந்தெடுக்கவும்.',
    selectState: 'மாநிலத்தைத் தேர்ந்தெடுக்கவும்',
    selectDistrict: 'மாவட்டத்தைத் தேர்ந்தெடுக்கவும்',
    placePlaceholder: 'ஊர் அல்லது கிராமத்தின் பெயர்',
    confirmBtn: 'உறுதிசெய்து தொடரவும்',
    backBtn: 'பின்னால்'
  },
  kn: {
    detecting: 'ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಗುರುತಿಸಲಾಗುತ್ತಿದೆ...',
    detectedTitle: 'ನಿಮ್ಮ ಸ್ಥಳ ಪತ್ತೆಯಾಗಿದೆ',
    suggestedLang: 'ಶಿಫಾರಸು ಮಾಡಿದ ಭಾಷೆ',
    continueIn: 'ಕನ್ನಡದಲ್ಲಿ ಮುಂದುವರಿಯಿರಿ',
    chooseAnother: 'ಬೇರೆ ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ',
    manualLocation: 'ಸ್ಥಳವನ್ನು ಹಸ್ತಚಾಲಿತವಾಗಿ ನಮೂದಿಸಿ',
    useEnglish: 'English ಬಳಸಿ',
    voicePrompt: (state, lang) => `ನೀವು ${state} ನಲ್ಲಿದ್ದೀರಿ ಎಂದು ಪತ್ತೆಯಾಗಿದೆ. ನೀವು ${lang} ನಲ್ಲಿ ಮುಂದುವರಿಯಲು ಬಯಸುವಿರಾ?`,
    voiceListening: 'ಆಲಿಸಲಾಗುತ್ತಿದೆ... "ಹೌದು" ಅಥವಾ "ಇಲ್ಲ" ಎಂದು ಹೇಳಿ',
    voiceHeard: 'ಗುರುತಿಸಲಾಗಿದೆ: ',
    permissionDeniedMsg: 'ಸ್ಥಳ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ರಾಜ್ಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    unavailableMsg: 'ಸ್ಥಳ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಆಯ್ಕೆಮಾಡಿ.',
    selectState: 'ರಾಜ್ಯ ಆಯ್ಕೆಮಾಡಿ',
    selectDistrict: 'ಜಿಲ್ಲೆ ಆಯ್ಕೆಮಾಡಿ',
    placePlaceholder: 'ಗ್ರಾಮ ಅಥವಾ ಪಟ್ಟಣದ ಹೆಸರು',
    confirmBtn: 'ದೃಢೀಕರಿಸಿ ಮುಂದುವರಿಯಿರಿ',
    backBtn: 'ಹಿಂದೆ'
  },
  ml: {
    detecting: 'നിങ്ങളുടെ ലൊക്കേഷൻ കണ്ടെത്തുന്നു...',
    detectedTitle: 'ലൊക്കേഷൻ കണ്ടെത്തി',
    suggestedLang: 'ശുപാർശ ചെയ്യുന്ന ഭാഷ',
    continueIn: 'മലയാളത്തിൽ തുടരുക',
    chooseAnother: 'മറ്റൊരു ഭാഷ തിരഞ്ഞെടുക്കുക',
    manualLocation: 'ലൊക്കേഷൻ നേരിട്ട് നൽകുക',
    useEnglish: 'English ഉപയോഗിക്കുക',
    voicePrompt: (state, lang) => `നിങ്ങൾ ${state} ൽ ഉള്ളതായി കണ്ടെത്തി. ${lang} ഭാഷയിൽ തുടരണോ?`,
    voiceListening: 'ശ്രദ്ധിക്കുന്നു... "അതെ" അല്ലെങ്കിൽ "അല്ല" എന്ന് പറയുക',
    voiceHeard: 'തിരിച്ചറിഞ്ഞു: ',
    permissionDeniedMsg: 'ലൊക്കേഷൻ അനുമതി നിരസിച്ചു. സംസ്ഥാനം തിരഞ്ഞെടുക്കുക.',
    unavailableMsg: 'ലൊക്കേഷൻ ലഭ്യമല്ല.',
    selectState: 'സംസ്ഥാനം തിരഞ്ഞെടുക്കുക',
    selectDistrict: 'ജില്ല തിരഞ്ഞെടുക്കുക',
    placePlaceholder: 'ഗ്രാമം അല്ലെങ്കിൽ നഗരത്തിന്റെ പേര്',
    confirmBtn: 'സ്ഥിരീകരിക്കുക',
    backBtn: 'പിന്നോട്ട്'
  },
  mr: {
    detecting: 'आपले स्थान शोधत आहे...',
    detectedTitle: 'आपले स्थान सापडले',
    suggestedLang: 'शिफारस केलेली भाषा',
    continueIn: 'मराठीत पुढे जा',
    chooseAnother: 'दुसरी भाषा निवडा',
    manualLocation: 'स्थान स्वतः प्रविष्ट करा',
    useEnglish: 'English वापरा',
    voicePrompt: (state, lang) => `आपण ${state} मध्ये आहात. आपण ${lang} मध्ये सुरू ठेवू इच्छिता का?`,
    voiceListening: 'ऐकत आहे... "होय" किंवा "नाही" म्हणा',
    voiceHeard: 'ओळखले: ',
    permissionDeniedMsg: 'स्थान परवानगी नाकारली. कृपया राज्य निवडा.',
    unavailableMsg: 'स्थान उपलब्ध नाही.',
    selectState: 'राज्य निवडा',
    selectDistrict: 'जिल्हा निवडा',
    placePlaceholder: 'गाव किंवा शहराचे नाव',
    confirmBtn: 'पुष्टी करा आणि पुढे जा',
    backBtn: 'मागे'
  },
  gu: {
    detecting: 'તમારું સ્થાન શોધી રહ્યાં છીએ...',
    detectedTitle: 'તમારું સ્થાન મળ્યું',
    suggestedLang: 'ભલામણ કરેલ ભાષા',
    continueIn: 'ગુજરાતીમાં આગળ વધો',
    chooseAnother: 'બીજી ભાષા પસંદ કરો',
    manualLocation: 'સ્થાન મેન્યુઅલી દાખલ કરો',
    useEnglish: 'English વાપરો',
    voicePrompt: (state, lang) => `તમે ${state} માં છો. શું તમે ${lang} માં ચાલુ રાખવા માંગો છો?`,
    voiceListening: 'સાંભળી રહ્યાં છીએ... "હા" અથવા "ના" કહો',
    voiceHeard: 'ઓળખાયું: ',
    permissionDeniedMsg: 'સ્થાન પરવાનગી નકારી. કૃપા કરીને રાજ્ય પસંદ કરો.',
    unavailableMsg: 'સ્થાન ઉપલબ્ધ નથી.',
    selectState: 'રાજ્ય પસંદ કરો',
    selectDistrict: 'જિલ્લો પસંદ કરો',
    placePlaceholder: 'ગામ અથવા શહેરનું નામ',
    confirmBtn: 'પુષ્ટિ કરો અને આગળ વધો',
    backBtn: 'પાછળ'
  },
  bn: {
    detecting: 'আপনার অবস্থান শনাক্ত করা হচ্ছে...',
    detectedTitle: 'আপনার অবস্থান পাওয়া গেছে',
    suggestedLang: 'প্রস্তাবিত ভাষা',
    continueIn: 'বাংলায় এগিয়ে যান',
    chooseAnother: 'অন্য ভাষা বেছে নিন',
    manualLocation: 'ম্যানুয়ালি অবস্থান লিখুন',
    useEnglish: 'English ব্যবহার করুন',
    voicePrompt: (state, lang) => `আপনি ${state} এ আছেন। আপনি কি ${lang} তে চালিয়ে যেতে চান?`,
    voiceListening: 'শুনছি... "হ্যাঁ" বা "না" বলুন',
    voiceHeard: 'শনাক্ত হয়েছে: ',
    permissionDeniedMsg: 'অবস্থানের অনুমতি প্রত্যাখ্যান করা হয়েছে। রাজ্য নির্বাচন করুন।',
    unavailableMsg: 'অবস্থান উপলব্ধ নয়।',
    selectState: 'রাজ্য নির্বাচন করুন',
    selectDistrict: 'জেলা নির্বাচন করুন',
    placePlaceholder: 'গ্রাম বা শহরের নাম',
    confirmBtn: 'নিশ্চিত করুন এবং এগিয়ে যান',
    backBtn: 'পেছনে'
  },
  or: {
    detecting: 'ଆପଣଙ୍କ ଅବସ୍ଥାନ ଚିହ୍ନଟ କରାଯାଉଛି...',
    detectedTitle: 'ଆପଣଙ୍କ ଅବସ୍ଥାନ ମିଳିଲା',
    suggestedLang: 'ପରାମର୍ଶିତ ଭାଷା',
    continueIn: 'ଓଡ଼ିଆରେ ଆଗକୁ ବଢ଼ନ୍ତୁ',
    chooseAnother: 'ଅନ୍ୟ ଭାଷା ବାଛନ୍ତୁ',
    manualLocation: 'ନିଜେ ଅବସ୍ଥାନ ଦିଅନ୍ତୁ',
    useEnglish: 'English ବ୍ୟବହାର କରନ୍ତୁ',
    voicePrompt: (state, lang) => `ଆପଣ ${state} ରେ ଅଛନ୍ତି। ଆପଣ ${lang} ରେ ଆଗକୁ ବଢ଼ିବାକୁ ଚାହାଁନ୍ତି କି?`,
    voiceListening: 'ଶୁଣୁଛି... "ହଁ" କିମ୍ବା "ନା" କୁହନ୍ତୁ',
    voiceHeard: 'ଚିହ୍ନଟ: ',
    permissionDeniedMsg: 'ଅବସ୍ଥାନ ଅନୁମତି ଅଗ୍ରାହ୍ୟ ହୋଇଛି। ରାଜ୍ୟ ବାଛନ୍ତୁ।',
    unavailableMsg: 'ଅବସ୍ଥାନ ଉପଲବ୍ଧ ନାହିଁ।',
    selectState: 'ରାଜ୍ୟ ବାଛନ୍ତୁ',
    selectDistrict: 'ଜିଲ୍ଲା ବାଛନ୍ତୁ',
    placePlaceholder: 'ଗ୍ରାମ କିମ୍ବା ସହରର ନାମ',
    confirmBtn: 'ନିଶ୍ଚିତ କରନ୍ତୁ',
    backBtn: 'ପଛକୁ'
  },
  pa: {
    detecting: 'ਤੁਹਾਡਾ ਟਿਕਾਣਾ ਲੱਭਿਆ ਜਾ ਰਿਹਾ ਹੈ...',
    detectedTitle: 'ਤੁਹਾਡਾ ਟਿਕਾਣਾ ਮਿਲਿਆ',
    suggestedLang: 'ਸਿਫ਼ਾਰਿਸ਼ ਕੀਤੀ ਭਾਸ਼ਾ',
    continueIn: 'ਪੰਜਾਬੀ ਵਿੱਚ ਜਾਰੀ ਰੱਖੋ',
    chooseAnother: 'ਦੂਜੀ ਭਾਸ਼ਾ ਚੁਣੋ',
    manualLocation: 'ਖੁਦ ਟਿਕਾਣਾ ਦਰਜ ਕਰੋ',
    useEnglish: 'English ਵਰਤੋਂ',
    voicePrompt: (state, lang) => `ਤੁਸੀਂ ${state} ਵਿੱਚ ਹੋ। ਕੀ ਤੁਸੀਂ ${lang} ਵਿੱਚ ਜਾਰੀ ਰੱਖਣਾ ਚਾਹੁੰਦੇ ਹੋ?`,
    voiceListening: 'ਸੁਣ ਰਿਹਾ ਹੈ... "ਹਾਂ" ਜਾਂ "ਨਹੀਂ" ਕਹੋ',
    voiceHeard: 'ਪਛਾਣ ਕੀਤੀ: ',
    permissionDeniedMsg: 'ਟਿਕਾਣਾ ਆਗਿਆ ਰੱਦ ਕੀਤੀ। ਕਿਰਪਾ ਕਰਕੇ ਰਾਜ ਚੁਣੋ।',
    unavailableMsg: 'ਟਿਕਾਣਾ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।',
    selectState: 'ਰਾਜ ਚੁਣੋ',
    selectDistrict: 'ਜ਼ਿਲ੍ਹਾ ਚੁਣੋ',
    placePlaceholder: 'ਪਿੰਡ ਜਾਂ ਸ਼ਹਿਰ ਦਾ ਨਾਂ',
    confirmBtn: 'ਪੁਸ਼ਟੀ ਕਰੋ',
    backBtn: 'ਪਿੱਛੇ'
  },
  as: {
    detecting: 'আপোনাৰ স্থান অনুসন্ধান কৰা হৈছে...',
    detectedTitle: 'আপোনাৰ স্থান চিনাক্ত কৰা হ’ল',
    suggestedLang: 'পৰামৰ্শিত ভাষা',
    continueIn: 'অসমীয়াত আগবাঢ়ক',
    chooseAnother: 'অন্য ভাষা বাছক',
    manualLocation: 'স্থান নিজে বাছক',
    useEnglish: 'English ব্যৱহাৰ কৰক',
    voicePrompt: (state, lang) => `আপুনি ${state} ত আছে। আপুনি ${lang} ত অব্যাহত ৰাখিব বিচাৰে নেকি?`,
    voiceListening: 'শুনি থকা হৈছে... "হয়" বা "নহয়" কওক',
    voiceHeard: 'চিনাক্ত: ',
    permissionDeniedMsg: 'স্থানৰ অনুমতি প্ৰত্যাখ্যান কৰা হ’ল। অনুগ্ৰহ কৰি ৰাজ্য বাছক।',
    unavailableMsg: 'স্থান উপলব্ধ নহয়।',
    selectState: 'ৰাজ্য বাছক',
    selectDistrict: 'জিলা বাছক',
    placePlaceholder: 'গাঁও বা নগৰৰ নাম',
    confirmBtn: 'নিশ্চিত কৰক',
    backBtn: 'পিছলৈ'
  },
  en: {
    detecting: 'Detecting your approximate location...',
    detectedTitle: 'We detected your location',
    suggestedLang: 'Suggested Language',
    continueIn: 'Continue in English',
    chooseAnother: 'Choose another language',
    manualLocation: 'Enter location manually',
    useEnglish: 'Use English',
    voicePrompt: (state, lang) => `We detected that you are in ${state}. Would you like to continue in ${lang}?`,
    voiceListening: 'Listening... say "Yes" or "No"',
    voiceHeard: 'Heard: ',
    permissionDeniedMsg: 'Location access was denied. You can choose your state and language below.',
    unavailableMsg: 'Location could not be determined automatically.',
    selectState: 'Select State',
    selectDistrict: 'Select District',
    placePlaceholder: 'Village / Town / City (Optional)',
    confirmBtn: 'Confirm & Continue',
    backBtn: 'Back'
  }
};

export const LocationLanguageModal: React.FC<LocationLanguageModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialMode = 'auto'
}) => {
  const {
    language,
    artisanLocation,
    saveLocationAndLanguage,
    setLanguage
  } = useLanguage();

  // Mode: 'detecting' | 'detected' | 'error' | 'manual' | 'languages'
  const [viewMode, setViewMode] = useState<'detecting' | 'detected' | 'error' | 'manual' | 'languages'>(
    initialMode === 'manual' ? 'manual' : (initialMode === 'language-only' ? 'languages' : 'detecting')
  );

  // Detection state
  const [detectionStatus, setDetectionStatus] = useState<LocationDetectionStatus>('idle');
  const [detectedLoc, setDetectedLoc] = useState<ArtisanLocation>(artisanLocation);
  const [suggestedLang, setSuggestedLang] = useState<LanguageCode>('en');
  const [recommendedList, setRecommendedList] = useState<LanguageCode[]>(['en', 'hi', 'te']);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Manual selection state
  const [manualState, setManualState] = useState<string>(artisanLocation.state || 'Telangana');
  const [manualDistrict, setManualDistrict] = useState<string>(artisanLocation.district || '');
  const [manualPlace, setManualPlace] = useState<string>(artisanLocation.place || '');
  const [manualLang, setManualLang] = useState<LanguageCode>(language || 'te');

  // Voice greeting & speech recognition state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceHeardText, setVoiceHeardText] = useState<string>('');
  const recognitionRef = useRef<any>(null);
  const speechTimeoutRef = useRef<any>(null);

  // Get translated strings for the currently suggested language or active UI language
  const activeStrings = MODAL_STRINGS[suggestedLang] || MODAL_STRINGS[language] || MODAL_STRINGS.en;

  // Run auto-detection
  const runDetection = useCallback(async () => {
    setViewMode('detecting');
    setDetectionStatus('detecting');
    setErrorMessage('');

    const res = await detectLocationAndLanguage(8000);
    setDetectionStatus(res.status);

    if (res.status === 'success' && res.location && res.recommendation) {
      setDetectedLoc(res.location);
      setSuggestedLang(res.recommendation.primaryLanguage);
      setRecommendedList(res.recommendation.recommendedLanguages);
      setManualState(res.location.state);
      setManualDistrict(res.location.district || '');
      setManualPlace(res.location.place || '');
      setManualLang(res.recommendation.primaryLanguage);
      setViewMode('detected');
    } else {
      setErrorMessage(res.errorMessage || activeStrings.unavailableMsg);
      setViewMode('error');
    }
  }, [activeStrings.unavailableMsg]);

  // Trigger detection when modal opens in auto mode
  useEffect(() => {
    if (isOpen) {
      if (initialMode === 'auto') {
        runDetection();
      } else if (initialMode === 'manual') {
        setViewMode('manual');
      } else if (initialMode === 'language-only') {
        setViewMode('languages');
      }
    } else {
      stopSpeaking();
      stopVoiceRecognition();
    }
    return () => {
      stopSpeaking();
      stopVoiceRecognition();
    };
  }, [isOpen, initialMode, runDetection]);

  // Voice TTS greeting when location is successfully detected
  useEffect(() => {
    if (viewMode === 'detected' && isOpen) {
      const stateName = detectedLoc.state;
      const langConfig = ALL_INDIAN_LANGUAGES[suggestedLang];
      const langNative = langConfig?.nativeName || langConfig?.name || 'English';

      const promptFn = MODAL_STRINGS[suggestedLang]?.voicePrompt || MODAL_STRINGS.en.voicePrompt;
      const speechText = promptFn(stateName, langNative);

      // Speak localized greeting
      setIsSpeaking(true);
      speakText(speechText, suggestedLang);

      const timer = setTimeout(() => {
        setIsSpeaking(false);
      }, 5000);

      return () => {
        clearTimeout(timer);
        stopSpeaking();
      };
    }
  }, [viewMode, isOpen, detectedLoc.state, suggestedLang]);

  // Speech Recognition setup (Voice Confirmation)
  const startVoiceRecognition = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      stopVoiceRecognition();
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = ALL_INDIAN_LANGUAGES[suggestedLang]?.bcp47 || 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceHeardText('');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        setVoiceHeardText(transcript);
        setIsListening(false);

        // Check for positive confirmation in multiple Indian languages & English
        const positiveWords = [
          'yes', 'yeah', 'yep', 'ok', 'okay', 'sure',
          'అవును', 'హౌ', 'సరే', 'బాగుంది', // Telugu
          'हाँ', 'हां', 'ठीक', 'सही', // Hindi
          'ஆம்', 'சரி', // Tamil
          'ಹೌದು', 'ಸರಿ', // Kannada
          'അതെ', 'ശരി', // Malayalam
          'हो', 'होय', // Marathi
          'હા', 'બરાબર', // Gujarati
          'হ্যাঁ', 'ঠিক আছে', // Bengali
          'ହଁ', 'ଠିକ', // Odia
          'ਹਾਂ', 'ਠੀਕ', // Punjabi
          'হয়', 'ঠিক' // Assamese
        ];

        const negativeWords = [
          'no', 'nope', 'change',
          'కాదు', 'వద్దు', 'మార్చు', // Telugu
          'नहीं', 'ना', 'बदलो', // Hindi
          'இல்லை', 'வேண்டாம்', // Tamil
          'ಇಲ್ಲ', // Kannada
          'അല്ല', // Malayalam
          'नाही', // Marathi
          'ના', // Gujarati
          'না', // Bengali
          'ନା', // Odia
          'ਨਹੀਂ', // Punjabi
          'নহয়' // Assamese
        ];

        const isPositive = positiveWords.some(w => transcript.includes(w.toLowerCase()));
        const isNegative = negativeWords.some(w => transcript.includes(w.toLowerCase()));

        if (isPositive) {
          handleConfirmLocation(suggestedLang);
        } else if (isNegative) {
          setViewMode('languages');
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();

      // Guard against lingering listeners (6s auto-timeout)
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = setTimeout(() => {
        stopVoiceRecognition();
      }, 6000);
    } catch (e) {
      console.warn('[LocationModal] Speech recognition error:', e);
      setIsListening(false);
    }
  };

  const stopVoiceRecognition = () => {
    if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  // Replay TTS voice greeting
  const handleReplayVoice = () => {
    stopSpeaking();
    const stateName = detectedLoc.state;
    const langConfig = ALL_INDIAN_LANGUAGES[suggestedLang];
    const langNative = langConfig?.nativeName || langConfig?.name || 'English';
    const promptFn = MODAL_STRINGS[suggestedLang]?.voicePrompt || MODAL_STRINGS.en.voicePrompt;
    const speechText = promptFn(stateName, langNative);
    setIsSpeaking(true);
    speakText(speechText, suggestedLang);
    setTimeout(() => setIsSpeaking(false), 5000);
  };

  // Confirm detected location and selected language
  const handleConfirmLocation = (langToUse: LanguageCode) => {
    stopSpeaking();
    stopVoiceRecognition();

    saveLocationAndLanguage(
      {
        state: detectedLoc.state,
        district: detectedLoc.district || 'Not available',
        place: detectedLoc.place || 'Not available',
        preferredLanguage: langToUse
      },
      langToUse
    );

    if (onComplete) {
      const stateObj = ALL_INDIAN_STATES.find(s => s.name.toLowerCase() === detectedLoc.state.toLowerCase());
      onComplete(detectedLoc.state, stateObj?.code || 'IN', langToUse);
    }

    onClose();
  };

  // Confirm manual selection
  const handleConfirmManual = () => {
    stopSpeaking();
    stopVoiceRecognition();

    const normalized = normalizeStateName(manualState) || manualState;
    saveLocationAndLanguage(
      {
        state: normalized,
        district: manualDistrict || 'Not available',
        place: manualPlace || manualDistrict || 'Not available',
        preferredLanguage: manualLang
      },
      manualLang
    );

    if (onComplete) {
      const stateObj = ALL_INDIAN_STATES.find(s => s.name.toLowerCase() === normalized.toLowerCase());
      onComplete(normalized, stateObj?.code || 'IN', manualLang);
    }

    onClose();
  };

  if (!isOpen) return null;

  // Available districts for manual state selection
  const currentDistricts = getDistrictsForState(manualState);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md transition-opacity">
      <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent dark:from-amber-500/20 dark:via-orange-500/10 dark:to-transparent border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span>Artisans</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-semibold uppercase tracking-wider">
                    {activeStrings.detectedTitle}
                  </span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {activeStrings.suggestedLang} & Artisan Location
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* STATE 1: DETECTING */}
          {viewMode === 'detecting' && (
            <div className="py-10 text-center space-y-4">
              <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-amber-400/30 dark:bg-amber-500/20 animate-ping" />
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-xl">
                  <Navigation className="w-8 h-8 animate-pulse" />
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  {activeStrings.detecting}
                </h4>
                <p className="text-sm text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                  Using browser geolocation to recommend your regional language and weaver place.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setViewMode('manual')}
                  className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Skip & enter manually →
                </button>
              </div>
            </div>
          )}

          {/* STATE 2: DETECTED SUCCESS */}
          {viewMode === 'detected' && (
            <div className="space-y-5">
              {/* Location Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 dark:bg-stone-800/80 border border-amber-200 dark:border-amber-900/40 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      📍 Detected Region
                    </span>
                    <h4 className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                      {detectedLoc.state}
                    </h4>
                    <p className="text-sm text-stone-600 dark:text-stone-400">
                      {detectedLoc.district && detectedLoc.district !== 'Not available' ? `${detectedLoc.district}, ` : ''}
                      {detectedLoc.place && detectedLoc.place !== 'Not available' && detectedLoc.place !== detectedLoc.district ? `${detectedLoc.place}, ` : ''}
                      India
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setManualState(detectedLoc.state);
                      setManualDistrict(detectedLoc.district || '');
                      setManualPlace(detectedLoc.place || '');
                      setViewMode('manual');
                    }}
                    className="text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-600 font-medium hover:bg-stone-50 transition-colors"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Language Recommendation Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-800 border-2 border-amber-500/40 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                      {activeStrings.suggestedLang}
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300">
                    Recommended
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white">
                    {ALL_INDIAN_LANGUAGES[suggestedLang]?.nativeName || 'తెలుగు'}
                  </span>
                  <span className="text-sm font-medium text-stone-500 dark:text-stone-400">
                    ({ALL_INDIAN_LANGUAGES[suggestedLang]?.name || 'Telugu'})
                  </span>
                </div>

                {/* Voice greeting status / assistant button */}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-700 flex items-center justify-between">
                  <button
                    onClick={handleReplayVoice}
                    className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300"
                  >
                    {isSpeaking ? (
                      <Volume2 className="w-4 h-4 animate-bounce text-amber-600" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                    <span>Listen to recommendation</span>
                  </button>

                  <button
                    onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                      isListening
                        ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 animate-pulse'
                        : 'bg-stone-50 text-stone-700 border-stone-200 dark:bg-stone-700 dark:text-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {isListening ? <Mic className="w-3.5 h-3.5 text-red-500" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isListening ? 'Listening...' : 'Voice reply (Say Yes/No)'}</span>
                  </button>
                </div>

                {isListening && (
                  <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg text-center font-medium">
                    {activeStrings.voiceListening}
                  </p>
                )}

                {voiceHeardText && (
                  <p className="text-xs text-stone-600 dark:text-stone-300 italic text-center">
                    {activeStrings.voiceHeard} "{voiceHeardText}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                {/* 1. Continue in Detected Language */}
                <button
                  onClick={() => handleConfirmLocation(suggestedLang)}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-base shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 transform active:scale-[0.99] transition-all"
                >
                  <Check className="w-5 h-5" />
                  <span>
                    {ALL_INDIAN_LANGUAGES[suggestedLang]?.nativeName || 'తెలుగు'} లో కొనసాగించండి
                  </span>
                  <span className="text-xs opacity-90">
                    (Continue in {ALL_INDIAN_LANGUAGES[suggestedLang]?.name || 'Telugu'})
                  </span>
                </button>

                {/* 2. Choose another language */}
                <button
                  onClick={() => setViewMode('languages')}
                  className="w-full py-3 px-5 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>{activeStrings.chooseAnother}</span>
                </button>

                {/* 3. Manual location */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      setManualState(detectedLoc.state);
                      setManualDistrict(detectedLoc.district || '');
                      setManualPlace(detectedLoc.place || '');
                      setViewMode('manual');
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs font-medium text-center transition-colors"
                  >
                    📍 {activeStrings.manualLocation}
                  </button>

                  <button
                    onClick={() => handleConfirmLocation('en')}
                    className="py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs font-medium text-center transition-colors"
                  >
                    {activeStrings.useEnglish}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STATE 3: ERROR / FALLBACK */}
          {viewMode === 'error' && (
            <div className="space-y-5 py-3">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    Location could not be auto-detected
                  </h4>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    {errorMessage || activeStrings.permissionDeniedMsg}
                  </p>
                </div>
              </div>

              <div className="text-center space-y-3">
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  No problem! Select your state manually to get regional craft recommendations and your preferred language.
                </p>

                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={() => setViewMode('manual')}
                    className="w-full py-3.5 px-5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-colors"
                  >
                    Select State & Language Manually
                  </button>

                  <button
                    onClick={runDetection}
                    className="w-full py-2.5 px-4 rounded-xl text-stone-600 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Try GPS auto-detect again</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STATE 4: MANUAL STATE / DISTRICT / PLACE SELECTOR */}
          {viewMode === 'manual' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                <button
                  onClick={() => setViewMode(detectedLoc.state ? 'detected' : 'languages')}
                  className="flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{activeStrings.backBtn}</span>
                </button>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Manual Location Entry
                </span>
              </div>

              {/* State Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  {activeStrings.selectState} *
                </label>
                <select
                  value={manualState}
                  onChange={(e) => {
                    const newState = e.target.value;
                    setManualState(newState);
                    const dists = getDistrictsForState(newState);
                    setManualDistrict(dists[0] || '');
                    const recLangs = getLanguagesForState(newState);
                    setManualLang(recLangs[0] || 'en');
                  }}
                  className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  {ALL_INDIAN_STATES.map((st) => (
                    <option key={st.code} value={st.name}>
                      {st.name} ({st.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* District Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  {activeStrings.selectDistrict}
                </label>
                {currentDistricts.length > 0 ? (
                  <select
                    value={manualDistrict}
                    onChange={(e) => setManualDistrict(e.target.value)}
                    className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="">Select District</option>
                    {currentDistricts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={manualDistrict}
                    onChange={(e) => setManualDistrict(e.target.value)}
                    placeholder="Enter district"
                    className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                )}
              </div>

              {/* Place / Village Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  Artisan Village / Town
                </label>
                <input
                  type="text"
                  value={manualPlace}
                  onChange={(e) => setManualPlace(e.target.value)}
                  placeholder={activeStrings.placePlaceholder}
                  className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              {/* Language Selection for this location */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  Preferred Language *
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {Object.entries(ALL_INDIAN_LANGUAGES).map(([code, item]) => {
                    const isRec = getLanguagesForState(manualState).includes(code as LanguageCode);
                    const isSelected = manualLang === code;

                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setManualLang(code as LanguageCode)}
                        className={`p-2.5 rounded-xl text-left border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                            : 'bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-sm leading-tight">{item.nativeName}</div>
                          <div className={`text-[11px] ${isSelected ? 'text-amber-100' : 'text-stone-500 dark:text-stone-400'}`}>
                            {item.name}
                          </div>
                        </div>
                        {isRec && !isSelected && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-semibold">
                            State
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleConfirmManual}
                className="w-full mt-3 py-3.5 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>{activeStrings.confirmBtn}</span>
              </button>
            </div>
          )}

          {/* STATE 5: FULL LANGUAGE SELECTOR GRID */}
          {viewMode === 'languages' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                <button
                  onClick={() => setViewMode(detectedLoc.state ? 'detected' : 'manual')}
                  className="flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{activeStrings.backBtn}</span>
                </button>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Select Language
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {Object.entries(ALL_INDIAN_LANGUAGES).map(([code, item]) => {
                  const isPrimary = recommendedList[0] === code;
                  const isRec = recommendedList.includes(code as LanguageCode);

                  return (
                    <button
                      key={code}
                      onClick={() => handleConfirmLocation(code as LanguageCode)}
                      className="p-3.5 rounded-2xl border text-left bg-stone-50 dark:bg-stone-800/90 border-stone-200 dark:border-stone-700 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-all flex flex-col justify-between group"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-base font-extrabold text-stone-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400">
                          {item.nativeName}
                        </span>
                        {isPrimary && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300">
                            Suggested
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        {item.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Privacy Note */}
        <div className="px-6 py-3 bg-stone-50 dark:bg-stone-900/80 border-t border-stone-200 dark:border-stone-800 text-center">
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            🔒 Privacy First: Your exact coordinates are never permanently saved or shared. You can change your location and language anytime.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationLanguageModal;
