import { CustomerCareMessage, LanguageCode } from '../types';

/**
 * AI Customer Care Service — Clean abstraction for AI chat.
 * Attempts to use server-side Gemini API; falls back to rule-based demo responses.
 * No API keys are exposed in frontend code.
 */

export async function sendChatMessage(
  message: string,
  role: 'seller' | 'buyer' | 'admin',
  language: LanguageCode,
  history: CustomerCareMessage[]
): Promise<string> {
  try {
    const res = await fetch('/api/v1/customer-care/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, role, language, history: history.slice(-6) }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.response;
    }
  } catch (e) {
    console.warn('Customer care API unavailable, using fallback responses');
  }
  return getLocalFallbackResponse(message, role, language);
}

function getLocalFallbackResponse(message: string, role: string, lang: LanguageCode): string {
  const q = message.toLowerCase();

  const responses: Record<string, Record<string, string>> = {
    en: {
      price: "To price your handicraft fairly, go to 'Create Bill' in the seller portal. Enter your material, labour, and transportation costs. ShilpSetu (KALAtech) will compare with market benchmarks and suggest a fair price range.",
      bill: "To create a bill, navigate to 'Create Bill' from the seller dashboard. Select your product, enter cost details, review the market price comparison, and finalize your invoice.",
      market: "The Market Price Analysis feature compares your proposed price with curated market benchmarks. It shows minimum, average, and maximum market prices for similar handicrafts.",
      listing: "To improve your product listing, use high-quality photos, provide detailed descriptions of materials and techniques, and highlight the cultural heritage of your craft.",
      buy: "To buy a handicraft, browse the marketplace, select a product you like, add it to your cart, and proceed to checkout. You can pay via UPI, card, or cash on delivery.",
      track: "You can track your order from 'My Orders' in the buyer dashboard. Orders go through stages: Created → Paid → Shipped → Delivered.",
      return: "For returns, please contact the seller directly through the 'Contact Seller' button on the product page. ShilpSetu facilitates direct artisan-to-buyer communication.",
      default: "Thank you for reaching out! I'm ShilpSetu's AI assistant (powered by KALAtech). I can help you with pricing, billing, product listings, marketplace navigation, and more. Please ask me a specific question!",
    },
    hi: {
      price: "अपने हस्तशिल्प की उचित कीमत के लिए, विक्रेता पोर्टल में 'बिल बनाएं' पर जाएं। अपनी सामग्री, श्रम और परिवहन लागत दर्ज करें। शिल्पसेतु (KALAtech) बाज़ार बेंचमार्क से तुलना करके उचित मूल्य सुझाएगा।",
      bill: "बिल बनाने के लिए, विक्रेता डैशबोर्ड से 'बिल बनाएं' पर जाएं। अपना उत्पाद चुनें, लागत विवरण दर्ज करें, बाज़ार मूल्य तुलना देखें और चालान को अंतिम रूप दें।",
      market: "बाज़ार मूल्य विश्लेषण आपके प्रस्तावित मूल्य की बाज़ार बेंचमार्क से तुलना करता है। यह समान हस्तशिल्प के न्यूनतम, औसत और अधिकतम बाज़ार मूल्य दिखाता है।",
      listing: "अपने उत्पाद की सूची को बेहतर बनाने के लिए, उच्च गुणवत्ता वाली तस्वीरों का उपयोग करें और सामग्री और तकनीकों का विस्तृत विवरण दें।",
      buy: "हस्तशिल्प खरीदने के लिए, बाज़ार ब्राउज़ करें, अपना पसंदीदा उत्पाद चुनें, कार्ट में जोड़ें और चेकआउट पर जाएं।",
      track: "आप खरीदार डैशबोर्ड में 'मेरे ऑर्डर' से अपना ऑर्डर ट्रैक कर सकते हैं।",
      return: "वापसी के लिए, कृपया उत्पाद पृष्ठ पर 'विक्रेता से संपर्क करें' बटन के माध्यम से विक्रेता से सीधे संपर्क करें।",
      default: "संपर्क करने के लिए धन्यवाद! मैं शिल्पसेतु (KALAtech) का AI सहायक हूं। मैं मूल्य निर्धारण, बिलिंग, उत्पाद सूची और बाज़ार नेविगेशन में आपकी मदद कर सकता हूं।",
    },
    te: {
      price: "మీ చేతివృత్తికి సరసమైన ధర నిర్ణయించడానికి, విక్రేత పోర్టల్‌లో 'బిల్లు తయారు చేయండి'కి వెళ్లండి. మీ ముడిసరుకు, శ్రమ మరియు రవాణా ఖర్చులను నమోదు చేయండి. శిల్పసేతు (KALAtech) తగిన ధరను సూచిస్తుంది.",
      bill: "బిల్లు తయారు చేయడానికి, విక్రేత డాష్‌బోర్డ్ నుండి 'బిల్లు తయారు చేయండి'కి నావిగేట్ చేయండి. మీ ఉత్పత్తిని ఎంచుకోండి, ఖర్చు వివరాలను నమోదు చేయండి.",
      market: "మార్కెట్ ధర విశ్లేషణ మీ ప్రతిపాదిత ధరను మార్కెట్ బెంచ్‌మార్క్‌లతో పోల్చుతుంది.",
      listing: "మీ ఉత్పత్తి జాబితాను మెరుగుపరచడానికి, నాణ్యమైన ఫోటోలు ఉపయోగించండి మరియు ముడిసరుకు మరియు తయారీ పద్ధతుల గురించి వివరంగా రాయండి.",
      buy: "చేతివృత్తి కొనుగోలు చేయడానికి, మార్కెట్‌ప్లేస్ బ్రౌజ్ చేయండి, మీకు నచ్చిన ఉత్పత్తిని ఎంచుకోండి, కార్ట్‌కు జోడించండి.",
      track: "మీరు కొనుగోలుదారు డాష్‌బోర్డ్‌లో 'నా ఆర్డర్లు' నుండి మీ ఆర్డర్‌ను ట్రాక్ చేయవచ్చు.",
      return: "రిటర్న్‌ల కోసం, దయచేసి ఉత్పత్తి పేజీలో 'విక్రేతను సంప్రదించండి' బటన్ ద్వారా విక్రేతను నేరుగా సంప్రదించండి.",
      default: "సంప్రదించినందుకు ధన్యవాదాలు! నేను శిల్పసేతు (KALAtech) AI సహాయకుడిని. ధర నిర్ణయం, బిల్లింగ్, ఉత్పత్తి జాబితాలు మరియు మార్కెట్ నావిగేషన్‌లో మీకు సహాయం చేయగలను.",
    },
  };

  const langResponses = responses[lang];

  if (q.includes('price') || q.includes('pricing') || q.includes('मूल्य') || q.includes('ధర')) return langResponses.price;
  if (q.includes('bill') || q.includes('invoice') || q.includes('बिल') || q.includes('బిల్లు')) return langResponses.bill;
  if (q.includes('market') || q.includes('बाज़ार') || q.includes('మార్కెట్')) return langResponses.market;
  if (q.includes('listing') || q.includes('improve') || q.includes('सूची') || q.includes('జాబితా')) return langResponses.listing;
  if (q.includes('buy') || q.includes('purchase') || q.includes('खरीद') || q.includes('కొనుగోలు')) return langResponses.buy;
  if (q.includes('track') || q.includes('order') || q.includes('ट्रैक') || q.includes('ట్రాక్')) return langResponses.track;
  if (q.includes('return') || q.includes('refund') || q.includes('वापसी') || q.includes('రిటర్న్')) return langResponses.return;

  return langResponses.default;
}

