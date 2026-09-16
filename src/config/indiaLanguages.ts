import { LanguageCode } from '../types';

export interface LanguageMetadata {
  code: LanguageCode;
  bcp47: string;
  name: string;
  nativeName: string;
  englishName: string;
  speechLocale: string;
  ttsLocale: string;
  hasUI: boolean;
  hasSTT: boolean; // Browser Speech-To-Text support
  hasTTS: boolean; // Browser Text-To-Speech support
  spokenKeywords: string[];
  description: string;
  flag: string;
}

export interface IndianState {
  code: string;
  name: string;
  nativeName: string;
  spokenKeywords: string[];
  recommendedLanguages: LanguageCode[];
  zone?: 'South' | 'North' | 'West' | 'East' | 'NorthEast' | 'Central' | 'UT';
}

// ==========================================================
// CENTRALIZED SUPPORTED INDIAN LANGUAGES METADATA
// ==========================================================
export const ALL_INDIAN_LANGUAGES: Record<LanguageCode, LanguageMetadata> = {
  te: {
    code: 'te',
    bcp47: 'te-IN',
    name: 'తెలుగు',
    nativeName: 'తెలుగు',
    englishName: 'Telugu',
    speechLocale: 'te-IN',
    ttsLocale: 'te-IN',
    hasUI: true,
    hasSTT: true,
    hasTTS: true,
    spokenKeywords: ['telugu', 'telgu', 'తెలుగు', 'telangana', 'andhra', 'three', 'moodu'],
    description: 'కళాకారుల హస్తకళలు మరియు ఆర్డర్లను తెలుగు వాయిస్ సహాయంతో చూడండి.',
    flag: '🇮🇳'
  },
  hi: {
    code: 'hi',
    bcp47: 'hi-IN',
    name: 'हिंदी',
    nativeName: 'हिन्दी',
    englishName: 'Hindi',
    speechLocale: 'hi-IN',
    ttsLocale: 'hi-IN',
    hasUI: true,
    hasSTT: true,
    hasTTS: true,
    spokenKeywords: ['hindi', 'hindee', 'हिंदी', 'हिन्दी', 'two', 'do'],
    description: 'भारतीय हस्तशिल्प और कारीगरों की संपूर्ण जानकारी और आवाज़ गाइड हिन्दी में।',
    flag: '🇮🇳'
  },
  en: {
    code: 'en',
    bcp47: 'en-IN',
    name: 'English',
    nativeName: 'English',
    englishName: 'English',
    speechLocale: 'en-IN',
    ttsLocale: 'en-IN',
    hasUI: true,
    hasSTT: true,
    hasTTS: true,
    spokenKeywords: ['english', 'angrezi', 'inglish', 'one', 'first', 'one'],
    description: 'Explore verified Indian handicrafts with English voice assistance and navigation.',
    flag: '🇮🇳'
  },
  ta: {
    code: 'ta',
    bcp47: 'ta-IN',
    name: 'தமிழ்',
    nativeName: 'தமிழ்',
    englishName: 'Tamil',
    speechLocale: 'ta-IN',
    ttsLocale: 'ta-IN',
    hasUI: true,
    hasSTT: true,
    hasTTS: true,
    spokenKeywords: ['tamil', 'thamizh', 'தமிழ்', 'chennai', 'madurai'],
    description: 'பாரம்பரிய கைவினைப் பொருட்கள் மற்றும் குரல் வழிகாட்டுதல் தமிழில்.',
    flag: '🇮🇳'
  },
  kn: {
    code: 'kn',
    bcp47: 'kn-IN',
    name: 'ಕನ್ನಡ',
    nativeName: 'ಕನ್ನಡ',
    englishName: 'Kannada',
    speechLocale: 'kn-IN',
    ttsLocale: 'kn-IN',
    hasUI: true,
    hasSTT: true,
    hasTTS: true,
    spokenKeywords: ['kannada', 'kanada', 'ಕನ್ನಡ', 'karnataka', 'bengaluru'],
    description: 'ಕರಕುಶಲ ವಸ್ತುಗಳು ಮತ್ತು ಧ್ವನಿ ಮಾರ್ಗದರ್ಶನ ಕನ್ನಡದಲ್ಲಿ.',
    flag: '🇮🇳'
  },
  ml: {
    code: 'ml',
    bcp47: 'ml-IN',
    name: 'മലയാളം',
    nativeName: 'മലയാളം',
    englishName: 'Malayalam',
    speechLocale: 'ml-IN',
    ttsLocale: 'ml-IN',
    hasUI: true,
    hasSTT: true,
    hasTTS: true,
    spokenKeywords: ['malayalam', 'malayalam', 'മലയാളം', 'kerala', 'kochi'],
    description: 'പരമ്പരാഗത കരകൗശല ഉത്പന്നങ്ങളും വോയ്‌സ് വഴികാട്ടിയും മലയാളത്തിൽ.',
    flag: '🇮🇳'
  },
  mr: {
    code: 'mr',
    bcp47: 'mr-IN',
    name: 'मराठी',
    nativeName: 'मराठी',
    englishName: 'Marathi',
    speechLocale: 'mr-IN',
    ttsLocale: 'mr-IN',
    hasUI: true,
    hasSTT: true,
    hasTTS: true,
    spokenKeywords: ['marathi', 'मराठी', 'maharashtra', 'mumbai', 'pune'],
    description: 'पारंपरिक हस्तकला आणि आवाज मार्गदर्शन मराठीमध्ये.',
    flag: '🇮🇳'
  },
  gu: {
    code: 'gu',
    bcp47: 'gu-IN',
    name: 'ગુજરાતી',
    nativeName: 'ગુજરાતી',
    englishName: 'Gujarati',
    speechLocale: 'gu-IN',
    ttsLocale: 'gu-IN',
    hasUI: true,
    hasSTT: true,
    hasTTS: true,
    spokenKeywords: ['gujarati', 'gujrati', 'ગુજરાતી', 'gujarat', 'ahmedabad'],
    description: 'પરંપરાગત હસ્તકલા અને અવાજ માર્ગદર્શન ગુજરાતીમાં.',
    flag: '🇮🇳'
  },
  bn: {
    code: 'bn',
    bcp47: 'bn-IN',
    name: 'বাংলা',
    nativeName: 'বাংলা',
    englishName: 'Bengali',
    speechLocale: 'bn-IN',
    ttsLocale: 'bn-IN',
    hasUI: true,
    hasSTT: true,
    hasTTS: true,
    spokenKeywords: ['bengali', 'bangla', 'বাংলা', 'kolkata', 'bengal'],
    description: 'ঐতিহ্যবাহী হস্তশিল্প এবং ভয়েস সহায়তা বাংলায়।',
    flag: '🇮🇳'
  },
  or: {
    code: 'or',
    bcp47: 'or-IN',
    name: 'ଓଡ଼ିଆ',
    nativeName: 'ଓଡ଼ିଆ',
    englishName: 'Odia',
    speechLocale: 'or-IN',
    ttsLocale: 'or-IN',
    hasUI: true,
    hasSTT: false, // fallback to Hindi/English for STT if browser lacks or-IN
    hasTTS: false, // fallback to hi-IN/en-IN for speech synth
    spokenKeywords: ['odia', 'oriya', 'ଓଡ଼ିଆ', 'odisha', 'bhubaneswar'],
    description: 'ପାରମ୍ପରିକ ହସ୍ତତନ୍ତ ଏବଂ ଶିଳ୍ପ ସହାୟତା ଓଡ଼ିଆରେ।',
    flag: '🇮🇳'
  },
  pa: {
    code: 'pa',
    bcp47: 'pa-IN',
    name: 'ਪੰਜਾਬੀ',
    nativeName: 'ਪੰਜਾਬੀ',
    englishName: 'Punjabi',
    speechLocale: 'pa-IN',
    ttsLocale: 'pa-IN',
    hasUI: true,
    hasSTT: true,
    hasTTS: true,
    spokenKeywords: ['punjabi', 'panjabi', 'ਪੰਜਾਬੀ', 'punjab', 'amritsar'],
    description: 'ਰਵਾਇਤੀ ਦਸਤਕਾਰੀ ਅਤੇ ਆਵਾਜ਼ ਸਹਾਇਤਾ ਪੰਜਾਬੀ ਵਿੱਚ।',
    flag: '🇮🇳'
  },
  as: {
    code: 'as',
    bcp47: 'as-IN',
    name: 'অসমীয়া',
    nativeName: 'অসমীয়া',
    englishName: 'Assamese',
    speechLocale: 'as-IN',
    ttsLocale: 'as-IN',
    hasUI: true,
    hasSTT: false, // fallback to Bengali/Hindi for speech
    hasTTS: false,
    spokenKeywords: ['assamese', 'axomiya', 'অসমীয়া', 'assam', 'guwahati'],
    description: 'পৰম্পৰাগত হস্তশিল্প আৰু ভইচ সহায় অসমীয়াত।',
    flag: '🇮🇳'
  }
};

