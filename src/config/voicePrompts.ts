import { LanguageCode } from '../types';

export interface LocalizedVoicePrompts {
  welcomeState: string;
  welcomeLanguage: (stateName: string) => string;
  askPhone: string;
  confirmPhone: (phone: string) => string;
  repeatPhone: string;
  askOtp: string;
  repeatOtp: string;
  askName: string;
  repeatName: string;
  askCraft: string;
  repeatCraft: string;
  confirmSummary: (name: string, craft: string) => string;
  voiceSelectedConfirm: string;
  askProductName: string;
  askLaborHours: string;
  askMaterialCost: string;
  explainFairPrice: (price: number | string, material: number | string, laborHours: number | string, hourlyWage: number | string) => string;
  unclearSpeech: string;
}

export const VOICE_PROMPTS: Record<LanguageCode, LocalizedVoicePrompts> = {
  en: {
    welcomeState: 'Welcome to ShilpSetu. Please choose your state.',
    welcomeLanguage: (stateName) => `Please choose your language for ${stateName}.`,
    askPhone: 'Please say your mobile number.',
    confirmPhone: (phone) => `I heard ${phone}. Is this correct? Say yes or no.`,
    repeatPhone: "I didn't understand. Please say your 10-digit mobile number again.",
    askOtp: 'Please say the OTP.',
    repeatOtp: "I didn't understand. Please say the 6-digit OTP code again.",
    askName: 'Please tell me your name.',
    repeatName: "I didn't understand your name. Please say it again.",
    askCraft: 'Please tell me the name of your handicraft work.',
    repeatCraft: "I didn't understand your craft. Please say it again.",
    confirmSummary: (name, craft) => `I have your details. Your name is ${name} and your handicraft work is ${craft}. Is this correct?`,
    voiceSelectedConfirm: 'Your language has been set to English.',
    askProductName: 'What is the name of your handicraft product?',
    askLaborHours: 'How many hours did it take to make this product?',
    askMaterialCost: 'What was the raw material cost in rupees?',
    explainFairPrice: (price, material, hours, wage) =>
      `The recommended fair price for your craft is ₹${price}. This includes ₹${material} for raw materials and ${hours} hours of skilled labor at ₹${wage} per hour plus artisan contingency.`,
    unclearSpeech: "I didn't understand. Please say it again."
  },
  hi: {
    welcomeState: 'ShilpSetu में आपका स्वागत है। कृपया अपना राज्य चुनें।',
    welcomeLanguage: (stateName) => `${stateName} के लिए अपनी भाषा चुनें।`,
    askPhone: 'कृपया अपना मोबाइल नंबर बोलें।',
    confirmPhone: (phone) => `मैंने सुना ${phone}। क्या यह सही है? हाँ या ना कहें।`,
    repeatPhone: 'मुझे पूरा नंबर समझ नहीं आया। कृपया 10 अंकों का मोबाइल नंबर दोबारा बोलें।',
    askOtp: 'कृपया ओटीपी बोलें।',
    repeatOtp: 'मुझे ओटीपी समझ नहीं आया। कृपया 6 अंकों का ओटीपी दोबारा बोलें।',
    askName: 'कृपया अपना नाम बताएं।',
    repeatName: 'मुझे आपका नाम समझ नहीं आया। कृपया दोबारा बोलें।',
    askCraft: 'कृपया अपने हस्तशिल्प कार्य का नाम बताएं।',
    repeatCraft: 'मुझे आपके शिल्प का नाम समझ नहीं आया। कृपया दोबारा बोलें।',
    confirmSummary: (name, craft) => `आपका नाम ${name} है और आपका शिल्प ${craft} है। क्या यह सही है?`,
    voiceSelectedConfirm: 'आपकी भाषा हिंदी चुनी गई है।',
    askProductName: 'आपके हस्तशिल्प उत्पाद का नाम क्या है?',
    askLaborHours: 'इस उत्पाद को बनाने में कितने घंटे लगे?',
    askMaterialCost: 'कच्चे माल की लागत कितनी है?',
    explainFairPrice: (price, material, hours, wage) =>
      `आपके उत्पाद की अनुशंसित उचित कीमत ₹${price} है। इसमें ₹${material} कच्चा माल और ${hours} घंटे की कुशल मजदूरी शामिल है।`,
    unclearSpeech: 'मुझे समझ नहीं आया। कृपया दोबारा बोलें।'
  },
  te: {
    welcomeState: 'ShilpSetu కు స్వాగతం. దయచేసి మీ రాష్ట్రాన్ని ఎంచుకోండి.',
    welcomeLanguage: (stateName) => `${stateName} కొరకు దయచేసి మీ భాషను ఎంచుకోండి.`,
    askPhone: 'దయచేసి మీ మొబైల్ నంబర్ చెప్పండి.',
    confirmPhone: (phone) => `నేను ${phone} అని విన్నాను. ఇది సరైనదేనా? అవును లేదా కాదు అని చెప్పండి.`,
    repeatPhone: 'పూర్తి నంబర్ అర్థం కాలేదు. దయచేసి 10 అంకెల మొబైల్ నంబర్ మళ్ళీ చెప్పండి.',
    askOtp: 'దయచేసి ఓటీపీ చెప్పండి.',
    repeatOtp: 'ఓటీపీ అర్థం కాలేదు. దయచేసి 6 అంకెల ఓటీపీ మళ్ళీ చెప్పండి.',
    askName: 'దయచేసి మీ పేరు చెప్పండి.',
    repeatName: 'మీ పేరు అర్థం కాలేదు. దయచేసి మళ్ళీ చెప్పండి.',
    askCraft: 'మీరు చేసే హస్తకళ పని పేరు చెప్పండి.',
    repeatCraft: 'మీ పని పేరు అర్థం కాలేదు. దయచేసి మళ్ళీ చెప్పండి.',
    confirmSummary: (name, craft) => `మీ పేరు ${name} మరియు మీ హస్తకళ పని ${craft}. ఇది సరైనదేనా?`,
    voiceSelectedConfirm: 'మీ భాష తెలుగుగా ఎంచుకోబడింది.',
    askProductName: 'మీ హస్తకళ ఉత్పత్తి పేరు ఏమిటి?',
    askLaborHours: 'ఈ ఉత్పత్తిని తయారు చేయడానికి ఎన్ని గంటలు పట్టింది?',
    askMaterialCost: 'ముడి పదార్థాల ఖర్చు ఎంత?',
    explainFairPrice: (price, material, hours, wage) =>
      `మీ ఉత్పత్తికి సిఫార్సు చేయబడిన న్యాయమైన ధర ₹${price}. ఇందులో ₹${material} ముడి సరుకులు మరియు ${hours} గంటల నైపుణ్య శ్రమ వేతనం ఉన్నాయి.`,
    unclearSpeech: 'నాకు అర్థం కాలేదు. దయచేసి మళ్ళీ చెప్పండి.'
  },
  ta: {
    welcomeState: 'ShilpSetu க்கு வரவேற்கிறோம். உங்கள் மாநிலத்தைத் தேர்ந்தெடுக்கவும்.',
    welcomeLanguage: (stateName) => `${stateName} மாநிலத்திற்கான மொழியைத் தேர்ந்தெடுக்கவும்.`,
    askPhone: 'உங்கள் மொபைல் எண்ணைச் சொல்லுங்கள்.',
    confirmPhone: (phone) => `நான் கேட்ட எண் ${phone}. இது சரியானதா? ஆம் அல்லது இல்லை என்று சொல்லுங்கள்.`,
    repeatPhone: 'எண் சரியாக கேட்கவில்லை. தயவுசெய்து 10 இலக்க மொபைல் எண்ணை மீண்டும் சொல்லுங்கள்.',
    askOtp: 'OTP-ஐச் சொல்லுங்கள்.',
    repeatOtp: 'OTP சரியாக கேட்கவில்லை. தயவுசெய்து 6 இலக்க OTP-ஐ மீண்டும் சொல்லுங்கள்.',
    askName: 'உங்கள் பெயரைச் சொல்லுங்கள்.',
    repeatName: 'உங்கள் பெயர் கேட்கவில்லை. தயவுசெய்து மீண்டும் சொல்லுங்கள்.',
    askCraft: 'நீங்கள் செய்யும் கைவினைப் பணியின் பெயரைச் சொல்லுங்கள்.',
    repeatCraft: 'உங்கள் கைவினைப் பெயர் கேட்கவில்லை. தயவுசெய்து மீண்டும் சொல்லுங்கள்.',
    confirmSummary: (name, craft) => `உங்கள் பெயர் ${name}, உங்கள் கைவினைப் பணி ${craft}. இது சரியானதா?`,
    voiceSelectedConfirm: 'உங்கள் மொழி தமிழாக தேர்ந்தெடுக்கப்பட்டுள்ளது.',
    askProductName: 'உங்கள் கைவினைப் பொருளின் பெயர் என்ன?',
    askLaborHours: 'இதை செய்ய எத்தனை மணி நேரம் ஆனது?',
    askMaterialCost: 'மூலப்பொருள் செலவு எவ்வளவு?',
    explainFairPrice: (price, material, hours, wage) =>
      `உங்கள் கைவினைக்கான நியாயமான விலை ₹${price}. இதில் மூலப்பொருட்கள் ₹${material} மற்றும் ${hours} மணி நேர உழைப்பு அடங்கும்.`,
    unclearSpeech: 'புரியவில்லை. தயவுசெய்து மீண்டும் சொல்லுங்கள்.'
  },
  kn: {
    welcomeState: 'ShilpSetu ಗೆ ಸುಸ್ವಾಗತ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ರಾಜ್ಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    welcomeLanguage: (stateName) => `${stateName} ಗಾಗಿ ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.`,
    askPhone: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ಹೇಳಿ.',
    confirmPhone: (phone) => `ನಾನು ಕೇಳಿದ ಸಂಖ್ಯೆ ${phone}. ಇದು ಸರಿಯೇ? ಹೌದು ಅಥವಾ ಇಲ್ಲ ಎಂದು ಹೇಳಿ.`,
    repeatPhone: 'ಸಂಖ್ಯೆ ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು 10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ಮತ್ತೆ ಹೇಳಿ.',
    askOtp: 'ದಯವಿಟ್ಟು OTP ಹೇಳಿ.',
    repeatOtp: 'OTP ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು 6 ಅಂಕಿಯ OTP ಮತ್ತೆ ಹೇಳಿ.',
    askName: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೆಸರನ್ನು ಹೇಳಿ.',
    repeatName: 'ನಿಮ್ಮ ಹೆಸರು ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಹೇಳಿ.',
    askCraft: 'ನೀವು ಮಾಡುವ ಕರಕುಶಲ ಕೆಲಸದ ಹೆಸರನ್ನು ಹೇಳಿ.',
    repeatCraft: 'ಕೆಲಸದ ಹೆಸರು ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಹೇಳಿ.',
    confirmSummary: (name, craft) => `ನಿಮ್ಮ ಹೆಸರು ${name} ಮತ್ತು ನಿಮ್ಮ ಕರಕುಶಲ ${craft}. ಇದು ಸರಿಯೇ?`,
    voiceSelectedConfirm: 'ನಿಮ್ಮ ಭಾಷೆ ಕನ್ನಡವಾಗಿ ಆಯ್ಕೆಯಾಗಿದೆ.',
    askProductName: 'ನಿಮ್ಮ ಕರಕುಶಲ ವಸ್ತುವಿನ ಹೆಸರು ಏನು?',
    askLaborHours: 'ಇದನ್ನು ಮಾಡಲು ಎಷ್ಟು ಗಂಟೆಗಳು ಬೇಕಾಯಿತು?',
    askMaterialCost: 'ಕಚ್ಚಾ ವಸ್ತುಗಳ ವೆಚ್ಚ ಎಷ್ಟು?',
    explainFairPrice: (price, material, hours, wage) =>
      `ನಿಮ್ಮ ಕರಕುಶಲ ವಸ್ತುವಿಗೆ ಶಿಫಾರಸು ಮಾಡಿದ ನ್ಯಾಯಯುತ ಬೆಲೆ ₹${price}. ಇದರಲ್ಲಿ ₹${material} ಕಚ್ಚಾ ವಸ್ತುಗಳು ಮತ್ತು ${hours} ಗಂಟೆಗಳ ನೈಪುಣ್ಯತೆಯ ಶ್ರಮ ಸೇರಿದೆ.`,
    unclearSpeech: 'ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಪುನರಾವರ್ತಿಸಿ.'
  },
  ml: {
    welcomeState: 'ShilpSetu ലേക്ക് സ്വാഗതം. നിങ്ങളുടെ സംസ്ഥാനം തിരഞ്ഞെടുക്കുക.',
    welcomeLanguage: (stateName) => `${stateName} നായുള്ള ഭാഷ തിരഞ്ഞെടുക്കുക.`,
    askPhone: 'നിങ്ങളുടെ മൊബൈൽ നമ്പർ പറയുക.',
    confirmPhone: (phone) => `ഞാൻ കേട്ടത് ${phone} എന്നാണ്. ഇത് ശരിയാണോ? അതെ അല്ലെങ്കിൽ അല്ല എന്ന് പറയുക.`,
    repeatPhone: 'മൊബൈൽ നമ്പർ വ്യക്തമായില്ല. ദയവായി 10 അക്ക നമ്പർ വീണ്ടും പറയുക.',
    askOtp: 'ദയവായി OTP പറയുക.',
    repeatOtp: 'OTP വ്യക്തമായില്ല. ദയവായി 6 അക്ക OTP വീണ്ടും പറയുക.',
    askName: 'നിങ്ങളുടെ പേര് പറയുക.',
    repeatName: 'പേര് വ്യക്തമായില്ല. ദയവായി വീണ്ടും പറയുക.',
    askCraft: 'നിങ്ങൾ ചെയ്യുന്ന കരകൗശല ജോലിയുടെ പേര് പറയുക.',
    repeatCraft: 'ജോലിയുടെ പേര് വ്യക്തമായില്ല. ദയവായി വീണ്ടും പറയുക.',
    confirmSummary: (name, craft) => `നിങ്ങളുടെ പേര് ${name}, കരകൗശലം ${craft}. ഇത് ശരിയാണോ?`,
    voiceSelectedConfirm: 'നിങ്ങളുടെ ഭാഷ മലയാളമായി തിരഞ്ഞെടുത്തു.',
    askProductName: 'നിങ്ങളുടെ കരകൗശല ഉൽപ്പന്നത്തിന്റെ പേര് എന്താണ്?',
    askLaborHours: 'ഇത് ഉണ്ടാക്കാൻ എത്ര മണിക്കൂർ എടുത്തു?',
    askMaterialCost: 'അസംസ്കൃത വസ്തുക്കളുടെ ചെലവ് എത്രയാണ്?',
    explainFairPrice: (price, material, hours, wage) =>
      `നിങ്ങളുടെ ഉൽപ്പന്നത്തിന് ശുപാർശ ചെയ്യുന്ന ന്യായമായ വില ₹${price} ആണ്. ഇതിൽ ₹${material} അസംസ്കൃത വസ്തുക്കളും ${hours} മണിക്കൂർ അധ്വാനവും ഉൾപ്പെടുന്നു.`,
    unclearSpeech: 'മനസ്സിലായില്ല. ദയവായി വീണ്ടും പറയുക.'
  },
  mr: {
    welcomeState: 'ShilpSetu मध्ये आपले स्वागत आहे. कृपया आपले राज्य निवडा.',
    welcomeLanguage: (stateName) => `${stateName} साठी कृपया आपली भाषा निवडा.`,
    askPhone: 'कृपया आपला मोबाईल नंबर सांगा.',
    confirmPhone: (phone) => `मी ${phone} ऐकले. हे बरोबर आहे का? हो किंवा नाही म्हणा.`,
    repeatPhone: 'नंबर समजला नाही. कृपया 10 अंकी मोबाईल नंबर पुन्हा सांगा.',
    askOtp: 'कृपया OTP सांगा.',
    repeatOtp: 'OTP समजला नाही. कृपया 6 अंकी OTP पुन्हा सांगा.',
    askName: 'कृपया आपले नाव सांगा.',
    repeatName: 'नाव समजले नाही. कृपया पुन्हा सांगा.',
    askCraft: 'आपण करत असलेल्या हस्तकलेचे नाव सांगा.',
    repeatCraft: 'हस्तकलेचे नाव समजले नाही. कृपया पुन्हा सांगा.',
    confirmSummary: (name, craft) => `आपले नाव ${name} आणि हस्तकला ${craft} आहे. हे बरोबर आहे का?`,
    voiceSelectedConfirm: 'आपली भाषा मराठी निवडली गेली आहे.',
    askProductName: 'आपल्या हस्तकला उत्पादनाचे नाव काय आहे?',
    askLaborHours: 'हे उत्पादन तयार करण्यासाठी किती तास लागले?',
    askMaterialCost: 'कच्च्या मालाचा खर्च किती झाला?',
    explainFairPrice: (price, material, hours, wage) =>
      `आपल्या उत्पादनाची वाजवी किंमत ₹${price} आहे. यामध्ये कच्चा माल ₹${material} आणि ${hours} तासांचे कुशल श्रम समाविष्ट आहेत.`,
    unclearSpeech: 'समजले नाही. कृपया पुन्हा सांगा.'
  },
  gu: {
    welcomeState: 'ShilpSetu માં આપનું સ્વાગત છે. કૃપા કરીને તમારું રાજ્ય પસંદ કરો.',
    welcomeLanguage: (stateName) => `${stateName} માટે તમારી ભાષા પસંદ કરો.`,
    askPhone: 'કૃપા કરીને તમારો મોબાઇલ નંબર બોલો.',
    confirmPhone: (phone) => `મેં ${phone} સાંભળ્યું. શું આ સાચું છે? હા કે ના કહો.`,
    repeatPhone: 'નંબર સમજાયો નથી. કૃપા કરીને 10 અંકનો મોબાઇલ નંબર ફરીથી બોલો.',
    askOtp: 'કૃપા કરીને OTP બોલો.',
    repeatOtp: 'OTP સમજાયો નથી. કૃપા કરીને 6 અંકનો OTP ફરીથી બોલો.',
    askName: 'કૃપા કરીને તમારું નામ કહો.',
    repeatName: 'નામ સમજાયું નથી. કૃપા કરીને ફરીથી કહો.',
    askCraft: 'તમે કરતા હસ્તકલા કામનું નામ કહો.',
    repeatCraft: 'કામનું નામ સમજાયું નથી. કૃપા કરીને ફરીથી કહો.',
    confirmSummary: (name, craft) => `તમારું નામ ${name} અને હસ્તકલા ${craft} છે. શું આ સાચું છે?`,
    voiceSelectedConfirm: 'તમારી ભાષા ગુજરાતી તરીકે પસંદ કરવામાં આવી છે.',
    askProductName: 'તમારા હસ્તકલા ઉત્પાદનનું નામ શું છે?',
    askLaborHours: 'આ ઉત્પાદન બનાવવામાં કેટલા કલાક લાગ્યા?',
    askMaterialCost: 'કાચા માલનો ખર્ચ કેટલો થયો?',
    explainFairPrice: (price, material, hours, wage) =>
      `તમારા ઉત્પાદનની વાજબી કિંમત ₹${price} છે. તેમાં કાચો માલ ₹${material} અને ${hours} કલાકની કુશળ મજૂરી સામેલ છે.`,
    unclearSpeech: 'સમજાયું નથી. કૃપા કરીને ફરીથી કહો.'
  },
  bn: {
    welcomeState: 'ShilpSetu-এ আপনাকে স্বাগতম। অনুগ্রহ করে আপনার রাজ্য নির্বাচন করুন।',
    welcomeLanguage: (stateName) => `${stateName}-এর জন্য আপনার ভাষা নির্বাচন করুন।`,
    askPhone: 'দয়া করে আপনার মোবাইল নম্বরটি বলুন।',
    confirmPhone: (phone) => `আমি শুনেছি ${phone}। এটা কি সঠিক? হ্যাঁ বা না বলুন।`,
    repeatPhone: 'নম্বরটি বুঝতে পারিনি। দয়া করে 10 সংখ্যার মোবাইল নম্বরটি পুনরায় বলুন।',
    askOtp: 'দয়া করে OTP বলুন।',
    repeatOtp: 'OTP বুঝতে পারিনি। দয়া করে 6 সংখ্যার OTP পুনরায় বলুন।',
    askName: 'দয়া করে আপনার নাম বলুন।',
    repeatName: 'নাম বুঝতে পারিনি। দয়া করে পুনরায় বলুন।',
    askCraft: 'আপনি যে হস্তশিল্পের কাজ করেন তার নাম বলুন।',
    repeatCraft: 'কাজের নাম বুঝতে পারিনি। দয়া করে পুনরায় বলুন।',
    confirmSummary: (name, craft) => `আপনার নাম ${name} এবং হস্তশিল্পের কাজ ${craft}। এটা কি সঠিক?`,
    voiceSelectedConfirm: 'আপনার ভাষা বাংলা হিসেবে নির্বাচন করা হয়েছে।',
    askProductName: 'আপনার হস্তশিল্প পণ্যের নাম কী?',
    askLaborHours: 'এই পণ্য তৈরি করতে কত ঘণ্টা সময় লেগেছে?',
    askMaterialCost: 'কাঁচামালের খরচ কত?',
    explainFairPrice: (price, material, hours, wage) =>
      `আপনার পণ্যের প্রস্তাবিত ন্যায্য মূল্য ₹${price}। এতে কাঁচামাল ₹${material} এবং ${hours} ঘণ্টার দক্ষ শ্রম অন্তর্ভুক্ত।`,
    unclearSpeech: 'বুঝতে পারিনি। দয়া করে পুনরায় বলুন।'
  },
  or: {
    welcomeState: 'ShilpSetu କୁ ସ୍ୱାଗତ। ଦୟାକରି ଆପଣଙ୍କ ରାଜ୍ୟ ବାଛନ୍ତୁ।',
    welcomeLanguage: (stateName) => `${stateName} ପାଇଁ ଆପଣଙ୍କ ଭାଷା ବାଛନ୍ତୁ।`,
    askPhone: 'ଦୟାକରି ଆପଣଙ୍କ ମୋବାଇଲ୍ ନମ୍ବର କୁହନ୍ତୁ।',
    confirmPhone: (phone) => `ମୁଁ ${phone} ଶୁଣିଲି। ଏହା ସଠିକ୍ କି? ହଁ ବା ନାହିଁ କୁହନ୍ତୁ।`,
    repeatPhone: 'ନମ୍ବର ବୁଝିପାରିଲୁ ନାହିଁ। ଦୟାକରି 10 ଅଙ୍କ ବିଶିଷ୍ଟ ମୋବାଇଲ୍ ନମ୍ବର ପୁଣି କୁହନ୍ତୁ।',
    askOtp: 'ଦୟାକରି OTP କୁହନ୍ତୁ।',
    repeatOtp: 'OTP ବୁଝିପାରିଲୁ ନାହିଁ। ଦୟାକରି 6 ଅଙ୍କ ବିଶିଷ୍ଟ OTP ପୁଣି କୁହନ୍ତୁ।',
    askName: 'ଦୟାକରି ଆପଣଙ୍କ ନାମ କୁହନ୍ତୁ।',
    repeatName: 'ନାମ ବୁଝିପାରିଲୁ ନାହିଁ। ଦୟାକରି ପୁଣି କୁହନ୍ତୁ।',
    askCraft: 'ଆପଣ କରୁଥିବା ହସ୍ତଶିଳ୍ପ କାର୍ଯ୍ୟର ନାମ କୁହନ୍ତୁ।',
    repeatCraft: 'କାର୍ଯ୍ୟର ନାମ ବୁଝିପାରିଲୁ ନାହିଁ। ଦୟାକରି ପୁଣି କୁହନ୍ତୁ।',
    confirmSummary: (name, craft) => `ଆପଣଙ୍କ ନାମ ${name} ଏବଂ ହସ୍ତଶିଳ୍ପ ${craft}। ଏହା ସଠିକ୍ କି?`,
    voiceSelectedConfirm: 'ଆପଣଙ୍କ ଭାଷା ଓଡ଼ିଆ ଭାବରେ ଚୟନ କରାଯାଇଛି।',
    askProductName: 'ଆପଣଙ୍କ ହସ୍ତଶିଳ୍ପ ଉତ୍ପାଦର ନାମ କ’ଣ?',
    askLaborHours: 'ଏହା ତିଆରି କରିବାକୁ କେତେ ଘଣ୍ଟା ଲାଗିଲା?',
    askMaterialCost: 'କଞ୍ଚାମାଲ ଖର୍ଚ୍ଚ କେତେ?',
    explainFairPrice: (price, material, hours, wage) =>
      `ଆପଣଙ୍କ ଉତ୍ପାଦର ଉଚିତ୍ ମୂଲ୍ୟ ₹${price}। ଏଥିରେ କଞ୍ଚାମାଲ ₹${material} ଏବଂ ${hours} ଘଣ୍ଟାର ଶ୍ରମ ଅନ୍ତର୍ଭୁକ୍ତ।`,
    unclearSpeech: 'ବୁଝିପାରିଲୁ ନାହିଁ। ଦୟାକରି ପୁଣି କୁହନ୍ତୁ।'
  },
  pa: {
    welcomeState: 'ShilpSetu ਵਿੱਚ ਜੀ ਆਇਆਂ ਨੂੰ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਰਾਜ ਚੁਣੋ।',
    welcomeLanguage: (stateName) => `${stateName} ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ।`,
    askPhone: 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਮੋਬਾਈਲ ਨੰਬਰ ਬੋਲੋ।',
    confirmPhone: (phone) => `ਮੈਂ ${phone} ਸੁਣਿਆ। ਕੀ ਇਹ ਸਹੀ ਹੈ? ਹਾਂ ਜਾਂ ਨਾਂਹ ਕਹੋ।`,
    repeatPhone: 'ਮੋਬਾਈਲ ਨੰਬਰ ਸਮਝ ਨਹੀਂ ਆਇਆ। ਕਿਰਪਾ ਕਰਕੇ 10 ਅੰਕਾਂ ਦਾ ਨੰਬਰ ਦੁਬਾਰਾ ਬੋਲੋ।',
    askOtp: 'ਕਿਰਪਾ ਕਰਕੇ OTP ਬੋਲੋ।',
    repeatOtp: 'OTP ਸਮਝ ਨਹੀਂ ਆਇਆ। ਕਿਰਪਾ ਕਰਕੇ 6 ਅੰਕਾਂ ਦਾ OTP ਦੁਬਾਰਾ ਬੋਲੋ।',
    askName: 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਨਾਮ ਦੱਸੋ।',
    repeatName: 'ਨਾਮ ਸਮਝ ਨਹੀਂ ਆਇਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਬੋਲੋ।',
    askCraft: 'ਆਪਣੇ ਦਸਤਕਾਰੀ ਦੇ ਕੰਮ ਦਾ ਨਾਮ ਦੱਸੋ।',
    repeatCraft: 'ਕੰਮ ਦਾ ਨਾਮ ਸਮਝ ਨਹੀਂ ਆਇਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਬੋਲੋ।',
    confirmSummary: (name, craft) => `ਤੁਹਾਡਾ ਨਾਮ ${name} ਅਤੇ ਦਸਤਕਾਰੀ ${craft} ਹੈ। ਕੀ ਇਹ ਸਹੀ ਹੈ?`,
    voiceSelectedConfirm: 'ਤੁਹਾਡੀ ਭਾਸ਼ਾ ਪੰਜਾਬੀ ਚੁਣੀ ਗਈ ਹੈ।',
    askProductName: 'ਤੁਹਾਡੇ ਉਤਪਾਦ ਦਾ ਨਾਮ ਕੀ ਹੈ?',
    askLaborHours: 'ਇਸਨੂੰ ਬਣਾਉਣ ਵਿੱਚ ਕਿੰਨੇ ਘੰਟੇ ਲੱਗੇ?',
    askMaterialCost: 'ਕੱਚੇ ਮਾਲ ਦੀ ਲਾਗਤ ਕਿੰਨੀ ਹੈ?',
    explainFairPrice: (price, material, hours, wage) =>
      `ਤੁਹਾਡੇ ਉਤਪਾਦ ਦੀ ਵਾਜਬ ਕੀਮਤ ₹${price} ਹੈ। ਇਸ ਵਿੱਚ ਕੱਚਾ ਮਾਲ ₹${material} ਅਤੇ ${hours} ਘੰਟੇ ਦੀ ਮਿਹਨਤ ਸ਼ਾਮਲ ਹੈ।`,
    unclearSpeech: 'ਸਮਝ ਨਹੀਂ ਆਇਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਹਰਾਓ।'
  },
  as: {
    welcomeState: 'ShilpSetu লৈ স্বাগতম। অনুগ্ৰহ কৰি আপোনাৰ ৰাজ্য বাছক।',
    welcomeLanguage: (stateName) => `${stateName} ৰ বাবে আপোনাৰ ভাষা বাছক।`,
    askPhone: 'অনুগ্ৰহ কৰি আপোনাৰ মোবাইল নম্বৰ কওক।',
    confirmPhone: (phone) => `মই ${phone} বুলি শুনিলোঁ। এইটো শুদ্ধ নে? হয় বা নহয় কওক।`,
    repeatPhone: 'নম্বৰটো বুজি নাপালোঁ। অনুগ্ৰহ কৰি ১০ টা সংখ্যাৰ মোবাইল নম্বৰ পুনৰ কওক।',
    askOtp: 'অনুগ্ৰহ কৰি OTP কওক।',
    repeatOtp: 'OTP বুজি নাপালোঁ। অনুগ্ৰহ কৰি ৬ টা সংখ্যাৰ OTP পুনৰ কওক।',
    askName: 'অনুগ্ৰহ কৰি আপোনাৰ নাম কওক।',
    repeatName: 'নাম বুজি নাপালোঁ। অনুগ্ৰহ কৰি পুনৰ কওক।',
    askCraft: 'আপুনি কৰা হস্তশিল্পৰ কামৰ নাম কওক।',
    repeatCraft: 'কামৰ নাম বুজি নাপালোঁ। অনুগ্ৰহ কৰি পুনৰ কওক।',
    confirmSummary: (name, craft) => `আপোনাৰ নাম ${name} আৰু হস্তশিল্পৰ কাম ${craft}। এইটো শুদ্ধ নে?`,
    voiceSelectedConfirm: 'আপোনাৰ ভাষা অসমীয়া হিচাপে বাছনি কৰা হৈছে।',
    askProductName: 'আপোনাৰ হস্তশিল্প সামগ্ৰীৰ নাম কি?',
    askLaborHours: 'এই সামগ্ৰী তৈয়াৰ কৰিবলৈ কিমান ঘণ্টা লাগিল?',
    askMaterialCost: 'কেঁচামালৰ খৰচ কিমান?',
    explainFairPrice: (price, material, hours, wage) =>
      `আপোনাৰ সামগ্ৰীৰ বাবে ন্যায্য মূল্য ₹${price}। ইয়াত কেঁচামাল ₹${material} আৰু ${hours} ঘণ্টাৰ শ্ৰম অন্তৰ্ভুক্ত।`,
    unclearSpeech: 'বুজি নাপালোঁ। অনুগ্ৰহ কৰি পুনৰ কওক।'
  }
};

export function getVoicePrompts(lang: LanguageCode | string): LocalizedVoicePrompts {
  const p = VOICE_PROMPTS[lang as LanguageCode];
  if (p) return p;
  return VOICE_PROMPTS.en;
}
