import { GoogleGenAI, Type } from "@google/genai";
import { LanguageCode } from "../src/types.js";

// Lazy initialization of GoogleGenAI
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface CatalogGenResult {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  tags: string[];
  material: string;
  est_dimensions: string;
  weight: string;
  status: 'success' | 'fallback';
  modelUsed: string;
}

export interface TranslationResult {
  title: string;
  description: string;
  tags: string[];
  status: 'success' | 'fallback';
  modelUsed: string;
}

export interface PricingGenResult {
  suggested_min: number;
  suggested_max: number;
  target_recommended: number;
  rationale: string;
  comparable_average: number;
  typical_middleman_price: number;
  artisan_profit_gain: number;
  margin_percentage: number;
  status: 'success' | 'fallback';
  modelUsed: string;
}

// Convert image url or base64 to Gemini inline part
function prepareImagePart(imageDataUrlOrBase64: string): { inlineData: { mimeType: string; data: string } } | null {
  try {
    if (imageDataUrlOrBase64.startsWith("data:")) {
      const parts = imageDataUrlOrBase64.split(",");
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      const data = parts[1];
      return { inlineData: { mimeType, data } };
    }
    return null;
  } catch (e) {
    console.error("Failed to parse image data", e);
    return null;
  }
}

export async function generateProductCatalog(
  imageData: string,
  categoryHint: string = "Handicraft",
  artisanRegion: string = "India"
): Promise<CatalogGenResult> {
  const ai = getAIClient();
  const startTime = Date.now();

  if (ai) {
    try {
      const imagePart = prepareImagePart(imageData);
      const prompt = `You are a specialist in rural Indian handicrafts, folk art, handloom textiles, and artisanal market linkage.
Analyze the provided product image (with category hint: "${categoryHint}", region: "${artisanRegion}").
Generate an authentic, professional e-commerce catalog record tailored to empower marginalized craftspeople.

Requirements:
- title: Evocative, professional handicraft title emphasizing authentic handcraft tradition and heritage.
- description: Rich 2-3 sentence narrative describing the technique, cultural heritage, and handmade qualities.
- category: The broad craft category (e.g. Weaving, Pottery, Metalcraft, Woodwork, Embroidery, Folk Painting, Jewelry).
- subcategory: Specific tradition or craft style (e.g. Double Ikat Silk, Blue Pottery, Dhokra Casting, Madhubani Art).
- tags: 4 to 6 relevant search tags (e.g. ["GI Tagged", "Handloom", "Pure Silk", "Natural Dyes"]).
- material: Traditional materials used (e.g. "Natural Terracotta Clay", "Pure Mulberry Silk", "Bell Metal").
- est_dimensions: Realistic size estimate (e.g. "10 inches x 6 inches", "5.5 meters").
- weight: Estimated weight (e.g. "450 grams", "1.2 kg").

Return ONLY valid JSON matching this schema.`;

      const contents = imagePart
        ? { parts: [imagePart, { text: prompt }] }
        : prompt;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { type: Type.STRING },
              subcategory: { type: Type.STRING },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              material: { type: Type.STRING },
              est_dimensions: { type: Type.STRING },
              weight: { type: Type.STRING },
            },
            required: ["title", "description", "category", "tags", "material", "est_dimensions"]
          }
        }
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      if (parsed.title && parsed.description) {
        return {
          title: parsed.title,
          description: parsed.description,
          category: parsed.category || categoryHint,
          subcategory: parsed.subcategory || `${categoryHint} Craft`,
          tags: Array.isArray(parsed.tags) ? parsed.tags : ["Handmade", "Traditional", categoryHint],
          material: parsed.material || "Traditional Natural Craft Materials",
          est_dimensions: parsed.est_dimensions || "Standard Handcrafted Dimensions",
          weight: parsed.weight || "350 grams",
          status: 'success',
          modelUsed: 'gemini-3.8-flash'
        };
      }
    } catch (err) {
      console.warn("Gemini catalog generation error, using rule-based fallback:", err);
    }
  }

  // Graceful rule-based fallback (as mandated by Section 5 & 14 of Implementation Plan)
  const categoryTitleMap: Record<string, string> = {
    Weaving: "Mastercrafted Handloom Heritage Fabric",
    Pottery: "Artisanal Hand-Molded Terracotta & Glazed Pottery",
    Metalcraft: "Traditional Lost-Wax Cast Bell Metal Figurine",
    Woodwork: "Hand-Carved Eco-Friendly Lacquered Wood Craft",
    Embroidery: "Intricate Hand-Embroidered Folk Heritage Textile",
    "Folk Painting": "Hand-Painted Folk Canvas with Natural Dyes"
  };

  const categoryDescMap: Record<string, string> = {
    Weaving: "Skillfully woven on traditional wooden pit looms using pure threads and organic dyes. Each warp and weft represents generations of inherited family weaving wisdom.",
    Pottery: "Molded by hand and wheel from natural riverbed clay, sun-dried and low-fired in traditional wood kilns for timeless rustic beauty and thermal resilience.",
    Metalcraft: "Cast using the ancient lost-wax technique where every mold is destroyed to yield a singular, non-reproducible metal sculpture steeped in tribal lore.",
    Woodwork: "Hand-turned on local lathes from sustainably sourced wood and buffed with natural vegetable lacquers for a baby-safe, lustrous satin finish.",
    Embroidery: "Needleworked with patience by village women artisans, featuring traditional shadow stitching and heritage motifs celebrating nature and community rites.",
    "Folk Painting": "Painted by master folk painters using handmade brushes and mineral pigments, depicting ancient themes of harmony with nature and auspicious blessings."
  };

  const title = categoryTitleMap[categoryHint] || `Handcrafted ${categoryHint} Heritage Creation`;
  const description = categoryDescMap[categoryHint] || `Authentic handmade ${categoryHint.toLowerCase()} created with inherited regional artisan techniques. Preserving cultural heritage while offering exquisite home utility and aesthetic beauty.`;

  return {
    title,
    description,
    category: categoryHint || "Handicraft",
    subcategory: `Traditional ${categoryHint}`,
    tags: ["Certified Handmade", "Direct from Artisan", "Heritage Craft", "Eco Friendly", categoryHint],
    material: "Traditional Natural Artisanal Materials",
    est_dimensions: "10 x 8 inches",
    weight: "450 grams",
    status: 'fallback',
    modelUsed: 'rule-based-handicraft-engine'
  };
}

