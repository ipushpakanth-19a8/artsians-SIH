import { MarketPriceResult } from '../types';

/**
 * Market Price Service — Clean abstraction for market pricing.
 * Currently uses demo/mock benchmark data from the server.
 * Designed so a real market-price API can be connected later.
 */

export async function getMarketPrice(category: string, proposedPrice?: number): Promise<MarketPriceResult> {
  try {
    const res = await fetch(`/api/v1/market-prices/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, proposed_price: proposedPrice }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Market price API unavailable, using fallback');
  }
  // Fallback demo data
  return getLocalFallbackPrice(category);
}

function getLocalFallbackPrice(category: string): MarketPriceResult {
  const DEMO_PRICES: Record<string, { min: number; avg: number; max: number }> = {
    Weaving: { min: 1200, avg: 3500, max: 9500 },
    Handloom: { min: 800, avg: 2500, max: 7000 },
    Pottery: { min: 450, avg: 1500, max: 4500 },
    Woodcraft: { min: 500, avg: 2000, max: 6000 },
    Metalcraft: { min: 800, avg: 3000, max: 8000 },
    Jewellery: { min: 300, avg: 1500, max: 5000 },
    Paintings: { min: 400, avg: 2000, max: 8000 },
    'Bamboo/Cane': { min: 200, avg: 800, max: 2500 },
    Textiles: { min: 500, avg: 1800, max: 5000 },
    'Traditional Decor': { min: 300, avg: 1200, max: 4000 },
    Embroidery: { min: 600, avg: 2000, max: 5500 },
    Other: { min: 300, avg: 1200, max: 4000 },
  };
  const data = DEMO_PRICES[category] || DEMO_PRICES['Other'];
  return {
    minPrice: data.min,
    averagePrice: data.avg,
    maxPrice: data.max,
    recommendedPrice: Math.round(data.avg * 1.05),
    source: 'demo',
    lastUpdated: new Date().toISOString(),
    category,
    benchmarkCount: 3,
  };
}

export function getPricePosition(price: number, market: MarketPriceResult): 'below' | 'at' | 'above' {
  if (price < market.averagePrice * 0.9) return 'below';
  if (price > market.averagePrice * 1.1) return 'above';
  return 'at';
}

export function generatePriceRecommendationText(
  proposedPrice: number,
  market: MarketPriceResult,
  lang: 'en' | 'hi' | 'te' = 'en'
): string {
  const pos = getPricePosition(proposedPrice, market);
  const recLow = Math.round(market.averagePrice * 0.95);
  const recHigh = Math.round(market.averagePrice * 1.1);

  const texts = {
    en: {
      below: `Your proposed price of ₹${proposedPrice.toLocaleString('en-IN')} is below the market average of ₹${market.averagePrice.toLocaleString('en-IN')}. Consider pricing between ₹${recLow.toLocaleString('en-IN')} and ₹${recHigh.toLocaleString('en-IN')} for better artisan profit while remaining competitive.`,
      at: `Your proposed price of ₹${proposedPrice.toLocaleString('en-IN')} aligns well with the market average of ₹${market.averagePrice.toLocaleString('en-IN')}. This provides a good balance of competitiveness and fair artisan earnings.`,
      above: `Your proposed price of ₹${proposedPrice.toLocaleString('en-IN')} is above the market average of ₹${market.averagePrice.toLocaleString('en-IN')}. If the quality and uniqueness justify it, this is acceptable. Otherwise, consider a price closer to ₹${recHigh.toLocaleString('en-IN')}.`,
    },
    hi: {
      below: `आपका प्रस्तावित मूल्य ₹${proposedPrice.toLocaleString('en-IN')} बाज़ार औसत ₹${market.averagePrice.toLocaleString('en-IN')} से नीचे है। बेहतर कारीगर लाभ के लिए ₹${recLow.toLocaleString('en-IN')} से ₹${recHigh.toLocaleString('en-IN')} के बीच मूल्य रखने पर विचार करें।`,
      at: `आपका प्रस्तावित मूल्य ₹${proposedPrice.toLocaleString('en-IN')} बाज़ार औसत ₹${market.averagePrice.toLocaleString('en-IN')} के अनुरूप है। यह प्रतिस्पर्धात्मकता और उचित कारीगर आय का अच्छा संतुलन है।`,
      above: `आपका प्रस्तावित मूल्य ₹${proposedPrice.toLocaleString('en-IN')} बाज़ार औसत ₹${market.averagePrice.toLocaleString('en-IN')} से ऊपर है। यदि गुणवत्ता और विशिष्टता इसे उचित ठहराती है, तो यह स्वीकार्य है।`,
    },
    te: {
      below: `మీ ప్రతిపాదిత ధర ₹${proposedPrice.toLocaleString('en-IN')} మార్కెట్ సగటు ₹${market.averagePrice.toLocaleString('en-IN')} కంటే తక్కువగా ఉంది. మెరుగైన కళాకారుల లాభం కోసం ₹${recLow.toLocaleString('en-IN')} నుండి ₹${recHigh.toLocaleString('en-IN')} మధ్య ధరను పరిగణించండి.`,
      at: `మీ ప్రతిపాదిత ధర ₹${proposedPrice.toLocaleString('en-IN')} మార్కెట్ సగటు ₹${market.averagePrice.toLocaleString('en-IN')}కు బాగా అనుగుణంగా ఉంది. ఇది పోటీ మరియు సరసమైన కళాకారుల ఆదాయం యొక్క మంచి సమతుల్యత.`,
      above: `మీ ప్రతిపాదిత ధర ₹${proposedPrice.toLocaleString('en-IN')} మార్కెట్ సగటు ₹${market.averagePrice.toLocaleString('en-IN')} కంటే ఎక్కువగా ఉంది. నాణ్యత మరియు ప్రత్యేకత దీనిని సమర్థిస్తే, ఇది ఆమోదయోగ్యమే.`,
    },
  };
  return texts[lang][pos];
}

// Aliases for convenient caller ergonomics
export async function getMarketPriceAnalysis(input: {
  category: string;
  material?: string;
  currentCost?: number;
  proposedPrice?: number;
}): Promise<MarketPriceResult> {
  return getMarketPrice(input.category, input.proposedPrice);
}

export function getMarketRecommendationText(
  proposedPrice: number,
  averagePrice: number,
  lang: 'en' | 'hi' | 'te' = 'en'
): string {
  const dummyResult: MarketPriceResult = {
    minPrice: Math.round(averagePrice * 0.7),
    averagePrice,
    maxPrice: Math.round(averagePrice * 1.3),
    recommendedPrice: Math.round(averagePrice * 1.05),
    source: 'demo',
    lastUpdated: new Date().toISOString(),
    category: 'Handicraft',
    benchmarkCount: 1,
  };
  return generatePriceRecommendationText(proposedPrice, dummyResult, lang);
}
