export type LanguageCode = 'en' | 'hi' | 'te';

export interface User {
  id: string;
  phone: string;
  name: string;
  role: 'artisan' | 'buyer' | 'admin';
  preferred_language: LanguageCode;
  created_at: string;
}

export interface Artisan {
  id: string;
  user_id: string;
  name: string;
  category: string;
  state: string;
  district: string;
  bio: string;
  experience_years: number;
  profile_image_url: string;
  phone: string;
}

export interface ProductCost {
  material_cost: number;
  labor_hours: number;
  hourly_rate: number;
  other_cost: number;
}

export interface PriceRecommendation {
  suggested_min: number;
  suggested_max: number;
  target_recommended: number;
  rationale: string;
  comparable_average: number;
  typical_middleman_price: number;
  artisan_profit_gain: number;
  margin_percentage: number;
}

export interface BuyerChannelMatch {
  channel_id: string;
  channel_name: string;
  channel_type: 'local_retail' | 'boutique' | 'export' | 'institutional' | 'direct_social';
  match_score: number; // 0-100
  reason: string;
  target_audience: string;
  recommended_price_tier: string;
  action_cta: string;
  platform_tag: string;
}

export interface ProductTranslation {
  title: string;
  description: string;
  tags: string[];
  translated_at: string;
  source: 'ai' | 'manual';
}

export interface Product {
  id: string;
  artisan_id: string;
  artisan_name: string;
  artisan_category: string;
  artisan_district: string;
  artisan_state: string;
  artisan_phone?: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  tags: string[];
  material: string;
  est_dimensions: string;
  weight?: string;
  base_language: LanguageCode;
  original_image_url: string;
  enhanced_image_url: string;
  enhancement_applied?: boolean;
  status: 'draft' | 'published';
  cost: ProductCost;
  pricing?: PriceRecommendation;
  final_price: number;
  translations: Record<LanguageCode, ProductTranslation>;
  market_linkage: BuyerChannelMatch[];
  views_count: number;
  enquiry_count: number;
  created_at: string;
  published_at?: string;
}

export interface MarketPriceBenchmark {
  id: string;
  category: string;
  material: string;
  craft_name: string;
  region: string;
  price_low: number;
  price_high: number;
  average_price: number;
  typical_middleman_cut: number; // percentage, e.g. 65%
  source: 'curated' | 'real';
  recorded_at: string;
}

export interface BuyerChannel {
  id: string;
  name: string;
  channel_type: 'local_retail' | 'boutique' | 'export' | 'institutional' | 'direct_social';
  typical_price_tier: 'budget' | 'mid' | 'premium' | 'luxury';
  category_fit: string[];
  description: string;
  margin_fee_pct: number;
  settlement_speed: string;
}

export interface Enquiry {
  id: string;
  product_id: string;
  product_title: string;
  artisan_id: string;
  buyer_name: string;
  buyer_contact: string;
  buyer_email?: string;
  buyer_location: string;
  quantity: number;
  message: string;
  status: 'new' | 'responded';
  created_at: string;
}

export interface Order {
  id: string;
  product_id: string;
  product_title: string;
  artisan_id: string;
  artisan_name: string;
  buyer_name: string;
  buyer_contact: string;
  buyer_email?: string;
  buyer_address?: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: 'created' | 'paid' | 'delivered';
  payment_id?: string;
  payment_method: 'razorpay_test' | 'upi_direct' | 'cash_on_delivery';
  fair_trade_verified: boolean;
  created_at: string;
}

export interface AIProcessingResult {
  id: string;
  product_id: string;
  feature: 'enhancement' | 'catalog' | 'translation' | 'pricing' | 'matching';
  model_used: string;
  latency_ms: number;
  status: 'success' | 'fallback' | 'failed';
  raw_input_summary: string;
  raw_response_summary: string;
  created_at: string;
}

export type AuditLog = AIProcessingResult;