// ==========================================================
// ALL 28 INDIAN STATES + 8 UNION TERRITORIES CONFIGURATION
// ==========================================================
export const ALL_INDIAN_STATES: IndianState[] = [
  // --- South ---
  {
    code: 'TS',
    name: 'Telangana',
    nativeName: 'తెలంగాణ',
    spokenKeywords: ['telangana', 'telengana', 'hyderabad', 'warangal', 'తెలంగాణ'],
    recommendedLanguages: ['te', 'en', 'hi'],
    zone: 'South'
  },
  {
    code: 'AP',
    name: 'Andhra Pradesh',
    nativeName: 'ఆంధ్రప్రదేశ్',
    spokenKeywords: ['andhra pradesh', 'andhra', 'vijayawada', 'visakhapatnam', 'tirupati', 'ఆంధ్రప్రదేశ్'],
    recommendedLanguages: ['te', 'en', 'hi'],
    zone: 'South'
  },
  {
    code: 'KA',
    name: 'Karnataka',
    nativeName: 'ಕರ್ನಾಟಕ',
    spokenKeywords: ['karnataka', 'karnatak', 'bengaluru', 'bangalore', 'mysore', 'ಕರ್ನಾಟಕ'],
    recommendedLanguages: ['kn', 'en', 'hi'],
    zone: 'South'
  },
  {
    code: 'TN',
    name: 'Tamil Nadu',
    nativeName: 'தமிழ்நாடு',
    spokenKeywords: ['tamil nadu', 'tamilnadu', 'chennai', 'madurai', 'coimbatore', 'தமிழ்நாடு'],
    recommendedLanguages: ['ta', 'en'],
    zone: 'South'
  },
  {
    code: 'KL',
    name: 'Kerala',
    nativeName: 'കേരളം',
    spokenKeywords: ['kerala', 'keralam', 'kochi', 'thiruvananthapuram', 'calicut', 'കേരളം'],
    recommendedLanguages: ['ml', 'en', 'hi'],
    zone: 'South'
  },

  // --- West ---
  {
    code: 'MH',
    name: 'Maharashtra',
    nativeName: 'महाराष्ट्र',
    spokenKeywords: ['maharashtra', 'mumbai', 'pune', 'nagpur', 'aurangabad', 'महाराष्ट्र'],
    recommendedLanguages: ['mr', 'hi', 'en'],
    zone: 'West'
  },
  {
    code: 'GJ',
    name: 'Gujarat',
    nativeName: 'ગુજરાત',
    spokenKeywords: ['gujarat', 'ahmedabad', 'surat', 'vadodara', 'kutch', 'ગુજરાત'],
    recommendedLanguages: ['gu', 'hi', 'en'],
    zone: 'West'
  },
  {
    code: 'GA',
    name: 'Goa',
    nativeName: 'गोंय',
    spokenKeywords: ['goa', 'panaji', 'margao', 'गोंय'],
    recommendedLanguages: ['mr', 'en', 'hi'],
    zone: 'West'
  },
  {
    code: 'RJ',
    name: 'Rajasthan',
    nativeName: 'राजस्थान',
    spokenKeywords: ['rajasthan', 'jaipur', 'jodhpur', 'udaipur', 'bikaner', 'राजस्थान'],
    recommendedLanguages: ['hi', 'en'],
    zone: 'West'
  },

  // --- North ---
  {
    code: 'UP',
    name: 'Uttar Pradesh',
    nativeName: 'उत्तर प्रदेश',
    spokenKeywords: ['uttar pradesh', 'up', 'lucknow', 'varanasi', 'kanpur', 'agra', 'उत्तर प्रदेश'],
    recommendedLanguages: ['hi', 'en'],
    zone: 'North'
  },
  {
    code: 'PB',
    name: 'Punjab',
    nativeName: 'ਪੰਜਾਬ',
    spokenKeywords: ['punjab', 'amritsar', 'ludhiana', 'jalandhar', 'ਪੰਜਾਬ'],
    recommendedLanguages: ['pa', 'hi', 'en'],
    zone: 'North'
  },
  {
    code: 'HR',
    name: 'Haryana',
    nativeName: 'हरियाणा',
    spokenKeywords: ['haryana', 'gurgaon', 'faridabad', 'panipat', 'हरियाणा'],
    recommendedLanguages: ['hi', 'pa', 'en'],
    zone: 'North'
  },
  {
    code: 'HP',
    name: 'Himachal Pradesh',
    nativeName: 'हिमाचल प्रदेश',
    spokenKeywords: ['himachal pradesh', 'himachal', 'shimla', 'kullu', 'manali', 'हिमाचल प्रदेश'],
    recommendedLanguages: ['hi', 'en'],
    zone: 'North'
  },
  {
    code: 'UK',
    name: 'Uttarakhand',
    nativeName: 'उत्तराखंड',
    spokenKeywords: ['uttarakhand', 'dehradun', 'haridwar', 'nainital', 'उत्तराखंड'],
    recommendedLanguages: ['hi', 'en'],
    zone: 'North'
  },

  // --- Central ---
  {
    code: 'MP',
    name: 'Madhya Pradesh',
    nativeName: 'मध्य प्रदेश',
    spokenKeywords: ['madhya pradesh', 'mp', 'bhopal', 'indore', 'gwalior', 'मध्य प्रदेश'],
    recommendedLanguages: ['hi', 'en'],
    zone: 'Central'
  },
  {
    code: 'CG',
    name: 'Chhattisgarh',
    nativeName: 'छत्तीसगढ़',
    spokenKeywords: ['chhattisgarh', 'raipur', 'bilaspur', 'bastar', 'छत्तीसगढ़'],
    recommendedLanguages: ['hi', 'en'],
    zone: 'Central'
  },

  // --- East ---
  {
    code: 'WB',
    name: 'West Bengal',
    nativeName: 'পশ্চিমবঙ্গ',
    spokenKeywords: ['west bengal', 'bengal', 'kolkata', 'howrah', 'darjeeling', 'পশ্চিমবঙ্গ'],
    recommendedLanguages: ['bn', 'en', 'hi'],
    zone: 'East'
  },
  {
    code: 'OD',
    name: 'Odisha',
    nativeName: 'ଓଡ଼ିଶା',
    spokenKeywords: ['odisha', 'orissa', 'bhubaneswar', 'cuttack', 'puri', 'ଓଡ଼ିଶା'],
    recommendedLanguages: ['or', 'hi', 'en'],
    zone: 'East'
  },
  {
    code: 'BR',
    name: 'Bihar',
    nativeName: 'बिहार',
    spokenKeywords: ['bihar', 'patna', 'gaya', 'bhagalpur', 'madhubani', 'बिहार'],
    recommendedLanguages: ['hi', 'en'],
    zone: 'East'
  },
  {
    code: 'JH',
    name: 'Jharkhand',
    nativeName: 'झारखंड',
    spokenKeywords: ['jharkhand', 'ranchi', 'jamshedpur', 'dhanbad', 'झारखंड'],
    recommendedLanguages: ['hi', 'en'],
    zone: 'East'
  },

  // --- North East ---
  {
    code: 'AS',
    name: 'Assam',
    nativeName: 'অসম',
    spokenKeywords: ['assam', 'asom', 'guwahati', 'silchar', 'অসম'],
    recommendedLanguages: ['as', 'bn', 'en', 'hi'],
    zone: 'NorthEast'
  },
  {
    code: 'AR',
    name: 'Arunachal Pradesh',
    nativeName: 'अरुणाचल प्रदेश',
    spokenKeywords: ['arunachal pradesh', 'arunachal', 'itanagar', 'tawang', 'अरुणाचल प्रदेश'],
    recommendedLanguages: ['en', 'hi'],
    zone: 'NorthEast'
  },
  {
    code: 'MN',
    name: 'Manipur',
    nativeName: 'মণিপুর',
    spokenKeywords: ['manipur', 'imphal', 'মণিপুর'],
    recommendedLanguages: ['en', 'hi'],
    zone: 'NorthEast'
  },
  {
    code: 'ML',
    name: 'Meghalaya',
    nativeName: 'Meghalaya',
    spokenKeywords: ['meghalaya', 'shillong', 'cherrapunji'],
    recommendedLanguages: ['en', 'hi'],
    zone: 'NorthEast'
  },
  {
    code: 'MZ',
    name: 'Mizoram',
    nativeName: 'Mizoram',
    spokenKeywords: ['mizoram', 'aizawl'],
    recommendedLanguages: ['en', 'hi'],
    zone: 'NorthEast'
  },
  {
    code: 'NL',
    name: 'Nagaland',
    nativeName: 'Nagaland',
    spokenKeywords: ['nagaland', 'kohima', 'dimapur'],
    recommendedLanguages: ['en', 'hi'],
    zone: 'NorthEast'
  },
  {
    code: 'SK',
    name: 'Sikkim',
    nativeName: 'सिक्किम',
    spokenKeywords: ['sikkim', 'gangtok', 'सिक्किम'],
    recommendedLanguages: ['en', 'hi'],
    zone: 'NorthEast'
  },
  {
    code: 'TR',
    name: 'Tripura',
    nativeName: 'ত্রিপুরা',
    spokenKeywords: ['tripura', 'agartala', 'ত্রিপুরা'],
    recommendedLanguages: ['bn', 'en', 'hi'],
    zone: 'NorthEast'
  },

  // --- Union Territories ---
  {
    code: 'DL',
    name: 'Delhi (NCT)',
    nativeName: 'दिल्ली',
    spokenKeywords: ['delhi', 'new delhi', 'ncr', 'दिल्ली'],
    recommendedLanguages: ['hi', 'en', 'pa'],
    zone: 'UT'
  },
  {
    code: 'JK',
    name: 'Jammu and Kashmir',
    nativeName: 'جموں و کشمیر / जम्मू और कश्मीर',
    spokenKeywords: ['jammu', 'kashmir', 'srinagar', 'jammu and kashmir'],
    recommendedLanguages: ['hi', 'en'],
    zone: 'UT'
  },
  {
    code: 'LA',
    name: 'Ladakh',
    nativeName: 'ལ་དྭགས / लद्दाख़',
    spokenKeywords: ['ladakh', 'leh', 'kargil'],
    recommendedLanguages: ['hi', 'en'],
    zone: 'UT'
  },
  {
    code: 'CH',
    name: 'Chandigarh',
    nativeName: 'ਚੰਡੀਗੜ੍ਹ / चंडीगढ़',
    spokenKeywords: ['chandigarh', 'ਚੰਡੀਗੜ੍ਹ'],
    recommendedLanguages: ['pa', 'hi', 'en'],
    zone: 'UT'
  },
  {
    code: 'PY',
    name: 'Puducherry',
    nativeName: 'புதுச்சேரி',
    spokenKeywords: ['puducherry', 'pondicherry', 'புதுச்சேரி'],
    recommendedLanguages: ['ta', 'en', 'te', 'ml'],
    zone: 'UT'
  },
  {
    code: 'AN',
    name: 'Andaman & Nicobar Islands',
    nativeName: 'अंडमान और निकोबार',
    spokenKeywords: ['andaman', 'nicobar', 'port blair'],
    recommendedLanguages: ['hi', 'en', 'bn', 'ta', 'te'],
    zone: 'UT'
  },
  {
    code: 'DN',
    name: 'Dadra & Nagar Haveli and Daman & Diu',
    nativeName: 'दादरा और नगर हवेली',
    spokenKeywords: ['daman', 'diu', 'dadra', 'nagar haveli'],
    recommendedLanguages: ['gu', 'hi', 'en', 'mr'],
    zone: 'UT'
  },
  {
    code: 'LD',
    name: 'Lakshadweep',
    nativeName: 'ലക്ഷദ്വീപ്',
    spokenKeywords: ['lakshadweep', 'kavaratti'],
    recommendedLanguages: ['ml', 'en'],
    zone: 'UT'
  }
];

