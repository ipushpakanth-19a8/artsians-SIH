import dotenv from "dotenv";
dotenv.config();
import { GoogleGenAI, Type } from "@google/genai";
import sharp from "sharp";
import { LanguageCode } from "../../src/types.js";

export interface CraftAttributes {
  craftCategory: string | null;
  craftName: string | null;
  productType: string | null;
  material: string | null;
  technique: string | null;
  motif: string | null;
  colors: string[];
  region: string | null;
  description: string | null;
  culturalContext: string | null;
  visualFeatures: string[];
  confidence: number;
  uncertainAttributes: string[];
}

export interface AIDebugInfo {
  provider: "Gemini" | "Demo Heuristic";
  model: string;
  imageReceived: boolean;
  imageMime: string;
  imageDimensions?: { width: number; height: number };
  imageSizeBytes?: number;
  selectedLanguage: LanguageCode;
  locale: string;
  rawResponseStatus: "success" | "fallback" | "error";
  structuredValidation: "passed" | "failed";
  confidenceScore: number;
  uncertainCount: number;
  translationStatus: "success" | "fallback" | "passthrough";
  voiceSupported: boolean;
  lastCorrectionApplied?: {
    field: string;
    original: string;
    corrected: string;
    timestamp: string;
  };
  latencyMs: number;
}

export interface StrictDetectedCraftOutput {
  product_name: string;
  category: string;
  material: string;
  colour: string;
  dimensions: string;
  craft_technique: string;
  suggested_price_range: string;
  short_description: string;
  confidence: number;
  needs_user_input: {
    product_name: boolean;
    category: boolean;
    material: boolean;
    colour: boolean;
    dimensions: boolean;
    craft_technique: boolean;
    suggested_price_range: boolean;
    short_description: boolean;
  };
}

export interface InspectCraftResponse {
  success: boolean;
  error?: string;
  message?: string;
  name?: string;
  type?: string;
  color?: string;
  detectedDetails?: Record<string, any>;
  data?: StrictDetectedCraftOutput;
  language: LanguageCode;
  locale: string;
  canonicalAttributes: CraftAttributes;
  localizedAttributes: CraftAttributes;
  confidence: number;
  uncertainAttributes: string[];
  aiProvider: "gemini" | "demo-heuristic";
  modelUsed: string;
  isFallback: boolean;
  notice?: string;
  debug: AIDebugInfo;
}

export interface VoiceCorrectionResult {
  success: boolean;
  field: keyof CraftAttributes | null;
  canonicalValue: string | string[] | null;
  localizedValue: string | string[] | null;
  extractedFrom: string;
  confidence: number;
}

/**
 * Validates the parsed JSON against strict 9-key shape.
 * If a field is missing, null, unknown, or confidence is low (< 0.60),
 * leaves it BLANK ("") and marks it as needs_user_input. Never fills with guesses or defaults.
 */
export function validateStrictCraftOutput(raw: any): StrictDetectedCraftOutput {
  const sanitize = (val: any): string => {
    if (val === null || val === undefined) return "";
    const str = typeof val === "string" ? val : Array.isArray(val) ? val.join(", ") : String(val);
    const trimmed = str.trim();
    const lower = trimmed.toLowerCase();
    if (
      !trimmed ||
      lower === "unknown" ||
      lower === "null" ||
      lower === "n/a" ||
      lower === "undefined" ||
      lower === "none" ||
      lower === "not visible" ||
      lower === "unspecified"
    ) {
      return "";
    }
    return trimmed;
  };

  const rawConf = typeof raw?.confidence === "number" ? raw.confidence : parseFloat(raw?.confidence);
  const confidence = isNaN(rawConf) ? 0 : Math.max(0, Math.min(1, rawConf));
  const isConfident = confidence >= 0.60;

  const product_name = isConfident ? sanitize(raw?.product_name || raw?.craftName) : "";
  const category = isConfident ? sanitize(raw?.category || raw?.craftCategory) : "";
  const material = isConfident ? sanitize(raw?.material) : "";
  const colour = isConfident ? sanitize(raw?.colour || (Array.isArray(raw?.colors) ? raw.colors.join(", ") : raw?.colors)) : "";
  const dimensions = isConfident ? sanitize(raw?.dimensions) : "";
  const craft_technique = isConfident ? sanitize(raw?.craft_technique || raw?.technique) : "";
  const suggested_price_range = isConfident ? sanitize(raw?.suggested_price_range) : "";
  const short_description = isConfident ? sanitize(raw?.short_description || raw?.description) : "";

  return {
    product_name,
    category,
    material,
    colour,
    dimensions,
    craft_technique,
    suggested_price_range,
    short_description,
    confidence: isConfident ? confidence : 0,
    needs_user_input: {
      product_name: !product_name,
      category: !category,
      material: !material,
      colour: !colour,
      dimensions: !dimensions,
      craft_technique: !craft_technique,
      suggested_price_range: !suggested_price_range,
      short_description: !short_description,
    },
  };
}

function getAIClient(): GoogleGenAI | null {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim().length === 0) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

export const LANGUAGE_LOCALES: Record<LanguageCode, string> = {
  en: "en-IN",
  hi: "hi-IN",
  te: "te-IN",
  ta: "ta-IN",
  kn: "kn-IN",
  ml: "ml-IN",
  mr: "mr-IN",
  gu: "gu-IN",
  bn: "bn-IN",
  or: "or-IN",
  pa: "pa-IN",
  as: "as-IN",
};

export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: "English",
  hi: "Hindi (हिन्दी)",
  te: "Telugu (తెలుగు)",
  ta: "Tamil (தமிழ்)",
  kn: "Kannada (ಕನ್ನಡ)",
  ml: "Malayalam (മലയാളം)",
  mr: "Marathi (मराठी)",
  gu: "Gujarati (ગુજરાતી)",
  bn: "Bengali (বাংলা)",
  or: "Odia (ଓଡ଼ିଆ)",
  pa: "Punjabi (ਪੰਜਾਬੀ)",
  as: "Assamese (অসমীয়া)",
};

/**
 * Preprocesses and standardizes an image buffer before sending to Gemini:
 * - Validates MIME type and integrity
 * - Auto-orients based on EXIF
 * - Resizes if max dimension > 1400px (preserves weave/brush detail without excess bytes)
 * - Returns optimized JPEG buffer & metadata
 */
