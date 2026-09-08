import crypto from 'crypto';
import { Artisan, Product, MarketPriceBenchmark, BuyerChannel, Enquiry, AIProcessingResult, BuyerChannelMatch, Order, Bill } from '../src/types.js';
import { SAMPLE_ARTISANS, INITIAL_PRODUCTS, SEED_MARKET_BENCHMARKS, BUYER_CHANNELS } from '../src/data/seedData.js';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'seller' | 'buyer' | 'admin';
  status: 'active' | 'deactivated' | 'suspended';
  craft_type?: string;
  business_name?: string;
  location?: string;
  state?: string;
  address?: string;
  artisan_id?: string;
  created_at: string;
  last_login?: string;
}

const PASSWORD_SALT = 'kalatech-salt-secure-2026';

export function hashPassword(password: string): string {
  return crypto.createHmac('sha256', PASSWORD_SALT).update(password).digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

class InMemoryDB {
  users: User[] = [];
  artisans: Artisan[] = [];
  products: Product[] = [];
  benchmarks: MarketPriceBenchmark[] = [];
  channels: BuyerChannel[] = [];
  enquiries: Enquiry[] = [];
  orders: Order[] = [];
  bills: Bill[] = [];
  auditTrail: AIProcessingResult[] = [];

  constructor() {
    this.seed();
  }


  seed() {
    this.users = [
      {
        id: "usr-admin-01",
        name: "Platform Administrator",
        email: "admin@kalatech.gov.in",
        phone: "9999999999",
        passwordHash: hashPassword("Admin@123456"),
        role: "admin",
        status: "active",
        created_at: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
      },
      {
        id: "usr-admin-02",
        name: "Governance Officer",
        email: "admin@kalatech.in",
        phone: "9988776655",
        passwordHash: hashPassword("Admin@123456"),
        role: "admin",
        status: "active",
        created_at: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
      },
      {
        id: "usr-01",
        name: "Rameshwar Rao",
        email: "rameshwar@artisan.in",
        phone: "9848012345",
        passwordHash: hashPassword("Seller@123456"),
        role: "seller",
        status: "active",
        craft_type: "Weaving",
        business_name: "Pochampally Heritage Weaves",
        location: "Bhoodan Pochampally",
        state: "Telangana",
        artisan_id: "art-01",
        created_at: new Date(Date.now() - 3600000 * 24 * 20).toISOString(),
      },
      {
        id: "usr-02",
        name: "Santosh Prajapati",
        email: "santosh@artisan.in",
        phone: "9829033445",
        passwordHash: hashPassword("Seller@123456"),
        role: "seller",
        status: "active",
        craft_type: "Blue Pottery",
        business_name: "Jaipur Traditional Clay Works",
        location: "Jaipur",
        state: "Rajasthan",
        artisan_id: "art-03",
        created_at: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
      },
      {
        id: "usr-buyer-01",
        name: "Anita Deshmukh",
        email: "buyer@culturecurate.in",
        phone: "9444077889",
        passwordHash: hashPassword("Buyer@123456"),
        role: "buyer",
        status: "active",
        location: "Bengaluru",
        state: "Karnataka",
        address: "Indiranagar 100ft Rd, Bengaluru - 560038",
        created_at: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
      },
      {
        id: "usr-buyer-02",
        name: "Arjun Singhania",
        email: "arjun@singhania.org",
        phone: "9811033221",
        passwordHash: hashPassword("Buyer@123456"),
        role: "buyer",
        status: "active",
        location: "New Delhi",
        state: "Delhi",
        address: "Vasant Vihar, New Delhi - 110057",
        created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
      }
    ];
    this.artisans = JSON.parse(JSON.stringify(SAMPLE_ARTISANS));
    this.products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    this.benchmarks = JSON.parse(JSON.stringify(SEED_MARKET_BENCHMARKS));
    this.channels = JSON.parse(JSON.stringify(BUYER_CHANNELS));
    this.enquiries = [
      {
        id: "enq-01",
        product_id: "prod-01",
        product_title: "Mastercrafted Pochampally Double-Ikat Silk Saree",
        artisan_id: "art-01",
        buyer_name: "Anita Deshmukh (Boutique Curator)",
        buyer_contact: "+91 98200 44556",
        buyer_email: "anita@heritagefabrics.in",
        buyer_location: "Mumbai, Maharashtra",
        quantity: 3,
        message: "We curate GI-tagged handlooms for our flagship store in Bandra. Would love to place a wholesale trial order of 3 sarees if custom pallu variations are possible.",
        status: "new",
        created_at: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: "enq-02",
        product_id: "prod-02",
        product_title: "Jaipur Handcrafted Blue Art Pottery Floral Amphora Vase",
        artisan_id: "art-03",
        buyer_name: "David Miller",
        buyer_contact: "+1 415 890 1234",
        buyer_email: "david@globalcrafttrade.org",
        buyer_location: "San Francisco, USA",
        quantity: 12,
        message: "Looking for authentic lead-free blue pottery vases for an international fair-trade lifestyle exhibition in autumn. Please confirm export packing support.",
        status: "responded",
        created_at: new Date(Date.now() - 3600000 * 24).toISOString()
      }
    ];
    this.orders = [
      {
        id: "ord-01",
        product_id: "prod-01",
        product_title: "Mastercrafted Pochampally Double-Ikat Silk Saree",
        artisan_id: "art-01",
        artisan_name: "Rameshwar Rao",
        buyer_name: "Meera Krishnan",
        buyer_contact: "+91 94440 77889",
        buyer_email: "meera.k@culturecurate.in",
        buyer_address: "Indiranagar, Bengaluru, Karnataka - 560038",
        quantity: 1,
        unit_price: 8400,
        total_amount: 8400,
        status: "paid",
        payment_id: "pay_test_rp_7849102",
        payment_method: "razorpay_test",
        fair_trade_verified: true,
        created_at: new Date(Date.now() - 3600000 * 12).toISOString()
      },
      {
        id: "ord-02",
        product_id: "prod-03",
        product_title: "Bastar Traditional Lost-Wax Bell Metal (Dhokra) Nandi Figurine",
        artisan_id: "art-01",
        artisan_name: "Rameshwar Rao",
        buyer_name: "Arjun Singhania",
        buyer_contact: "+91 98110 33221",
        buyer_email: "arjun@singhania.org",
        buyer_address: "Vasant Vihar, New Delhi - 110057",
        quantity: 2,
        unit_price: 2400,
        total_amount: 4800,
        status: "paid",
        payment_id: "pay_test_rp_9921045",
        payment_method: "upi_direct",
        fair_trade_verified: true,
        created_at: new Date(Date.now() - 3600000 * 36).toISOString()
      }
    ];
    this.auditTrail = [
      {
        id: "aud-01",
        product_id: "prod-01",
        feature: "enhancement",
        model_used: "image-studio-enhancer",
        latency_ms: 480,
        status: "success",
        raw_input_summary: "Photo normalized for pit loom ambient lighting and fiber texture contrast",
        raw_response_summary: "Generated 1200px enhanced studio lighting preview",
        created_at: new Date(Date.now() - 3600000 * 48).toISOString()
      },
      {
        id: "aud-02",
        product_id: "prod-01",
        feature: "catalog",
        model_used: "gemini-3.8-flash",
        latency_ms: 1240,
        status: "success",
        raw_input_summary: "Category: Weaving | Region: Pochampally, Telangana",
        raw_response_summary: "Extracted title, GI tagging tags, mulberry silk material, double ikat description",
        created_at: new Date(Date.now() - 3600000 * 48).toISOString()
      },
      {
        id: "aud-03",
        product_id: "prod-01",
        feature: "pricing",
        model_used: "gemini-3.8-flash",
        latency_ms: 890,
        status: "success",
        raw_input_summary: "Cost ₹3200 + 45h labor @ ₹90/hr vs Pochampally curated benchmark ₹7400",
        raw_response_summary: "Recommended ₹8,400 target (range ₹7,500-₹9,800), saving ₹5,000 from middleman",
        created_at: new Date(Date.now() - 3600000 * 48).toISOString()
      }
    ];
  }

  // User operations
  findUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  findUserByEmail(email: string): User | undefined {
    if (!email) return undefined;
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserByPhone(phone: string): User | undefined {
    if (!phone) return undefined;
    const clean = phone.replace(/[^0-9]/g, '');
    return this.users.find(u => u.phone.replace(/[^0-9]/g, '').slice(-10) === clean.slice(-10));
  }

  findUserByEmailOrPhone(identifier: string): User | undefined {
    if (!identifier) return undefined;
    const clean = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/[^0-9]/g, '');
    return this.users.find(u => {
      if (u.email.toLowerCase() === clean) return true;
      if (cleanDigits.length >= 7 && u.phone.replace(/[^0-9]/g, '').slice(-10) === cleanDigits.slice(-10)) return true;
      return false;
    });
  }

  createUser(data: Omit<User, "id" | "created_at">): User {
    const id = `usr-${Date.now().toString().slice(-6)}`;
    const user: User = {
      ...data,
      id,
      created_at: new Date().toISOString()
    };
    this.users.unshift(user);
    return user;
  }

  updateUserStatus(id: string, status: 'active' | 'deactivated' | 'suspended'): User | undefined {
    const user = this.users.find(u => u.id === id);
    if (user) {
      user.status = status;
    }
    return user;
  }

  getAllSellers(): User[] {
    return this.users.filter(u => u.role === 'seller');
  }

  getAllBuyers(): User[] {
    return this.users.filter(u => u.role === 'buyer');
  }

  getAllUsers(): User[] {
    return this.users;
  }

  // Artisan operations
  getArtisan(id: string): Artisan | undefined {
    return this.artisans.find(a => a.id === id);
  }

  createOrUpdateArtisan(data: Partial<Artisan> & { phone: string }): Artisan {
    let existing = this.artisans.find(a => a.phone === data.phone);
    if (existing) {
      Object.assign(existing, data);
      return existing;
    }
    const newArtisan: Artisan = {
      id: `art-${Date.now().toString().slice(-4)}`,
      user_id: `usr-${Date.now().toString().slice(-4)}`,
      name: data.name || "Master Craftsperson",
      category: data.category || "Weaving",
      state: data.state || "Telangana",
      district: data.district || "Bhoodan Pochampally",
      bio: data.bio || "Traditional artisan continuing ancient ancestral craft legacy.",
      experience_years: data.experience_years || 15,
      profile_image_url: data.profile_image_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
      phone: data.phone
    };
    this.artisans.push(newArtisan);
    return newArtisan;
  }

  // Product operations
  getProducts(filters?: { category?: string; query?: string; minPrice?: number; maxPrice?: number; artisanId?: string; status?: string; includeDisabled?: boolean }): Product[] {
    let list = this.products;

    // By default, hide disabled products from public marketplace
    if (!filters?.includeDisabled) {
      list = list.filter(p => p.status !== 'disabled');
    }

    if (!filters) return list;

    if (filters.status) {
      list = list.filter(p => p.status === filters.status);
    }
    if (filters.artisanId) {
      list = list.filter(p => p.artisan_id === filters.artisanId);
    }
    if (filters.category && filters.category !== "all") {
      list = list.filter(p => p.category.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters.minPrice !== undefined) {
      list = list.filter(p => (p.final_price || p.pricing?.target_recommended || 0) >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      list = list.filter(p => (p.final_price || p.pricing?.target_recommended || 0) <= filters.maxPrice!);
    }
    if (filters.query) {
      const q = filters.query.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.artisan_name.toLowerCase().includes(q) ||
        p.artisan_district.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return list;
  }

  getProductById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  createProduct(data: Partial<Product>): Product {
    const id = `prod-${Date.now().toString().slice(-4)}`;
    const product: Product = {
      id,
      artisan_id: data.artisan_id || "art-01",
      artisan_name: data.artisan_name || "Artisan Craftsperson",
      artisan_category: data.artisan_category || "Weaving",
      artisan_district: data.artisan_district || "Bhoodan Pochampally",
      artisan_state: data.artisan_state || "Telangana",
      artisan_phone: data.artisan_phone || "+91 98480 12345",
      title: data.title || "Handcrafted Heritage Art Piece",
      description: data.description || "Authentic handmade creation produced using generational folk art techniques.",
      category: data.category || "Weaving",
      subcategory: data.subcategory || "Traditional Craft",
      tags: data.tags || ["Handmade", "Heritage"],
      material: data.material || "Natural Artisanal Materials",
      est_dimensions: data.est_dimensions || "Standard Size",
      weight: data.weight || "400 grams",
      base_language: data.base_language || "en",
      original_image_url: data.original_image_url || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
      enhanced_image_url: data.enhanced_image_url || data.original_image_url || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=90",
      enhancement_applied: !!data.enhancement_applied,
      status: data.status || "draft",
      cost: data.cost || {
        material_cost: 500,
        labor_hours: 10,
        hourly_rate: 80,
        other_cost: 100
      },
      pricing: data.pricing,
      final_price: data.final_price || 1500,
      translations: data.translations || {
        en: {
          title: data.title || "Handcrafted Heritage Art Piece",
          description: data.description || "Authentic handmade creation.",
          tags: data.tags || ["Handmade"],
          translated_at: new Date().toISOString(),
          source: "ai"
        },
        hi: {
          title: `पारंपरिक ${data.title || "हस्तशिल्प"}`,
          description: "हस्तनिर्मित पारंपरिक भारतीय कलाकृति।",
          tags: ["हस्तनिर्मित", "पारंपरिक"],
          translated_at: new Date().toISOString(),
          source: "ai"
        },
        te: {
          title: `సాంప్రదాయ ${data.title || "చేతిపని"}`,
          description: "గ్రామీణ కళాకారుల చేతిపని నైపుణ్యంతో తయారైన వస్తువు.",
          tags: ["చేతిపని", "వారసత్వం"],
          translated_at: new Date().toISOString(),
          source: "ai"
        }
      },
      market_linkage: data.market_linkage || [],
      views_count: 1,
      enquiry_count: 0,
      created_at: new Date().toISOString()
    };
    this.products.unshift(product);
    return product;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | undefined {
    const p = this.products.find(item => item.id === id);
    if (!p) return undefined;
    Object.assign(p, updates);
    return p;
  }

  // Channel matching logic
  calculateMarketLinkage(product: Product): BuyerChannelMatch[] {
    const matches: BuyerChannelMatch[] = [];
    const cat = product.category;
    const price = product.final_price || product.pricing?.target_recommended || 1500;

    // Rule-based channel scoring + custom rationale
    if (["Weaving", "Embroidery", "Folk Painting"].includes(cat)) {
      matches.push({
        channel_id: "ch-01",
        channel_name: "Fabindia & Jaypore Artisan Guild",
        channel_type: "boutique",
        match_score: 94,
        reason: `${cat} collections enjoy strong buyer demand in premium lifestyle retail with certified handcraft provenance.`,
        target_audience: "Urban design enthusiasts & lifestyle shoppers",
        recommended_price_tier: `₹${Math.round(price * 0.95)} - ₹${Math.round(price * 1.2)}`,
        action_cta: "Submit to Curated Boutique Portal",
        platform_tag: "Curated Handloom & Craft"
      });
    }

    if (price >= 2000 || ["Metalcraft", "Folk Painting", "Weaving"].includes(cat)) {
      matches.push({
        channel_id: "ch-02",
        channel_name: "Etsy Global & Fair Trade Export Network",
        channel_type: "export",
        match_score: 91,
        reason: `International conscious consumers frequently pay 2x-3x value for verified authentic ${cat} heritage pieces.`,
        target_audience: "Global diaspora & ethical art collectors (US/EU/UK)",
        recommended_price_tier: `$${Math.round(price / 70)} - $${Math.round(price / 55)} USD`,
        action_cta: "Export Listing Ready",
        platform_tag: "Global Fair Trade"
      });
    }

    matches.push({
      channel_id: "ch-03",
      channel_name: "Dastkar & Shilparamam Craft Haat (Direct)",
      channel_type: "local_retail",
      match_score: 88,
      reason: `Direct weekend consumer footfall with 0% intermediary commission and immediate cash/UPI settlements.`,
      target_audience: "Cultural tourists, local families & festive gift shoppers",
      recommended_price_tier: `₹${Math.round(price * 0.9)} - ₹${price}`,
      action_cta: "Display at Craft Stall",
      platform_tag: "Direct Cash Haat"
    });

    if (["Metalcraft", "Woodwork", "Folk Painting"].includes(cat)) {
      matches.push({
        channel_id: "ch-04",
        channel_name: "TRIFED & GeM Govt Bulk Procurement",
        channel_type: "institutional",
        match_score: 86,
        reason: `Eligible for institutional purchase orders (50-200 units) for government felicitations and corporate gifting.`,
        target_audience: "Public sector enterprises & corporate gifting desks",
        recommended_price_tier: `₹${Math.round(price * 0.85)} (Bulk Order Rate)`,
        action_cta: "Apply for Institutional Vendor Roster",
        platform_tag: "Govt GeM Registered"
      });
    }

    matches.push({
      channel_id: "ch-05",
      channel_name: "Artisan Direct WhatsApp & Social Showcase",
      channel_type: "direct_social",
      match_score: 98,
      reason: "Direct peer-to-peer sharing via WhatsApp catalog links gives you 100% price control with zero middleman deductions.",
      target_audience: "Your existing repeat buyers, neighborhood patrons & family referrals",
      recommended_price_tier: `₹${price}`,
      action_cta: "Share WhatsApp Product Card",
      platform_tag: "100% Margin Retention"
    });

    return matches.sort((a, b) => b.match_score - a.match_score).slice(0, 3);
  }

  // Order operations
  createOrder(orderData: Omit<Order, "id" | "created_at">): Order {
    const order: Order = {
      ...orderData,
      id: `ord-${Date.now().toString().slice(-4)}`,
      created_at: new Date().toISOString()
    };
    this.orders.unshift(order);
    return order;
  }

  getOrdersByArtisan(artisanId: string): Order[] {
    return this.orders.filter(o => o.artisan_id === artisanId || artisanId === "art-01");
  }

  getOrders(): Order[] {
    return this.orders;
  }

  // Bill operations
  createBill(billData: Bill): Bill {
    this.bills.unshift(billData);
    return billData;
  }

  getBills(): Bill[] {
    if (this.bills.length === 0) {
      this.bills = [
        {
          id: 'bill-seed-01',
          billNumber: 'KT-INV-20260308-0101',
          sellerId: 'art-01',
          sellerName: 'Rameshwar Rao',
          sellerPhone: '+91 98480 12345',
          sellerLocation: 'Yadadri Bhoodan Pochampally, Telangana',
          productId: 'prod-01',
          productName: 'Pochampally Double-Ikat Silk Saree',
          productCategory: 'Handloom',
          quantity: 2,
          materialCost: 2800,
          labourCost: 3200,
          transportationCost: 250,
          otherCost: 150,
          totalCost: 12800,
          proposedPrice: 8400,
          marketMinPrice: 7200,
          marketAveragePrice: 8600,
          marketMaxPrice: 11000,
          recommendedPrice: 8500,
          finalPrice: 8400,
          profit: 4000,
          profitPercentage: 31.25,
          status: 'finalized',
          createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
          finalizedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        }
      ];
    }
    return this.bills;
  }

  getBillById(id: string): Bill | undefined {
    return this.getBills().find(b => b.id === id || b.billNumber === id);
  }

  // Benchmark operations
  getBenchmarks(): MarketPriceBenchmark[] {
    return this.benchmarks;
  }

  getBenchmarkById(id: string): MarketPriceBenchmark | undefined {
    return this.benchmarks.find(b => b.id === id);
  }

  updateBenchmark(id: string, updates: Partial<MarketPriceBenchmark>): MarketPriceBenchmark | undefined {
    const b = this.benchmarks.find(item => item.id === id);
    if (!b) return undefined;
    Object.assign(b, {
      ...updates,
      last_updated: new Date().toISOString()
    });
    return b;
  }

  addBenchmark(data: Omit<MarketPriceBenchmark, "id" | "last_updated">): MarketPriceBenchmark {
    const newBenchmark: MarketPriceBenchmark = {
      ...data,
      id: `bm-${Date.now().toString().slice(-4)}`,
      last_updated: new Date().toISOString()
    };
    this.benchmarks.unshift(newBenchmark);
    return newBenchmark;
  }

  // Product moderation
  setProductStatus(id: string, status: 'published' | 'draft' | 'disabled' | 'rejected'): Product | undefined {
    const prod = this.products.find(p => p.id === id);
    if (prod) {
      prod.status = status;
    }
    return prod;
  }

  // Order status
  updateOrderStatus(id: string, status: Order['status']): Order | undefined {
    const ord = this.orders.find(o => o.id === id);
    if (ord) {
      ord.status = status;
    }
    return ord;
  }

  // Audit operations
  logAudit(audit: Omit<AIProcessingResult, "id" | "created_at">): AIProcessingResult {
    const item: AIProcessingResult = {
      ...audit,
      id: `aud-${Date.now().toString().slice(-4)}`,
      created_at: new Date().toISOString()
    };
    this.auditTrail.unshift(item);
    return item;
  }
}

export const db = new InMemoryDB();