export async function translateProductContent(
  title: string,
  description: string,
  tags: string[],
  targetLang: LanguageCode
): Promise<TranslationResult> {
  const ai = getAIClient();

  if (targetLang === 'en') {
    return { title, description, tags, status: 'success', modelUsed: 'passthrough' };
  }

  const langNames: Record<LanguageCode, string> = {
    en: "English",
    hi: "Hindi (हिन्दी)",
    te: "Telugu (తెలుగు)"
  };

  if (ai) {
    try {
      const prompt = `You are an expert multilingual translator specializing in Indian handicraft terminology, artisan folklore, and retail e-commerce.
Translate the following product listing into ${langNames[targetLang]}.
Keep the tone dignified, authentic, and culturally respectful to the artisan's craft tradition.

Product Title: ${title}
Product Description: ${description}
Tags: ${JSON.stringify(tags)}

Return ONLY valid JSON matching this schema:
{
  "title": "Translated title in ${langNames[targetLang]}",
  "description": "Translated description in ${langNames[targetLang]}",
  "tags": ["tag1 in ${langNames[targetLang]}", "tag2..."]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      if (parsed.title && parsed.description) {
        return {
          title: parsed.title,
          description: parsed.description,
          tags: Array.isArray(parsed.tags) ? parsed.tags : tags,
          status: 'success',
          modelUsed: 'gemini-3.8-flash'
        };
      }
    } catch (e) {
      console.warn(`Translation to ${targetLang} failed with Gemini, using curated fallback`, e);
    }
  }

  // Graceful rule-based translations for supported demo targets
  if (targetLang === 'hi') {
    return {
      title: `पारंपरिक हस्तनिर्मित ${title}`,
      description: `कारीगर द्वारा परंपरागत विधि से तैयार की गई अनूठी हस्तकला। ${description}`,
      tags: tags.map(t => `हस्तनिर्मित ${t}`),
      status: 'fallback',
      modelUsed: 'rule-based-i18n-dictionary'
    };
  }

  if (targetLang === 'te') {
    return {
      title: `సాంప్రదాయ చేతిపని ${title}`,
      description: `గ్రామీణ కళాకారుల హస్తకళా నైపుణ్యంతో రూపుదిద్దుకున్న ప్రామాణికమైన వస్తువు. ${description}`,
      tags: tags.map(t => `చేతిపని ${t}`),
      status: 'fallback',
      modelUsed: 'rule-based-i18n-dictionary'
    };
  }

  return { title, description, tags, status: 'fallback', modelUsed: 'fallback-english' };
}

export async function generatePriceRecommendation(
  cost: { material_cost: number; labor_hours: number; hourly_rate: number; other_cost: number },
  category: string,
  benchmarkRows: Array<{ craft_name: string; price_low: number; price_high: number; average_price: number; typical_middleman_cut: number }>
): Promise<PricingGenResult> {
  const ai = getAIClient();

  // Baseline cost-plus calculation
  const totalCost = cost.material_cost + (cost.labor_hours * cost.hourly_rate) + cost.other_cost;
  
  // Calculate average benchmark for this category
  let avgBenchmark = 2500;
  let typicalMiddlemanCutPct = 60;
  if (benchmarkRows.length > 0) {
    avgBenchmark = Math.round(benchmarkRows.reduce((sum, r) => sum + r.average_price, 0) / benchmarkRows.length);
    typicalMiddlemanCutPct = Math.round(benchmarkRows.reduce((sum, r) => sum + r.typical_middleman_cut, 0) / benchmarkRows.length);
  }

  // Middleman typically pays only slightly above raw material cost or ~35-40% of market value
  const typicalMiddlemanPayout = Math.max(
    Math.round(cost.material_cost * 1.25),
    Math.round(avgBenchmark * ((100 - typicalMiddlemanCutPct) / 100))
  );

  // Fair cost-plus floor with at least 35% margin for the artisan
  const costPlusFloor = Math.round(totalCost * 1.35);
  const suggestedMin = Math.max(costPlusFloor, Math.round(avgBenchmark * 0.85));
  const suggestedMax = Math.max(suggestedMin + 500, Math.round(avgBenchmark * 1.25));
  const targetRecommended = Math.round((suggestedMin * 0.45) + (suggestedMax * 0.55));
  const artisanGain = Math.max(0, targetRecommended - typicalMiddlemanPayout);
  const marginPct = Math.round(((targetRecommended - totalCost) / targetRecommended) * 100);

  let rationale = `Cost-plus floor of ₹${costPlusFloor} (Materials ₹${cost.material_cost} + ${cost.labor_hours}h labor @ ₹${cost.hourly_rate}/hr) matched against curated ${category} benchmarks (₹${avgBenchmark} avg). Eliminates ${typicalMiddlemanCutPct}% middleman commission to return ₹${artisanGain} extra direct income to the craftsperson.`;

  if (ai) {
    try {
      const prompt = `You are a micro-economist and fair-trade handicraft valuation analyst.
An artisan crafted a ${category} item with:
- Raw Materials: ₹${cost.material_cost}
- Labor Hours: ${cost.labor_hours} hours
- Fair Hourly Wage: ₹${cost.hourly_rate}/hr
- Total direct production cost: ₹${totalCost}
- Relevant market benchmarks for this craft category average: ₹${avgBenchmark} (ranging ₹${suggestedMin} to ₹${suggestedMax}).
- Local middlemen typically pay artisans only ₹${typicalMiddlemanPayout} and resell at high urban markups.

Generate a crisp 1-2 sentence economic justification explaining why ₹${targetRecommended} (in range ₹${suggestedMin}-₹${suggestedMax}) is a fair direct-to-consumer price that rewards artisan labor and eliminates unfair intermediary capture.

Return ONLY valid JSON:
{
  "rationale": "one or two sentence explanation"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      if (parsed.rationale) {
        rationale = parsed.rationale;
        return {
          suggested_min: suggestedMin,
          suggested_max: suggestedMax,
          target_recommended: targetRecommended,
          rationale,
          comparable_average: avgBenchmark,
          typical_middleman_price: typicalMiddlemanPayout,
          artisan_profit_gain: artisanGain,
          margin_percentage: marginPct,
          status: 'success',
          modelUsed: 'gemini-3.8-flash'
        };
      }
    } catch (e) {
      console.warn("Gemini pricing reasoning error, using mathematical formulation:", e);
    }
  }

  return {
    suggested_min: suggestedMin,
    suggested_max: suggestedMax,
    target_recommended: targetRecommended,
    rationale,
    comparable_average: avgBenchmark,
    typical_middleman_price: typicalMiddlemanPayout,
    artisan_profit_gain: artisanGain,
    margin_percentage: marginPct,
    status: 'fallback',
    modelUsed: 'cost-plus-curated-dataset-engine'
  };
}