export async function preprocessCraftImage(
  imageData: string
): Promise<{ buffer: Buffer; mimeType: string; width: number; height: number; sizeBytes: number }> {
  let inputBuffer: Buffer;
  let detectedMime = "image/jpeg";

  if (imageData.startsWith("data:")) {
    const match = imageData.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (match) {
      detectedMime = match[1];
      inputBuffer = Buffer.from(match[2], "base64");
    } else {
      inputBuffer = Buffer.from(imageData.split(",")[1] || "", "base64");
    }
  } else if (imageData.startsWith("http://") || imageData.startsWith("https://")) {
    const res = await fetch(imageData);
    const arrayBuf = await res.arrayBuffer();
    inputBuffer = Buffer.from(arrayBuf);
    detectedMime = res.headers.get("content-type") || "image/jpeg";
  } else {
    inputBuffer = Buffer.from(imageData, "base64");
  }

  // Use Sharp for validation, auto-orientation, and dimension bounding
  const metadata = await sharp(inputBuffer).metadata();
  const width = metadata.width || 800;
  const height = metadata.height || 600;

  let pipeline = sharp(inputBuffer).rotate(); // auto-rotate based on EXIF

  const maxDimension = 1400;
  if (width > maxDimension || height > maxDimension) {
    pipeline = pipeline.resize({
      width: width >= height ? maxDimension : undefined,
      height: height > width ? maxDimension : undefined,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  // Preserve fine craft details (weaving threads, wood grain, brush strokes)
  const processedBuffer = await pipeline
    .jpeg({
      quality: 88,
      chromaSubsampling: "4:4:4", // Maintain crisp color boundaries for craft motifs
    })
    .toBuffer();

  const finalMeta = await sharp(processedBuffer).metadata();

  return {
    buffer: processedBuffer,
    mimeType: "image/jpeg",
    width: finalMeta.width || width,
    height: finalMeta.height || height,
    sizeBytes: processedBuffer.length,
  };
}

/**
 * Validates and sanitizes raw JSON output into a strict CraftAttributes object
 */
export function validateCraftAttributes(raw: any): CraftAttributes {
  const sanitizeStr = (v: any): string | null => {
    if (typeof v !== "string") return null;
    const trimmed = v.trim();
    if (
      !trimmed ||
      trimmed.toLowerCase() === "unknown" ||
      trimmed.toLowerCase() === "null" ||
      trimmed.toLowerCase() === "n/a"
    ) {
      return null;
    }
    return trimmed;
  };

  const sanitizeStrArray = (v: any): string[] => {
    if (!Array.isArray(v)) return [];
    return v
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0 && item.toLowerCase() !== "unknown");
  };

  const craftCategory = sanitizeStr(raw.craftCategory) || sanitizeStr(raw.category);
  const craftName = sanitizeStr(raw.craftName) || sanitizeStr(raw.title);
  const productType = sanitizeStr(raw.productType) || sanitizeStr(raw.subcategory);
  const material = sanitizeStr(raw.material);
  const technique = sanitizeStr(raw.technique) || sanitizeStr(raw.craft_technique);
  const motif = sanitizeStr(raw.motif);
  const region = sanitizeStr(raw.region);
  const description = sanitizeStr(raw.description);
  const culturalContext = sanitizeStr(raw.culturalContext);

  let confidence = typeof raw.confidence === "number" ? raw.confidence : 0.82;
  if (confidence > 1) confidence = confidence / 100;
  if (isNaN(confidence) || confidence < 0) confidence = 0.75;
  if (confidence > 0.98) confidence = 0.95; // Never claim 100% certainty from photo alone

  const colors = sanitizeStrArray(raw.colors);
  const visualFeatures = sanitizeStrArray(raw.visualFeatures || raw.tags);
  const uncertainAttributes = sanitizeStrArray(raw.uncertainAttributes);

  // Mark uncertain attributes if missing or inferred
  if (!region && !uncertainAttributes.includes("region")) uncertainAttributes.push("region");
  if (!material && !uncertainAttributes.includes("material")) uncertainAttributes.push("material");

  return {
    craftCategory,
    craftName,
    productType,
    material,
    technique,
    motif,
    colors: colors.length ? colors : ["Natural craft tones"],
    region,
    description,
    culturalContext,
    visualFeatures: visualFeatures.length ? visualFeatures : ["Handmade artisan texture"],
    confidence: Number(confidence.toFixed(2)),
    uncertainAttributes,
  };
}

/**
 * Curated knowledge base for authentic Indian crafts with multi-lingual dictionary
 */
export interface CraftTaxonomyEntry {
  keywords: string[];
  canonical: CraftAttributes;
  translations: Partial<Record<LanguageCode, Partial<CraftAttributes>>>;
}

import { CRAFT_KNOWLEDGE_BASE, LOCALIZED_TERMS } from "./craftData.js";
export { CRAFT_KNOWLEDGE_BASE, LOCALIZED_TERMS };

/**
 * Finds matching taxonomy entry by keywords in prompt or image hints
 */
export function matchTaxonomyCraft(textCorpus: string): CraftTaxonomyEntry | null {
  const clean = textCorpus.toLowerCase();
  for (const entry of CRAFT_KNOWLEDGE_BASE) {
    if (entry.keywords.some((kw) => clean.includes(kw.toLowerCase()))) {
      return entry;
    }
  }
  return null;
}

/**
 * Real visual statistical inspection: analyzes image RGB means using Sharp
 * to detect craft category, colors, and craftsmanship profile even offline
 */
export async function detectVisualCraftProfile(
  buffer: Buffer,
  categoryHint?: string,
  regionHint?: string,
  rawSourceUrl?: string
): Promise<{ matched: CraftTaxonomyEntry | null; detectedColors: string[]; confidence: number }> {
  // Check text corpus ONLY if a specific craft hint is provided (ignore generic hints like 'handicraft')
  const cleanCategory = (categoryHint || "").toLowerCase().trim();
  if (cleanCategory && cleanCategory !== "handicraft" && cleanCategory !== "handloom" && cleanCategory !== "all") {
    for (const entry of CRAFT_KNOWLEDGE_BASE) {
      if (entry.keywords.some((kw) => cleanCategory.includes(kw.toLowerCase()))) {
        return { matched: entry, detectedColors: entry.canonical.colors, confidence: 0.88 };
      }
    }
  }

  try {
    const stats = await sharp(buffer).stats();
    const [rChan, gChan, bChan] = stats.channels;
    const r = Math.round(rChan?.mean || 128);
    const g = Math.round(gChan?.mean || 128);
    const b = Math.round(bChan?.mean || 128);

    // 1. High luminance white / off-white -> Lucknowi Chikankari Embroidery
    if (r > 190 && g > 185 && b > 180) {
      const entry = CRAFT_KNOWLEDGE_BASE.find(e => e.canonical.craftName?.includes("Chikankari")) || CRAFT_KNOWLEDGE_BASE[6];
      return { matched: entry, detectedColors: ["Pristine White", "Ivory Cream"], confidence: 0.88 };
    }

    // 2. High blue or cyan dominance -> Jaipur Blue Pottery
    if (b > 115 && b > r * 1.05 && b > g * 0.95) {
      const entry = CRAFT_KNOWLEDGE_BASE.find(e => e.canonical.craftName?.includes("Blue Pottery")) || CRAFT_KNOWLEDGE_BASE[4];
      return { matched: entry, detectedColors: ["Cobalt Blue", "Turquoise", "Natural White Clay"], confidence: 0.88 };
    }

    // 3. Bright primary tones or high contrast lacquerware (saffron/red/wood) -> Channapatna Wooden Toys
    if (r > 160 && g > 120 && b < 100 && (r - g) < 70) {
      const entry = CRAFT_KNOWLEDGE_BASE.find(e => e.canonical.craftName?.includes("Channapatna")) || CRAFT_KNOWLEDGE_BASE[3];
      return { matched: entry, detectedColors: ["Turmeric Yellow", "Sindoor Red", "Leaf Green"], confidence: 0.88 };
    }

    // 4. Earthy terracotta clay tone -> Terracotta Clay Pottery
    if (r > 130 && r <= 200 && g >= 60 && g <= 120 && b < 90 && (r - g) >= 40 && (r - g) <= 100) {
      const terracottaEntry: CraftTaxonomyEntry = {
        keywords: ["terracotta", "clay pot", "earthenware", "terracotta cups", "pottery"],
        canonical: {
          craftCategory: "Pottery",
          craftName: "Terracotta Clay Pottery",
          productType: "Clay Cups / Cookware",
          material: "Natural Alluvial Riverbed Clay",
          technique: "Potter's Wheel Turning & Traditional Kiln Firing",
          motif: "Natural Terracotta Grooves & Hand-Pinched Rim",
          colors: ["Terracotta Rust", "Earthy Red", "Smoky Ochre"],
          region: "Likely Rural Clay Craft Cluster",
          description: "Traditional wheel-thrown earthen pottery handcrafted from natural unglazed riverbed clay and baked in open wood-fired kilns.",
          culturalContext: "Ancient Indian pottery heritage connecting daily life with sustainable earthen craftsmanship.",
          visualFeatures: ["Smooth wheel-thrown concentric ridges", "Natural porous unglazed clay texture", "Warm terracotta reddish-brown earth hue"],
          confidence: 0.88,
          uncertainAttributes: ["exact potter cluster", "dimensions"]
        },
        translations: {}
      };
      return { matched: terracottaEntry, detectedColors: ["Terracotta Rust", "Earthy Red", "Smoky Ochre"], confidence: 0.88 };
    }

    // 5. Rich crimson / maroon / deep textile tones -> Handloom Silk Saree
    if (r > 120 && g < 75 && b < 85 && (r - g) > 55) {
      const entry = CRAFT_KNOWLEDGE_BASE.find(e => e.canonical.craftName?.includes("Saree") || e.canonical.craftName?.includes("Silk")) || CRAFT_KNOWLEDGE_BASE[0];
      return { matched: entry, detectedColors: ["Royal Crimson", "Gold Zari", "Emerald Green"], confidence: 0.88 };
    }

    // 6. Golden / Bronze / Deep antique yellow-brown -> Bastar Dhokra Bell Metal
    if (r > 100 && g > 80 && b < 70 && Math.abs(r - g) < 35) {
      const entry = CRAFT_KNOWLEDGE_BASE.find(e => e.canonical.craftName?.includes("Dhokra")) || CRAFT_KNOWLEDGE_BASE[7];
      return { matched: entry, detectedColors: ["Antique Bronze", "Golden Brass", "Verdigris Patina"], confidence: 0.85 };
    }
  } catch (err) {
    console.warn("Visual color profile analysis fallback note:", err);
  }

  // If none matched with high confidence, return null. NEVER force CRAFT_KNOWLEDGE_BASE[0]!
  return { matched: null, detectedColors: [], confidence: 0 };
}

/**
 * Translates canonical craft attributes into user's selected language
 */
export async function localizeCraftAttributes(
  canonical: CraftAttributes,
  targetLang: LanguageCode
): Promise<CraftAttributes> {
  if (targetLang === "en") {
    return { ...canonical };
  }

  // 1. Check curated knowledge base for exact handcrafted translations
  for (const entry of CRAFT_KNOWLEDGE_BASE) {
    if (
      entry.canonical.craftName?.toLowerCase() === canonical.craftName?.toLowerCase() ||
      (canonical.craftName && entry.keywords.some((kw) => canonical.craftName?.toLowerCase().includes(kw)))
    ) {
      const langTrans = entry.translations[targetLang];
      if (langTrans) {
        return {
          craftCategory: langTrans.craftCategory || canonical.craftCategory,
          craftName: langTrans.craftName || canonical.craftName,
          productType: langTrans.productType || canonical.productType,
          material: langTrans.material || canonical.material,
          technique: langTrans.technique || canonical.technique,
          motif: langTrans.motif || canonical.motif,
          colors: langTrans.colors || canonical.colors,
          region: langTrans.region || canonical.region,
          description: langTrans.description || canonical.description,
          culturalContext: langTrans.culturalContext || canonical.culturalContext,
          visualFeatures: langTrans.visualFeatures || canonical.visualFeatures,
          confidence: canonical.confidence,
          uncertainAttributes: canonical.uncertainAttributes,
        };
      }
    }
  }

  // 2. Call Gemini for dynamic high-quality translation if API is available
  const ai = getAIClient();
  if (ai) {
    try {
      const targetLangName = LANGUAGE_NAMES[targetLang] || targetLang;
      const prompt = `You are an expert cultural linguist and translator of Indian handicrafts.
Translate the following craft attributes into ${targetLangName}.
Translate BOTH labels and values into authentic regional phrasing.
Do not use literal dictionary translations; use natural artisan vocabulary in ${targetLangName}.

Craft Data to Translate:
- Category: ${canonical.craftCategory || ""}
- Craft Name: ${canonical.craftName || ""}
- Product Type: ${canonical.productType || ""}
- Material: ${canonical.material || ""}
- Technique: ${canonical.technique || ""}
- Motif: ${canonical.motif || ""}
- Colors: ${canonical.colors.join(", ")}
- Region: ${canonical.region || ""}
- Description: ${canonical.description || ""}
- Cultural Context: ${canonical.culturalContext || ""}
- Visual Features: ${canonical.visualFeatures.join(", ")}

Return ONLY valid JSON matching this schema:
{
  "craftCategory": "...",
  "craftName": "...",
  "productType": "...",
  "material": "...",
  "technique": "...",
  "motif": "...",
  "colors": ["..."],
  "region": "...",
  "description": "...",
  "culturalContext": "...",
  "visualFeatures": ["..."]
}`;

      const res = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });

      const parsed = JSON.parse(res.text?.trim() || "{}");
      if (parsed.craftName || parsed.description) {
        return {
          craftCategory: parsed.craftCategory || canonical.craftCategory,
          craftName: parsed.craftName || canonical.craftName,
          productType: parsed.productType || canonical.productType,
          material: parsed.material || canonical.material,
          technique: parsed.technique || canonical.technique,
          motif: parsed.motif || canonical.motif,
          colors: Array.isArray(parsed.colors) && parsed.colors.length ? parsed.colors : canonical.colors,
          region: parsed.region || canonical.region,
          description: parsed.description || canonical.description,
          culturalContext: parsed.culturalContext || canonical.culturalContext,
          visualFeatures: Array.isArray(parsed.visualFeatures) && parsed.visualFeatures.length ? parsed.visualFeatures : canonical.visualFeatures,
          confidence: canonical.confidence,
          uncertainAttributes: canonical.uncertainAttributes,
        };
      }
    } catch (e) {
      console.warn(`Dynamic translation to ${targetLang} failed, using rule-based dictionary fallback:`, e);
    }
  }

  // 3. Fallback dictionary localization using LOCALIZED_TERMS across all 12 languages
  const translateTerm = (term: string | null): string | null => {
    if (!term) return null;
    const clean = term.trim();
    if (LOCALIZED_TERMS[clean] && LOCALIZED_TERMS[clean][targetLang]) {
      return LOCALIZED_TERMS[clean][targetLang];
    }
    for (const [key, mapping] of Object.entries(LOCALIZED_TERMS)) {
      if (clean.toLowerCase() === key.toLowerCase() || clean.toLowerCase().includes(key.toLowerCase())) {
        if (mapping[targetLang]) {
          return mapping[targetLang];
        }
      }
    }
    return term;
  };

  const translatedColors = (canonical.colors || []).map((c) => translateTerm(c) || c);

  return {
    ...canonical,
    craftCategory: translateTerm(canonical.craftCategory),
    craftName: translateTerm(canonical.craftName),
    productType: translateTerm(canonical.productType),
    material: translateTerm(canonical.material),
    technique: translateTerm(canonical.technique),
    motif: translateTerm(canonical.motif),
    colors: translatedColors,
    region: translateTerm(canonical.region),
  };
}

