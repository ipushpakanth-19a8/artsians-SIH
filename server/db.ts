import crypto from 'crypto';
import prisma from './config/database.js';
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
  district?: string;
  place?: string;
  preferredLanguage?: string;
  address?: string;
  artisan_id?: string;
  created_at: string;
  last_login?: string;
  hasCompletedBuyerOnboarding?: boolean;
  hasCompletedSellerOnboarding?: boolean;
}

const PASSWORD_SALT = 'kalatech-salt-secure-2026';

export function hashPassword(password: string): string {
  return crypto.createHmac('sha256', PASSWORD_SALT).update(password).digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

class PostgresDB {
  users: User[] = [];
  artisans: Artisan[] = [];
  products: Product[] = [];
  benchmarks: MarketPriceBenchmark[] = [];
  channels: BuyerChannel[] = [];
  enquiries: Enquiry[] = [];
  orders: Order[] = [];
  bills: Bill[] = [];
  auditTrail: AIProcessingResult[] = [];
  isInitialized: boolean = false;

  constructor() {
    this.seedDefaultsInMemory();
    this.initFromPostgres();
  }

  private seedDefaultsInMemory() {
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
        hasCompletedSellerOnboarding: false,
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
        hasCompletedSellerOnboarding: false,
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
        hasCompletedBuyerOnboarding: false,
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
        hasCompletedBuyerOnboarding: false,
      }
    ];
    this.artisans = JSON.parse(JSON.stringify(SAMPLE_ARTISANS));
    this.products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    this.benchmarks = JSON.parse(JSON.stringify(SEED_MARKET_BENCHMARKS));
    this.channels = JSON.parse(JSON.stringify(BUYER_CHANNELS));
  }

  async initFromPostgres() {
    try {
      const [
        dbUsers,
        dbArtisans,
        dbProducts,
        dbBenchmarks,
        dbChannels,
        dbOrders,
        dbBills,
        dbEnquiries,
        dbAuditLogs
      ] = await Promise.all([
        prisma.user.findMany({ orderBy: { created_at: 'desc' } }),
        prisma.artisan.findMany({ orderBy: { created_at: 'desc' } }),
        prisma.product.findMany({ orderBy: { created_at: 'desc' } }),
        prisma.marketPriceBenchmark.findMany({ orderBy: { last_updated: 'desc' } }),
        prisma.buyerChannel.findMany(),
        prisma.order.findMany({ orderBy: { created_at: 'desc' } }),
        prisma.bill.findMany({ orderBy: { createdAt: 'desc' } }),
        prisma.enquiry.findMany({ orderBy: { created_at: 'desc' } }),
        prisma.aIProcessingResult.findMany({ orderBy: { created_at: 'desc' } })
      ]);

      if (dbUsers.length > 0) {
        this.users = dbUsers.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          passwordHash: u.passwordHash,
          role: u.role as User['role'],
          status: u.status as User['status'],
          craft_type: u.craft_type || undefined,
          business_name: u.business_name || undefined,
          location: u.location || undefined,
          state: u.state || undefined,
          address: u.address || undefined,
          artisan_id: u.artisan_id || undefined,
          created_at: u.created_at.toISOString(),
          last_login: u.last_login ? u.last_login.toISOString() : undefined,
          hasCompletedBuyerOnboarding: (u as any).hasCompletedBuyerOnboarding ?? false,
          hasCompletedSellerOnboarding: (u as any).hasCompletedSellerOnboarding ?? false,
        }));
      }

      if (dbArtisans.length > 0) {
        this.artisans = dbArtisans.map(a => ({
          id: a.id,
          user_id: a.user_id || `usr-${a.id}`,
          name: a.name,
          category: a.category,
          state: a.state,
          district: a.district,
          bio: a.bio,
          experience_years: a.experience_years,
          profile_image_url: a.profile_image_url,
          phone: a.phone
        }));
      }

      if (dbProducts.length > 0) {
        this.products = dbProducts.map(p => ({
          id: p.id,
          artisan_id: p.artisan_id,
          artisan_name: p.artisan_name,
          artisan_category: p.artisan_category,
          artisan_district: p.artisan_district,
          artisan_state: p.artisan_state,
          artisan_phone: p.artisan_phone || undefined,
          title: p.title,
          description: p.description,
          short_description: p.short_description || undefined,
          b2b_description: p.b2b_description || undefined,
          social_caption: p.social_caption || undefined,
          category: p.category,
          subcategory: p.subcategory || undefined,
          craft_technique: p.craft_technique || undefined,
          motifs: (p.motifs as string[]) || undefined,
          colors: (p.colors as string[]) || undefined,
          tags: (p.tags as string[]) || [],
          material: p.material,
          est_dimensions: p.est_dimensions,
          weight: p.weight || undefined,
          base_language: p.base_language as any,
          original_image_url: p.original_image_url,
          enhanced_image_url: p.enhanced_image_url,
          image_variants: (p.image_variants as any) || undefined,
          enhancement_applied: p.enhancement_applied,
          status: p.status as any,
          validation_status: p.validation_status as any,
          gi_status: p.gi_status as any,
          gi_certificate_number: p.gi_certificate_number || undefined,
          cost: p.cost as any,
          pricing: (p.pricing as any) || undefined,
          final_price: p.final_price,
          b2b_price: p.b2b_price || undefined,
          minimum_order_quantity: p.minimum_order_quantity || 1,
          production_capacity_monthly: p.production_capacity_monthly || 20,
          lead_time_days: p.lead_time_days || 7,
          customization_available: p.customization_available || false,
          sample_available: p.sample_available || false,
          seen_at_exhibition: (p.seen_at_exhibition as any) || undefined,
          translations: (p.translations as any) || {},
          market_linkage: (p.market_linkage as any) || [],
          views_count: p.views_count,
          enquiry_count: p.enquiry_count,
          quantity: p.quantity || 1,
          location: p.location || undefined,
          craft_origin: p.craft_origin || undefined,
          materialCost: (p as any).materialCost ?? undefined,
          laborHours: (p as any).laborHours ?? undefined,
          fairHourlyWage: (p as any).fairHourlyWage ?? undefined,
          laborValue: (p as any).laborValue ?? undefined,
          baseCost: (p as any).baseCost ?? undefined,
          marginAmount: (p as any).marginAmount ?? undefined,
          recommendedFairPrice: (p as any).recommendedFairPrice ?? undefined,
          artisanApprovedPrice: (p as any).artisanApprovedPrice ?? undefined,
          pricingFormulaVersion: (p as any).pricingFormulaVersion ?? undefined,
          pricingCalculatedAt: (p as any).pricingCalculatedAt ? (p as any).pricingCalculatedAt.toISOString() : undefined,
          created_at: p.created_at.toISOString()
        }));
      }

      if (dbBenchmarks.length > 0) {
        this.benchmarks = dbBenchmarks.map(b => ({
          id: b.id,
          category: b.category,
          material: b.material || undefined,
          craft_name: b.craft_name,
          craft_type: b.craft_type || undefined,
          region: b.region,
          price_low: b.price_low,
          price_high: b.price_high,
          average_price: b.average_price,
          target_recommended: b.target_recommended || undefined,
          typical_middleman_cut: b.typical_middleman_cut,
          source: b.source,
          last_updated: b.last_updated.toISOString()
        }));
      }

      if (dbChannels.length > 0) {
        this.channels = dbChannels.map(c => ({
          id: c.id,
          name: c.name,
          channel_type: c.channel_type as any,
          typical_price_tier: c.typical_price_tier as any,
          category_fit: (c.category_fit as string[]) || [],
          description: c.description,
          margin_fee_pct: c.margin_fee_pct,
          settlement_speed: c.settlement_speed
        }));
      }

      if (dbOrders.length > 0) {
        this.orders = dbOrders.map(o => ({
          id: o.id,
          product_id: o.product_id,
          product_title: o.product_title,
          artisan_id: o.artisan_id,
          artisan_name: o.artisan_name,
          buyer_name: o.buyer_name,
          buyer_contact: o.buyer_contact,
          buyer_email: o.buyer_email || undefined,
          buyer_address: o.buyer_address || undefined,
          quantity: o.quantity,
          unit_price: o.unit_price,
          total_amount: o.total_amount,
          status: o.status as any,
          payment_id: o.payment_id || undefined,
          payment_method: o.payment_method as any,
          fair_trade_verified: o.fair_trade_verified,
          recommended_fair_price: (o as any).recommended_fair_price ?? undefined,
          artisan_approved_price: (o as any).artisan_approved_price ?? undefined,
          fair_price_breakdown: (o as any).fair_price_breakdown ?? undefined,
          created_at: o.created_at.toISOString()
        }));
      }

      if (dbBills.length > 0) {
        this.bills = dbBills.map(b => ({
          id: b.id,
          billNumber: b.billNumber,
          sellerId: b.sellerId,
          sellerName: b.sellerName,
          sellerPhone: b.sellerPhone,
          sellerLocation: b.sellerLocation,
          productId: b.productId,
          productName: b.productName,
          productCategory: b.productCategory,
          quantity: b.quantity,
          materialCost: b.materialCost,
          labourCost: b.labourCost,
          transportationCost: b.transportationCost,
          otherCost: b.otherCost,
          totalCost: b.totalCost,
          proposedPrice: b.proposedPrice,
          marketMinPrice: b.marketMinPrice,
          marketAveragePrice: b.marketAveragePrice,
          marketMaxPrice: b.marketMaxPrice,
          recommendedPrice: b.recommendedPrice,
          finalPrice: b.finalPrice,
          profit: b.profit,
          profitPercentage: b.profitPercentage,
          fairHourlyWage: (b as any).fairHourlyWage ?? undefined,
          laborHours: (b as any).laborHours ?? undefined,
          laborValue: (b as any).laborValue ?? undefined,
          baseCost: (b as any).baseCost ?? undefined,
          marginAmount: (b as any).marginAmount ?? undefined,
          recommendedFairPrice: (b as any).recommendedFairPrice ?? undefined,
          artisanApprovedPrice: (b as any).artisanApprovedPrice ?? undefined,
          pricingFormulaVersion: (b as any).pricingFormulaVersion ?? undefined,
          status: b.status as any,
          createdAt: b.createdAt.toISOString(),
          finalizedAt: b.finalizedAt ? b.finalizedAt.toISOString() : undefined
        }));
      }

      if (dbEnquiries.length > 0) {
        this.enquiries = dbEnquiries.map(e => ({
          id: e.id,
          product_id: e.product_id,
          product_title: e.product_title,
          artisan_id: e.artisan_id,
          buyer_name: e.buyer_name,
          buyer_contact: e.buyer_contact,
          buyer_email: e.buyer_email || undefined,
          buyer_location: e.buyer_location,
          quantity: e.quantity,
          message: e.message,
          status: e.status as any,
          created_at: e.created_at.toISOString()
        }));
      }

      if (dbAuditLogs.length > 0) {
        this.auditTrail = dbAuditLogs.map(a => ({
          id: a.id,
          product_id: a.product_id || 'prod-general',
          feature: a.feature as any,
          model_used: a.model_used,
          latency_ms: a.latency_ms,
          status: a.status as any,
          raw_input_summary: a.raw_input_summary,
          raw_response_summary: a.raw_response_summary,
          created_at: a.created_at.toISOString()
        }));
      }

      this.isInitialized = true;
      console.log(`✓ PostgreSQL database synchronized via Prisma: ${this.users.length} users, ${this.products.length} products, ${this.orders.length} orders.`);
    } catch (err) {
      console.warn('⚠️ Warning: PostgreSQL not reachable on startup, continuing with memory cache:', err);
    }
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
      created_at: new Date().toISOString(),
      hasCompletedBuyerOnboarding: data.hasCompletedBuyerOnboarding ?? false,
      hasCompletedSellerOnboarding: data.hasCompletedSellerOnboarding ?? false,
    };
    this.users.unshift(user);

    // Persist asynchronously to PostgreSQL
    prisma.user.create({
      data: {
        id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash: data.passwordHash,
        role: data.role,
        status: data.status,
        craft_type: data.craft_type,
        business_name: data.business_name,
        location: data.location,
        state: data.state,
        address: data.address,
        artisan_id: data.artisan_id,
        hasCompletedBuyerOnboarding: data.hasCompletedBuyerOnboarding ?? false,
        hasCompletedSellerOnboarding: data.hasCompletedSellerOnboarding ?? false,
      } as any
    }).catch(e => console.error('Prisma User create error:', e));

    return user;
  }

  updateUserOnboarding(id: string, completed: boolean): User | undefined {
    const user = this.users.find(u => u.id === id);
    if (user) {
      user.hasCompletedBuyerOnboarding = completed;
      prisma.user.update({
        where: { id },
        data: { hasCompletedBuyerOnboarding: completed } as any
      }).catch(e => console.error('Prisma User onboarding update error:', e));
    }
    return user;
  }

  updateSellerOnboarding(id: string, completed: boolean): User | undefined {
    const user = this.users.find(u => u.id === id);
    if (user) {
      user.hasCompletedSellerOnboarding = completed;
      prisma.user.update({
        where: { id },
        data: { hasCompletedSellerOnboarding: completed } as any
      }).catch(e => console.error('Prisma Seller onboarding update error:', e));
    }
    return user;
  }

  updateUserStatus(id: string, status: 'active' | 'deactivated' | 'suspended'): User | undefined {
    const user = this.users.find(u => u.id === id);
    if (user) {
      user.status = status;
      prisma.user.update({
        where: { id },
        data: { status }
      }).catch(e => console.error('Prisma User status update error:', e));
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
      prisma.artisan.update({
        where: { id: existing.id },
        data: {
          name: existing.name,
          category: existing.category,
          state: existing.state,
          district: existing.district,
          place: existing.place,
          preferredLanguage: existing.preferredLanguage,
          bio: existing.bio,
          experience_years: existing.experience_years,
          profile_image_url: existing.profile_image_url,
          phone: existing.phone
        } as any
      }).catch(e => console.error('Prisma Artisan update error:', e));
      return existing;
    }
    const newArtisan: Artisan = {
      id: `art-${Date.now().toString().slice(-4)}`,
      user_id: `usr-${Date.now().toString().slice(-4)}`,
      name: data.name || "Master Craftsperson",
      category: data.category || "Weaving",
      state: data.state || "Telangana",
      district: data.district || "Bhoodan Pochampally",
      place: data.place || "Not available",
      preferredLanguage: data.preferredLanguage || "te",
      bio: data.bio || "Traditional artisan continuing ancient ancestral craft legacy.",
      experience_years: data.experience_years || 15,
      profile_image_url: data.profile_image_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
      phone: data.phone
    };
    this.artisans.push(newArtisan);

    prisma.artisan.create({
      data: {
        id: newArtisan.id,
        user_id: newArtisan.user_id,
        name: newArtisan.name,
        category: newArtisan.category,
        state: newArtisan.state,
        district: newArtisan.district,
        place: newArtisan.place,
        preferredLanguage: newArtisan.preferredLanguage,
        bio: newArtisan.bio,
        experience_years: newArtisan.experience_years,
        profile_image_url: newArtisan.profile_image_url,
        phone: newArtisan.phone
      } as any
    }).catch(e => console.error('Prisma Artisan create error:', e));

    return newArtisan;
  }

  // Product operations
  getProducts(filters?: { category?: string; query?: string; minPrice?: number; maxPrice?: number; artisanId?: string; status?: string; includeDisabled?: boolean }): Product[] {
    let list = this.products;

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
      materialCost: data.materialCost,
      laborHours: data.laborHours,
      fairHourlyWage: data.fairHourlyWage,
      laborValue: data.laborValue,
      baseCost: data.baseCost,
      marginAmount: data.marginAmount,
      recommendedFairPrice: data.recommendedFairPrice,
      artisanApprovedPrice: data.artisanApprovedPrice,
      pricingFormulaVersion: data.pricingFormulaVersion || "v1.0-living-wage",
      pricingCalculatedAt: data.pricingCalculatedAt || new Date().toISOString(),
      fairPricingBreakdown: data.fairPricingBreakdown,
      created_at: new Date().toISOString()
    };
    this.products.unshift(product);

    // Persist to PostgreSQL via Prisma
    prisma.product.create({
      data: {
        id: product.id,
        artisan_id: product.artisan_id,
        artisan_name: product.artisan_name,
        artisan_category: product.artisan_category,
        artisan_district: product.artisan_district,
        artisan_state: product.artisan_state,
        artisan_phone: product.artisan_phone,
        title: product.title,
        description: product.description,
        short_description: product.short_description,
        b2b_description: product.b2b_description,
        social_caption: product.social_caption,
        category: product.category,
        subcategory: product.subcategory,
        craft_technique: product.craft_technique,
        motifs: product.motifs || [],
        colors: product.colors || [],
        tags: product.tags,
        material: product.material,
        est_dimensions: product.est_dimensions,
        weight: product.weight,
        base_language: product.base_language,
        original_image_url: product.original_image_url,
        enhanced_image_url: product.enhanced_image_url,
        image_variants: product.image_variants || {},
        enhancement_applied: product.enhancement_applied || false,
        status: product.status,
        validation_status: product.validation_status,
        gi_status: product.gi_status,
        gi_certificate_number: product.gi_certificate_number,
        cost: product.cost as any,
        pricing: (product.pricing as any) || null,
        final_price: product.final_price,
        b2b_price: product.b2b_price,
        minimum_order_quantity: product.minimum_order_quantity,
        production_capacity_monthly: product.production_capacity_monthly,
        lead_time_days: product.lead_time_days,
        customization_available: product.customization_available,
        sample_available: product.sample_available,
        seen_at_exhibition: (product.seen_at_exhibition as any) || null,
        translations: product.translations as any,
        market_linkage: product.market_linkage as any,
        views_count: product.views_count,
        enquiry_count: product.enquiry_count,
        quantity: product.quantity,
        location: product.location,
        craft_origin: product.craft_origin,
        materialCost: product.materialCost,
        laborHours: product.laborHours,
        fairHourlyWage: product.fairHourlyWage,
        laborValue: product.laborValue,
        baseCost: product.baseCost,
        marginAmount: product.marginAmount,
        recommendedFairPrice: product.recommendedFairPrice,
        artisanApprovedPrice: product.artisanApprovedPrice,
        pricingFormulaVersion: product.pricingFormulaVersion,
        pricingCalculatedAt: product.pricingCalculatedAt ? new Date(product.pricingCalculatedAt) : new Date()
      } as any
    }).catch(e => console.error('Prisma Product create error:', e));

    return product;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | undefined {
    const p = this.products.find(item => item.id === id);
    if (!p) return undefined;
    Object.assign(p, updates);

    // Persist to PostgreSQL via Prisma
    const dataToUpdate: any = {};
    if (updates.title !== undefined) dataToUpdate.title = updates.title;
    if (updates.description !== undefined) dataToUpdate.description = updates.description;
    if (updates.category !== undefined) dataToUpdate.category = updates.category;
    if (updates.material !== undefined) dataToUpdate.material = updates.material;
    if (updates.craft_technique !== undefined) dataToUpdate.craft_technique = updates.craft_technique;
    if (updates.est_dimensions !== undefined) dataToUpdate.est_dimensions = updates.est_dimensions;
    if (updates.quantity !== undefined) dataToUpdate.quantity = updates.quantity;
    if (updates.location !== undefined) dataToUpdate.location = updates.location;
    if (updates.motifs !== undefined) dataToUpdate.motifs = updates.motifs;
    if (updates.colors !== undefined) dataToUpdate.colors = updates.colors;
    if (updates.final_price !== undefined) dataToUpdate.final_price = updates.final_price;
    if (updates.status !== undefined) dataToUpdate.status = updates.status;
    if (updates.pricing !== undefined) dataToUpdate.pricing = updates.pricing;
    if (updates.enhanced_image_url !== undefined) dataToUpdate.enhanced_image_url = updates.enhanced_image_url;
    if (updates.enhancement_applied !== undefined) dataToUpdate.enhancement_applied = updates.enhancement_applied;
    if (updates.translations !== undefined) dataToUpdate.translations = updates.translations;
    if (updates.market_linkage !== undefined) dataToUpdate.market_linkage = updates.market_linkage;
    if (updates.views_count !== undefined) dataToUpdate.views_count = updates.views_count;
    if (updates.enquiry_count !== undefined) dataToUpdate.enquiry_count = updates.enquiry_count;
    if (updates.seen_at_exhibition !== undefined) dataToUpdate.seen_at_exhibition = updates.seen_at_exhibition;
    if (updates.materialCost !== undefined) dataToUpdate.materialCost = updates.materialCost;
    if (updates.laborHours !== undefined) dataToUpdate.laborHours = updates.laborHours;
    if (updates.fairHourlyWage !== undefined) dataToUpdate.fairHourlyWage = updates.fairHourlyWage;
    if (updates.laborValue !== undefined) dataToUpdate.laborValue = updates.laborValue;
    if (updates.baseCost !== undefined) dataToUpdate.baseCost = updates.baseCost;
    if (updates.marginAmount !== undefined) dataToUpdate.marginAmount = updates.marginAmount;
    if (updates.recommendedFairPrice !== undefined) dataToUpdate.recommendedFairPrice = updates.recommendedFairPrice;
    if (updates.artisanApprovedPrice !== undefined) dataToUpdate.artisanApprovedPrice = updates.artisanApprovedPrice;
    if (updates.pricingFormulaVersion !== undefined) dataToUpdate.pricingFormulaVersion = updates.pricingFormulaVersion;
    if (updates.pricingCalculatedAt !== undefined) dataToUpdate.pricingCalculatedAt = new Date(updates.pricingCalculatedAt);

    prisma.product.findUnique({ where: { id }, select: { id: true } })
      .then(existing => {
        if (existing) {
          return prisma.product.update({
            where: { id },
            data: dataToUpdate
          });
        }
      })
      .catch(e => {
        // Non-critical background sync logging
        if (process.env.NODE_ENV === 'development') {
          console.debug('Prisma background product sync note:', e?.message || e);
        }
      });

    return p;
  }

  // Channel matching logic
  calculateMarketLinkage(product: Product): BuyerChannelMatch[] {
    const matches: BuyerChannelMatch[] = [];
    const cat = product.category;
    const price = product.final_price || product.pricing?.target_recommended || 1500;

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

    prisma.order.create({
      data: {
        id: order.id,
        product_id: order.product_id,
        product_title: order.product_title,
        artisan_id: order.artisan_id,
        artisan_name: order.artisan_name,
        buyer_name: order.buyer_name,
        buyer_contact: order.buyer_contact,
        buyer_email: order.buyer_email,
        buyer_address: order.buyer_address,
        quantity: order.quantity,
        unit_price: order.unit_price,
        total_amount: order.total_amount,
        status: order.status,
        payment_id: order.payment_id,
        payment_method: order.payment_method,
        fair_trade_verified: order.fair_trade_verified,
        recommended_fair_price: order.recommended_fair_price,
        artisan_approved_price: order.artisan_approved_price,
        fair_price_breakdown: (order.fair_price_breakdown as any) || null
      } as any
    }).catch(e => console.error('Prisma Order create error:', e));

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

    prisma.bill.create({
      data: {
        id: billData.id,
        billNumber: billData.billNumber,
        sellerId: billData.sellerId,
        sellerName: billData.sellerName,
        sellerPhone: billData.sellerPhone || "+91 98480 12345",
        sellerLocation: billData.sellerLocation || "Pochampally, Telangana",
        productId: billData.productId,
        productName: billData.productName,
        productCategory: billData.productCategory,
        quantity: billData.quantity,
        materialCost: billData.materialCost,
        labourCost: billData.labourCost,
        transportationCost: billData.transportationCost,
        otherCost: billData.otherCost,
        totalCost: billData.totalCost,
        proposedPrice: billData.proposedPrice,
        marketMinPrice: billData.marketMinPrice,
        marketAveragePrice: billData.marketAveragePrice,
        marketMaxPrice: billData.marketMaxPrice,
        recommendedPrice: billData.recommendedPrice,
        finalPrice: billData.finalPrice,
        profit: billData.profit,
        profitPercentage: billData.profitPercentage,
        fairHourlyWage: billData.fairHourlyWage,
        laborHours: billData.laborHours,
        laborValue: billData.laborValue,
        baseCost: billData.baseCost,
        marginAmount: billData.marginAmount,
        recommendedFairPrice: billData.recommendedFairPrice,
        artisanApprovedPrice: billData.artisanApprovedPrice,
        pricingFormulaVersion: billData.pricingFormulaVersion || "v1.0-living-wage",
        status: billData.status,
        finalizedAt: billData.finalizedAt ? new Date(billData.finalizedAt) : null
      } as any
    }).catch(e => console.error('Prisma Bill create error:', e));

    return billData;
  }

  getBills(): Bill[] {
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

    const dataToUpdate: any = {};
    if (updates.category !== undefined) dataToUpdate.category = updates.category;
    if (updates.region !== undefined) dataToUpdate.region = updates.region;
    if (updates.price_low !== undefined) dataToUpdate.price_low = updates.price_low;
    if (updates.average_price !== undefined) dataToUpdate.average_price = updates.average_price;
    if (updates.price_high !== undefined) dataToUpdate.price_high = updates.price_high;
    if (updates.target_recommended !== undefined) dataToUpdate.target_recommended = updates.target_recommended;
    if (updates.source !== undefined) dataToUpdate.source = updates.source;

    prisma.marketPriceBenchmark.update({
      where: { id },
      data: dataToUpdate
    }).catch(e => console.error('Prisma Benchmark update error:', e));

    return b;
  }

  addBenchmark(data: Omit<MarketPriceBenchmark, "id" | "last_updated">): MarketPriceBenchmark {
    const newBenchmark: MarketPriceBenchmark = {
      ...data,
      id: `bm-${Date.now().toString().slice(-4)}`,
      last_updated: new Date().toISOString()
    };
    this.benchmarks.unshift(newBenchmark);

    prisma.marketPriceBenchmark.create({
      data: {
        id: newBenchmark.id,
        category: newBenchmark.category,
        material: newBenchmark.material,
        craft_name: newBenchmark.craft_name,
        craft_type: newBenchmark.craft_type,
        region: newBenchmark.region,
        price_low: newBenchmark.price_low,
        price_high: newBenchmark.price_high,
        average_price: newBenchmark.average_price,
        target_recommended: newBenchmark.target_recommended,
        typical_middleman_cut: newBenchmark.typical_middleman_cut,
        source: newBenchmark.source
      }
    }).catch(e => console.error('Prisma Benchmark create error:', e));

    return newBenchmark;
  }

  // Product moderation
  setProductStatus(id: string, status: 'published' | 'draft' | 'disabled' | 'rejected'): Product | undefined {
    const prod = this.products.find(p => p.id === id);
    if (prod) {
      prod.status = status;
      prisma.product.update({
        where: { id },
        data: { status }
      }).catch(e => console.error('Prisma Product status update error:', e));
    }
    return prod;
  }

  // Order status
  updateOrderStatus(id: string, status: Order['status']): Order | undefined {
    const ord = this.orders.find(o => o.id === id);
    if (ord) {
      ord.status = status;
      prisma.order.update({
        where: { id },
        data: { status }
      }).catch(e => console.error('Prisma Order status update error:', e));
    }
    return ord;
  }

  seed() {
    this.seedDefaultsInMemory();
  }

  // Audit operations
  logAudit(audit: Omit<AIProcessingResult, "id" | "created_at"> | (Omit<AIProcessingResult, "id" | "created_at" | "product_id"> & { product_id?: string })): AIProcessingResult {
    const item: AIProcessingResult = {
      product_id: (audit as any).product_id || 'prod-general',
      feature: audit.feature,
      model_used: audit.model_used,
      latency_ms: audit.latency_ms,
      status: audit.status,
      raw_input_summary: audit.raw_input_summary,
      raw_response_summary: audit.raw_response_summary,
      id: `aud-${Date.now().toString().slice(-4)}`,
      created_at: new Date().toISOString()
    };
    this.auditTrail.unshift(item);

    // Verify product exists before inserting FK
    const productExists = (audit as any).product_id && this.products.some(p => p.id === (audit as any).product_id);
    prisma.aIProcessingResult.create({
      data: {
        id: item.id,
        product_id: productExists ? (audit as any).product_id : null,
        feature: item.feature,
        model_used: item.model_used,
        latency_ms: item.latency_ms,
        status: item.status,
        raw_input_summary: item.raw_input_summary,
        raw_response_summary: item.raw_response_summary
      }
    }).catch(e => console.error('Prisma AI Audit log error:', e));

    return item;
  }

  // RFQ and B2B Enquiry Pipeline
  addEnquiry(enquiry: Omit<Enquiry, 'id' | 'created_at'>): Enquiry {
    const newEnquiry: Enquiry = {
      ...enquiry,
      id: `enq-${Date.now().toString().slice(-4)}`,
      created_at: new Date().toISOString()
    };
    this.enquiries.unshift(newEnquiry);

    prisma.enquiry.create({
      data: {
        id: newEnquiry.id,
        product_id: newEnquiry.product_id,
        product_title: newEnquiry.product_title,
        artisan_id: newEnquiry.artisan_id,
        buyer_name: newEnquiry.buyer_name,
        buyer_contact: newEnquiry.buyer_contact,
        buyer_email: newEnquiry.buyer_email,
        buyer_location: newEnquiry.buyer_location,
        quantity: newEnquiry.quantity,
        message: newEnquiry.message,
        status: newEnquiry.status
      }
    }).catch(e => console.error('Prisma Enquiry create error:', e));

    return newEnquiry;
  }

  updateEnquiryStatus(id: string, status: Enquiry['status']): Enquiry | undefined {
    const item = this.enquiries.find(e => e.id === id);
    if (item) {
      item.status = status;
      prisma.enquiry.update({
        where: { id },
        data: { status }
      }).catch(e => console.error('Prisma Enquiry status update error:', e));
    }
    return item;
  }
}

export const db = new PostgresDB();
