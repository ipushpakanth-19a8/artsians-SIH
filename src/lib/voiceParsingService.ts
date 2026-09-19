import { LanguageCode } from '../types';
import { normalizeSpokenDigits } from './useVoiceFormAssistant';

// ============================================================================
// 1. MULTILINGUAL YES / NO PARSER
// ============================================================================

const YES_KEYWORDS: Record<string, string[]> = {
  all: ['yes', 'correct', 'right', 'okay', 'ok', 'true', 'sure', 'yep', 'fine', 'done', 'perfect', "that's right", 'thats right'],
  en: ['yes', 'correct', 'right', 'okay', 'ok', 'true', 'sure', 'yep', "that's right", 'thats right'],
  hi: ['हाँ', 'सही', 'ठीक', 'बिल्कुल', 'सही है', 'हां', 'हांजी', 'haan', 'sahi', 'theek', 'bilkul', 'sahi hai'],
  te: ['అవును', 'సరే', 'సరి', 'సరైనది', 'కరెక్ట్', 'బాగుంది', 'అంతే', 'avunu', 'sare', 'sari', 'sarainadi', 'correct', 'bagundi', 'anthe'],
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

function escapeRegex(s: string) {
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

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

// ============================================================================
// 2. QUANTITY VOICE PARSER
// ============================================================================

const NUMBER_WORD_MAP: Record<string, number> = {
  // English Units & Teens
  'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
  'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19,
  // English Tens
  'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50,
  'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90,
  'hundred': 100, 'one hundred': 100, 'two hundred': 200,

  // Common Compound English Phrases
  'twenty one': 21, 'twenty two': 22, 'twenty three': 23, 'twenty four': 24, 'twenty five': 25,
  'twenty six': 26, 'twenty seven': 27, 'twenty eight': 28, 'twenty nine': 29,
  'thirty one': 31, 'thirty two': 32, 'thirty three': 33, 'thirty four': 34, 'thirty five': 35,
  'forty five': 45, 'fifty five': 55,

  // Hindi
  'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पाँच': 5, 'पांच': 5,
  'छह': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
  'ग्यारह': 11, 'बारह': 12, 'तेरह': 13, 'चौदह': 14, 'पंद्रह': 15,
  'सोलह': 16, 'सत्रह': 17, 'अठारह': 18, 'उन्नीस': 19, 'बीस': 20,
  'इक्कीस': 21, 'बाईस': 22, 'तेईस': 23, 'चौबीस': 24, 'पच्चीस': 25,
  'तीस': 30, 'पैंतीस': 35, 'चालीस': 40, 'पचास': 50, 'सौ': 100, 'एक सौ': 100,
  'ek': 1, 'do': 2, 'teen': 3, 'chaar': 4, 'paanch': 5, 'chhah': 6, 'saat': 7, 'aath': 8, 'nau': 9, 'das': 10,
  'bees': 20, 'pachhis': 25, 'pachees': 25,

  // Telugu
  'ఒకటి': 1, 'రెండు': 2, 'మూడు': 3, 'నాలుగు': 4, 'ఐదు': 5,
  'ఆరు': 6, 'ఏడు': 7, 'ఎనిమిది': 8, 'తొమ్మిది': 9, 'పది': 10,
  'పదకొండు': 11, 'పన్నెండు': 12, 'పదమూడు': 13, 'పద్నాలుగు': 14, 'పదిహేను': 15,
  'ఇరవై': 20, 'ఇరవై ఒకటి': 21, 'ఇరవై రెండు': 22, 'ఇరవై ఐదు': 25, 'పాతిక': 25,
  'ముప్పై': 30, 'ముప్పై ఐదు': 35, 'నలభై': 40, 'యాభై': 50, 'వంద': 100, 'ఒక వంద': 100,
  'okati': 1, 'rendu': 2, 'moodu': 3, 'naalugu': 4, 'aidu': 5, 'aaru': 6, 'eedu': 7, 'enimidi': 8, 'tommidi': 9, 'padi': 10,
  'iravai': 20, 'iravai aidu': 25, 'yaabhai': 50, 'vanda': 100,

  // Tamil
  'ஒன்று': 1, 'இரண்டு': 2, 'மூன்று': 3, 'நான்கு': 4, 'ஐந்து': 5,
  'ஆறு': 6, 'ஏழு': 7, 'எட்டு': 8, 'ஒன்பது': 9, 'பத்து': 10,
  'பதினைந்து': 15, 'இருபது': 20, 'இருபத்தைந்து': 25, 'ஐம்பது': 50, 'நூறு': 100,
  'onnu': 1, 'irandu': 2, 'moondru': 3, 'naangu': 4, 'ainthu': 5, 'pathu': 10, 'irubadhu': 20,
};

/**
 * Parses spoken quantity into a validated positive integer.
 * Examples:
 * - "twenty" -> 20
 * - "twenty five" -> 25
 * - "one hundred" -> 100
 * - "I have 20 pieces" -> 20
 * - "పదిహేను" -> 15
 * - "बीस पीस" -> 20
 */
export function parseQuantityTranscript(transcript: string): number | null {
  if (!transcript || typeof transcript !== 'string') return null;
  const clean = transcript.toLowerCase().trim();

  // If explicitly negative
  if (/(-|minus|negative)\s*\d+/i.test(clean)) return null;

  // 1. Check for compound phrases like "twenty five", "twenty-five" (sorted by length descending)
  const normalizedCompound = clean.replace(/-/g, ' ');
  const sortedEntries = Object.entries(NUMBER_WORD_MAP).sort((a, b) => b[0].length - a[0].length);
  for (const [word, val] of sortedEntries) {
    const regex = new RegExp(`(^|\\s)${escapeRegex(word)}(\\s|$)`, 'i');
    if (regex.test(normalizedCompound) || normalizedCompound === word) {
      if (val > 0) return val;
    }
  }

  // 2. Direct digits match in raw transcript: e.g. "5", "5 pieces", "I have 20 pieces"
  const digitMatch = clean.match(/\b\d+\b/);
  if (digitMatch) {
    const num = parseInt(digitMatch[0], 10);
    if (!isNaN(num) && num > 0) return num;
  }

  // 3. Normalize spoken Indian digits (e.g. "ఒకటి", "पांच", "இரண்டு") via normalizeSpokenDigits
  try {
    const digitConverted = normalizeSpokenDigits(clean);
    const convertedMatch = digitConverted.match(/\b\d+\b/);
    if (convertedMatch) {
      const num = parseInt(convertedMatch[0], 10);
      if (!isNaN(num) && num > 0) return num;
    }
  } catch {}

  // 4. Composite tens + units (e.g., "twenty" + "five" -> 20 + 5 = 25)
  const tensMap: Record<string, number> = {
    twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90
  };
  const unitsMap: Record<string, number> = {
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9
  };
  for (const [tenWord, tenVal] of Object.entries(tensMap)) {
    for (const [unitWord, unitVal] of Object.entries(unitsMap)) {
      const compRegex = new RegExp(`(^|\\s)${tenWord}\\s+${unitWord}(\\s|$)`, 'i');
      if (compRegex.test(normalizedCompound)) {
        return tenVal + unitVal;
      }
    }
  }

  return null;
}

// ============================================================================
// 3. COLOR PARSER
// ============================================================================

/**
 * Normalizes voice transcript into an array of clean, capitalized color strings.
 * Example: "Red and golden" -> ["Red", "Golden"]
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
 * e.g. "The name is Telangana handwoven saree" -> "Telangana handwoven saree"
 * e.g. "The type is Handloom textile" -> "Handloom textile"
 * e.g. "Color is Red and golden" -> "Red and golden"
 */
export function cleanVoiceAnswer(transcript: string, field: string): string {
  if (!transcript || typeof transcript !== 'string') return '';
  let s = transcript.trim();

  // Strip conversational prefixes
  const prefixes = [
    /^(the\s+name\s+is|name\s+is|it\s+is|it's|its|product\s+name\s+is|my\s+handicraft\s+is|handicraft\s+name\s+is)\s+/i,
    /^(the\s+type\s+is|type\s+is|category\s+is|craft\s+type\s+is|this\s+is|this\s+craft\s+is)\s+/i,
    /^(the\s+color\s+is|colors\s+are|color\s+is|the\s+colors\s+are|it\s+is|color\s+of\s+product\s+is)\s+/i,
    /^(the\s+location\s+is|location\s+is|the\s+address\s+is|address\s+is|i\s+am\s+from|from|my\s+address\s+is)\s+/i,
    /^(change\s+the\s+\w+\s+to|change\s+to|actually\s+it\s+is|make\s+it|please\s+make\s+it)\s+/i,
    /^(i\s+have|available\s+quantity\s+is|we\s+have|quantity\s+is)\s+/i,
    /^(నామకరణం|పేరు|రకం|రంగు|స్థలం|చిరునామా|సంఖ్య)\s+/i,
    /^(नाम|प्रकार|रंग|स्थान|पता|संख्या|मात्रा)\s+/i,
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
 * Contains ZERO hallucinated claims (no false GI certifications, unverified history, materials or dimensions).
 * Suitable for an artisan marketplace listing.
 */
export function generateAutoDescription(
  details: ConfirmedProductDetails,
  language: LanguageCode = 'en'
): string {
  const name = details.handicraftName || 'Handcrafted Product';
  const type = details.handicraftType || 'Handloom / Handicraft';
  const colorStr = details.colors?.length ? details.colors.join(' and ') : 'traditional';
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
      return `यह पारंपरिक ${colorStr} रंगों का ${type} (${name}) ${loc} के कारीगरों द्वारा तैयार किया गया है। यह उत्पाद क्षेत्र की पारंपरिक शिल्प कौशल को दर्शाता है और ${qtyStr} की मात्रा में उपलब्ध है।`;
    case 'te':
      return `ఈ సంప్రదాయ ${colorStr} రంగుల ${type} (${name}) ${loc} కళాకారులచే నైపుణ్యంతో రూపొందించబడింది. ఈ ఉత్పత్తి ఈ ప్రాంతపు సాంప్రదాయ చేతిపనిని ప్రతిబింబిస్తుంది మరియు ${qtyStr} పరిమాణంలో అందుబాటులో ఉంది.`;
    case 'ta':
      return `${loc} பகுதியைச் சேர்ந்த கைவினைஞர்களால் உருவாக்கப்பட்ட இந்த பாரம்பரிய ${colorStr} நிற ${type} (${name}) இப்பகுதியின் உன்னத கைவினைத்திறனை பிரதிபலிக்கிறது, மொத்தம் ${qtyStr} கிடைக்கின்றன.`;
    case 'kn':
      return `${loc} ಪ್ರದೇಶದ ಕುಶಲಕರ್ಮಿಗಳಿಂದ ರಚಿಸಲ್ಪಟ್ಟ ಈ ಸಾಂಪ್ರದಾಯಿಕ ${colorStr} ಬಣ್ಣಗಳ ${type} (${name}) ಈ ಭಾಗದ ಶ್ರೇಷ್ಠ ಕರಕುಶಲತೆಯನ್ನು ಪ್ರತಿಬಿಂಬಿಸುತ್ತದೆ, ಒಟ್ಟು ${qtyStr} ಲಭ್ಯವಿದೆ.`;
    case 'ml':
      return `${loc} പ്രദേശത്തെ കരകൗശല വിദഗ്ദ്ധർ തയ്യാറാക്കിയ പരമ്പരാഗത ${colorStr} നിറങ്ങളിലുള്ള ${type} (${name}) തനതായ കരവിരുത് പ്രതിഫലിപ്പിക്കുന്നു, ആകെ ${qtyStr} ലഭ്യമാണ്.`;
    case 'mr':
      return `${loc} येथील कारागिरांनी तयार केलेले हे पारंपारिक ${colorStr} रंगांचे ${type} (${name}) स्थानिक हस्तकलेचे प्रतिनिधित्व करते आणि ${qtyStr} उपलब्ध आहे.`;
    case 'gu':
      return `${loc} ના કારીગરો દ્વારા નિર્મિત આ પરંપરાગત ${colorStr} રંગોનું ${type} (${name}) પ્રાદેશિક હસ્તકલાનું પ્રતીક છે અને ${qtyStr} ઉપલબ્ધ છે.`;
    case 'bn':
      return `${loc}-এর কারিগরদের দ্বারা নির্মিত ঐতিহ্যবাহী ${colorStr} রঙের ${type} (${name}) অঞ্চলের নিপুণ হস্তশিল্পের পরিচায়ক এবং ${qtyStr} উপলব্ধ রয়েছে।`;
    case 'or':
      return `${loc} ର କାରିଗରମାନଙ୍କ ଦ୍ୱାରା ନିର୍ମିତ ଏହି ପାରମ୍ପରିକ ${colorStr} ରଙ୍ଗର ${type} (${name}) ଆଞ୍ଚଳିକ ହସ୍ତଶିଳ୍ପକୁ ଦର୍ଶାଏ ଏବଂ ${qtyStr} ଉପଲବ୍ଧ ଅଛି।`;
    case 'pa':
      return `${loc} ਦੇ ਕਾਰੀਗਰਾਂ ਦੁਆਰਾ ਤਿਆਰ ਕੀਤਾ ਗਿਆ ਇਹ ਰਵਾਇਤੀ ${colorStr} ਰੰਗਾਂ ਦਾ ${type} (${name}) ਖੇਤਰੀ ਦਸਤਕਾਰੀ ਨੂੰ ਦਰਸਾਉਂਦਾ ਹੈ ਅਤੇ ${qtyStr} ਉਪਲਬਧ ਹਨ।`;
    case 'as':
      return `${loc} ৰ শিল্পীসকলে তৈয়াৰ কৰা এই পৰম্পৰাগত ${colorStr} ৰঙৰ ${type} (${name}) অঞ্চলটোৰ উৎকৃষ্ট হস্তশিল্পক প্ৰতিফলিত কৰে আৰু ${qtyStr} উপলব্ধ।`;
    case 'en':
    default:
      return `This traditional ${colorStr} ${type} (${name}) is crafted by artisans from ${loc}. The product reflects the region's traditional craftsmanship and is available in a quantity of ${qtyStr}.`;
  }
}