/**
 * Main Craft Inspection Orchestrator
 */
export async function inspectCraftImage(
  imageData: string,
  userLanguage: LanguageCode = "en",
  categoryHint?: string,
  regionHint?: string
): Promise<InspectCraftResponse> {
  const startTime = Date.now();
  const locale = LANGUAGE_LOCALES[userLanguage] || "en-IN";

  // 1. Image Preprocessing via Sharp
  let processedImg: { buffer: Buffer; mimeType: string; width: number; height: number; sizeBytes: number };
  try {
    processedImg = await preprocessCraftImage(imageData);
  } catch (err: any) {
    console.warn("Sharp preprocessing failed, continuing with uncompressed payload:", err);
    processedImg = {
      buffer: Buffer.from(imageData.includes(",") ? imageData.split(",")[1] : imageData, "base64"),
      mimeType: "image/jpeg",
      width: 800,
      height: 600,
      sizeBytes: imageData.length,
    };
  }

  // 2. Structured image verification logging (DEVELOPMENT ONLY / DEBUG)
  const isDebug = process.env.DEBUG === "true" || process.env.NODE_ENV !== "production";
  if (isDebug) {
    console.log("\n[AI DEBUG] === INSPECT CRAFT REQUEST ===");
    console.log("[AI DEBUG] Image MIME:", processedImg.mimeType);
    console.log("[AI DEBUG] Image Dimensions:", `${processedImg.width}x${processedImg.height}`);
    console.log("[AI DEBUG] Image Size:", `${processedImg.sizeBytes} bytes`);
    console.log("[AI DEBUG] Selected Language:", userLanguage);
    console.log("[AI DEBUG] ============================\n");
  }

  // 3. Multimodal Analysis via Gemini with Strict JSON prompt
  const ai = getAIClient();
  let strictOutput: StrictDetectedCraftOutput | null = null;
  let canonicalAttributes: CraftAttributes | null = null;
  let modelUsed = "rule-based-handicraft-engine";
  let aiProvider: "gemini" | "demo-heuristic" = "demo-heuristic";
  let rawResponseStatus: "success" | "fallback" | "error" = "fallback";
  let structuredValidation: "passed" | "failed" = "failed";

  const emptyCraftAttributes: CraftAttributes = {
    craftCategory: null,
    craftName: null,
    productType: null,
    material: null,
    technique: null,
    motif: null,
    colors: [],
    region: null,
    description: null,
    culturalContext: null,
    visualFeatures: [],
    confidence: 0,
    uncertainAttributes: ["product_name", "category", "material", "price", "quantity", "short_description"],
  };

  if (ai) {
    try {
      const base64Data = processedImg.buffer.toString("base64");
      const STRICT_PROMPT = `Analyze this photo of an artisan handcrafted product.
You must return a raw JSON object ONLY, with NO markdown formatting, NO code fences (\`\`\`json or \`\`\`), and NO introductory or concluding prose.

The JSON MUST contain EXACTLY these keys:
{
  "product_name": "Specific craft or product name, or empty string if uncertain",
  "category": "High-level craft category (e.g. Handloom, Pottery, Woodcraft, Metalcraft, Embroidery, Jewelry, Bamboo), or empty string if uncertain",
  "material": "Visible natural/authentic craft materials (e.g. Pure Silk, Terracotta Clay, Brass, Teak Wood), or empty string if uncertain",
  "colour": "Dominant visible color or colors, or empty string if uncertain",
  "dimensions": "Estimated dimensions if visually discernable (e.g. 6 yards, 10x5 cm), or empty string if uncertain",
  "craft_technique": "Specific artisanal technique visible (e.g. Handloom Jacquard Weaving, Wheel Thrown, Lost-wax casting, Lacquer turning), or empty string if uncertain",
  "suggested_price_range": "Estimated fair artisan price range in INR (e.g. ₹500 - ₹800), or empty string if uncertain",
  "short_description": "Factual 1-2 sentence description of visible handmade features and craftsmanship, or empty string if uncertain",
  "confidence": 0.85
}

CRITICAL RULES:
1. ONLY describe what is clearly visible in the image.
2. If any field cannot be determined with high confidence, set its value to an empty string "". DO NOT guess, hallucinate, or fill placeholders.
3. The "confidence" key must be a number between 0.0 and 1.0 representing your overall visual confidence.
4. Output raw JSON ONLY.`;

      const candidateModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
      let response: any = null;
      let usedModel = "gemini-2.5-flash";

      for (const m of candidateModels) {
        try {
          if (isDebug) {
            console.log(`[AI DEBUG] Attempting model ${m}...`);
          }
          response = await ai.models.generateContent({
            model: m,
            contents: [
              {
                role: "user",
                parts: [
                  {
                    inlineData: {
                      mimeType: processedImg.mimeType,
                      data: base64Data,
                    },
                  },
                  { text: STRICT_PROMPT },
                ],
              },
            ],
            config: {
              responseMimeType: "application/json",
            },
          });
          usedModel = m;
          if (response && response.text) break;
        } catch (modelErr: any) {
          console.warn(`Gemini model ${m} invocation attempt note:`, modelErr?.message || modelErr);
        }
      }

      if (response && response.text) {
        if (isDebug) {
          console.log("\n[AI DEBUG] === RAW MODEL RESPONSE ===");
          console.log(response.text);
          console.log("[AI DEBUG] ============================\n");
        }
        let cleanText = response.text.trim();
        if (cleanText.startsWith("```")) {
          cleanText = cleanText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
        }
        const parsed = JSON.parse(cleanText || "{}");
        strictOutput = validateStrictCraftOutput(parsed);
        if (strictOutput && strictOutput.confidence >= 0.60) {
          modelUsed = usedModel;
          aiProvider = "gemini";
          rawResponseStatus = "success";
          structuredValidation = "passed";
        }
      }
    } catch (e: any) {
      console.warn("Gemini craft vision API call note:", e?.message || e);
      rawResponseStatus = "error";
    }
  }

  // 4. Visual Statistical Inspection Fallback if Gemini key is missing, offline, or low confidence
  if (!strictOutput || strictOutput.confidence < 0.60) {
    aiProvider = "demo-heuristic";
    modelUsed = "visual-statistical-profiler";

    const { matched, detectedColors, confidence: matchConf } = await detectVisualCraftProfile(
      processedImg.buffer,
      categoryHint,
      regionHint,
      imageData.startsWith("http") ? imageData : undefined
    );

    if (matched) {
      strictOutput = validateStrictCraftOutput({
        product_name: matched.canonical.craftName,
        category: matched.canonical.craftCategory,
        material: matched.canonical.material,
        colour: detectedColors.length ? detectedColors.join(", ") : matched.canonical.colors.join(", "),
        dimensions: "",
        craft_technique: matched.canonical.technique,
        suggested_price_range: "",
        short_description: matched.canonical.description,
        confidence: matchConf || 0.82,
      });
      rawResponseStatus = "fallback";
      structuredValidation = "passed";
    } else {
      // Could NOT read the photo with high confidence
      rawResponseStatus = "error";
      structuredValidation = "failed";
      strictOutput = validateStrictCraftOutput({ confidence: 0 });
    }
  }

  // If photo could not be read or recognized with confidence >= 0.60, return real error state
  if (!strictOutput || strictOutput.confidence < 0.60) {
    const latencyMs = Date.now() - startTime;
    return {
      success: false,
      error: "could_not_read_photo",
      message: "Couldn't read the photo, let's fill the details by voice instead",
      data: strictOutput || validateStrictCraftOutput({ confidence: 0 }),
      language: userLanguage,
      locale,
      canonicalAttributes: { ...emptyCraftAttributes },
      localizedAttributes: { ...emptyCraftAttributes },
      confidence: 0,
      uncertainAttributes: ["product_name", "category", "material", "price", "quantity", "short_description"],
      aiProvider: "demo-heuristic",
      modelUsed: "visual-statistical-profiler",
      isFallback: true,
      debug: {
        provider: "Demo Heuristic",
        model: "visual-statistical-profiler",
        imageReceived: true,
        imageMime: processedImg.mimeType,
        imageDimensions: { width: processedImg.width, height: processedImg.height },
        imageSizeBytes: processedImg.sizeBytes,
        selectedLanguage: userLanguage,
        locale,
        rawResponseStatus: "error",
        structuredValidation: "failed",
        confidenceScore: 0,
        uncertainCount: 6,
        translationStatus: "passthrough",
        voiceSupported: true,
        latencyMs,
      },
    };
  }

  // Build canonical attributes from validated strict output
  const colorsList = strictOutput.colour
    ? strictOutput.colour.split(/[,&]/).map((s) => s.trim()).filter(Boolean)
    : [];

  const uncertainList = Object.entries(strictOutput.needs_user_input)
    .filter(([_, needed]) => needed)
    .map(([k]) => k);

  canonicalAttributes = {
    craftCategory: strictOutput.category || null,
    craftName: strictOutput.product_name || null,
    productType: null,
    material: strictOutput.material || null,
    technique: strictOutput.craft_technique || null,
    motif: null,
    colors: colorsList,
    region: null,
    description: strictOutput.short_description || null,
    culturalContext: null,
    visualFeatures: [],
    confidence: strictOutput.confidence,
    uncertainAttributes: uncertainList,
  };

  // 5. Localize Attributes into User's Selected Language
  let localizedAttributes: CraftAttributes;
  let translationStatus: "success" | "fallback" | "passthrough" = "passthrough";

  if (userLanguage === "en") {
    localizedAttributes = { ...canonicalAttributes };
    translationStatus = "passthrough";
  } else {
    try {
      localizedAttributes = await localizeCraftAttributes(canonicalAttributes, userLanguage);
      translationStatus = "success";
    } catch {
      localizedAttributes = { ...canonicalAttributes };
      translationStatus = "fallback";
    }
  }

  const latencyMs = Date.now() - startTime;

  const debug: AIDebugInfo = {
    provider: aiProvider === "gemini" ? "Gemini" : "Demo Heuristic",
    model: modelUsed,
    imageReceived: true,
    imageMime: processedImg.mimeType,
    imageDimensions: { width: processedImg.width, height: processedImg.height },
    imageSizeBytes: processedImg.sizeBytes,
    selectedLanguage: userLanguage,
    locale,
    rawResponseStatus,
    structuredValidation,
    confidenceScore: strictOutput.confidence,
    uncertainCount: uncertainList.length,
    translationStatus,
    voiceSupported: true,
    latencyMs,
  };

  return {
    success: true,
    name: strictOutput.product_name,
    type: strictOutput.category,
    color: strictOutput.colour,
    detectedDetails: {
      material: strictOutput.material,
      technique: strictOutput.craft_technique,
      description: strictOutput.short_description,
      dimensions: strictOutput.dimensions,
    },
    data: strictOutput,
    language: userLanguage,
    locale,
    canonicalAttributes,
    localizedAttributes,
    confidence: strictOutput.confidence,
    uncertainAttributes: uncertainList,
    aiProvider,
    modelUsed,
    isFallback: aiProvider === "demo-heuristic",
    notice:
      aiProvider === "demo-heuristic"
        ? "Notice: Running in Demo / Heuristic AI mode. Real Gemini multimodal analysis requires GEMINI_API_KEY."
        : undefined,
    debug,
  };
}