// ==========================================================
// VOICE & MATCHING HELPER FUNCTIONS
// ==========================================================

/**
 * Match a spoken query string to an Indian state using exact keywords or fuzzy includes.
 */
export function matchStateFromSpeech(transcript: string): IndianState | null {
  if (!transcript) return null;
  const clean = transcript.toLowerCase().trim();

  // Exact or keyword match
  for (const st of ALL_INDIAN_STATES) {
    if (st.name.toLowerCase() === clean || st.nativeName.toLowerCase() === clean) {
      return st;
    }
    for (const kw of st.spokenKeywords) {
      if (clean.includes(kw.toLowerCase())) {
        return st;
      }
    }
  }
  return null;
}

/**
 * Match a spoken query string to a LanguageCode using native, English, and phonetic synonyms.
 */
export function matchLanguageFromSpeech(transcript: string): LanguageMetadata | null {
  if (!transcript) return null;
  const clean = transcript.toLowerCase().trim();

  for (const key of Object.keys(ALL_INDIAN_LANGUAGES) as LanguageCode[]) {
    const lang = ALL_INDIAN_LANGUAGES[key];
    if (
      clean === lang.code.toLowerCase() ||
      clean === lang.englishName.toLowerCase() ||
      clean === lang.nativeName.toLowerCase() ||
      clean.includes(lang.englishName.toLowerCase()) ||
      clean.includes(lang.nativeName.toLowerCase())
    ) {
      return lang;
    }
    for (const kw of lang.spokenKeywords) {
      if (clean.includes(kw.toLowerCase())) {
        return lang;
      }
    }
  }
  return null;
}

/**
 * Get recommended LanguageMetadata array for a given state code or name
 */
export function getRecommendedLanguagesForState(stateCodeOrName: string): LanguageMetadata[] {
  const state = ALL_INDIAN_STATES.find(
    (s) =>
      s.code.toLowerCase() === stateCodeOrName.toLowerCase() ||
      s.name.toLowerCase() === stateCodeOrName.toLowerCase()
  );

  if (!state) {
    return [ALL_INDIAN_LANGUAGES.en, ALL_INDIAN_LANGUAGES.hi, ALL_INDIAN_LANGUAGES.te];
  }

  const recs: LanguageMetadata[] = [];
  for (const code of state.recommendedLanguages) {
    if (ALL_INDIAN_LANGUAGES[code]) {
      recs.push(ALL_INDIAN_LANGUAGES[code]);
    }
  }

  // Ensure English and Hindi are always available in recommendations if not already present
  if (!recs.some((l) => l.code === 'en')) recs.push(ALL_INDIAN_LANGUAGES.en);
  if (!recs.some((l) => l.code === 'hi')) recs.push(ALL_INDIAN_LANGUAGES.hi);

  return recs;
}
