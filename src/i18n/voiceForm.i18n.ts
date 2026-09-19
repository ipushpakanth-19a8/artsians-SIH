import { LanguageCode } from '../types';

export interface VoiceFormFieldConfig {
  key: 'product_name' | 'category' | 'color' | 'address' | 'quantity' | 'description' | 'material' | 'price' | 'short_description';
  label: string;
  type: 'text' | 'number';
  placeholder: string;
}

export interface VoiceFormFieldItem {
  label: string;
  askPrompt: string;
  confirmPrompt: (v: string) => string;
}

export interface VoiceFormTranslations {
  fields: {
    product_name?: VoiceFormFieldItem;
    category?: VoiceFormFieldItem;
    color?: VoiceFormFieldItem;
    address?: VoiceFormFieldItem;
    quantity?: VoiceFormFieldItem;
    description?: VoiceFormFieldItem;
    material?: VoiceFormFieldItem;
    price?: VoiceFormFieldItem;
    short_description?: VoiceFormFieldItem;
    [key: string]: VoiceFormFieldItem | undefined;
  };
  readbackPrompt: (v: string) => string;
  sayYesOrNo: string;
  repeatPrompt: string;
  goBackPrompt: string;
  finalSummaryPrompt: (summary: string) => string;
  savedMessage: string;
  photoReadError: string;
  micDeniedMessage: string;
  yesButton: string;
  noButton: string;
  listening: string;
  speaking: string;
  typeOrSpeakNotice: string;
  stepIndicator: (current: number, total: number) => string;
}

export const MULTILINGUAL_YES_WORDS: Record<string, string[]> = {
  en: ['yes', 'yeah', 'yep', 'correct', 'right', 'sure', 'true', 'ok', 'okay', 'save', 'confirm'],
  hi: ['हाँ', 'हा', 'सही', 'ठीक', 'ठीक है', 'सत्य', 'पुष्टि', 'सहेजें', 'haan', 'ha', 'sahi', 'theek hai', 'theek', 'yes'],
  te: ['అవును', 'సరి', 'సరే', 'కరెక్ట్', 'బాగుంది', 'నిజం', 'avunu', 'sari', 'sare', 'correct', 'yes'],
  ta: ['ஆம்', 'சரி', 'உண்மை', 'நன்று', 'aam', 'sari', 'correct', 'yes'],
  bn: ['হ্যাঁ', 'হ্যা', 'ঠিক', 'সঠিক', 'হাঁ', 'haan', 'thik', 'sothik', 'yes'],
  mr: ['हो', 'होय', 'बरोबर', 'योग्य', 'ho', 'hoy', 'barobar', 'theek', 'yes'],
  kn: ['ಹೌದು', 'ಸರಿ', 'ಹೌದು ಸರಿ', 'hodu', 'howdu', 'sari', 'yes'],
  ml: ['അതെ', 'ശരി', 'athe', 'shari', 'yes'],
  gu: ['હા', 'સાચું', 'બરાબર', 'ha', 'sachu', 'barabar', 'yes'],
  or: ['ହଁ', 'ଠିକ୍', 'ସତ', 'haan', 'thik', 'yes'],
  pa: ['ਹਾਂ', 'ਸਹੀ', 'ਠੀਕ', 'haan', 'sahi', 'thik', 'yes'],
  as: ['হয়', 'ঠিক', 'হাঁ', 'hoy', 'thik', 'yes'],
};

export const MULTILINGUAL_NO_WORDS: Record<string, string[]> = {
  en: ['no', 'nope', 'wrong', 'incorrect', 'false', 'change', 'retry', 'cancel'],
  hi: ['नहीं', 'नही', 'ना', 'गलत', 'अशुद्ध', 'बदलो', 'nahi', 'nahin', 'na', 'galat', 'no'],
  te: ['కాదు', 'వద్దు', 'తప్పు', 'సరికాదు', 'మార్చండి', 'kaadu', 'vaddu', 'tappu', 'no'],
  ta: ['இல்லை', 'தவறு', 'வேண்டாம்', 'மாற்று', 'illai', 'thavaru', 'vendaam', 'no'],
  bn: ['না', 'ভুল', 'নয়', 'পরিবর্তন', 'na', 'bhul', 'noy', 'no'],
  mr: ['नाही', 'ना', 'चूक', 'नको', 'बदला', 'nahi', 'na', 'chook', 'nako', 'no'],
  kn: ['ಇಲ್ಲ', 'ತಪ್ಪು', 'ಬೇಡ', 'ಬದಲಾಯಿಸಿ', 'illa', 'tappu', 'beda', 'no'],
  ml: ['അല്ല', 'തെറ്റ്', 'വേണ്ട', 'alla', 'thettu', 'venda', 'no'],
  gu: ['ના', 'ખોટું', 'નથી', 'બદલો', 'na', 'khotu', 'nathi', 'no'],
  or: ['ନା', 'ଭୁଲ୍', 'ନୁହେଁ', 'na', 'bhul', 'no'],
  pa: ['ਨਹੀਂ', 'ਗਲਤ', 'ਨਾ', 'nahi', 'galat', 'na', 'no'],
  as: ['নহয়', 'ভুল', 'না', 'nohoy', 'bhul', 'na', 'no'],
};