/**
 * Natural voice correction engine:
 * Extracts field-level edits from spoken transcripts in any Indian language
 * e.g. "The material is silk", "రంగు నీలం", "शिल्प कलमकारी नहीं पोचमपल्ली है"
 */
export async function extractVoiceCorrection(
  transcript: string,
  language: LanguageCode = "en",
  currentAttributes: CraftAttributes
): Promise<VoiceCorrectionResult> {
  const text = transcript.trim().toLowerCase();

  // Natural language affirmative / negative checks
  const yesWords = [
    "yes", "correct", "right", "good", "okay", "save", "confirm",
    "हाँ", "सही", "ठीक", "हां", "सहेजें",
    "అవును", "సరిగ్గా ఉంది", "బాగుంది", "ఖరారు చేయండి",
    "ஆம்", "சரி", "உண்மை",
    "ಹೌದು", "ಸರಿ",
    "അതെ", "ശരി",
    "होय", "बरोबर",
    "હા", "સાચું",
    "হ্যাঁ", "ঠিক",
    "ହଁ", "ଠିକ୍",
    "ਹਾਂ", "ਸਹੀ",
    "হয়", "ঠিক"
  ];

  for (const y of yesWords) {
    if (text === y.toLowerCase() || text.startsWith(y.toLowerCase() + " ") || text.endsWith(" " + y.toLowerCase())) {
      return {
        success: true,
        field: null,
        canonicalValue: "CONFIRMED",
        localizedValue: "CONFIRMED",
        extractedFrom: transcript,
        confidence: 0.96,
      };
    }
  }

  const noWords = [
    "no", "nope", "not right", "not correct", "wrong", "change", "incorrect", "false",
    "नहीं", "ना", "गलत", "सही नहीं", "सही नहीं है", "बदलो", "गलत है",
    "కాదు", "వద్దు", "తప్పు", "సరిగ్గా లేదు", "మార్చండి", "తప్పుగా ఉంది",
    "இல்லை", "தவறு", "சரி இல்லை", "மாற்று",
    "ಇಲ್ಲ", "ತಪ್ಪು", "ಸರಿಯಿಲ್ಲ", "ಬದಲಾಯಿಸಿ",
    "അല്ല", "തെറ്റ്", "ശരിയല്ല", "മാറ്റുക",
    "नाही", "चूक", "बरोबर नाही", "बदला",
    "ના", "ખોટું", "બરાબર નથી", "બદલો",
    "না", "ভুল", "ঠিক নয়", "পরিবর্তন করুন",
    "ନା", "ଭୁଲ", "ଠିକ୍ ନୁହେଁ", "ବଦଳାନ୍ତୁ",
    "ਨਹੀਂ", "ਗਲਤ", "ਸਹੀ ਨਹੀਂ", "ਬਦਲੋ",
    "নহয়", "ভুল", "ঠিক নহয়", "সলনি কৰক"
  ];

  for (const n of noWords) {
    if (text === n.toLowerCase() || text.startsWith(n.toLowerCase() + " ") || text.endsWith(" " + n.toLowerCase())) {
      return {
        success: true,
        field: null,
        canonicalValue: "AWAITING_FIELD",
        localizedValue: "AWAITING_FIELD",
        extractedFrom: transcript,
        confidence: 0.95,
      };
    }
  }

  // Field indicator triggers
  const fieldTriggers: Array<{ field: keyof CraftAttributes; words: string[] }> = [
    {
      field: "material",
      words: ["material", "the material", "మెటీరియల్", "పదార్థం", "సామగ్రి", "सामग्री", "पदार्थ", "பொருள்", "ವಸ್ತು", "സാമഗ്രി", "સામગ્રી", "উপাদান", "ଉପାଦାନ", "ਸਮੱਗਰੀ", "সামগ্ৰী"]
    },
    {
      field: "craftName",
      words: ["craft name", "craft", "the craft", "name", "హస్తకళ", "కళ పేరు", "పేరు", "शिल्प नाम", "शिल्प", "नाम", "கைவினை", "பெயர்", "ಕರಕುಶಲ", "ಹೆಸರು"]
    },
    {
      field: "productType",
      words: ["product type", "product", "type", "రకం", "ఉత్పత్తి", "ఉత్పత్తి రకం", "उत्पाद प्रकार", "उत्पाद", "வகை"]
    },
    {
      field: "technique",
      words: ["technique", "method", "విధానం", "పద్ధతి", "నేత పద్ధతి", "तकनीक", "पद्धति", "தொழில்நுட்பம்", "విధానము"]
    },
    {
      field: "colors",
      words: ["color", "colors", "colour", "colours", "రంగు", "రంగులు", "रंग", "वर्ण", "வண்ணம்", "ಬಣ್ಣ", "നിറം"]
    },
    {
      field: "region",
      words: ["region", "origin", "state", "place", "ప్రాంతం", "ప్రదేశం", "స్థలం", "क्षेत्र", "स्थान", "राज्य", "இடம்", "ಪ್ರದೇಶ"]
    }
  ];

  for (const ft of fieldTriggers) {
    for (const w of ft.words) {
      if (text === w.toLowerCase() || text === `the ${w.toLowerCase()}` || text === `${w.toLowerCase()} please`) {
        return {
          success: true,
          field: ft.field,
          canonicalValue: "AWAITING_VALUE",
          localizedValue: "AWAITING_VALUE",
          extractedFrom: transcript,
          confidence: 0.94,
        };
      }
    }
  }

  // 1. Material Keywords
  const materialDict: Record<string, { canonical: string; aliases: string[]; localized: Record<LanguageCode, string> }> = {
    silk: {
      canonical: "Pure Mulberry Silk",
      aliases: ["silk", "పట్టు", "రేశం", "रेशम", "पट्टू", "பட்டு", "ರೇಷ್ಮೆ", "പട്ട്", "রেশম", "ਰੇਸ਼ਮ", "reshem", "pattu"],
      localized: { en: "Pure Mulberry Silk", te: "స్వచ్ఛమైన పట్టు", hi: "शुद्ध रेशम", ta: "தூய பட்டு", kn: "ಶುದ್ಧ ರೇಷ್ಮೆ", ml: "ശുദ്ധമായ പട്ട്", mr: "शुद्ध रेशीम", gu: "શુદ્ધ રેશમ", bn: "খাঁটি রেশম", or: "ବିଶୁଦ୍ଧ ରେଶମ", pa: "ਸ਼ੁੱਧ ਰੇਸ਼ਮ", as: "বিশুদ্ধ ৰেচম" },
    },
    cotton: {
      canonical: "Pure Handloom Cotton",
      aliases: ["cotton", "పత్తి", "కాటన్", "సూతీ", "सूती", "कपास", "பருத்தி", "ಹತ್ತಿ", "പരുത്തി", "সুতি", "ਸੂਤੀ", "ਕਪাহী"],
      localized: { en: "Pure Handloom Cotton", te: "చేనేత పత్తి / కాటన్", hi: "शुद्ध हथकरघा सूती", ta: "தூய பருத்தி", kn: "ಹತ್ತಿ", ml: "പരുത്തി", mr: "सुती", gu: "સુતરાઉ", bn: "সুতি", or: "କପା", pa: "ਸੂਤੀ", as: "ਕਪাহী" },
    },
    clay: {
      canonical: "Natural Riverbed Terracotta Clay",
      aliases: ["clay", "terracotta", "మట్టి", "టెర్రకోట", "मिट्टी", "टेराकोटा", "களிமண்", "ಮಣ್ಣು", "കളിമണ്ണ്", "মাটি", "ମାଟି"],
      localized: { en: "Natural Terracotta Clay", te: "సహజ బంకమట్టి / టెర్రకోట", hi: "प्राकृतिक नदी की मिट्टी", ta: "இயற்கை களிமண்", kn: "ನೈಸರ್ಗಿಕ ಜೇಡಿಮಣ್ಣು", ml: "കളിമണ്ണ്", mr: "नैसर्गिक माती", gu: "કુદરતી માટી", bn: "প্রাকৃতিক মাটি", or: "ପ୍ରାକୃତିକ ମାଟି", pa: "ਕੁਦਰਤੀ ਮਿੱਟੀ", as: "প্ৰাকৃতিক মাটি" },
    },
    wood: {
      canonical: "Natural Seasoned Wood",
      aliases: ["wood", "wooden", "చెక్క", "लकड़ी", "काठ", "மர", "ಮರ", "തടി", "લાકડું", "কাঠ", "କାଠ", "ਲੱਕੜ"],
      localized: { en: "Natural Seasoned Wood", te: "సహజ చెక్క", hi: "प्राकृतिक लकड़ी", ta: "இயற்கை மரம்", kn: "ನೈಸರ್ಗಿಕ ಮರ", ml: "തടി", mr: "नैसर्गिक लाकूड", gu: "કુદરતી લાકડું", bn: "প্রাকৃতিক কাঠ", or: "ପ୍ରାକୃତିକ କାଠ", pa: "ਕੁਦਰਤੀ ਲੱਕੜ", as: "প্ৰাকৃতিক কাঠ" },
    },
    brass: {
      canonical: "Hand-Cast Brass & Bell Metal",
      aliases: ["brass", "bronze", "bell metal", "కంచు", "ఇత్తడి", "पीतल", "कांसा", "பித்தளை", "ಹಿತ್ತಾಳೆ", "പിച്ചള", "पितल", "ପିତ୍ତଳ", "ਪਿੱਤਲ"],
      localized: { en: "Hand-Cast Brass & Bell Metal", te: "ఇత్తడి & కంచు మిశ్రమం", hi: "हस्तनिर्मित पीतल एवं कांसा", ta: "பித்தளை மற்றும் வெண்கலம்", kn: "ಹಿತ್ತಾಳೆ ಮತ್ತು ಕಂಚು", ml: "പിച്ചളയും വെങ്കലവും", mr: "पितळ आणि कासे", gu: "પિત્તળ અને કાંસું", bn: "পিতল ও কাঁসা", or: "ପିତ୍ତଳ ଏବଂ କଂସା", pa: "ਪਿੱਤਲ ਅਤੇ ਕਾਂਸੀ", as: "পিতল আৰু কাঁহ" },
    },
    bamboo: {
      canonical: "Hand-Split Organic Bamboo & Cane",
      aliases: ["bamboo", "cane", "వెదురు", "बांस", "మూங்கில்", "ಬಿದಿರು", "മുള", "बांबू", "વાંસ", "বাঁশ", "ବାଉଁଶ", "ਬਾਂਸ", "বাঁহ"],
      localized: { en: "Organic Bamboo & Cane", te: "సహజ వెదురు", hi: "प्राकृतिक बांस", ta: "இயற்கை மூங்கில்", kn: "ನೈಸರ್ಗಿಕ ಬಿದಿರು", ml: "മുള", mr: "नैसर्गिक बांबू", gu: "કુદરતી વાંસ", bn: "প্রাকৃতিক বাঁশ", or: "ପ୍ରାକୃତିକ ବାଉଁଶ", pa: "ਕੁਦਰਤੀ ਬਾਂਸ", as: "প্ৰাকৃতিক বাঁহ" },
    },
    wool: {
      canonical: "Pure Himalayan Wool",
      aliases: ["wool", "woolen", "ఉన్ని", "ऊन", "கம்பளி", "ಉಣ್ಣೆ", "കമ്പിളി", "পশম", "ଉଲ୍", "ਉੱਨ", "ঊণ"],
      localized: { en: "Pure Himalayan Wool", te: "స్వచ్ఛమైన ఉన్ని", hi: "शुद्ध ऊन", ta: "தூய கம்பளி", kn: "ಶುದ್ಧ ಉಣ್ಣೆ", ml: "ശുദ്ധമായ കമ്പിളി", mr: "शुद्ध लोकर", gu: "શુદ્ધ ઉન", bn: "খাঁটি পশম", or: "ବିଶୁଦ୍ଧ ଉଲ୍", pa: "ਸ਼ੁੱਧ ਉੱਨ", as: "বিশুদ্ধ ঊণ" },
    }
  };

  for (const [matKey, matObj] of Object.entries(materialDict)) {
    const regionalTerms = Object.values(matObj.localized).map((s) => s.toLowerCase());
    const allMatches = [matKey, ...matObj.aliases, ...regionalTerms];
    if (allMatches.some((term) => text.includes(term.toLowerCase()))) {
      return {
        success: true,
        field: "material",
        canonicalValue: matObj.canonical,
        localizedValue: matObj.localized[language] || matObj.canonical,
        extractedFrom: transcript,
        confidence: 0.92,
      };
    }
  }

  // Fallback to Gemini
  const ai = getAIClient();
  if (ai) {
    try {
      const prompt = `Artisan spoken transcript (language: ${language}): "${transcript}"
Determine which field the artisan is correcting: ["craftName", "material", "technique", "craftCategory", "region", "motif", "productType"]
Return ONLY JSON:
{
  "field": "material",
  "canonicalValue": "Pure Mulberry Silk",
  "localizedValue": "..."
}`;
      const res = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });
      const parsed = JSON.parse(res.text?.trim() || "{}");
      if (parsed.field && parsed.canonicalValue) {
        return {
          success: true,
          field: parsed.field,
          canonicalValue: parsed.canonicalValue,
          localizedValue: parsed.localizedValue || parsed.canonicalValue,
          extractedFrom: transcript,
          confidence: 0.88,
        };
      }
    } catch (e) {
      console.warn("Gemini craft voice correction fallback:", e);
    }
  }

  return {
    success: true,
    field: "craftName",
    canonicalValue: transcript,
    localizedValue: transcript,
    extractedFrom: transcript,
    confidence: 0.72,
  };
}


