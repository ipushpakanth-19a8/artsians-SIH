import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Starting KALAtech JSON -> PostgreSQL Migration with Prisma...');

  const dataFilePath = path.join(process.cwd(), 'data_store.json');
  let data: any = {};

  if (fs.existsSync(dataFilePath)) {
    console.log(`📂 Reading existing data store from: ${dataFilePath}`);
    try {
      const raw = fs.readFileSync(dataFilePath, 'utf-8');
      data = JSON.parse(raw);
    } catch (e) {
      console.error('❌ Error parsing data_store.json:', e);
      throw e;
    }
  } else {
    console.warn('⚠️ data_store.json not found! Loading fallback seed data...');
  }

  const users = data.users || [];
  const artisans = data.artisans || [];
  const products = data.products || [];
  const benchmarks = data.benchmarks || [];
  const channels = data.channels || [];
  const enquiries = data.enquiries || [];
  const orders = data.orders || [];
  const bills = data.bills || [];
  const auditTrail = data.auditTrail || [];

  console.log(`📊 Identified records in JSON data store:
  - Users: ${users.length}
  - Artisans: ${artisans.length}
  - Products: ${products.length}
  - Benchmarks: ${benchmarks.length}
  - Channels: ${channels.length}
  - Enquiries: ${enquiries.length}
  - Orders: ${orders.length}
  - Bills: ${bills.length}
  - AI Audit Logs: ${auditTrail.length}`);

  // 1. Migrate Artisans first (due to FK relations)
  console.log('🌱 Migrating Artisans...');
  for (const art of artisans) {
    await prisma.artisan.upsert({
      where: { id: art.id },
      update: {
        name: art.name,
        category: art.category,
        state: art.state,
        district: art.district,
        bio: art.bio || 'Master craftsperson',
        experience_years: Number(art.experience_years) || 10,
        profile_image_url: art.profile_image_url || '',
        phone: art.phone || ''
      },
      create: {
        id: art.id,
        user_id: art.user_id,
        name: art.name,
        category: art.category,
        state: art.state,
        district: art.district,
        bio: art.bio || 'Master craftsperson',
        experience_years: Number(art.experience_years) || 10,
        profile_image_url: art.profile_image_url || '',
        phone: art.phone || ''
      }
    });
  }
  console.log(`✅ Artisans migrated: ${artisans.length}`);

  // 2. Migrate Users
  console.log('🌱 Migrating Users...');
  for (const u of users) {
    // Check if artisan_id exists
    let artisanConnect = undefined;
    if (u.artisan_id && artisans.some((a: any) => a.id === u.artisan_id)) {
      artisanConnect = u.artisan_id;
    }

    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        phone: u.phone,
        passwordHash: u.passwordHash,
        role: u.role,
        status: u.status || 'active',
        craft_type: u.craft_type,
        business_name: u.business_name,
        location: u.location,
        state: u.state,
        address: u.address,
        artisan_id: artisanConnect,
        last_login: u.last_login ? new Date(u.last_login) : null,
      },
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        passwordHash: u.passwordHash,
        role: u.role,
        status: u.status || 'active',
        craft_type: u.craft_type,
        business_name: u.business_name,
        location: u.location,
        state: u.state,
        address: u.address,
        artisan_id: artisanConnect,
        last_login: u.last_login ? new Date(u.last_login) : null,
        created_at: u.created_at ? new Date(u.created_at) : new Date(),
      }
    });
  }
  console.log(`✅ Users migrated: ${users.length}`);

  // 3. Migrate Products
  console.log('🌱 Migrating Products...');
  for (const p of products) {
    // Ensure artisan exists
    const artisanExists = await prisma.artisan.findUnique({ where: { id: p.artisan_id } });
    if (!artisanExists) {
      await prisma.artisan.create({
        data: {
          id: p.artisan_id,
          name: p.artisan_name || 'Artisan Craftsperson',
          category: p.artisan_category || p.category || 'Weaving',
          state: p.artisan_state || 'Telangana',
          district: p.artisan_district || 'Bhoodan Pochampally',
          bio: 'Generational folk artisan',
          experience_years: 15,
          profile_image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
          phone: p.artisan_phone || '+91 98480 12345'
        }
      });
    }

    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        artisan_id: p.artisan_id,
        artisan_name: p.artisan_name || 'Artisan Craftsperson',
        artisan_category: p.artisan_category || p.category || 'Weaving',
        artisan_district: p.artisan_district || 'Bhoodan Pochampally',
        artisan_state: p.artisan_state || 'Telangana',
        artisan_phone: p.artisan_phone,
        title: p.title,
        description: p.description,
        short_description: p.short_description,
        b2b_description: p.b2b_description,
        social_caption: p.social_caption,
        category: p.category,
        subcategory: p.subcategory,
        craft_technique: p.craft_technique,
        motifs: p.motifs || [],
        colors: p.colors || [],
        tags: p.tags || [],
        material: p.material || 'Artisanal Natural Materials',
        est_dimensions: p.est_dimensions || 'Standard',
        weight: p.weight,
        base_language: p.base_language || 'en',
        original_image_url: p.original_image_url || '',
        enhanced_image_url: p.enhanced_image_url || p.original_image_url || '',
        image_variants: p.image_variants || {},
        enhancement_applied: !!p.enhancement_applied,
        status: p.status || 'published',
        validation_status: p.validation_status,
        gi_status: p.gi_status,
        gi_certificate_number: p.gi_certificate_number,
        cost: p.cost || { material_cost: 500, labor_hours: 8, hourly_rate: 80, other_cost: 50 },
        pricing: p.pricing || null,
        final_price: Number(p.final_price) || 1500,
        b2b_price: p.b2b_price ? Number(p.b2b_price) : null,
        minimum_order_quantity: p.minimum_order_quantity || 1,
        production_capacity_monthly: p.production_capacity_monthly || 20,
        lead_time_days: p.lead_time_days || 7,
        customization_available: !!p.customization_available,
        sample_available: !!p.sample_available,
        seen_at_exhibition: p.seen_at_exhibition || null,
        translations: p.translations || {},
        market_linkage: p.market_linkage || [],
        views_count: p.views_count || 1,
        enquiry_count: p.enquiry_count || 0,
        quantity: p.quantity || 1,
        location: p.location,
        craft_origin: p.craft_origin
      },
      create: {
        id: p.id,
        artisan_id: p.artisan_id,
        artisan_name: p.artisan_name || 'Artisan Craftsperson',
        artisan_category: p.artisan_category || p.category || 'Weaving',
        artisan_district: p.artisan_district || 'Bhoodan Pochampally',
        artisan_state: p.artisan_state || 'Telangana',
        artisan_phone: p.artisan_phone,
        title: p.title,
        description: p.description,
        short_description: p.short_description,
        b2b_description: p.b2b_description,
        social_caption: p.social_caption,
        category: p.category,
        subcategory: p.subcategory,
        craft_technique: p.craft_technique,
        motifs: p.motifs || [],
        colors: p.colors || [],
        tags: p.tags || [],
        material: p.material || 'Artisanal Natural Materials',
        est_dimensions: p.est_dimensions || 'Standard',
        weight: p.weight,
        base_language: p.base_language || 'en',
        original_image_url: p.original_image_url || '',
        enhanced_image_url: p.enhanced_image_url || p.original_image_url || '',
        image_variants: p.image_variants || {},
        enhancement_applied: !!p.enhancement_applied,
        status: p.status || 'published',
        validation_status: p.validation_status,
        gi_status: p.gi_status,
        gi_certificate_number: p.gi_certificate_number,
        cost: p.cost || { material_cost: 500, labor_hours: 8, hourly_rate: 80, other_cost: 50 },
        pricing: p.pricing || null,
        final_price: Number(p.final_price) || 1500,
        b2b_price: p.b2b_price ? Number(p.b2b_price) : null,
        minimum_order_quantity: p.minimum_order_quantity || 1,
        production_capacity_monthly: p.production_capacity_monthly || 20,
        lead_time_days: p.lead_time_days || 7,
        customization_available: !!p.customization_available,
        sample_available: !!p.sample_available,
        seen_at_exhibition: p.seen_at_exhibition || null,
        translations: p.translations || {},
        market_linkage: p.market_linkage || [],
        views_count: p.views_count || 1,
        enquiry_count: p.enquiry_count || 0,
        quantity: p.quantity || 1,
        location: p.location,
        craft_origin: p.craft_origin,
        created_at: p.created_at ? new Date(p.created_at) : new Date()
      }
    });

    // Create ProductImage variants
    if (p.original_image_url) {
      await prisma.productImage.create({
        data: {
          product_id: p.id,
          url: p.original_image_url,
          variant_type: 'original'
        }
      });
    }
    if (p.enhanced_image_url && p.enhanced_image_url !== p.original_image_url) {
      await prisma.productImage.create({
        data: {
          product_id: p.id,
          url: p.enhanced_image_url,
          variant_type: 'enhanced'
        }
      });
    }
  }
  console.log(`✅ Products migrated: ${products.length}`);

  // 4. Migrate MarketPriceBenchmarks
  console.log('🌱 Migrating Market Price Benchmarks...');
  for (const bm of benchmarks) {
    await prisma.marketPriceBenchmark.upsert({
      where: { id: bm.id },
      update: {
        category: bm.category,
        material: bm.material,
        craft_name: bm.craft_name,
        craft_type: bm.craft_type || bm.category,
        region: bm.region,
        price_low: Number(bm.price_low),
        price_high: Number(bm.price_high),
        average_price: Number(bm.average_price),
        target_recommended: bm.target_recommended ? Number(bm.target_recommended) : Number(bm.average_price),
        typical_middleman_cut: Number(bm.typical_middleman_cut) || 60,
        source: bm.source || 'Admin Intelligence',
      },
      create: {
        id: bm.id,
        category: bm.category,
        material: bm.material,
        craft_name: bm.craft_name,
        craft_type: bm.craft_type || bm.category,
        region: bm.region,
        price_low: Number(bm.price_low),
        price_high: Number(bm.price_high),
        average_price: Number(bm.average_price),
        target_recommended: bm.target_recommended ? Number(bm.target_recommended) : Number(bm.average_price),
        typical_middleman_cut: Number(bm.typical_middleman_cut) || 60,
        source: bm.source || 'Admin Intelligence',
        last_updated: bm.last_updated ? new Date(bm.last_updated) : new Date()
      }
    });
  }
  console.log(`✅ Benchmarks migrated: ${benchmarks.length}`);

  // 5. Migrate Buyer Channels
  console.log('🌱 Migrating Buyer Channels...');
  for (const ch of channels) {
    await prisma.buyerChannel.upsert({
      where: { id: ch.id },
      update: {
        name: ch.name,
        channel_type: ch.channel_type,
        typical_price_tier: ch.typical_price_tier,
        category_fit: ch.category_fit || [],
        description: ch.description,
        margin_fee_pct: Number(ch.margin_fee_pct) || 0,
        settlement_speed: ch.settlement_speed || 'Immediate'
      },
      create: {
        id: ch.id,
        name: ch.name,
        channel_type: ch.channel_type,
        typical_price_tier: ch.typical_price_tier,
        category_fit: ch.category_fit || [],
        description: ch.description,
        margin_fee_pct: Number(ch.margin_fee_pct) || 0,
        settlement_speed: ch.settlement_speed || 'Immediate'
      }
    });
  }
  console.log(`✅ Buyer Channels migrated: ${channels.length}`);

  // 6. Migrate Orders
  console.log('🌱 Migrating Orders...');
  for (const ord of orders) {
    const product = await prisma.product.findUnique({ where: { id: ord.product_id } });
    if (!product) continue;

    await prisma.order.upsert({
      where: { id: ord.id },
      update: {
        product_id: ord.product_id,
        product_title: ord.product_title,
        artisan_id: ord.artisan_id,
        artisan_name: ord.artisan_name,
        buyer_name: ord.buyer_name,
        buyer_contact: ord.buyer_contact,
        buyer_email: ord.buyer_email,
        buyer_address: ord.buyer_address,
        quantity: ord.quantity || 1,
        unit_price: Number(ord.unit_price) || 0,
        total_amount: Number(ord.total_amount) || 0,
        status: ord.status || 'paid',
        payment_id: ord.payment_id,
        payment_method: ord.payment_method || 'upi_direct',
        fair_trade_verified: ord.fair_trade_verified !== false,
      },
      create: {
        id: ord.id,
        product_id: ord.product_id,
        product_title: ord.product_title,
        artisan_id: ord.artisan_id,
        artisan_name: ord.artisan_name,
        buyer_name: ord.buyer_name,
        buyer_contact: ord.buyer_contact,
        buyer_email: ord.buyer_email,
        buyer_address: ord.buyer_address,
        quantity: ord.quantity || 1,
        unit_price: Number(ord.unit_price) || 0,
        total_amount: Number(ord.total_amount) || 0,
        status: ord.status || 'paid',
        payment_id: ord.payment_id,
        payment_method: ord.payment_method || 'upi_direct',
        fair_trade_verified: ord.fair_trade_verified !== false,
        created_at: ord.created_at ? new Date(ord.created_at) : new Date(),
      }
    });
  }
  console.log(`✅ Orders migrated: ${orders.length}`);

  // 7. Migrate Bills
  console.log('🌱 Migrating Bills...');
  for (const b of bills) {
    const prod = await prisma.product.findUnique({ where: { id: b.productId } });
    const art = await prisma.artisan.findUnique({ where: { id: b.sellerId } });
    if (!prod || !art) continue;

    await prisma.bill.upsert({
      where: { id: b.id },
      update: {
        billNumber: b.billNumber,
        sellerId: b.sellerId,
        sellerName: b.sellerName,
        sellerPhone: b.sellerPhone,
        sellerLocation: b.sellerLocation,
        productId: b.productId,
        productName: b.productName,
        productCategory: b.productCategory,
        quantity: b.quantity || 1,
        materialCost: Number(b.materialCost) || 0,
        labourCost: Number(b.labourCost) || 0,
        transportationCost: Number(b.transportationCost) || 0,
        otherCost: Number(b.otherCost) || 0,
        totalCost: Number(b.totalCost) || 0,
        proposedPrice: Number(b.proposedPrice) || 0,
        marketMinPrice: Number(b.marketMinPrice) || 0,
        marketAveragePrice: Number(b.marketAveragePrice) || 0,
        marketMaxPrice: Number(b.marketMaxPrice) || 0,
        recommendedPrice: Number(b.recommendedPrice) || 0,
        finalPrice: Number(b.finalPrice) || 0,
        profit: Number(b.profit) || 0,
        profitPercentage: Number(b.profitPercentage) || 0,
        status: b.status || 'finalized',
        finalizedAt: b.finalizedAt ? new Date(b.finalizedAt) : null,
      },
      create: {
        id: b.id,
        billNumber: b.billNumber,
        sellerId: b.sellerId,
        sellerName: b.sellerName,
        sellerPhone: b.sellerPhone,
        sellerLocation: b.sellerLocation,
        productId: b.productId,
        productName: b.productName,
        productCategory: b.productCategory,
        quantity: b.quantity || 1,
        materialCost: Number(b.materialCost) || 0,
        labourCost: Number(b.labourCost) || 0,
        transportationCost: Number(b.transportationCost) || 0,
        otherCost: Number(b.otherCost) || 0,
        totalCost: Number(b.totalCost) || 0,
        proposedPrice: Number(b.proposedPrice) || 0,
        marketMinPrice: Number(b.marketMinPrice) || 0,
        marketAveragePrice: Number(b.marketAveragePrice) || 0,
        marketMaxPrice: Number(b.marketMaxPrice) || 0,
        recommendedPrice: Number(b.recommendedPrice) || 0,
        finalPrice: Number(b.finalPrice) || 0,
        profit: Number(b.profit) || 0,
        profitPercentage: Number(b.profitPercentage) || 0,
        status: b.status || 'finalized',
        createdAt: b.createdAt ? new Date(b.createdAt) : new Date(),
        finalizedAt: b.finalizedAt ? new Date(b.finalizedAt) : null,
      }
    });
  }
  console.log(`✅ Bills migrated: ${bills.length}`);

  // 8. Migrate Enquiries
  console.log('🌱 Migrating Enquiries...');
  for (const enq of enquiries) {
    const prod = await prisma.product.findUnique({ where: { id: enq.product_id } });
    const art = await prisma.artisan.findUnique({ where: { id: enq.artisan_id } });
    if (!prod || !art) continue;

    await prisma.enquiry.upsert({
      where: { id: enq.id },
      update: {
        product_id: enq.product_id,
        product_title: enq.product_title,
        artisan_id: enq.artisan_id,
        buyer_name: enq.buyer_name,
        buyer_contact: enq.buyer_contact,
        buyer_email: enq.buyer_email,
        buyer_location: enq.buyer_location,
        quantity: enq.quantity || 1,
        message: enq.message || '',
        status: enq.status || 'new',
      },
      create: {
        id: enq.id,
        product_id: enq.product_id,
        product_title: enq.product_title,
        artisan_id: enq.artisan_id,
        buyer_name: enq.buyer_name,
        buyer_contact: enq.buyer_contact,
        buyer_email: enq.buyer_email,
        buyer_location: enq.buyer_location,
        quantity: enq.quantity || 1,
        message: enq.message || '',
        status: enq.status || 'new',
        created_at: enq.created_at ? new Date(enq.created_at) : new Date(),
      }
    });
  }
  console.log(`✅ Enquiries migrated: ${enquiries.length}`);

  // 9. Migrate AI Processing Results / Audit Trail
  console.log('🌱 Migrating AI Audit Trail...');
  for (const aud of auditTrail) {
    await prisma.aIProcessingResult.upsert({
      where: { id: aud.id },
      update: {
        product_id: aud.product_id,
        feature: aud.feature,
        model_used: aud.model_used,
        latency_ms: aud.latency_ms || 300,
        status: aud.status || 'success',
        raw_input_summary: aud.raw_input_summary || '',
        raw_response_summary: aud.raw_response_summary || '',
      },
      create: {
        id: aud.id,
        product_id: aud.product_id,
        feature: aud.feature,
        model_used: aud.model_used,
        latency_ms: aud.latency_ms || 300,
        status: aud.status || 'success',
        raw_input_summary: aud.raw_input_summary || '',
        raw_response_summary: aud.raw_response_summary || '',
        created_at: aud.created_at ? new Date(aud.created_at) : new Date(),
      }
    });
  }
  console.log(`✅ AI Audit Trail records migrated: ${auditTrail.length}`);

  console.log('\n🎉 ALL JSON RECORDS HAVE BEEN SUCCESSFULLY MIGRATED TO POSTGRESQL VIA PRISMA!');
}

main()
  .catch((e) => {
    console.error('❌ Migration Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
