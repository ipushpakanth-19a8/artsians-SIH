import { LanguageCode } from '../types';

// ============================================================================
// 1. MULTILINGUAL YES / NO PARSER
// ============================================================================

const YES_KEYWORDS: Record<string, string[]> = {
  all: ['yes', 'correct', 'right', 'okay', 'ok', 'true', 'sure', 'yep', 'fine', 'done', 'perfect', "that's right", 'thats right'],
  en: ['yes', 'correct', 'right', 'okay', 'ok', 'true', 'sure', 'yep', "that's right", 'thats right'],
  hi: ['हाँ', 'सही', 'ठीक', 'बिल्कुल', 'सही है', 'हां', 'हांजी', 'haan', 'sahi', 'theek', 'bilkul', 'sahi hai'],
  te: ['అవును', 'సరి', 'సరైనది', 'కరెక్ట్', 'బాగుంది', 'అంతే', 'avunu', 'sari', 'sarainadi', 'correct', 'bagundi', 'anthe'],
  ta: ['ஆம்', 'சரி', 'சரியானது', 'கரெக்ட்', 'aam', 'sari', 'sariyanathu', 'correct'],
  kn: ['ಹೌದು', 'ಸರಿ', 'ಸರಿಯಾಗಿದೆ', 'ಕರೆಕ್ಟ್', 'haudu', 'sari', 'sariyagide', 'correct'],
  ml: ['അതെ', 'ശരി', 'ശരിയാണ്', 'ate', 'sari', 'sariyaanu', 'correct'],
  mr: ['हो', 'होय', 'बरोबर', 'ठीक', 'योग्य', 'ho', 'hoy', 'barobar', 'theek', 'yogya'],
  gu: ['હા', 'બરાબર', 'સાચું', 'ઠીક', 'ha', 'barabar', 'saachu', 'theek'],
  bn: ['হ্যাঁ', 'ঠিক', 'সঠিক', 'হ্যাঁ ঠিক', 'haan', 'thik', 'sothik'],
  or: ['ହଁ', 'ଠିକ', 'ଠିକ ଅଛି', 'han', 'thik', 'thik achhi'],
  pa: ['ਹਾਂ', 'ਠੀਕ', 'ਬਿਲਕੁਲ', 'ਸਹੀ', 'haan', 'theek', 'bilkul', 'sahi'],
  as: ['হয়', 'ঠিক', 'শুদ্ধ', 'hoy', 'thik', 'xuddho'],
};

const NO_KEYWORDS: Record<string, string[]> = {
  all: ['no', 'wrong', 'incorrect', 'not correct', 'nope', 'change', 'false', 'bad', 'mistake', 'nah'],
  en: ['no', 'wrong', 'incorrect', 'not correct', 'nope', 'change', 'nah'],
  hi: ['नहीं', 'गलत', 'गलत है', 'ना', 'नहीं है', 'बदलो', 'nahi', 'galat', 'galat hai', 'na', 'nah', 'badlo'],
  te: ['కాదు', 'తప్పు', 'తప్పుగా ఉంది', 'వద్దు', 'మార్చు', 'kaadu', 'thappu', 'vaddu', 'kaadhu', 'maarchu'],
  ta: ['இல்லை', 'தவறு', 'சரியில்லை', 'மாற்று', 'illai', 'thavaru', 'sariyillai', 'maatru'],
  kn: ['ಇಲ್ಲ', 'ತಪ್ಪು', 'ಸರಿಯಲ್ಲ', 'ಬದಲಾಯಿಸಿ', 'illa', 'thappu', 'sariyalla'],
  ml: ['അല്ല', 'തെറ്റ്', 'ശരിയല്ല', 'മാറ്റുക', 'alla', 'thettu', 'sariyalla'],
  mr: ['नाही', 'चुकीचे', 'चूक', 'बदला', 'nahi', 'chukiche', 'chook'],
  gu: ['ના', 'ખોટું', 'બરાબર નથી', 'બદલો', 'naa', 'khotu', 'barabar nathi'],
  bn: ['না', 'ভুল', 'ঠিক না', 'বদলান', 'naa', 'bhul', 'thik na'],
  or: ['ନା', 'ଭୁଲ', 'ଠିକ ନୁହେଁ', 'ବଦଳାନ୍ତୁ', 'naa', 'bhul', 'thik nuhen'],
  pa: ['ਨਹੀਂ', 'ਗਲਤ', 'ਨਾ', 'ਬਦਲੋ', 'nahi', 'galat', 'naa'],
  as: ['নহয়', 'ভুল', 'ঠিক নহয়', 'সলনি কৰক', 'nohoy', 'bhul'],
};