function normalizeSpokenNumberWords(text: string): string {
  const numberWordMap: Record<string, string> = {
    // English
    zero: "0", one: "1", two: "2", three: "3", four: "4", five: "5", six: "6", seven: "7", eight: "8", nine: "9",
    ten: "10", eleven: "11", twelve: "12", thirteen: "13", fourteen: "14", fifteen: "15", sixteen: "16", seventeen: "17",
    eighteen: "18", nineteen: "19", twenty: "20", thirty: "30", forty: "40", fifty: "50", sixty: "60", seventy: "70",
    eighty: "80", ninety: "90", hundred: "100", "two hundred": "200", "three hundred": "300", "four hundred": "400",
    "five hundred": "500", "six hundred": "600", "seven hundred": "700", "eight hundred": "800", "nine hundred": "900",
    thousand: "1000", "two thousand": "2000", "two thousand five hundred": "2500", "three thousand": "3000",
    // Hindi
    शून्य: "0", एक: "1", दो: "2", तीन: "3", चार: "4", पांच: "5", पाँच: "5", छह: "6", सात: "7", आठ: "8", नौ: "9",
    दस: "10", ग्यारह: "11", बारह: "12", तेरह: "13", चौदह: "14", पंद्रह: "15", सोलह: "16", सत्रह: "17", अठारह: "18",
    उन्नीस: "19", बीस: "20", पच्चीस: "25", तीस: "30", चालीस: "40", पचास: "50", साठ: "60", सत्तर: "70", अस्सी: "80",
    नब्बे: "90", सौ: "100", "दो सौ": "200", "तीन सौ": "300", "चार सौ": "400", "पांच सौ": "500", "आठ सौ": "800",
    हजार: "1000", "दो हजार": "2000", "ढाई हजार": "2500",
    // Telugu
    సున్నా: "0", ఒకటి: "1", రెండు: "2", మూడు: "3", నాలుగు: "4", ఐదు: "5", ఆరు: "6", ఏడు: "7", ఎనిమిది: "8", తొమ్మిది: "9",
    పది: "10", పదకొండు: "11", పన్నెండు: "12", పదమూడు: "13", పద్నాలుగు: "14", పదిహేను: "15", పదహారు: "16", పదిహేడు: "17",
    పద్దెనిమిది: "18", పంతొమ్మిది: "19", ఇరవై: "20", "ఇరవై ఐదు": "25", ముప్పై: "30", నలభై: "40", యాభై: "50",
    వంద: "100", "రెండు వందలు": "200", "ఐదు వందలు": "500", "ఎనిమిది వందలు": "800", వేయి: "1000", వెయ్యి: "1000",
    "రెండు వేలు": "2000", "రెండు వేల ఐదు వందలు": "2500",
    // Tamil
    பூஜ்ஜியம்: "0", ஒன்று: "1", இரண்டு: "2", மூன்று: "3", நான்கு: "4", ஐந்து: "5", ஆறு: "6", ஏழு: "7", எட்டு: "8",
    ஒன்பது: "9", பத்து: "10", பன்னிரண்டு: "12", பதினைந்து: "15", இருபது: "20", ஐம்பது: "50", நூறு: "100",
    "ஐந்நூறு": "500", "எண்ணூறு": "800", ஆயிரம்: "1000",
    // Kannada
    ಸೊನ್ನೆ: "0", ಒಂದು: "1", ಎರಡು: "2", ಮೂರು: "3", ನಾಲ್ಕು: "4", ಐದು: "5", ಆರು: "6", ಏಳು: "7", ಎಂಟು: "8",
    ಒಂಬತ್ತು: "9", ಹತ್ತು: "10", ಹನ್ನೆರಡು: "12", ಹದಿನೈದು: "15", ಇಪ್ಪತ್ತು: "20", ಐವತ್ತು: "50", ನೂರು: "100",
    "ಐನೂರು": "500", "ಎಂಟುನೂರು": "800", ಸಾವಿರ: "1000"
  };

  let normalized = text.toLowerCase();
  const sortedWords = Object.entries(numberWordMap).sort((a, b) => b[0].length - a[0].length);
  for (const [word, digit] of sortedWords) {
    const reg = new RegExp(`\\b${word}\\b`, "gi");
    normalized = normalized.replace(reg, digit);
  }
  return normalized;
}

export interface TargetFieldExtractionResult {
  success: boolean;
  field: string;
  canonicalValue: any;
  localizedValue: any;
  displayValue: string;
  isConfirmation?: boolean;
  isRejection?: boolean;
  spokenConfirmation: string;
  rawTranscript: string;
}

/**
 * Targeted single-field natural language voice extractor
 * Extracts specifically the field being queried without corrupting other attributes
 */
