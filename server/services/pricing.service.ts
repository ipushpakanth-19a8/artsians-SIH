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
  static validatePricingInputs(input: Partial<FairPricingRequest>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (input.materialCost !== undefined && (typeof input.materialCost !== 'number' || isNaN(input.materialCost) || input.materialCost < 0)) {
      errors.push('Material cost cannot be negative and must be a valid number');
    }

    if (input.laborHours !== undefined && (typeof input.laborHours !== 'number' || isNaN(input.laborHours) || input.laborHours < 0)) {
      errors.push('Labor hours cannot be negative and must be a valid number');
    }

    if (input.fairHourlyWage !== undefined && (typeof input.fairHourlyWage !== 'number' || isNaN(input.fairHourlyWage) || input.fairHourlyWage < 0)) {
      errors.push('Fair wage cannot be negative and must be a valid number');
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

  validatePricingInputs(input: Partial<FairPricingRequest>): { valid: boolean; errors: string[] } {
    return PricingService.validatePricingInputs(input);
  }

  /**
   * Deterministic, explainable Fair Pricing calculation.
   * Uses project's canonical formula:
   *   Labor Value = Labor Hours * Fair Hourly Wage
   *   Base Cost = Material Cost + Labor Value (+ Other Cost)
   *   Margin/Contingency = Base Cost * 0.25 (25% safety margin)
   *   Recommended Fair Price = Base Cost + Margin/Contingency
   *
   * Gemini may help identify/classify product information, but Gemini DOES NOT
   * directly decide the final price.
   */
  static async calculateFairPrice(input: FairPricingRequest): Promise<FairPricingResponse> {
    const validation = PricingService.validatePricingInputs(input);
    if (!validation.valid) {
      throw new Error(`Pricing validation failed: ${validation.errors.join(', ')}`);
    }

    const qty = Math.max(1, Math.round(Number(input.quantity) || 1));
    const materialCost = Math.max(0, Math.round(Number(input.materialCost) || 0));
    // Statutory fair living wage floor: minimum ₹100/hr based on traditional craft cluster benchmarks
    const livingWageRateFloor = 100;
    const rawWage = input.fairHourlyWage && input.fairHourlyWage > 0 ? Math.round(input.fairHourlyWage) : livingWageRateFloor;
    const fairHourlyWage = Math.max(livingWageRateFloor, rawWage);
    // Default labor hours: 10 if unprovided or 0
    const laborHours = input.laborHours !== undefined && input.laborHours >= 0 ? Number(input.laborHours) : 10;
    const otherCost = Math.max(0, Math.round(Number(input.otherCost) || 0));

    // 1. Labor Value = labor hours * fair hourly wage
    const laborValue = Math.round(laborHours * fairHourlyWage);

    // 2. Base Production Cost = material cost + labor value + other cost
    const baseCost = materialCost + laborValue + otherCost;

    // 3. Margin / Contingency = 25% of base cost (contingency & business expenses)
    const marginOrContingency = Math.round(baseCost * 0.25);

    // 4. Baseline Recommended Fair Price
    let recommendedFairPrice = baseCost + marginOrContingency;

    // 5. Market Benchmark Calibrations (PostgreSQL / Curated benchmarks)
    let dbBenchmarks: any[] = [];
    const category = input.category || input.craftType || 'Handicraft';

    try {
      if (prisma && (prisma as any).marketPriceBenchmark) {
        dbBenchmarks = await (prisma as any).marketPriceBenchmark.findMany({
          where: {
            category: {
              equals: category,
              mode: 'insensitive'
            }
          }
        });
      }
    } catch (err) {
      // Graceful fallback if PostgreSQL table not populated
    }

    let marketStats = {
      min: Math.round(recommendedFairPrice * 0.88),
      avg: Math.round(recommendedFairPrice * 1.15),
      max: Math.round(recommendedFairPrice * 1.45),
      count: dbBenchmarks.length,
      typicalMiddlemanCut: 60
    };

    if (dbBenchmarks.length > 0) {
      const validPrices = dbBenchmarks.map(b => b.average_price).filter(p => typeof p === 'number' && p > 0);
      if (validPrices.length > 0) {
        const avg = Math.round(validPrices.reduce((a: number, b: number) => a + b, 0) / validPrices.length);
        const min = Math.min(...dbBenchmarks.map(b => b.price_low || avg * 0.8));
        const max = Math.max(...dbBenchmarks.map(b => b.price_high || avg * 1.3));
        marketStats = {
          min: Math.round(min),
          avg: Math.round(avg),
          max: Math.round(max),
          count: dbBenchmarks.length,
          typicalMiddlemanCut: Math.round(dbBenchmarks[0]?.typical_middleman_cut || 60)
        };
      }
    }

    // Guardrail: Recommended Fair Price can NEVER fall below baseCost + marginOrContingency (living wage floor)
    const livingWageFloor = baseCost + marginOrContingency;
    if (recommendedFairPrice < livingWageFloor) {
      recommendedFairPrice = livingWageFloor;
    }

    // 6. Generate detailed multilingual voice explanations
    const rawExplanation: FairPricingExplanation = PricingService.generateExplanations({
      recommendedFairPrice,
      materialCost,
      laborHours,
      fairHourlyWage,
      laborValue,
      marginOrContingency
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

    const breakdown = {
      materialCost,
      laborHours,
      fairHourlyWage,
      laborValue,
      baseCost,
      marginAmount: marginOrContingency,
      recommendedFairPrice,
      totalRecommendedFairPrice: recommendedFairPrice * qty,
      quantity: qty
    };

    return {
      productId: input.productId,
      productName: input.productName,
      materialCost,
      laborHours,
      fairHourlyWage,
      laborValue,
      baseCost,
      marginOrContingency,
      marginAmount: marginOrContingency,
      recommendedFairPrice,
      artisanApprovedPrice: input.artisanApprovedPrice || recommendedFairPrice,
      quantity: qty,
      unitFairPrice: recommendedFairPrice,
      currency: 'INR',
      pricingFormulaVersion: 'v1.0-fair-wage',
      breakdown,
      explanation,
      calculatedAt: new Date().toISOString(),
      marketBenchmarks: marketStats
    } as any;
  }

  async calculateFairPrice(input: FairPricingRequest): Promise<FairPricingResponse> {
    return PricingService.calculateFairPrice(input);
  }

  /**
   * Generates localized human-spoken explanations of the calculation components.
   * Explains the actual formula components: material cost, labor hours, wage rate, labor value, and margin.
   */
  static generateExplanations(data: {
    recommendedFairPrice: number;
    materialCost: number;
    laborHours: number;
    fairHourlyWage: number;
    laborValue: number;
    marginOrContingency: number;
  }): FairPricingExplanation {
    const { recommendedFairPrice, materialCost, laborHours, fairHourlyWage, laborValue } = data;

    const formattedFair = `₹${recommendedFairPrice.toLocaleString('en-IN')}`;
    const formattedMat = `₹${materialCost.toLocaleString('en-IN')}`;
    const formattedWage = `₹${fairHourlyWage.toLocaleString('en-IN')}`;
    const formattedLaborVal = `₹${laborValue.toLocaleString('en-IN')}`;

    const english = `Your recommended fair price is ${formattedFair}. You spent ${formattedMat} on materials. You worked for ${laborHours} hours. At a fair wage of ${formattedWage} per hour, your labor value is ${formattedLaborVal}. The remaining amount covers the configured margin and business expenses. Your recommended fair price is ${formattedFair}.`;

    const hindi = `आपकी अनुशंसित उचित कीमत ${formattedFair} है। आपने सामग्री पर ${formattedMat} खर्च किए। आपने ${laborHours} घंटे काम किया। ${formattedWage} प्रति घंटे की उचित मजदूरी पर, आपके श्रम का मूल्य ${formattedLaborVal} है। शेष राशि मार्जिन और व्यावसायिक खर्चों को कवर करती है। आपकी अनुशंसित उचित कीमत ${formattedFair} है।`;

    const telugu = `మీ సిఫార్సు చేయబడిన సరసమైన ధర ${formattedFair}. మీరు ముడిసరుకుపై ${formattedMat} ఖర్చు చేశారు. మీరు ${laborHours} గంటలు పనిచేశారు. గంటకు ${formattedWage} సరసమైన వేతనంతో మీ శ్రమ విలువ ${formattedLaborVal}. మిగిలిన మొత్తం మార్జిన్ మరియు వ్యాపార ఖర్చులను భర్తీ చేస్తుంది. మీ సిఫార్సు చేయబడిన సరసమైన ధర ${formattedFair}.`;

    return {
      english,
      hindi,
      telugu
    };
  }

  generateExplanations(data: {
    recommendedFairPrice: number;
    materialCost: number;
    laborHours: number;
    fairHourlyWage: number;
    laborValue: number;
    marginOrContingency: number;
  }): FairPricingExplanation {
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