/**
 * Checks if spoken transcript represents a YES, NO, or UNKNOWN confirmation.
 */
export function parseConfirmationResponse(
  transcript: string,
  language: LanguageCode = 'en'
): 'yes' | 'no' | 'unknown' {
  if (!transcript || typeof transcript !== 'string') return 'unknown';
  const clean = transcript.toLowerCase().trim().replace(/[.,!?;:]/g, '');

  const langYes = [...(YES_KEYWORDS[language] || []), ...YES_KEYWORDS.all];
  const langNo = [...(NO_KEYWORDS[language] || []), ...NO_KEYWORDS.all];

  // Exact word match or inclusion
  for (const noWord of langNo) {
    const regex = new RegExp(`(^|\\s)${escapeRegex(noWord.toLowerCase())}(\\s|$)`, 'i');
    if (regex.test(clean) || clean === noWord.toLowerCase()) {
      return 'no';
    }
  }

  for (const yesWord of langYes) {
    const regex = new RegExp(`(^|\\s)${escapeRegex(yesWord.toLowerCase())}(\\s|$)`, 'i');
    if (regex.test(clean) || clean === yesWord.toLowerCase()) {
      return 'yes';
    }
  }

  return 'unknown';
}

function escapeRegex(s: string) {
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

// ============================================================================
// 2. QUANTITY VOICE PARSER
// ============================================================================

const NUMBER_WORD_MAP: Record<string, number> = {
  // English
  'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
  'twenty': 20, 'twenty five': 25, 'thirty': 30, 'fifty': 50, 'hundred': 100,

  // Hindi
  'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पाँच': 5, 'पांच': 5,
  'छह': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
  'ग्यारह': 11, 'बारह': 12, 'पंद्रह': 15, 'बीस': 20, 'पच्चीस': 25, 'पचास': 50, 'सौ': 100,
  'ek': 1, 'do': 2, 'teen': 3, 'chaar': 4, 'paanch': 5, 'chhah': 6, 'saat': 7, 'aath': 8, 'nau': 9, 'das': 10,

  // Telugu
  'ఒకటి': 1, 'రెండు': 2, 'మూడు': 3, 'నాలుగు': 4, 'ఐదు': 5,
  'ఆరు': 6, 'ఏడు': 7, 'ఎనిమిది': 8, 'తొమ్మిది': 9, 'పది': 10,
  'పదిహేను': 15, 'ఇరవై': 20, 'యాభై': 50, 'వంద': 100,
  'okati': 1, 'rendu': 2, 'moodu': 3, 'naalugu': 4, 'aidu': 5, 'aaru': 6, 'eedu': 7, 'enimidi': 8, 'tommidi': 9, 'padi': 10,

  // Tamil
  'ஒன்று': 1, 'இரண்டு': 2, 'மூன்று': 3, 'நான்கு': 4, 'ஐந்து': 5,
  'ஆறு': 6, 'ஏழு': 7, 'எட்டு': 8, 'ஒன்பது': 9, 'பத்து': 10,
  'onnu': 1, 'irandu': 2, 'moondru': 3, 'naangu': 4, 'ainthu': 5,
};

/**
 * Parses spoken quantity into a validated positive integer.
 * Examples: "Five" -> 5, "I have 10 pieces" -> 10, "పాతిక" / "ఐదు" -> 5
 */
export function parseQuantityTranscript(transcript: string): number | null {
  if (!transcript || typeof transcript !== 'string') return null;
  const clean = transcript.toLowerCase().trim();

  // If explicitly negative
  if (/(-|minus|negative)\s*\d+/i.test(clean)) return null;

  // 1. Direct digits match: e.g. "5", "5 pieces", "I have 12 pieces"
  const digitMatch = clean.match(/\b\d+\b/);
  if (digitMatch) {
    const num = parseInt(digitMatch[0], 10);
    if (!isNaN(num) && num > 0) return num;
    return null;
  }

  // 2. Multi-word phrases match
  for (const [word, val] of Object.entries(NUMBER_WORD_MAP)) {
    const regex = new RegExp(`(^|\\s)${escapeRegex(word)}(\\s|$)`, 'i');
    if (regex.test(clean) || clean === word) {
      return val;
    }
  }

  return null;
}

// ============================================================================
// 3. COLOR PARSER
// ============================================================================

/**
 * Normalizes voice transcript into an array of clean, capitalized color strings.
 * Example: "Red and Black" -> ["Red", "Black"]
 * Example: "blue, white, and gold" -> ["Blue", "White", "Gold"]
 */
export function parseColorsTranscript(transcript: string): string[] {
  if (!transcript || typeof transcript !== 'string') return [];
  const clean = transcript
    .replace(/\b(the colors are|the color is|colors are|color is|color|colors|रंग|రంగులు|మరియు|और|and|with)\b/gi, ',')
    .replace(/[;.]/g, ',');

  const parts = clean
    .split(',')
    .map(c => c.trim())
    .filter(c => c.length > 1 && !/^(the|a|an|is|are|it|please)$/i.test(c));

  if (parts.length === 0 && transcript.trim().length > 0) {
    // Fallback: take original trimmed string with first letter capital
    const single = transcript.trim();
    return [single.charAt(0).toUpperCase() + single.slice(1)];
  }

  return parts.map(c => c.charAt(0).toUpperCase() + c.slice(1));
}

// ============================================================================
// 4. NATURAL VALUE CLEANER
// ============================================================================

/**
 * Strips conversational filler from spoken input.
 * e.g. "The name is Pochampally Saree" -> "Pochampally Saree"
 * e.g. "The type is Handloom" -> "Handloom"
 * e.g. "Change color to Red" -> "Red"
 */
export function cleanVoiceAnswer(transcript: string, field: string): string {
  if (!transcript || typeof transcript !== 'string') return '';
  let s = transcript.trim();

  // Strip prefixes
  const prefixes = [
    /^(the\s+name\s+is|name\s+is|it\s+is|it's|its|product\s+name\s+is)\s+/i,
    /^(the\s+type\s+is|type\s+is|category\s+is|craft\s+type\s+is)\s+/i,
    /^(the\s+color\s+is|colors\s+are|color\s+is|the\s+colors\s+are)\s+/i,
    /^(the\s+location\s+is|location\s+is|the\s+address\s+is|address\s+is|i\s+am\s+from|from)\s+/i,
    /^(change\s+the\s+\w+\s+to|change\s+to|actually\s+it\s+is|make\s+it)\s+/i,
    /^(i\s+have|available\s+quantity\s+is|we\s+have)\s+/i,
    /^(నామకరణం|పేరు|రకం|రంగు|స్థలం|చిరునామా|సంఖ్య)\s+/i,
    /^(नाम|प्रकार|रंग|स्थान|पता|संख्या)\s+/i,
  ];

  for (const p of prefixes) {
    s = s.replace(p, '');
  }

  // Remove trailing periods/punctuation
  s = s.replace(/[.,;!?]+$/, '').trim();
  return s;
}

// ============================================================================
// 5. DETERMINISTIC DESCRIPTION GENERATOR
// ============================================================================

export interface ConfirmedProductDetails {
  handicraftName: string;
  handicraftType: string;
  colors: string[];
  location: string;
  quantity: number;
}

/**
 * Generates an automatic, strictly factual product description from confirmed details.
 * Contains ZERO hallucinated claims (no false GI certifications, unverified history, or dimensions).
 */
export function generateAutoDescription(
  details: ConfirmedProductDetails,
  language: LanguageCode = 'en'
): string {
  const name = details.handicraftName || 'Handcrafted Artisan Product';
  const type = details.handicraftType || 'Handicraft';
  const colorStr = details.colors?.length ? details.colors.join(' and ') : 'authentic craft';
  const loc = details.location && details.location !== 'Location unavailable' ? details.location : 'India';
  const qty = details.quantity > 0 ? details.quantity : 1;
  const getQtyText = (lang: LanguageCode): string => {
    switch (lang) {
      case 'hi': return `${qty} पीस`;
      case 'te': return `${qty} పీసులు`;
      case 'ta': return `${qty} எண்ணிக்கை`;
      case 'kn': return `${qty} ವಸ್ತುಗಳು`;
      case 'ml': return `${qty} എണ്ണം`;
      case 'mr': return `${qty} नग`;
      case 'gu': return `${qty} પીસ`;
      case 'bn': return `${qty} টি`;
      case 'or': return `${qty} ଟି`;
      case 'pa': return `${qty} ਪੀਸ`;
      case 'as': return `${qty} টা`;
      case 'en':
      default:
        return qty === 1 ? '1 piece' : `${qty} pieces`;
    }
  };

  const qtyStr = getQtyText(language);

  switch (language) {
    case 'hi':
      return `${loc} से उपलब्ध ${colorStr} रंगों में प्रामाणिक ${name} (${type}), कुल ${qtyStr} उपलब्ध हैं।`;
    case 'te':
      return `${loc} నుండి లభించే ${colorStr} రంగుల ప్రామాణిక ${name} (${type}), మొత్తం ${qtyStr} అందుబాటులో ఉన్నాయి.`;
    case 'ta':
      return `${loc} பகுதியில் இருந்து கிடைக்கும் ${colorStr} நிறங்கள் கொண்ட ${name} (${type}), மொத்தம் ${qtyStr} உள்ளன.`;
    case 'kn':
      return `${loc} ನಿಂದ ಲಭ್ಯವಿರುವ ${colorStr} ಬಣ್ಣಗಳ ಸಾಂಪ್ರದಾಯಿಕ ${name} (${type}), ಒಟ್ಟು ${qtyStr} ಲಭ್ಯವಿದೆ.`;
    case 'ml':
      return `${loc} പ്രദേശത്ത് നിന്നുള്ള ${colorStr} നിറങ്ങളിലുള്ള ${name} (${type}), ആകെ ${qtyStr} ലഭ്യമാണ്.`;
    case 'mr':
      return `${loc} येथून उपलब्ध ${colorStr} रंगांचे अस्सल ${name} (${type}), एकूण ${qtyStr} उपलब्ध आहेत.`;
    case 'gu':
      return `${loc} થી ઉપલબ્ધ ${colorStr} રંગોમાં અધિકૃત ${name} (${type}), કુલ ${qtyStr} ઉપલબ્ધ છે.`;
    case 'bn':
      return `${loc} থেকে উপলব্ধ ${colorStr} রঙের খাঁটি ${name} (${type}), মোট ${qtyStr} উপলব্ধ।`;
    case 'or':
      return `${loc} ରୁ ଉପଲବ୍ଧ ${colorStr} ରଙ୍ଗର ${name} (${type}), ମୋଟ ${qtyStr} ଉପଲବ୍ଧ।`;
    case 'pa':
      return `${loc} ਤੋਂ ਉਪਲਬਧ ${colorStr} ਰੰਗਾਂ ਵਿੱਚ ਅਸਲ ${name} (${type}), ਕੁੱਲ ${qtyStr} ਉਪਲਬਧ ਹਨ।`;
    case 'as':
      return `${loc} ৰ পৰা উপলব্ধ ${colorStr} ৰঙৰ খাঁটি ${name} (${type}), মুঠ ${qtyStr} উপলব্ধ।`;
    case 'en':
    default:
      return `${name} ${type} featuring ${colorStr} colors, available from ${loc} with ${qtyStr} ready for purchase.`;
  }
}