export async function extractTargetFieldFromVoice(
  transcript: string,
  targetField: string,
  language: LanguageCode = "en",
  currentFormState: Record<string, any> = {}
): Promise<TargetFieldExtractionResult> {
  const text = transcript.trim();
  const cleanLower = text.toLowerCase().replace(/[,.?!;:]/g, " ").replace(/\s+/g, " ").trim();
  const normalizedNumbers = normalizeSpokenNumberWords(text);

  // Material dictionary for multilingual canonical mappings
  const materialDictionary: Record<string, { canonical: string; aliases: string[]; localized: Record<LanguageCode, string> }> = {
    cotton: {
      canonical: "cotton",
      aliases: ["cotton", "పత్తి", "కాటన్", "సూతీ", "सूती", "कपास", "பருத்தி", "ಹತ್ತಿ", "പരുത്തി", "সুতি", "ਸੂਤੀ", "ਕਪাহী"],
      localized: { en: "Cotton", te: "పత్తి / కాటన్", hi: "सूती / कपास", ta: "பருத்தி", kn: "ಹತ್ತಿ", ml: "പരുത്തി", mr: "सुती", gu: "સુતરાઉ", bn: "সুতি", or: "କପା", pa: "ਸੂਤੀ", as: "ਕਪাহী" },
    },
    silk: {
      canonical: "silk",
      aliases: ["silk", "పట్టు", "రేశం", "रेशम", "पट्टू", "பட்டு", "ರೇಷ್ಮೆ", "പട്ട്", "রেশম", "ਰੇਸ਼ਮ", "reshem", "pattu"],
      localized: { en: "Silk", te: "పట్టు", hi: "रेशम", ta: "பட்டு", kn: "ರೇಷ್ಮೆ", ml: "പട്ട്", mr: "रेशीम", gu: "રેશમ", bn: "রেশম", or: "ਰੇଶମ", pa: "ਰੇਸ਼ਮ", as: "ৰেচম" },
    },
    clay: {
      canonical: "clay",
      aliases: ["clay", "terracotta", "మట్టి", "టెర్రకోట", "मिट्टी", "टेराकोटा", "களிமண்", "ಮಣ್ಣು", "കളിമണ്ണ്", "মাটি", "ମାଟି"],
      localized: { en: "Terracotta Clay", te: "బంకమట్టి / టెర్రకోట", hi: "प्राकृतिक मिट्टी", ta: "களிமண்", kn: "ಜೇಡಿಮಣ್ಣು", ml: "കളിമണ്ണ്", mr: "माती", gu: "માટી", bn: "মাটি", or: "ମାଟି", pa: "ਮਿੱਟੀ", as: "মাটি" },
    },
    wood: {
      canonical: "wood",
      aliases: ["wood", "wooden", "చెక్క", "लकड़ी", "काठ", "மர", "ಮರ", "തടി", "લાકડું", "কাঠ", "କାଠ", "ਲੱਕੜ"],
      localized: { en: "Wood", te: "సహజ చెక్క", hi: "प्राकृतिक लकड़ी", ta: "மரம்", kn: "ಮರ", ml: "തടി", mr: "લાકूड", gu: "લાકડું", bn: "কাঠ", or: "କାଠ", pa: "ਲੱਕੜ", as: "কাঠ" },
    },
    brass: {
      canonical: "brass",
      aliases: ["brass", "bronze", "bell metal", "కంచు", "ఇత్తడి", "पीतल", "कांसा", "பித்தளை", "ಹಿತ್ತಾಳೆ", "പിച്ചള", "पितल", "ପିତ୍ତଳ", "ਪਿੱਤਲ"],
      localized: { en: "Brass & Bronze", te: "ఇత్తడి & కంచు", hi: "पीतल एवं कांसा", ta: "பித்தளை", kn: "ಹಿತ್ತಾಳೆ", ml: "പിച്ചള", mr: "पितळ", gu: "પિત્તળ", bn: "पितল", or: "ପିତ୍ତଳ", pa: "ਪਿੱਤਲ", as: "पितল" },
    },
    bamboo: {
      canonical: "bamboo",
      aliases: ["bamboo", "cane", "వెదురు", "बांस", "మూங்கில்", "ಬಿದಿರು", "മുള", "बांबू", "વાંસ", "বাঁশ", "ବାଉଁଶ", "ਬਾਂਸ", "বাঁহ"],
      localized: { en: "Bamboo & Cane", te: "వెదురు", hi: "बांस", ta: "மூங்கில்", kn: "ಬಿದಿರು", ml: "മുള", mr: "बांबू", gu: "વાંસ", bn: "বাঁশ", or: "ବାଉଁଶ", pa: "ਬਾਂਸ", as: "বাঁহ" },
    },
    wool: {
      canonical: "wool",
      aliases: ["wool", "woolen", "ఉన్ని", "ऊन", "கம்பளி", "ಉಣ್ಣೆ", "ಕമ്പിളി", "পশম", "ଉଲ୍", "ਉੱਨ", "ঊণ"],
      localized: { en: "Wool", te: "Wool", hi: "ऊन", ta: "கம்பளி", kn: "ಉಣ್ಣೆ", ml: "കമ്പിളി", mr: "लोकर", gu: "ઉન", bn: "পশম", or: "ଉଲ୍", pa: "ਉੱਨ", as: "ঊণ" },
    },
  };

  // Check for inline corrections or material mentions first
  for (const [matKey, matObj] of Object.entries(materialDictionary)) {
    const regionalTerms = Object.values(matObj.localized).map((s) => s.toLowerCase());
    const allMatches = [matKey, ...matObj.aliases, ...regionalTerms];
    if (allMatches.some((term) => cleanLower.includes(term.toLowerCase()))) {
      return {
        success: true,
        field: targetField === "confirmation" ? "material" : targetField,
        canonicalValue: matObj.canonical,
        localizedValue: matObj.localized[language] || matObj.canonical,
        displayValue: matObj.localized[language] || matObj.canonical,
        isConfirmation: false,
        isRejection: false,
        spokenConfirmation:
          language === "te"
            ? `నేను మెటీరియల్ ${matObj.localized[language] || matObj.canonical} అని విన్నాను. ఇది సరైనదేనా?`
            : language === "hi"
            ? `मैंने सामग्री ${matObj.localized[language] || matObj.canonical} सुनी। क्या यह सही है?`
            : `I heard ${matObj.localized[language] || matObj.canonical} for material. Is that correct?`,
        rawTranscript: transcript
      };
    }
  }

  // 1. Check for Rejection FIRST ("No", "नहीं", "కాదు", "తప్పు", "No, that is not right.")
  const noWords = [
    "no", "nope", "not right", "not correct", "wrong", "change", "incorrect", "false",
    "that is not right", "thats not right", "no that is not right",
    "नहीं", "ना", "गलत", "सही नहीं", "बदलो", "गलत है",
    "కాదు", "వద్దు", "తప్పు", "సరిగ్గా లేదు", "మార్చండి",
    "இல்லை", "தவறு", "இಲ್ಲ", "ತಪ್ಪು", "അല്ല", "തെറ്റ്", "नाही", "चूक", "ના", "ખોટું",
    "না", "ভুল", "ନା", "ଭୁଲ", "ਨਹੀਂ", "ਗਲਤ", "নহয়"
  ];

  for (const n of noWords) {
    if (
      cleanLower === n.toLowerCase() ||
      cleanLower.startsWith(n.toLowerCase() + " ") ||
      cleanLower.endsWith(" " + n.toLowerCase()) ||
      cleanLower.includes("not right") ||
      cleanLower.includes("not correct") ||
      cleanLower.startsWith("no ") ||
      cleanLower === "no"
    ) {
      return {
        success: true,
        field: targetField,
        canonicalValue: false,
        localizedValue: false,
        displayValue: "Rejected",
        isRejection: true,
        spokenConfirmation: language === "te" ? "మరలా ప్రయత్నిద్దాం." : language === "hi" ? "कृपया दोबारा बताएं।" : "Let's try again.",
        rawTranscript: transcript
      };
    }
  }

  // 2. Check for Confirmation / Affirmation ("Yes", "हाँ", "అవును", "Yes, that is correct.")
  const yesWords = [
    "yes", "correct", "right", "true", "okay", "save", "confirm", "perfect", "good",
    "that is correct", "thats correct", "yes that is correct",
    "हाँ", "सही", "ठीक", "हां", "सहेजें", "बिल्कुल", "सही है",
    "అవును", "సరిగ్గా ఉంది", "బాగుంది", "ఖరారు చేయండి", "ఖరారు", "ఖచ్చితంగా",
    "ஆம்", "சரி", "உண்மை", "ಹೌದು", "ಸರಿ", "അതെ", "ശരി", "होय", "बरोबर", "હા", "સાચું",
    "হ্যাঁ", "ঠিক", "ହଁ", "ଠିକ୍", "ਹਾਂ", "ਸਹੀ", "হয়"
  ];

  for (const y of yesWords) {
    if (
      cleanLower === y.toLowerCase() ||
      cleanLower.startsWith(y.toLowerCase() + " ") ||
      cleanLower.endsWith(" " + y.toLowerCase()) ||
      cleanLower.includes("that is correct") ||
      cleanLower.includes("thats correct") ||
      cleanLower.startsWith("yes ") ||
      cleanLower === "yes"
    ) {
      return {
        success: true,
        field: targetField,
        canonicalValue: true,
        localizedValue: true,
        displayValue: "Confirmed",
        isConfirmation: true,
        spokenConfirmation: language === "te" ? "నమోదు చేయబడింది." : language === "hi" ? "सहेज लिया गया।" : "Saved.",
        rawTranscript: transcript
      };
    }
  }

  // 3. Field-Specific Value Extraction
  let canonicalVal: any = null;
  let localizedVal: any = null;
  let displayStr = "";
  let spokenConfirm = "";

  if (targetField === "laborHours") {
    const match = normalizedNumbers.match(/(\d+)\s*(?:hours|hour|hrs|घंटे|घंटा|గంటలు|గంట|மணிநேரம்|ಗಂಟೆ)?/i) ||
                  normalizedNumbers.match(/(?:spent|took|worked|పట్టింది|తీసుకుంది|लगे|काम किया)\s*(\d+)/i) ||
                  normalizedNumbers.match(/(\d+)/);
    if (match) {
      const h = parseInt(match[1], 10);
      if (h >= 1 && h <= 500) {
        canonicalVal = h;
        localizedVal = h;
        displayStr = `${h} hours`;
        spokenConfirm =
          language === "te"
            ? `నేను ${h} పని గంటలు అని విన్నాను. ఇది సరైనదేనా?`
            : language === "hi"
            ? `मैंने ${h} मेहनत के घंटे सुने। क्या यह सही है?`
            : `I heard ${h} hours. Is that correct?`;
      }
    }
  } else if (targetField === "materialCost") {
    const match = normalizedNumbers.match(/(?:cost|material cost|expense|ఖర్చు|లాगत|செలவு|ವೆಚ್ಚ)[\s\w:]*?(\d{2,6})/i) ||
                  normalizedNumbers.match(/(\d{2,6})\s*(?:rupees|rs\.?|inr|₹|రూపాయలు|రुपये|రూபாய்|రూపాయి)?/i) ||
                  normalizedNumbers.match(/(\d{2,6})/);
    if (match) {
      const c = parseInt(match[1], 10);
      if (c >= 10 && c <= 500000) {
        canonicalVal = c;
        localizedVal = c;
        displayStr = `₹${c}`;
        spokenConfirm =
          language === "te"
            ? `నేను ముడిసరుకు ఖర్చు ₹${c} అని విన్నాను. ఇది సరైనదేనా?`
            : language === "hi"
            ? `मैंने सामग्री लागत ₹${c} सुनी। क्या यह सही है?`
            : `I heard ₹${c} for material cost. Is that correct?`;
      }
    }
  } else if (targetField === "quantity") {
    const match = normalizedNumbers.match(/(\d+)\s*(?:pieces|piece|items|units|pcs|ముక్కలు|నగలు|పీస్|पीस|துண்டுகள்|ತುಂಡುಗಳು)?/i) ||
                  normalizedNumbers.match(/(?:have|available|ఉన్నాయి|उपलब्ध)\s*(\d+)/i) ||
                  normalizedNumbers.match(/(\d+)/);
    if (match) {
      const q = parseInt(match[1], 10);
      if (q >= 1 && q <= 10000) {
        canonicalVal = q;
        localizedVal = q;
        displayStr = `${q} pieces`;
        spokenConfirm =
          language === "te"
            ? `నేను ${q} ముక్కలు సిద్ధంగా ఉన్నాయి అని విన్నాను. ఇది సరైనదేనా?`
            : language === "hi"
            ? `मैंने ${q} पीस सुने। क्या यह सही है?`
            : `I heard ${q} pieces available. Is that correct?`;
      }
    }
  } else if (targetField === "dimensions") {
    const dimMatch =
      normalizedNumbers.match(/(\d+(?:\.\d+)?)\s*(?:meters|meter|mtr|inches|inch|cm|feet|ft|మీటర్లు|మీటరు|ఇంచులు|అంగుళాలు|मीटर|इंच)/i) ||
      normalizedNumbers.match(/(\d+(?:\.\d+)?\s*(?:x|by|\*)\s*\d+(?:\.\d+)?\s*(?:inches|inch|cm|feet|meters)?)/i);
    if (dimMatch) {
      canonicalVal = dimMatch[0];
      localizedVal = dimMatch[0];
      displayStr = dimMatch[0];
      spokenConfirm =
        language === "te"
          ? `నేను కొలతలు ${dimMatch[0]} అని విన్నాను. ఇది సరైనదేనా?`
          : language === "hi"
          ? `मैंने माप ${dimMatch[0]} सुना। क्या यह सही है?`
          : `I heard ${dimMatch[0]} for dimensions. Is that correct?`;
    }
  } else if (targetField === "fairHourlyWage") {
    const match = normalizedNumbers.match(/(?:wage|hourly wage|per hour|rate|వేతనం|మజదూరీ|గంటకు|प्रति घंटा)[\s\w:]*?(\d{2,5})/i) ||
                  normalizedNumbers.match(/(\d{2,5})\s*(?:rupees|rs\.?|inr|₹|రూపాయలు|रुपये)?\s*(?:per hour|hourly|\/hr|గంటకు|प्रति घंटा)/i) ||
                  normalizedNumbers.match(/(\d{2,5})/);
    if (match) {
      const w = parseInt(match[1], 10);
      if (w >= 50 && w <= 10000) {
        canonicalVal = w;
        localizedVal = w;
        displayStr = `₹${w}/hr`;
        spokenConfirm =
          language === "te"
            ? `నేను గంటకు ₹${w} వేతనం అని విన్నాను. ఇది సరైనదేనా?`
            : language === "hi"
            ? `मैंने ₹${w} प्रति घंटा मजदूरी सुनी। क्या यह सही है?`
            : `I heard ₹${w} per hour for fair wage. Is that correct?`;
      }
    }
  } else if (targetField === "artisanApprovedPrice") {
    const match = normalizedNumbers.match(/(?:use|price|sell for|ధర|कीमत|వేల|రూపాయలు|रुपये)[\s\w:]*?(\d{2,7})/i) ||
                  normalizedNumbers.match(/(\d{2,7})\s*(?:rupees|rs\.?|inr|₹|రూపాయలు|रुपये)/i) ||
                  normalizedNumbers.match(/(\d{2,7})/);
    if (match) {
      const p = parseInt(match[1], 10);
      if (p >= 50 && p <= 1000000) {
        canonicalVal = p;
        localizedVal = p;
        displayStr = `₹${p}`;
        spokenConfirm =
          language === "te"
            ? `నేను మీరు నిర్ణయించిన ధర ₹${p} అని విన్నాను. ఇది సరైనదేనా?`
            : language === "hi"
            ? `मैंने आपकी स्वीकृत कीमत ₹${p} सुनी। क्या यह सही है?`
            : `I heard ₹${p} as your approved selling price. Is that correct?`;
      }
    }
  } else if (targetField === "region") {
    // Clean fillers from region name
    const cleaned = text.replace(/^(it is|made in|from|ఇది|యొక్క|నుండి|से|का)\s*/i, "").trim();
    if (cleaned.length >= 2) {
      canonicalVal = cleaned;
      localizedVal = cleaned;
      displayStr = cleaned;
      spokenConfirm =
        language === "te"
          ? `నేను ప్రాంతం ${cleaned} అని విన్నాను. ఇది సరైనదేనా?`
          : language === "hi"
          ? `मैंने क्षेत्र ${cleaned} सुना। क्या यह सही है?`
          : `I heard ${cleaned} for region. Is that correct?`;
    }
  } else if (targetField === "technique") {
    const cleaned = text.replace(/^(it is|technique is|పద్ధతి|విధానం|तकनीक)\s*/i, "").trim();
    if (cleaned.length >= 2) {
      canonicalVal = cleaned;
      localizedVal = cleaned;
      displayStr = cleaned;
      spokenConfirm =
        language === "te"
          ? `నేను తయారీ పద్ధతి ${cleaned} అని విన్నాను. ఇది సరైనదేనా?`
          : language === "hi"
          ? `मैंने शिल्प तकनीक ${cleaned} सुनी। क्या यह सही है?`
          : `I heard ${cleaned} for technique. Is that correct?`;
    }
  } else if (targetField === "motif") {
    const cleaned = text.replace(/^(motif is|design is|డిజైన్|రూపకల్పన|डिजाइन)\s*/i, "").trim();
    if (cleaned.length >= 2) {
      canonicalVal = cleaned;
      localizedVal = cleaned;
      displayStr = cleaned;
      spokenConfirm =
        language === "te"
          ? `నేను నమూనా ${cleaned} అని విన్నాను. ఇది సరైనదేనా?`
          : language === "hi"
          ? `मैंने डिज़ाइन ${cleaned} सुना। क्या यह सही है?`
          : `I heard ${cleaned} for motif design. Is that correct?`;
    }
  } else if (targetField === "pattern") {
    const cleaned = text.replace(/^(pattern is|style is|ప్యాటర్న్|శైలి|पैटर्न|शैली)\s*/i, "").trim();
    if (cleaned.length >= 2) {
      canonicalVal = cleaned;
      localizedVal = cleaned;
      displayStr = cleaned;
      spokenConfirm =
        language === "te"
          ? `నేను ప్యాటర్న్ ${cleaned} అని విన్నాను. ఇది సరైనదేనా?`
          : language === "hi"
          ? `मैंने पैटर्न ${cleaned} सुना। क्या यह सही है?`
          : `I heard ${cleaned} for pattern. Is that correct?`;
    }
  } else if (targetField === "productType") {
    const cleaned = text.replace(/^(type is|product type is|రకం|प्रकार)\s*/i, "").trim();
    if (cleaned.length >= 2) {
      canonicalVal = cleaned;
      localizedVal = cleaned;
      displayStr = cleaned;
      spokenConfirm =
        language === "te"
          ? `నేను ఉత్పత్తి రకం ${cleaned} అని విన్నాను. ఇది సరైనదేనా?`
          : language === "hi"
          ? `मैंने उत्पाद प्रकार ${cleaned} सुना। क्या यह सही है?`
          : `I heard ${cleaned} for product type. Is that correct?`;
    }
  } else if (targetField === "craftCategory") {
    const cleaned = text.replace(/^(category is|craft category is|వర్గం|श्रेणी)\s*/i, "").trim();
    if (cleaned.length >= 2) {
      canonicalVal = cleaned;
      localizedVal = cleaned;
      displayStr = cleaned;
      spokenConfirm =
        language === "te"
          ? `నేను కళా వర్గం ${cleaned} అని విన్నాను. ఇది సరైనదేనా?`
          : language === "hi"
          ? `मैंने शिल्प श्रेणी ${cleaned} सुनी। क्या यह सही है?`
          : `I heard ${cleaned} for craft category. Is that correct?`;
    }
  } else if (targetField === "productName" || targetField === "craftName") {
    const cleaned = text.replace(/^(name is|product is|craft is|title is|పేరు|नाम)\s*/i, "").trim();
    if (cleaned.length >= 2) {
      canonicalVal = cleaned;
      localizedVal = cleaned;
      displayStr = cleaned;
      spokenConfirm =
        language === "te"
          ? `నేను పేరు ${cleaned} అని విన్నాను. ఇది సరైనదేనా?`
          : language === "hi"
          ? `मैंने नाम ${cleaned} सुना। क्या यह सही है?`
          : `I heard ${cleaned} for name. Is that correct?`;
    }
  } else if (targetField === "description") {
    const cleaned = text.replace(/^(description is|story is|వివరణ|कथा|कहानी|विवरण)\s*/i, "").trim();
    if (cleaned.length >= 3) {
      canonicalVal = cleaned;
      localizedVal = cleaned;
      displayStr = cleaned;
      spokenConfirm =
        language === "te"
          ? `నేను వివరణ ${cleaned} అని విన్నాను. ఇది సరైనదేనా?`
          : language === "hi"
          ? `मैंने विवरण ${cleaned} सुना। क्या यह सही है?`
          : `I heard ${cleaned} for description. Is that correct?`;
    }
  } else if (targetField === "colors") {
    canonicalVal = text;
    localizedVal = text;
    displayStr = text;
    spokenConfirm =
      language === "te"
        ? `నేను రంగులు ${text} అని విన్నాను. ఇది సరైనదేనా?`
        : language === "hi"
        ? `मैंने रंग ${text} सुने। क्या यह सही है?`
        : `I heard ${text} for colors. Is that correct?`;
  }

  // 4. Gemini AI fallback
  if (!canonicalVal) {
    const ai = getAIClient();
    if (ai) {
      try {
        const prompt = `You are a multilingual voice parser for rural Indian artisans.
Language: ${language}
Field to extract: "${targetField}" (Must be one of: productName, productType, craftCategory, craftName, material, technique, motif, colors, pattern, region, description, dimensions, quantity, laborHours, materialCost)
Artisan spoken text: "${transcript}"

Extract ONLY the value for "${targetField}".
If asking laborHours or materialCost or quantity, return a pure integer number.
If asking material, return the canonical English name (e.g. "cotton", "silk", "wood", "clay", "brass", "wool", "bamboo") and localized name in ${language}.

Return ONLY valid JSON:
{
  "success": true,
  "canonicalValue": 15 or "cotton",
  "localizedValue": 15 or "పత్తి",
  "displayValue": "15 hours" or "Cotton"
}`;

        const res = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });

        const parsed = JSON.parse(res.text?.trim() || "{}");
        if (parsed.canonicalValue !== null && parsed.canonicalValue !== undefined) {
          canonicalVal = parsed.canonicalValue;
          localizedVal = parsed.localizedValue || parsed.canonicalValue;
          displayStr = parsed.displayValue || String(canonicalVal);
          spokenConfirm =
            language === "te"
              ? `నేను ${displayStr} అని విన్నాను. ఇది సరైనదేనా?`
              : language === "hi"
              ? `मैंने ${displayStr} सुना। क्या यह सही है?`
              : `I heard ${displayStr}. Is that correct?`;
        }
      } catch (e) {
        console.warn("AI target field voice extraction fallback note:", e);
      }
    }
  }

  if (canonicalVal !== null && canonicalVal !== undefined) {
    return {
      success: true,
      field: targetField,
      canonicalValue: canonicalVal,
      localizedValue: localizedVal,
      displayValue: displayStr,
      spokenConfirmation: spokenConfirm,
      rawTranscript: transcript
    };
  }

  return {
    success: false,
    field: targetField,
    canonicalValue: null,
    localizedValue: null,
    displayValue: "",
    spokenConfirmation:
      language === "te"
        ? "క్షమించండి, మీ వాయిస్ వివరాలు సరిగ్గా అర్థం కాలేదు. దయచేసి మళ్ళీ చెప్పండి."
        : language === "hi"
        ? "क्षमा करें, विवरण समझ नहीं आया। कृपया दोबारा स्पष्ट बोलें।"
        : "I didn't quite catch that. Please speak clearly or enter manually.",
    rawTranscript: transcript
  };
}

