import prisma from '../config/database.js';
import {
  PriceRecommendation,
  ProductCost,
  MarketComparableItem,
  FairPricingRequest,
  FairPricingResponse,
  FairPricingExplanation
} from '../../src/types.js';

export interface PricingCalculationInput {
  cost: ProductCost;
  category: string;
  craftComplexityScore?: number; // 1-10 (default 7)
  qualityTier?: string;
  visualAttributes?: string;
  comparables?: MarketComparableItem[];
}

export class PricingService {
  /**
   * Validate raw pricing input fields.
   * Enforces non-negative values and proper types.
   */
  static validatePricingInputs(input: Partial<FairPricingRequest & { targetMargin?: number }>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (input.materialCost !== undefined && (typeof input.materialCost !== 'number' || isNaN(input.materialCost) || input.materialCost < 0)) {
      errors.push('Material cost cannot be negative and must be a valid number');
    }

    if (input.laborHours !== undefined && (typeof input.laborHours !== 'number' || isNaN(input.laborHours) || input.laborHours < 0)) {
      errors.push('Labor hours cannot be negative and must be a valid number');
    }

    if (input.fairHourlyWage !== undefined && (typeof input.fairHourlyWage !== 'number' || isNaN(input.fairHourlyWage) || input.fairHourlyWage <= 0)) {
      errors.push('Fair wage must be a valid positive number');
    }

    if (input.targetMargin !== undefined && (typeof input.targetMargin !== 'number' || isNaN(input.targetMargin) || input.targetMargin < 0 || input.targetMargin >= 1)) {
      errors.push('Target margin must be greater than or equal to 0 and less than 1');
    }

    if (input.quantity !== undefined && (typeof input.quantity !== 'number' || isNaN(input.quantity) || input.quantity <= 0)) {
      errors.push('Quantity must be a valid positive integer');
    }

    if (input.artisanApprovedPrice !== undefined && (typeof input.artisanApprovedPrice !== 'number' || isNaN(input.artisanApprovedPrice) || input.artisanApprovedPrice <= 0)) {
      errors.push('Artisan approved price must be a valid positive number');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validatePricingInputs(input: Partial<FairPricingRequest & { targetMargin?: number }>): { valid: boolean; errors: string[] } {
    return PricingService.validatePricingInputs(input);
  }

  /**
   * Deterministic, explainable Fair Pricing calculation.
   * Uses project's canonical formula:
   *   Labor Cost = Labor Hours * Fair Hourly Wage
   *   Production Cost = Material Cost + Labor Cost (+ Other Cost)
   *   Fair Price = Production Cost / (1 - Target Margin)
   *
   * Example:
   *   Material Cost = ₹800
   *   Labor Hours = 20
   *   Fair Wage = ₹150/hr
   *   Target Margin = 20% (0.20)
   *   Labor Cost: 20 * 150 = ₹3,000
   *   Production Cost: ₹800 + ₹3,000 = ₹3,800
   *   Fair Price: ₹3,800 / 0.80 = ₹4,750
   */
  static async calculateFairPrice(input: FairPricingRequest & { targetMargin?: number }): Promise<FairPricingResponse> {
    const validation = PricingService.validatePricingInputs(input);
    if (!validation.valid) {
      throw new Error(`Pricing validation failed: ${validation.errors.join(', ')}`);
    }

    const qty = Math.max(1, Math.round(Number(input.quantity) || 1));
    const materialCost = Math.max(0, Math.round(Number(input.materialCost) || 0));
    // Fair hourly wage: minimum ₹100/hr floor, default ₹150/hr
    const livingWageRateFloor = 100;
    const rawWage = input.fairHourlyWage && input.fairHourlyWage > 0 ? Math.round(input.fairHourlyWage) : 150;
    const fairHourlyWage = Math.max(livingWageRateFloor, rawWage);
    const laborHours = input.laborHours !== undefined && input.laborHours >= 0 ? Number(input.laborHours) : 10;
    const otherCost = Math.max(0, Math.round(Number(input.otherCost) || 0));

    // 1. Labor Cost = Labor Hours * Fair Hourly Wage
    const laborCost = Math.round(laborHours * fairHourlyWage);

    // 2. Production Cost = Material Cost + Labor Cost + Other Cost
    const productionCost = materialCost + laborCost + otherCost;

    // 3. Target Margin (default 20% = 0.20)
    const targetMargin = (input.targetMargin !== undefined && input.targetMargin >= 0 && input.targetMargin < 1)
      ? Number(input.targetMargin)
      : 0.20;

    // 4. Deterministic Fair Price Formula:
    // Fair Price = Production Cost / (1 - Target Margin)
    const recommendedFairPrice = Math.round(productionCost / (1 - targetMargin));
    const marginAmount = recommendedFairPrice - productionCost;

    // 5. Market Benchmark Calibrations (PostgreSQL / Curated benchmarks)
    let dbBenchmarks: any[] = [];
    const category = input.category || input.craftType || '';

    try {
      if (prisma && (prisma as any).marketPriceBenchmark) {
        dbBenchmarks = await (prisma as any).marketPriceBenchmark.findMany({
          where: category ? {
            OR: [
              { category: { equals: category, mode: 'insensitive' } },
              { craft_type: { equals: category, mode: 'insensitive' } },
              { craft_name: { contains: category, mode: 'insensitive' } },
            ]
          } : undefined
        });
      }
    } catch (err) {
      // Graceful fallback if PostgreSQL table not populated
    }

    let marketStats: {
      available: boolean;
      min: number;
      median: number;
      avg: number;
      max: number;
      count: number;
      typicalMiddlemanCut?: number;
      message?: string;
      priceLow?: number;
      priceHigh?: number;
      averagePrice?: number;
    };

    if (dbBenchmarks.length > 0) {
      const validPrices: number[] = [];
      const lowPrices: number[] = [];
      const highPrices: number[] = [];

      for (const b of dbBenchmarks) {
        if (typeof b.average_price === 'number' && b.average_price > 0) validPrices.push(b.average_price);
        if (typeof b.price_low === 'number' && b.price_low > 0) lowPrices.push(b.price_low);
        if (typeof b.price_high === 'number' && b.price_high > 0) highPrices.push(b.price_high);
      }

      const allComparablePrices = [...validPrices, ...lowPrices, ...highPrices].sort((a, b) => a - b);
      const min = lowPrices.length ? Math.min(...lowPrices) : (validPrices.length ? Math.min(...validPrices) : 0);
      const max = highPrices.length ? Math.max(...highPrices) : (validPrices.length ? Math.max(...validPrices) : 0);
      const avg = validPrices.length ? Math.round(validPrices.reduce((a, b) => a + b, 0) / validPrices.length) : 0;

      // Calculate median
      let median = avg;
      if (allComparablePrices.length > 0) {
        const mid = Math.floor(allComparablePrices.length / 2);
        median = allComparablePrices.length % 2 !== 0
          ? allComparablePrices[mid]
          : Math.round((allComparablePrices[mid - 1] + allComparablePrices[mid]) / 2);
      }

      marketStats = {
        available: true,
        min: Math.round(min),
        median: Math.round(median),
        avg: Math.round(avg),
        max: Math.round(max),
        priceLow: Math.round(min),
        priceHigh: Math.round(max),
        averagePrice: Math.round(avg),
        count: dbBenchmarks.length,
        typicalMiddlemanCut: Math.round(dbBenchmarks[0]?.typical_middleman_cut || 60),
      };
    } else {
      // Section 16 & Test 12 require NO fake market prices when benchmark data is unavailable
      marketStats = {
        available: false,
        min: 0,
        median: 0,
        avg: 0,
        max: 0,
        priceLow: 0,
        priceHigh: 0,
        averagePrice: 0,
        count: 0,
        message: 'Market benchmark data is currently unavailable for this specific craft category.'
      };
    }

    // 6. Generate detailed multilingual voice explanations
    const rawExplanation: FairPricingExplanation = PricingService.generateExplanations({
      recommendedFairPrice,
      materialCost,
      laborHours,
      fairHourlyWage,
      laborCost,
      productionCost,
      targetMargin,
      marketStats
    });

    const explanation = {
      en: {
        speechText: rawExplanation.english,
        voiceCommands: ['Explain the price', 'Accept this price', 'Change the price']
      },
      hi: {
        speechText: rawExplanation.hindi,
        voiceCommands: ['कीमत समझाएं', 'यह कीमत स्वीकार करें', 'कीमत बदलें']
      },
      te: {
        speechText: rawExplanation.telugu,
        voiceCommands: ['ధరను వివరించండి', 'ఈ ధరను ఆమోదించండి', 'ధరను మార్చండి']
      },
      english: rawExplanation.english,
      hindi: rawExplanation.hindi,
      telugu: rawExplanation.telugu
    };

    // Separate artisanApprovedPrice vs recommendedFairPrice (Section 18 & 19)
    const artisanApprovedPrice = input.artisanApprovedPrice !== undefined && Number(input.artisanApprovedPrice) > 0
      ? Number(input.artisanApprovedPrice)
      : recommendedFairPrice;

    const breakdown = {
      materialCost,
      laborHours,
      fairHourlyWage,
      laborCost,
      laborValue: laborCost,
      productionCost,
      baseCost: productionCost,
      targetMargin,
      marginAmount,
      marginOrContingency: marginAmount,
      recommendedFairPrice,
      artisanApprovedPrice,
      quantity: qty,
      unitPrice: artisanApprovedPrice,
      subtotal: artisanApprovedPrice * qty,
      totalRecommendedFairPrice: recommendedFairPrice * qty
    };

    return {
      productId: input.productId,
      productName: input.productName,
      materialCost,
      laborHours,
      fairHourlyWage,
      laborCost,
      laborValue: laborCost,
      productionCost,
      baseCost: productionCost,
      targetMargin,
      marginOrContingency: marginAmount,
      marginAmount,
      recommendedFairPrice,
      artisanApprovedPrice,
      quantity: qty,
      unitFairPrice: recommendedFairPrice,
      unitPrice: artisanApprovedPrice,
      subtotal: artisanApprovedPrice * qty,
      currency: 'INR',
      pricingFormulaVersion: 'v2.0-deterministic-margin',
      breakdown,
      explanation,
      calculation: {
        laborCost,
        productionCost,
        marginAmount,
      },
      finalPrice: artisanApprovedPrice || recommendedFairPrice,
      marketStats,
      marketBenchmark: marketStats,
      marketBenchmarks: marketStats,
      marketMinPrice: marketStats?.min || 0,
      marketMaxPrice: marketStats?.max || 0,
    } as any;
  }

  async calculateFairPrice(input: FairPricingRequest & { targetMargin?: number }): Promise<FairPricingResponse> {
    return PricingService.calculateFairPrice(input);
  }

  /**
   * Generates localized human-spoken explanations of the calculation components.
   * Explains the formula: material cost, labor hours, wage rate, production cost, margin, and market benchmarks.
   */
  static generateExplanations(data: {
    recommendedFairPrice: number;
    materialCost: number;
    laborHours: number;
    fairHourlyWage: number;
    laborCost?: number;
    laborValue?: number;
    productionCost?: number;
    targetMargin?: number;
    marginOrContingency?: number;
    marketStats?: { available: boolean; min: number; max: number; median: number; count: number };
  }): FairPricingExplanation {
    const { recommendedFairPrice, materialCost, laborHours, fairHourlyWage, marketStats } = data;
    const laborCost = data.laborCost !== undefined ? data.laborCost : (data.laborValue !== undefined ? data.laborValue : Math.round(laborHours * fairHourlyWage));
    const productionCost = data.productionCost !== undefined ? data.productionCost : (materialCost + laborCost);
    const targetMargin = data.targetMargin !== undefined ? data.targetMargin : 0.20;

    const formattedFair = `₹${recommendedFairPrice.toLocaleString('en-IN')}`;
    const formattedMat = `₹${materialCost.toLocaleString('en-IN')}`;
    const formattedWage = `₹${fairHourlyWage.toLocaleString('en-IN')}`;
    const formattedLabor = `₹${laborCost.toLocaleString('en-IN')}`;
    const formattedProd = `₹${productionCost.toLocaleString('en-IN')}`;
    const marginPct = Math.round(targetMargin * 100);

    let marketEn = "";
    let marketHi = "";
    let marketTe = "";

    if (marketStats && marketStats.available && marketStats.count > 0) {
      const formattedMin = `₹${marketStats.min.toLocaleString('en-IN')}`;
      const formattedMax = `₹${marketStats.max.toLocaleString('en-IN')}`;
      const formattedMedian = `₹${marketStats.median.toLocaleString('en-IN')}`;
      marketEn = ` Comparable products are selling between ${formattedMin} and ${formattedMax}, with a market median of ${formattedMedian}.`;
      marketHi = ` समान उत्पाद बाज़ार में ${formattedMin} से ${formattedMax} के बीच बिक रहे हैं, और औसत बाज़ार मूल्य ${formattedMedian} है।`;
      marketTe = ` సమానమైన ఉత్పత్తులు మార్కెట్‌లో ${formattedMin} నుండి ${formattedMax} మధ్య అమ్ముడవుతున్నాయి, మార్కెట్ మధ్యస్థ ధర ${formattedMedian}.`;
    } else {
      marketEn = ` Market benchmark data is currently unavailable for this specific craft.`;
      marketHi = ` इस विशिष्ट शिल्प के लिए बाज़ार डेटा वर्तमान में उपलब्ध नहीं है।`;
      marketTe = ` ఈ కళాఖండానికి సంబంధించి మార్కెట్ గణాంకాలు ప్రస్తుతం అందుబాటులో లేవు.`;
    }

    const english = `Your material cost is ${formattedMat}. Your labor cost is ${formattedLabor} for ${laborHours} hours at ${formattedWage} per hour. Your production cost is ${formattedProd}. Based on the selected ${marginPct} percent margin, the fair price is ${formattedFair}.${marketEn}`;

    const hindi = `आपकी सामग्री लागत ${formattedMat} है। ${formattedWage} प्रति घंटे की दर से ${laborHours} घंटे के लिए आपकी श्रम लागत ${formattedLabor} है। आपकी उत्पादन लागत ${formattedProd} है। ${marginPct} प्रतिशत मार्जिन के आधार पर, उचित मूल्य ${formattedFair} है।${marketHi}`;

    const telugu = `మీ ముడిసరుకు ఖర్చు ${formattedMat}. గంటకు ${formattedWage} చొప్పున ${laborHours} గంటల మీ శ్రమ ఖర్చు ${formattedLabor}. మీ మొత్తం తయారీ ఖర్చు ${formattedProd}. ${marginPct} శాతం మార్జిన్ ఆధారంగా, సరసమైన ధర ${formattedFair}.${marketTe}`;

    return {
      english,
      hindi,
      telugu
    };
  }

  generateExplanations(data: any): FairPricingExplanation {
    return PricingService.generateExplanations(data);
  }

  /**
   * Backward-compatible recommendation calculation.
   */
  async calculatePriceRecommendation(input: PricingCalculationInput): Promise<PriceRecommendation> {
    const {
      cost,
      category,
      craftComplexityScore = 7,
      qualityTier = 'Fine Mastercraft',
      visualAttributes = 'Generational handicraft technique with authentic regional integrity',
      comparables: providedComps
    } = input;

    // Strict Fair Wage Floor: (Materials + (Labor Hours * Hourly Rate) + Other Expenses) * 1.25 living wage multiplier
    const laborCost = (cost.labor_hours || 10) * (cost.hourly_rate || 100);
    const totalDirectCost = (cost.material_cost || 0) + laborCost + (cost.other_cost || 0);
    const fairWageFloor = Math.round(totalDirectCost * 1.25);

    let dbBenchmarks: any[] = [];
    try {
      if (prisma && prisma.marketPriceBenchmark) {
        dbBenchmarks = await prisma.marketPriceBenchmark.findMany({
          where: {
            category: {
              equals: category,
              mode: 'insensitive'
            }
          }
        });
      }
    } catch (err) {
      console.warn('Could not query MarketPriceBenchmark table, using formula fallback:', err);
    }

    let compsAvg = 2800;
    let comparables: MarketComparableItem[] = providedComps || [];

    if (comparables.length > 0) {
      compsAvg = Math.round(comparables.reduce((sum, c) => sum + c.price, 0) / comparables.length);
    } else if (dbBenchmarks.length > 0) {
      const dbAvg = Math.round(dbBenchmarks.reduce((sum, b) => sum + (b.average_price || 0), 0) / dbBenchmarks.length);
      compsAvg = dbAvg || 2800;
      comparables = dbBenchmarks.map(b => ({
        platform: b.source || 'National Benchmark',
        title: `${b.craft_name} (${b.region})`,
        price: b.average_price,
        artisan_cluster: b.region
      }));
    } else {
      compsAvg = Math.max(2500, Math.round(totalDirectCost * 1.6));
    }

    const typicalMiddlemanPrice = Math.max(
      Math.round((cost.material_cost || 0) * 1.25),
      Math.round(compsAvg * 0.38)
    );

    const clampedScore = Math.max(1, Math.min(10, craftComplexityScore));
    const complexityMultiplier = 0.85 + (clampedScore * 0.045);
    const marketDrivenTarget = Math.round(compsAvg * complexityMultiplier);

    const target_recommended = Math.max(fairWageFloor, marketDrivenTarget);
    const suggested_min = Math.max(fairWageFloor, Math.round(target_recommended * 0.88));
    const suggested_max = Math.max(suggested_min + 400, Math.round(target_recommended * 1.22));

    const artisan_profit_gain = Math.max(0, target_recommended - typicalMiddlemanPrice);
    const margin_percentage = Math.round(((target_recommended - totalDirectCost) / target_recommended) * 100);

    const rationale = `Valued as "${qualityTier}" (Complexity ${clampedScore}/10: ${visualAttributes}). Calibrated against ${comparables.length} market benchmarks (avg ₹${compsAvg.toLocaleString('en-IN')}). Strictly guarantees the artisan living-wage floor of ₹${fairWageFloor.toLocaleString('en-IN')} and ensures +₹${artisan_profit_gain.toLocaleString('en-IN')} direct retained profit over conventional middleman commission.`;

    return {
      suggested_min,
      suggested_max,
      target_recommended,
      b2b_recommended: Math.round(target_recommended * 0.85),
      fair_cost: totalDirectCost,
      fair_wage_floor: fairWageFloor,
      market_low: suggested_min,
      market_avg: compsAvg,
      market_high: suggested_max,
      comparable_average: compsAvg,
      typical_middleman_price: typicalMiddlemanPrice,
      artisan_profit_gain,
      margin_percentage,
      confidence_score: 0.94,
      craft_complexity_score: clampedScore,
      quality_tier: qualityTier,
      market_comparables: comparables,
      pricing_engine: 'deterministic-fair-trade-v2',
      rationale,
      why_this_price: {
        simple_explanation: `Protects your ₹${fairWageFloor.toLocaleString('en-IN')} fair living-wage floor and yields ₹${artisan_profit_gain.toLocaleString('en-IN')} extra earnings compared to selling to a local broker.`,
        labor_share_pct: Math.round((laborCost / target_recommended) * 100),
        material_cost: cost.material_cost,
        packaging_transport: cost.other_cost || 0,
        fair_living_wage: laborCost,
        market_comparables_count: comparables.length
      },
      status: 'success'
    };
  }
}

export const pricingService = new PricingService();
export default pricingService;