export const MULTILINGUAL_REPEAT_WORDS: Record<string, string[]> = {
  en: ['repeat', 'again', 'say again', 'pardon'],
  hi: ['फिर से', 'दोबारा', 'फिर बोलो', 'phir se', 'dobara', 'repeat'],
  te: ['మళ్ళీ', 'మరోసారి', 'మళ్ళీ చెప్పండి', 'malli', 'marosari', 'repeat'],
  ta: ['மீண்டும்', 'மறுபடி', 'திரும்பச் சொல்', 'meendum', 'marubadi', 'repeat'],
  bn: ['আবার', 'পুনরায়', 'আবার বলুন', 'abar', 'repeat'],
  mr: ['पुन्हा', 'परत सांगा', 'punha', 'repeat'],
  kn: ['ಮತ್ತೆ', 'ಇನ್ನೊಮ್ಮೆ', 'ಮತ್ತೆ ಹೇಳಿ', 'matte', 'innomme', 'repeat'],
  ml: ['വീണ്ടും', 'ഒന്നുകൂടി', 'veendum', 'repeat'],
  gu: ['ફરીથી', 'ફરી બોલો', 'farithi', 'repeat'],
  or: ['ପୁଣିଥରେ', 'ଆଉଥରେ କୁହନ୍ତୁ', 'punithare', 'repeat'],
  pa: ['ਦੁਬਾਰਾ', 'ਮੁੜ ਕੇ', 'dubara', 'repeat'],
  as: ['আকৌ', 'পুনৰ কওক', 'akou', 'repeat'],
};

export const MULTILINGUAL_GO_BACK_WORDS: Record<string, string[]> = {
  en: ['go back', 'back', 'previous', 'return'],
  hi: ['पीछे जाओ', 'पीछे', 'पिछला', 'peeche', 'wapas', 'go back'],
  te: ['వెనక్కి', 'వెనుకకు', 'మునుపటిది', 'venakki', 'venukaku', 'go back'],
  ta: ['பின்னே செல்', 'முந்தையது', 'பின்னால்', 'pinne', 'go back'],
  bn: ['পিছনে', 'পূর্ববর্তী', 'pichone', 'go back'],
  mr: ['मागे जा', 'मागे', 'mage', 'go back'],
  kn: ['ಹಿಂದೆ ಹೋಗಿ', 'ಹಿಂದೆ', 'hinde', 'go back'],
  ml: ['പുറകോട്ട്', 'മുമ്പത്തെ', 'purakottu', 'go back'],
  gu: ['પાછા જાઓ', 'પાછળ', 'pacha', 'go back'],
  or: ['ପଛକୁ ଯାଆନ୍ତୁ', 'ପୂର୍ବବର୍ତ୍ତୀ', 'pachaku', 'go back'],
  pa: ['ਪਿੱਛੇ ਜਾਓ', 'ਪਿੱਛੇ', 'pichhe', 'go back'],
  as: ['পিছলৈ যাওক', 'আগৰটো', 'pisholoi', 'go back'],
};