export interface VoiceAutoFillProductResult {
  success: boolean;
  fieldsUpdated: string[];
  attributes: {
    title?: string;
    category?: string;
    material?: string;
    craftType?: string;
    colors?: string;
    dimensions?: string;
    handmadeFeatures?: string;
    madeInLocation?: string;
    shortDesc?: string;
    story?: string;
    suggestedPrice?: number;
    materialCost?: number;
  };
  spokenConfirmation: string;
}

/**
 * Auto-fill craft product details from voice assistance
 * Supports natural speech in Telugu, Hindi, Tamil, Kannada, English, etc.
 * e.g. "ధర 2500, ఖర్చు 1100, స్వచ్ఛమైన పట్టు, కొలతలు 5.5 మీటర్లు"
 */
export async function extractProductDetailsFromVoice(
  transcript: string,
  language: LanguageCode = "en",
  currentFormState: Record<string, any> = {}
): Promise<VoiceAutoFillProductResult> {
  const text = transcript.trim();
  const lower = text.toLowerCase();
  const attributes: VoiceAutoFillProductResult["attributes"] = {};
  const fieldsUpdated: string[] = [];

  // 1. Rule-based multilingual extractor (runs first for instant determinism)
  // Price extraction: e.g. "ధర 2500", "వెల 2400", "price 2500", "कीमत 2500", "2500 rupees", "₹2500"
  const priceMatch =
    lower.match(/(?:price|selling price|sell for|ధర|వెల|कीमत|मूल्य|दर|விலை|ಬೆಲೆ)[\s\w:]*?(\d{2,6})/i) ||
    lower.match(/(\d{2,6})\s*(?:rupees|rs\.?|inr|₹|రూపాయలు|రూ\.|रुपये|रुपया|ரூபாய்|ರೂಪಾಯಿ)/i);
  if (priceMatch) {
    const p = parseInt(priceMatch[1], 10);
    if (p >= 50 && p <= 500000) {
      attributes.suggestedPrice = p;
      if (!fieldsUpdated.includes("suggestedPrice")) fieldsUpdated.push("suggestedPrice");
    }
  }

  // Material Cost extraction: e.g. "ఖర్చు 1100", "cost 1100", "material cost 1200", "लागत 1000"
  const costMatch =
    lower.match(/(?:material cost|cost|making cost|making|expense|ఖర్చు|తయారీ ఖర్చు|లాభం కాకుండా ఖర్చు|लागत|सामग्री लागत|खर्च|செலவு|ವೆಚ್ಚ)[\s\w:]*?(\d{2,6})/i);
  if (costMatch) {
    const c = parseInt(costMatch[1], 10);
    if (c >= 20 && c <= 500000) {
      attributes.materialCost = c;
      if (!fieldsUpdated.includes("materialCost")) fieldsUpdated.push("materialCost");
    }
  }

  // Dimensions: e.g. "5.5 meters", "6 inches", "5.5 మీటర్లు", "6 అంగుళాలు", "5.5 मीटर"
  const dimMatch =
    lower.match(/(\d+(?:\.\d+)?)\s*(?:meters|meter|mtr|inches|inch|cm|feet|ft|మీటర్లు|మీటరు|ఇంచులు|అంగుళాలు|मीटर|इंच)/i);
  if (dimMatch) {
    attributes.dimensions = dimMatch[0];
    if (!fieldsUpdated.includes("dimensions")) fieldsUpdated.push("dimensions");
  }

  // Material extraction
  if (lower.includes("silk") || lower.includes("పట్టు") || lower.includes("रेशम") || lower.includes("पट्टू") || lower.includes("பட்டு") || lower.includes("ರೇಷ್ಮೆ")) {
    attributes.material = language === "te" ? "స్వచ్ఛమైన పట్టు" : language === "hi" ? "शुद्ध रेशम" : "Pure Mulberry Silk";
    if (!fieldsUpdated.includes("material")) fieldsUpdated.push("material");
  } else if (lower.includes("cotton") || lower.includes("పత్తి") || lower.includes("కాటన్") || lower.includes("सूती") || lower.includes("பருத்தி")) {
    attributes.material = language === "te" ? "చేనేత పత్తి" : language === "hi" ? "शुद्ध हथकरघा सूती" : "Pure Handloom Cotton";
    if (!fieldsUpdated.includes("material")) fieldsUpdated.push("material");
  } else if (lower.includes("clay") || lower.includes("terracotta") || lower.includes("మట్టి") || lower.includes("టెర్రకోట") || lower.includes("मिट्टी")) {
    attributes.material = language === "te" ? "సహజ బంకమట్టి / టెర్రకోట" : language === "hi" ? "प्राकृतिक नदी की मिट्टी" : "Natural Terracotta Clay";
    if (!fieldsUpdated.includes("material")) fieldsUpdated.push("material");
  } else if (lower.includes("wood") || lower.includes("చెక్క") || lower.includes("लकड़ी") || lower.includes("ಮರ")) {
    attributes.material = language === "te" ? "సహజ చెక్క" : language === "hi" ? "प्राकृतिक लकड़ी" : "Natural Seasoned Wood";
    if (!fieldsUpdated.includes("material")) fieldsUpdated.push("material");
  } else if (lower.includes("brass") || lower.includes("bronze") || lower.includes("bell metal") || lower.includes("ఇత్తడి") || lower.includes("కంచు") || lower.includes("पीतल") || lower.includes("कांसा")) {
    attributes.material = language === "te" ? "ఇత్తడి & కంచు మిశ్రమం" : language === "hi" ? "हस्तनिर्मित पीतल एवं कांसा" : "Hand-Cast Brass & Bell Metal";
    if (!fieldsUpdated.includes("material")) fieldsUpdated.push("material");
  }

  // Craft Type / Lineage
  if (lower.includes("ikat") || lower.includes("pochampally") || lower.includes("ఇక్కత్") || lower.includes("పోచంపల్లి") || lower.includes("इकत")) {
    attributes.craftType = language === "te" ? "డబుల్ ఇక్కత్ మగ్గం నేత" : language === "hi" ? "डबल इकत बुनाई" : "Double Ikat Handloom Weaving";
    attributes.category = "Handloom";
    if (!fieldsUpdated.includes("craftType")) fieldsUpdated.push("craftType");
    if (!fieldsUpdated.includes("category")) fieldsUpdated.push("category");
  } else if (lower.includes("kalamkari") || lower.includes("కలంకారి") || lower.includes("कलमकारी")) {
    attributes.craftType = language === "te" ? "చేతి బ్లాక్ ప్రింటింగ్ & సహజ రంగులు" : language === "hi" ? "हस्त-ब्लॉक छपाई एवं प्राकृतिक रंग" : "Kalamkari Hand-Block Printing";
    attributes.category = "Textile Art";
    if (!fieldsUpdated.includes("craftType")) fieldsUpdated.push("craftType");
    if (!fieldsUpdated.includes("category")) fieldsUpdated.push("category");
  } else if (lower.includes("channapatna") || lower.includes("చన్నపట్న") || lower.includes("चन्नापटना")) {
    attributes.craftType = language === "te" ? "లేత్ టర్నింగ్ & లక్క మెరుగు" : language === "hi" ? "लेथ टर्निंग एवं प्राकृतिक लाख पॉलिश" : "Lathe Turning with Natural Lacquer";
    attributes.category = "Woodcraft";
    if (!fieldsUpdated.includes("craftType")) fieldsUpdated.push("craftType");
    if (!fieldsUpdated.includes("category")) fieldsUpdated.push("category");
  }

  // Product title if mentioned
  if (lower.includes("saree") || lower.includes("చీర") || lower.includes("साड़ी") || lower.includes("புடவை")) {
    attributes.title = attributes.craftType ? `${attributes.craftType} Saree` : "Handcrafted Artisan Saree";
    if (!fieldsUpdated.includes("title")) fieldsUpdated.push("title");
  } else if (lower.includes("cup") || lower.includes("కుల్హడ్") || lower.includes("కప్పు") || lower.includes("कुल्हड़")) {
    attributes.title = "Terracotta Chai Cups (Set of 6)";
    if (!fieldsUpdated.includes("title")) fieldsUpdated.push("title");
  } else if (lower.includes("toy") || lower.includes("బొమ్మ") || lower.includes("खिलौना")) {
    attributes.title = "Handcrafted Wooden Toy Stacker";
    if (!fieldsUpdated.includes("title")) fieldsUpdated.push("title");
  }

  // 2. If Gemini AI is active, complement any missing details
  const ai = getAIClient();
  if (ai && fieldsUpdated.length < 2) {
    try {
      const targetLangName = LANGUAGE_NAMES[language] || language;
      const prompt = `You are a voice assistant for rural Indian artisans listing handicrafts.
Artisan transcript in ${targetLangName}: "${transcript}"
Extract non-null values for: suggestedPrice, materialCost, material, craftType, dimensions, title. Return JSON.`;

      const res = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });

      const parsed = JSON.parse(res.text?.trim() || "{}");
      for (const [key, val] of Object.entries(parsed)) {
        if (val !== null && val !== undefined && val !== "" && !(attributes as any)[key]) {
          (attributes as any)[key] = val;
          fieldsUpdated.push(key);
        }
      }
    } catch (e) {
      console.warn("Gemini voice product detail extraction note:", e);
    }
  }

  // Construct gentle spoken confirmation in user's language
  let spokenConfirmation = "";
  if (language === "te") {
    const parts = [];
    if (attributes.suggestedPrice) parts.push(`ధర ₹${attributes.suggestedPrice}`);
    if (attributes.materialCost) parts.push(`ఖర్చు ₹${attributes.materialCost}`);
    if (attributes.material) parts.push(`మెటీరియల్ ${attributes.material}`);
    if (attributes.dimensions) parts.push(`కొలతలు ${attributes.dimensions}`);
    if (attributes.title) parts.push(`పేరు ${attributes.title}`);
    spokenConfirmation = parts.length
      ? `వివరాలు నమోదు చేయబడ్డాయి: ${parts.join(", ")}.`
      : "మీరు చెప్పిన వివరాలు విన్నాను. దయచేసి ధర లేదా మెటీరియల్ చెప్పండి.";
  } else if (language === "hi") {
    const parts = [];
    if (attributes.suggestedPrice) parts.push(`कीमत ₹${attributes.suggestedPrice}`);
    if (attributes.materialCost) parts.push(`लागत ₹${attributes.materialCost}`);
    if (attributes.material) parts.push(`सामग्री ${attributes.material}`);
    if (attributes.dimensions) parts.push(`माप ${attributes.dimensions}`);
    if (attributes.title) parts.push(`शीर्षक ${attributes.title}`);
    spokenConfirmation = parts.length
      ? `विवरण स्वतः भर दिए गए हैं: ${parts.join(", ")}.`
      : "मैंने आपकी आवाज सुनी। कृपया कीमत या सामग्री स्पष्ट बताएं।";
  } else {
    const parts = [];
    if (attributes.suggestedPrice) parts.push(`price ₹${attributes.suggestedPrice}`);
    if (attributes.materialCost) parts.push(`cost ₹${attributes.materialCost}`);
    if (attributes.material) parts.push(`material ${attributes.material}`);
    if (attributes.dimensions) parts.push(`dimensions ${attributes.dimensions}`);
    if (attributes.title) parts.push(`title ${attributes.title}`);
    spokenConfirmation = parts.length
      ? `Auto-entered craft details: ${parts.join(", ")}.`
      : "I heard your voice. You can state price, material, or dimensions to auto-fill.";
  }

  return {
    success: fieldsUpdated.length > 0,
    fieldsUpdated,
    attributes,
    spokenConfirmation,
  };
}