export function getSuggestedQuestions(role: string, lang: LanguageCode): string[] {
  const questions: Record<string, Record<string, string[]>> = {
    en: {
      seller: [
        "How should I price my handicraft?",
        "How do I create a bill?",
        "What is market price comparison?",
        "How can I improve my product listing?",
      ],
      buyer: [
        "How do I buy a handicraft?",
        "How can I track my order?",
        "Tell me about artisan crafts",
        "How do I return a product?",
      ],
      admin: [
        "How do I manage sellers?",
        "How to view analytics?",
        "How to monitor orders?",
        "How to review bills?",
      ],
    },
    hi: {
      seller: [
        "मैं अपने हस्तशिल्प की कीमत कैसे तय करूं?",
        "बिल कैसे बनाएं?",
        "बाज़ार मूल्य तुलना क्या है?",
        "उत्पाद सूची कैसे सुधारें?",
      ],
      buyer: [
        "हस्तशिल्प कैसे खरीदें?",
        "ऑर्डर कैसे ट्रैक करें?",
        "कारीगर शिल्प के बारे में बताएं",
        "उत्पाद कैसे वापस करें?",
      ],
      admin: [
        "विक्रेताओं को कैसे प्रबंधित करें?",
        "विश्लेषण कैसे देखें?",
        "ऑर्डर की निगरानी कैसे करें?",
        "बिलों की समीक्षा कैसे करें?",
      ],
    },
    te: {
      seller: [
        "నా చేతివృత్తికి ధర ఎలా నిర్ణయించాలి?",
        "బిల్లు ఎలా తయారు చేయాలి?",
        "మార్కెట్ ధర పోలిక అంటే ఏమిటి?",
        "ఉత్పత్తి జాబితాను ఎలా మెరుగుపరచాలి?",
      ],
      buyer: [
        "చేతివృత్తి ఎలా కొనాలి?",
        "ఆర్డర్ ఎలా ట్రాక్ చేయాలి?",
        "కళాకారుల చేతివృత్తుల గురించి చెప్పండి",
        "ఉత్పత్తిని ఎలా రిటర్న్ చేయాలి?",
      ],
      admin: [
        "విక్రేతలను ఎలా నిర్వహించాలి?",
        "విశ్లేషణలు ఎలా చూడాలి?",
        "ఆర్డర్లను ఎలా పర్యవేక్షించాలి?",
        "బిల్లులను ఎలా సమీక్షించాలి?",
      ],
    },
  };

  return questions[lang]?.[role] || questions.en.buyer;
}
