export type LanguageCode =
  | 'en'
  | 'hi'
  | 'te'
  | 'ta'
  | 'bn'
  | 'mr'
  | 'gu'
  | 'kn'
  | 'ml'
  | 'or'
  | 'pa'
  | 'as';

export interface RegionalLanguageConfig {
  code: LanguageCode;
  label: string;
  native: string;
  bhashiniCode?: string;
}

export const SUPPORTED_LANGUAGES: RegionalLanguageConfig[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া' },
];

export type HandicraftCategory =
  | 'Handloom'
  | 'Pottery'
  | 'Woodcraft'
  | 'Metalcraft'
  | 'Jewellery'
  | 'Paintings'
  | 'Bamboo/Cane'
  | 'Textiles'
  | 'Traditional Decor'
  | 'Weaving'
  | 'Embroidery'
  | 'Other';

export interface User {
  id: string;
  phone: string;
  name: string;
  role: 'seller' | 'buyer' | 'admin';
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

export interface MarketComparableItem {
  platform: string;
  title: string;
  price: number;
  artisan_cluster?: string;
}

export interface PriceRecommendation {
  suggested_min: number;
  suggested_max: number;
  target_recommended: number;
  b2b_recommended?: number;
  fair_cost?: number;
  market_low?: number;
  market_avg?: number;
  market_high?: number;
  rationale: string;
  why_this_price?: {
    simple_explanation: string;
    labor_share_pct: number;
    material_cost: number;
    packaging_transport: number;
    fair_living_wage: number;
    market_comparables_count: number;
  };
  comparable_average: number;
  typical_middleman_price: number;
  artisan_profit_gain: number;
  margin_percentage: number;
  confidence_score?: number; // 0 to 1
  craft_complexity_score?: number;
  quality_tier?: string;
  market_comparables?: MarketComparableItem[];
  pricing_engine?: string;
  fair_wage_floor?: number;
  status?: 'success' | 'fallback';
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
  short_description?: string;
  b2b_description?: string;
  social_caption?: string;
  category: string;
  subcategory?: string;
  craft_technique?: string;
  motifs?: string[];
  colors?: string[];
  tags: string[];
  material: string;
  est_dimensions: string;
  weight?: string;
  base_language: LanguageCode;
  original_image_url: string;
  enhanced_image_url: string;
  image_variants?: {
    square_1x1?: string;
    portrait_9x16?: string;
    thumbnail?: string;
    transparent_png?: string;
  };
  enhancement_applied?: boolean;
  status: 'draft' | 'published' | 'disabled' | 'rejected';
  validation_status?: 'AI Generated' | 'Needs Review' | 'Verified by Artisan' | 'Published';
  gi_status?: 'certified' | 'potential' | 'none' | 'Needs artisan confirmation';
  gi_certificate_number?: string;
  cost: ProductCost;
  pricing?: PriceRecommendation;
  final_price: number;
  b2b_price?: number;
  minimum_order_quantity?: number;
  production_capacity_monthly?: number;
  lead_time_days?: number;
  customization_available?: boolean;
  sample_available?: boolean;
  seen_at_exhibition?: {
    event_name: string;
    stall_number: string;
    city: string;
    year: string;
    qr_scans_count?: number;
    repeat_orders_count?: number;
  };
  translations: Partial<Record<LanguageCode, ProductTranslation>>;
  market_linkage: BuyerChannelMatch[];
  views_count: number;
  enquiry_count: number;
  created_at: string;
  published_at?: string;
  quantity?: number;
  location?: string;
  craft_origin?: string;
}

export interface MarketPriceBenchmark {
  id: string;
  category: string;
  material?: string;
  craft_name: string;
  craft_type?: string;
  region: string;
  price_low: number;
  price_high: number;
  average_price: number;
  target_recommended?: number;
  typical_middleman_cut: number; // percentage, e.g. 65%
  source: string;
  recorded_at?: string;
  last_updated?: string;
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
  status: 'created' | 'paid' | 'shipped' | 'delivered';
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

// ---- New types for enhanced features ----

export interface Bill {
  id: string;
  billNumber: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerLocation: string;
  productId: string;
  productName: string;
  productCategory: string;
  quantity: number;
  materialCost: number;
  labourCost: number;
  transportationCost: number;
  otherCost: number;
  totalCost: number;
  proposedPrice: number;
  marketMinPrice: number;
  marketAveragePrice: number;
  marketMaxPrice: number;
  recommendedPrice: number;
  finalPrice: number;
  profit: number;
  profitPercentage: number;
  status: 'draft' | 'finalized';
  createdAt: string;
  finalizedAt?: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  addedAt: string;
}

export interface WishlistItem {
  productId: string;
  product: Product;
  addedAt: string;
}

export interface CustomerCareMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface MarketPriceResult {
  minPrice: number;
  averagePrice: number;
  maxPrice: number;
  recommendedPrice: number;
  source: 'demo' | 'real';
  lastUpdated: string;
  category: string;
  benchmarkCount: number;
}

export interface AdminStats {
  totalUsers: number;
  totalSellers: number;
  totalBuyers: number;
  totalProducts: number;
  totalOrders: number;
  totalSales: number;
  totalBills: number;
  pendingOrders: number;
}