export const VOICE_FORM_I18N: Record<LanguageCode, VoiceFormTranslations> = {
  en: {
    fields: {
      product_name: {
        label: 'Product Name',
        askPrompt: 'What is the name of this product?',
        confirmPrompt: (v) => `I see this is ${v}. Is that correct?`,
      },
      category: {
        label: 'Category',
        askPrompt: 'What craft category does this belong to, such as pottery, handloom, or woodcraft?',
        confirmPrompt: (v) => `The category is set to ${v}. Is that correct?`,
      },
      color: {
        label: 'Color of Product',
        askPrompt: 'What is the color of your handicraft?',
        confirmPrompt: (v) => `The color is ${v}. Is that correct?`,
      },
      address: {
        label: 'Address / Craft Location',
        askPrompt: 'What is the address or crafting location of this handicraft?',
        confirmPrompt: (v) => `Craft address is ${v}. Is that correct?`,
      },
      description: {
        label: 'Description',
        askPrompt: 'Please give a short one-sentence description of your craft.',
        confirmPrompt: (v) => `Description is: ${v}. Is that correct?`,
      },
      material: {
        label: 'Material',
        askPrompt: 'What authentic material is this product made of?',
        confirmPrompt: (v) => `The material is ${v}. Is that correct?`,
      },
      price: {
        label: 'Price (₹)',
        askPrompt: 'What is your selling price in rupees?',
        confirmPrompt: (v) => `The price is set to ₹${v}. Is that correct?`,
      },
      quantity: {
        label: 'Quantity Available',
        askPrompt: 'How many items of this product do you have ready to sell?',
        confirmPrompt: (v) => `The quantity available is ${v}. Is that correct?`,
      },
      short_description: {
        label: 'Short Description',
        askPrompt: 'Please give a short one-sentence description of your craft.',
        confirmPrompt: (v) => `Description is: ${v}. Is that correct?`,
      },
    },
    readbackPrompt: (v) => `I heard: ${v}. Is that correct?`,
    sayYesOrNo: 'Please say YES to confirm, or NO to change.',
    repeatPrompt: 'Repeating the question.',
    goBackPrompt: 'Going back to previous question.',
    finalSummaryPrompt: (summary) => `Here is the summary: ${summary}. Should I save this product?`,
    savedMessage: 'Product details confirmed and saved successfully.',
    photoReadError: "Couldn't read the photo, let's fill the details by voice instead.",
    micDeniedMessage: 'Microphone permission denied. You can tap the buttons or type manually.',
    yesButton: 'Yes, Correct',
    noButton: 'No, Change',
    listening: 'Listening to your voice...',
    speaking: 'Speaking...',
    typeOrSpeakNotice: 'Speak into microphone or edit by typing directly.',
    stepIndicator: (c, t) => `Field ${c} of ${t}`,
  },
  hi: {
    fields: {
      product_name: {
        label: 'उत्पाद का नाम',
        askPrompt: 'इस उत्पाद का नाम क्या है?',
        confirmPrompt: (v) => `मैंने पहचाना है कि यह ${v} है। क्या यह सही है?`,
      },
      category: {
        label: 'शिल्प श्रेणी',
        askPrompt: 'यह किस शिल्प श्रेणी में आता है, जैसे हथकरघा, मिट्टी का काम, या काष्ठ शिल्प?',
        confirmPrompt: (v) => `श्रेणी ${v} रखी गई है। क्या यह सही है?`,
      },
      color: {
        label: 'हस्तशिल्प का रंग',
        askPrompt: 'आपके हस्तशिल्प का मुख्य रंग क्या है?',
        confirmPrompt: (v) => `रंग ${v} है। क्या यह सही है?`,
      },
      address: {
        label: 'निर्माण स्थान / पता',
        askPrompt: 'इस हस्तशिल्प का निर्माण स्थान या पता क्या है?',
        confirmPrompt: (v) => `स्थान का पता ${v} है। क्या यह सही है?`,
      },
      quantity: {
        label: 'उपलब्ध संख्या',
        askPrompt: 'बिक्री के लिए आपके पास इस उत्पाद के कितने नग उपलब्ध हैं?',
        confirmPrompt: (v) => `उपलब्ध संख्या ${v} है। क्या यह सही है?`,
      },
      description: {
        label: 'संक्षिप्त विवरण',
        askPrompt: 'कृपया अपने हस्तशिल्प के बारे में एक छोटा विवरण बताएं।',
        confirmPrompt: (v) => `विवरण है: ${v}। क्या यह सही है?`,
      },
      material: {
        label: 'सामग्री',
        askPrompt: 'यह उत्पाद किस प्राकृतिक या पारंपरिक सामग्री से बना है?',
        confirmPrompt: (v) => `सामग्री ${v} है। क्या यह सही है?`,
      },
      price: {
        label: 'मूल्य (₹)',
        askPrompt: 'आपकी बिक्री का मूल्य रुपयों में कितना है?',
        confirmPrompt: (v) => `मूल्य ₹${v} तय किया गया है। क्या यह सही है?`,
      },
      short_description: {
        label: 'संक्षिप्त विवरण',
        askPrompt: 'कृपया अपने उत्पाद के बारे में एक छोटा विवरण बताएं।',
        confirmPrompt: (v) => `विवरण है: ${v}। क्या यह सही है?`,
      },
    },
    readbackPrompt: (v) => `मैंने सुना: ${v}। क्या यह सही है?`,
    sayYesOrNo: 'कृपया हाँ या नहीं बोलें।',
    repeatPrompt: 'प्रश्न दोहराया जा रहा है।',
    goBackPrompt: 'पिछले प्रश्न पर वापस जा रहे हैं।',
    finalSummaryPrompt: (summary) => `उत्पाद का विवरण: ${summary}। क्या मैं इस उत्पाद को सहेज लूँ?`,
    savedMessage: 'उत्पाद विवरण की पुष्टि हो गई और सफलतापूर्वक सहेज लिया गया।',
    photoReadError: 'तस्वीर को पढ़ा नहीं जा सका, आइए आवाज़ से विवरण भरते हैं।',
    micDeniedMessage: 'माइक्रोफ़ोन की अनुमति अस्वीकृत है। आप बटन दबाकर या लिखकर आगे बढ़ सकते हैं।',
    yesButton: 'हाँ, सही है',
    noButton: 'नहीं, बदलो',
    listening: 'आपकी आवाज़ सुन रहे हैं...',
    speaking: 'बोल रहे हैं...',
    typeOrSpeakNotice: 'माइक में बोलें या सीधे लिखकर बदलें।',
    stepIndicator: (c, t) => `फ़ील्ड ${c} / ${t}`,
  },
  te: {
    fields: {
      product_name: {
        label: 'ఉత్పత్తి పేరు',
        askPrompt: 'ఈ ఉత్పత్తి పేరు ఏమిటి?',
        confirmPrompt: (v) => `ఇది ${v} అని గుర్తించాను. ఇది సరిగ్గానే ఉందా?`,
      },
      category: {
        label: 'కళా విభాగం',
        askPrompt: 'ఇది ఏ హస్తకళ విభాగానికి చెందుతుంది? ఉదాహరణకు చేనేత, మట్టి పాత్రలు, లేదా చెక్క బొమ్మలు?',
        confirmPrompt: (v) => `విభాగం ${v} గా ఉంది. ఇది సరైనదేనా?`,
      },
      color: {
        label: 'రంగు',
        askPrompt: 'మీ హస్తకళ యొక్క రంగు ఏమిటి?',
        confirmPrompt: (v) => `రంగు ${v} అని నమోదయింది. ఇది సరిగ్గానే ఉందా?`,
      },
      address: {
        label: 'చిరునామా / ప్రాంతం',
        askPrompt: 'ఈ చేతివృత్తి తయారీ చిరునామా లేదా ప్రాంతం ఏమిటి?',
        confirmPrompt: (v) => `చిరునామా ${v} అని నమోదయింది. ఇది సరిగ్గానే ఉందా?`,
      },
      quantity: {
        label: 'అందుబాటులో ఉన్న సంఖ్య',
        askPrompt: 'మీ దగ్గర అమ్మకానికి ఎన్ని వస్తువులు సిద్ధంగా ఉన్నాయి?',
        confirmPrompt: (v) => `అందుబాటులో ఉన్న సంఖ్య ${v}. ఇది సరైనదేనా?`,
      },
      description: {
        label: 'చిన్న వివరణ',
        askPrompt: 'దయచేసి మీ కళారూపం గురించి చిన్న వివరణ ఇవ్వండి.',
        confirmPrompt: (v) => `వివరణ: ${v}. ఇది సరిగ్గానే ఉందా?`,
      },
      material: {
        label: 'పదార్థం / సామగ్రి',
        askPrompt: 'ఈ ఉత్పత్తి ఏ సహజ పదార్థంతో తయారు చేయబడింది?',
        confirmPrompt: (v) => `పదార్థం ${v} అని గుర్తించాను. ఇది సరిగ్గానే ఉందా?`,
      },
      price: {
        label: 'ధర (₹)',
        askPrompt: 'ఈ ఉత్పత్తి అమ్మకపు ధర రూపాయలలో ఎంత?',
        confirmPrompt: (v) => `ధర ₹${v} గా నిర్ణయించబడింది. ఇది సరిగ్గానే ఉందా?`,
      },
      short_description: {
        label: 'చిన్న వివరణ',
        askPrompt: 'దయచేసి మీ కళారూపం గురించి ఒక చిన్న వాక్యం చెప్పండి.',
        confirmPrompt: (v) => `వివరణ: ${v}. ఇది సరిగ్గానే ఉందా?`,
      },
    },
    readbackPrompt: (v) => `మీరు చెప్పింది: ${v}. ఇది సరైనదేనా?`,
    sayYesOrNo: 'దయచేసి అవును లేదా కాదు అని చెప్పండి.',
    repeatPrompt: 'ప్రశ్నను మళ్ళీ అడుగుతున్నాను.',
    goBackPrompt: 'మునుపటి ప్రశ్నకు వెళ్తున్నాము.',
    finalSummaryPrompt: (summary) => `మొత్తం వివరాలు: ${summary}. ఈ ఉత్పత్తిని సేవ్ చేయమంటారా?`,
    savedMessage: 'ఉత్పత్తి వివరాలు విజయవంతంగా భద్రపరచబడ్డాయి.',
    photoReadError: 'ఫోటోను గుర్తించలేకపోయాము, వాయిస్ ద్వారా వివరాలను పూరిద్దాం.',
    micDeniedMessage: 'మైక్రోఫోన్ అనుమతి నిరాకరించబడింది. బటన్ నొక్కడం లేదా టైప్ చేయడం ద్వారా కొనసాగవచ్చు.',
    yesButton: 'అవును, సరిగ్గానే ఉంది',
    noButton: 'కాదు, మార్చండి',
    listening: 'మీ మాటలను వింటున్నాము...',
    speaking: 'మాట్లాడుతున్నాము...',
    typeOrSpeakNotice: 'మైక్ ద్వారా చెప్పండి లేదా నేరుగా టైప్ చేయండి.',
    stepIndicator: (c, t) => `అంశం ${c} / ${t}`,
  },
  ta: {
    fields: {
      product_name: {
        label: 'பொருளின் பெயர்',
        askPrompt: 'இந்த கைவினைப் பொருளின் பெயர் என்ன?',
        confirmPrompt: (v) => `இது ${v} என அறிந்துகொண்டேன். இது சரியானதா?`,
      },
      category: {
        label: 'பிரிவு',
        askPrompt: 'இது எந்தக் கைவினைப் பிரிவைச் சேர்ந்தது? கைத்தறி, மட்பாண்டம் அல்லது மர வேலைப்பாடா?',
        confirmPrompt: (v) => `பிரிவு ${v} என உள்ளது. சரியானதா?`,
      },
      material: {
        label: 'பயன்படுத்திய மூலப்பொருள்',
        askPrompt: 'இது எந்த இயற்கை மூலப்பொருளால் செய்யப்பட்டது?',
        confirmPrompt: (v) => `மூலப்பொருள் ${v}. இது சரியானதா?`,
      },
      price: {
        label: 'விலை (₹)',
        askPrompt: 'இதன் விற்பனை விலை ரூபாய் மதிப்பில் எவ்வளவு?',
        confirmPrompt: (v) => `விலை ₹${v} என குறிப்பிடப்பட்டுள்ளது. சரியானதா?`,
      },
      quantity: {
        label: 'கையிருப்பு எண்ணிக்கை',
        askPrompt: 'விற்பனைக்கு உங்களிடம் எத்தனை பொருட்கள் தயாராக உள்ளன?',
        confirmPrompt: (v) => `கையிருப்பு எண்ணிக்கை ${v}. சரியானதா?`,
      },
      short_description: {
        label: 'சுருக்கமான விளக்கம்',
        askPrompt: 'உங்கள் கைவினைப் பொருள் பற்றி ஒரு சிறிய விளக்கம் கூறுங்கள்.',
        confirmPrompt: (v) => `விளக்கம்: ${v}. சரியானதா?`,
      },
    },
    readbackPrompt: (v) => `நீங்கள் கூறியது: ${v}. இது சரியானதா?`,
    sayYesOrNo: 'தயவுசெய்து ஆம் அல்லது இல்லை என்று கூறவும்.',
    repeatPrompt: 'கேள்வி மீண்டும் கேட்கப்படுகிறது.',
    goBackPrompt: 'முந்தைய கேள்விக்குத் திரும்புகிறோம்.',
    finalSummaryPrompt: (summary) => `முழு விவரம்: ${summary}. இந்தப் பொருளைச் சேமிக்கலாமா?`,
    savedMessage: 'பொருள் விவரங்கள் வெற்றிகரமாகச் சேமிக்கப்பட்டன.',
    photoReadError: 'புகைப்படத்தை படிக்க முடியவில்லை, குரல் வழி விவரங்களை நிரப்புவோம்.',
    micDeniedMessage: 'மைக் அனுமதி மறுக்கப்பட்டது. தட்டச்சு செய்து தொடரலாம்.',
    yesButton: 'ஆம், சரி',
    noButton: 'இல்லை, மாற்று',
    listening: 'கேட்கிறது...',
    speaking: 'பேசுகிறது...',
    typeOrSpeakNotice: 'குரல் மூலமாகவோ தட்டச்சு செய்தோ நிரப்பலாம்.',
    stepIndicator: (c, t) => `படி ${c} / ${t}`,
  },
  bn: {
    fields: {
      product_name: {
        label: 'পণ্যের নাম',
        askPrompt: 'এই পণ্যের নাম কী?',
        confirmPrompt: (v) => `আমি বুঝতে পারছি এটি ${v}। এটি কি সঠিক?`,
      },
      category: {
        label: 'বিভাগ',
        askPrompt: 'এটি কোন ধরনের হস্তশিল্প বিভাগ?',
        confirmPrompt: (v) => `বিভাগ ${v} দেওয়া হয়েছে। এটি কি সঠিক?`,
      },
      material: {
        label: 'উপাদান',
        askPrompt: 'এই পণ্যটি কী উপাদান দিয়ে তৈরি?',
        confirmPrompt: (v) => `উপাদান ${v}। এটি কি সঠিক?`,
      },
      price: {
        label: 'মূল্য (₹)',
        askPrompt: 'টাকায় এর বিক্রয় মূল্য কত?',
        confirmPrompt: (v) => `মূল্য ₹${v} ধরা হয়েছে। এটি কি সঠিক?`,
      },
      quantity: {
        label: 'উপলব্ধ সংখ্যা',
        askPrompt: 'বিক্রয়ের জন্য আপনার কাছে কয়টি পণ্য আছে?',
        confirmPrompt: (v) => `সংখ্যা ${v}। এটি কি সঠিক?`,
      },
      short_description: {
        label: 'সংক্ষিপ্ত বিবরণ',
        askPrompt: 'আপনার পণ্য সম্পর্কে একটি ছোট বিবরণ দিন।',
        confirmPrompt: (v) => `বিবরণ: ${v}। এটি কি সঠিক?`,
      },
    },
    readbackPrompt: (v) => `আমি শুনেছি: ${v}। এটি কি সঠিক?`,
    sayYesOrNo: 'অনুগ্রহ করে হ্যাঁ বা না বলুন।',
    repeatPrompt: 'প্রশ্নটি আবার করা হচ্ছে।',
    goBackPrompt: 'আগের প্রশ্নে ফিরে যাচ্ছি।',
    finalSummaryPrompt: (summary) => `বিবরণ: ${summary}। এই পণ্যটি কি সংরক্ষণ করব?`,
    savedMessage: 'পণ্যের বিবরণ সফলভাবে সংরক্ষণ করা হয়েছে।',
    photoReadError: 'ছবি পড়া যায়নি, আসুন কণ্ঠস্বরের মাধ্যমে তথ্য পূরণ করি।',
    micDeniedMessage: 'মাইক্রোফোন অনুমতি মেলেনি। লিখে পূরণ করুন।',
    yesButton: 'হ্যাঁ, ঠিক',
    noButton: 'না, বদলান',
    listening: 'শুনছি...',
    speaking: 'বলছি...',
    typeOrSpeakNotice: 'মুখে বলুন বা টাইপ করুন।',
    stepIndicator: (c, t) => `পদক্ষেপ ${c} / ${t}`,
  },
  mr: {
    fields: {
      product_name: {
        label: 'उत्पादनाचे नाव',
        askPrompt: 'या उत्पादनाचे नाव काय आहे?',
        confirmPrompt: (v) => `मी ओळखले आहे की हे ${v} आहे. हे बरोबर आहे का?`,
      },
      category: {
        label: 'प्रवर्ग',
        askPrompt: 'हे कोणत्या हस्तकला प्रवर्गात येते?',
        confirmPrompt: (v) => `प्रवर्ग ${v} आहे. हे बरोबर आहे का?`,
      },
      material: {
        label: 'साहित्य',
        askPrompt: 'हे उत्पादन कोणत्या साहित्यापासून बनवले आहे?',
        confirmPrompt: (v) => `साहित्य ${v} आहे. हे बरोबर आहे का?`,
      },
      price: {
        label: 'किंमत (₹)',
        askPrompt: 'याची विक्री किंमत रुपयांमध्ये किती आहे?',
        confirmPrompt: (v) => `किंमत ₹${v} आहे. हे बरोबर आहे का?`,
      },
      quantity: {
        label: 'उपलब्ध नग',
        askPrompt: 'तुमच्याकडे किती नग विक्रीसाठी तयार आहेत?',
        confirmPrompt: (v) => `उपलब्ध नग ${v} आहेत. हे बरोबर आहे का?`,
      },
      short_description: {
        label: 'थोडक्यात माहिती',
        askPrompt: 'कृपया उत्पादनाची एक ओळ माहिती सांगा.',
        confirmPrompt: (v) => `माहिती: ${v}. हे बरोबर आहे का?`,
      },
    },
    readbackPrompt: (v) => `मी ऐकले: ${v}. हे बरोबर आहे का?`,
    sayYesOrNo: 'कृपया हो किंवा नाही म्हणा.',
    repeatPrompt: 'प्रश्न पुन्हा विचारत आहे.',
    goBackPrompt: 'मागील प्रश्नावर जात आहोत.',
    finalSummaryPrompt: (summary) => `माहिती: ${summary}. हे उत्पादन सेव्ह करू का?`,
    savedMessage: 'उत्पादनाची माहिती यशस्वीरीत्या सेव्ह केली.',
    photoReadError: 'फोटो वाचता आला नाही, चला आवाजाद्वारे माहिती भरूया.',
    micDeniedMessage: 'माइक परवानगी नाकारली आहे. टाइप करून भरा.',
    yesButton: 'हो, बरोबर',
    noButton: 'नाही, बदला',
    listening: 'ऐकत आहे...',
    speaking: 'बोलत आहे...',
    typeOrSpeakNotice: 'माइकद्वारे बोला किंवा टाइप करा.',
    stepIndicator: (c, t) => `रकाना ${c} / ${t}`,
  },
  kn: {
    fields: {
      product_name: {
        label: 'ಉತ್ಪನ್ನದ ಹೆಸರು',
        askPrompt: 'ಈ ಉತ್ಪನ್ನದ ಹೆಸರೇನು?',
        confirmPrompt: (v) => `ಇದು ${v} ಎಂದು ಗುರುತಿಸಿದ್ದೇನೆ. ಇದು ಸರಿಯೇ?`,
      },
      category: {
        label: 'ವರ್ಗ',
        askPrompt: 'ಇದು ಯಾವ ಕರಕುಶಲ ವರ್ಗಕ್ಕೆ ಸೇರುತ್ತದೆ?',
        confirmPrompt: (v) => `ವರ್ಗ ${v} ಆಗಿದೆ. ಇದು ಸರಿಯೇ?`,
      },
      material: {
        label: 'ವಸ್ತು / ಸಾಮಗ್ರಿ',
        askPrompt: 'ಇದು ಯಾವ ನೈಸರ್ಗಿಕ ವಸ್ತುಗಳಿಂದ ತಯಾರಾಗಿದೆ?',
        confirmPrompt: (v) => `ವಸ್ತು ${v} ಆಗಿದೆ. ಇದು ಸರಿಯೇ?`,
      },
      price: {
        label: 'ಬೆಲೆ (₹)',
        askPrompt: 'ಇದರ ಮಾರಾಟ ಬೆಲೆ ರೂಪಾಯಿಗಳಲ್ಲಿ ಎಷ್ಟು?',
        confirmPrompt: (v) => `ಬೆಲೆ ₹${v} ನಿಗದಿಪಡಿಸಲಾಗಿದೆ. ಇದು ಸರಿಯೇ?`,
      },
      quantity: {
        label: 'ಲಭ್ಯವಿರುವ ಪ್ರಮಾಣ',
        askPrompt: 'ಮಾರಾಟಕ್ಕೆ ಎಷ್ಟು ಪ್ರಮಾಣ ಲಭ್ಯವಿದೆ?',
        confirmPrompt: (v) => `ಲಭ್ಯವಿರುವ ಪ್ರಮಾಣ ${v}. ಇದು ಸರಿಯೇ?`,
      },
      short_description: {
        label: 'ಸಂಕ್ಷಿಪ್ತ ವಿವರಣೆ',
        askPrompt: 'ದಯವಿಟ್ಟು ಉತ್ಪನ್ನದ ಬಗ್ಗೆ ಒಂದು ಸಣ್ಣ ವಿವರಣೆ ನೀಡಿ.',
        confirmPrompt: (v) => `ವಿವರಣೆ: ${v}. ಇದು ಸರಿಯೇ?`,
      },
    },
    readbackPrompt: (v) => `ನಾನು ಕೇಳಿದ್ದು: ${v}. ಇದು ಸರಿಯೇ?`,
    sayYesOrNo: 'ದಯವಿಟ್ಟು ಹೌದು ಅಥವಾ ಇಲ್ಲ ಎಂದು ಹೇಳಿ.',
    repeatPrompt: 'ಪ್ರಶ್ನೆಯನ್ನು ಪುನರಾವರ್ತಿಸಲಾಗುತ್ತಿದೆ.',
    goBackPrompt: 'ಹಿಂದಿನ ಪ್ರಶ್ನೆಗೆ ಹೋಗುತ್ತಿದ್ದೇವೆ.',
    finalSummaryPrompt: (summary) => `ವಿವರ: ${summary}. ಈ ಉತ್ಪನ್ನವನ್ನು ಉಳಿಸಬೇಕೇ?`,
    savedMessage: 'ಉತ್ಪನ್ನದ ವಿವರಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ.',
    photoReadError: 'ಫೋಟೋ ಓದಲಾಗಲಿಲ್ಲ, ಧ್ವನಿ ಮೂಲಕ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡೋಣ.',
    micDeniedMessage: 'ಮೈಕ್ರೋಫೋನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ಟೈಪ್ ಮಾಡುವ ಮೂಲಕ ಮುಂದುವರಿಯಿರಿ.',
    yesButton: 'ಹೌದು, ಸರಿ',
    noButton: 'ಇಲ್ಲ, ಬದಲಾಯಿಸಿ',
    listening: 'ಆಲಿಸಲಾಗುತ್ತಿದೆ...',
    speaking: 'ಮಾತನಾಡಲಾಗುತ್ತಿದೆ...',
    typeOrSpeakNotice: 'ಧ್ವನಿ ಮೂಲಕ ಹೇಳಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ.',
    stepIndicator: (c, t) => `ಹಂತ ${c} / ${t}`,
  },
  // Fallbacks for other languages using Hindi/English baseline
  ml: null as any,
  gu: null as any,
  or: null as any,
  pa: null as any,
  as: null as any,
};

// Fill in other language fallbacks cleanly
const defaultEn = VOICE_FORM_I18N.en;
(['ml', 'gu', 'or', 'pa', 'as'] as LanguageCode[]).forEach((lang) => {
  if (!VOICE_FORM_I18N[lang]) {
    VOICE_FORM_I18N[lang] = defaultEn;
  }
});

export function getVoiceFormI18n(lang: LanguageCode = 'en'): VoiceFormTranslations {
  const base = VOICE_FORM_I18N[lang] || VOICE_FORM_I18N.en;
  return new Proxy(base, {
    get(target: any, prop: string) {
      if (prop === 'fields') {
        return new Proxy(target.fields || {}, {
          get(fTarget: any, fKey: string) {
            return fTarget[fKey] || (VOICE_FORM_I18N.en.fields as any)[fKey] || {
              label: fKey,
              askPrompt: `Please provide ${fKey}`,
              confirmPrompt: (v: string) => `${fKey} is ${v}. Is that correct?`
            };
          }
        });
      }
      return target[prop] || (VOICE_FORM_I18N.en as any)[prop];
    }
  });
}
