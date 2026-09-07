import { MarketPriceBenchmark, BuyerChannel, Product, Artisan } from '../types';

export const SEED_MARKET_BENCHMARKS: MarketPriceBenchmark[] = [
  // Weaving & Handloom
  {
    id: "mb-01",
    category: "Weaving",
    material: "Mulberry Silk & Zari",
    craft_name: "Pochampally Ikat Silk Saree",
    region: "Telangana (Bhoodan Pochampally)",
    price_low: 5800,
    price_high: 9500,
    average_price: 7400,
    typical_middleman_cut: 62,
    source: "curated",
    recorded_at: "2026-03-01"
  },
  {
    id: "mb-02",
    category: "Weaving",
    material: "Handspun Organic Khadi Cotton",
    craft_name: "Ponduru Fine Khadi Fabric (per meter)",
    region: "Andhra Pradesh (Srikakulam)",
    price_low: 650,
    price_high: 1200,
    average_price: 880,
    typical_middleman_cut: 55,
    source: "curated",
    recorded_at: "2026-03-01"
  },
  {
    id: "mb-03",
    category: "Weaving",
    material: "Tussar Wild Silk & Natural Dyes",
    craft_name: "Gopalpur Tussar Ghicha Stole",
    region: "Odisha (Jajpur)",
    price_low: 1800,
    price_high: 3400,
    average_price: 2500,
    typical_middleman_cut: 58,
    source: "curated",
    recorded_at: "2026-03-01"
  },
  {
    id: "mb-04",
    category: "Weaving",
    material: "Pashmina Wool & Hand Spun Cashmere",
    craft_name: "Kashmiri Handwoven Kani Shawl",
    region: "Jammu & Kashmir (Srinagar)",
    price_low: 14000,
    price_high: 28000,
    average_price: 19500,
    typical_middleman_cut: 70,
    source: "curated",
    recorded_at: "2026-03-01"
  },
  {
    id: "mb-05",
    category: "Weaving",
    material: "Fine Mercerized Cotton & Zari Border",
    craft_name: "Mangalagiri Handloom Cotton Dupatta",
    region: "Andhra Pradesh (Guntur)",
    price_low: 950,
    price_high: 1850,
    average_price: 1350,
    typical_middleman_cut: 52,
    source: "curated",
    recorded_at: "2026-03-01"
  },

  // Pottery & Ceramics
  {
    id: "mb-06",
    category: "Pottery",
    material: "Quartz Stone Powder, Glass & Natural Oxides",
    craft_name: "Jaipur Blue Art Pottery Floral Vase",
    region: "Rajasthan (Jaipur)",
    price_low: 1400,
    price_high: 2900,
    average_price: 2100,
    typical_middleman_cut: 65,
    source: "curated",
    recorded_at: "2026-03-01"
  },
  {
    id: "mb-07",
    category: "Pottery",
    material: "Riverbank Terracotta Clay & Wood Smoke",
    craft_name: "Gorakhpur Terracotta Elephant Figurine",
    region: "Uttar Pradesh (Gorakhpur)",
    price_low: 450,
    price_high: 980,
    average_price: 680,
    typical_middleman_cut: 60,
    source: "curated",
    recorded_at: "2026-03-01"
  },
  {
    id: "mb-08",
    category: "Pottery",
    material: "Black Clay & Mustard Oil Polished",
    craft_name: "Nizamabad Black Pottery Tea Set",
    region: "Uttar Pradesh (Azamgarh)",
    price_low: 1200,
    price_high: 2400,
    average_price: 1750,
    typical_middleman_cut: 64,
    source: "curated",
    recorded_at: "2026-03-01"
  },
  {
    id: "mb-09",
    category: "Pottery",
    material: "Serpentine Glazed Stone & Clay",
    craft_name: "Longpi Black Stone Cooking Pot",
    region: "Manipur (Ukhrul)",
    price_low: 1600,
    price_high: 3100,
    average_price: 2200,
    typical_middleman_cut: 62,
    source: "curated",
    recorded_at: "2026-03-01"
  },

  // Metalcraft & Bell Metal
  {
    id: "mb-10",
    category: "Metalcraft",
    material: "Lost-Wax Cast Bell Metal (Bronze & Brass)",
    craft_name: "Bastar Dhokra Tribal Nandi / Bull Figurine",
    region: "Chhattisgarh (Bastar)",
    price_low: 2200,
    price_high: 4600,
    average_price: 3300,
    typical_middleman_cut: 68,
    source: "curated",
    recorded_at: "2026-03-01"
  },
  {
    id: "mb-11",
    category: "Metalcraft",
    material: "Zinc-Copper Alloy with Pure Silver Inlay",
    craft_name: "Bidriware Silver Inlay Floral Decanter",
    region: "Karnataka (Bidar) / Telangana",
    price_low: 3800,
    price_high: 7800,
    average_price: 5400,
    typical_middleman_cut: 66,
    source: "curated",
    recorded_at: "2026-03-01"
  },
  {
    id: "mb-12",
    category: "Metalcraft",
    material: "Pure Silver 92.5 Wirework",
    craft_name: "Cuttack Tarakasi Silver Filigree Peacock",
    region: "Odisha (Cuttack)",
    price_low: 4500,
    price_high: 9200,
    average_price: 6500,
    typical_middleman_cut: 58,
    source: "curated",
    recorded_at: "2026-03-01"
  },
  {
    id: "mb-13",
    category: "Metalcraft",
    material: "Hand-Beaten Copper & Tin Lining",
    craft_name: "Tambat Hand-Hammered Water Dispenser",
    region: "Maharashtra (Pune)",
    price_low: 2600,
    price_high: 4900,
    average_price: 3600,
    typical_middleman_cut: 54,
    source: "curated",
    recorded_at: "2026-03-01"
  },

  // Woodwork & Toys
  {
    id: "mb-14",
    category: "Woodwork",
    material: "Wrightia Tinctoria (Ivory Wood) & Veg Lacquer",
    craft_name: "Channapatna Wooden Balancing Stacker & Dolls",
    region: "Karnataka (Ramanagara)",
    price_low: 650,
    price_high: 1400,
    average_price: 950,
    typical_middleman_cut: 58,
    source: "curated",
    recorded_at: "2026-03-01"
  },
  {
    id: "mb-15",
    category: "Woodwork",
    material: "Teak Wood & Hand Carving",
    craft_name: "Saharanpur Lattice Jali Wooden Screen Box",
    region: "Uttar Pradesh (Saharanpur)",
    price_low: 1100,
    price_high: 2200,
    average_price: 1550,
    typical_middleman_cut: 62,
    source: "curated",
    recorded_at: "2026-03-01"
  },
  {
    id: "mb-16",
    category: "Woodwork",
    material: "Ponki Wood & Natural Tamarind Seed Paste",
    craft_name: "Kondapalli Dancing Raja-Rani Dolls",
    region: "Andhra Pradesh (Krishna)",
    price_low: 850,
    price_high: 1750,
    average_price: 1250,
    typical_middleman_cut: 60,
    source: "curated",
    recorded_at: "2026-03-01"
  },

  // Embroidery & Textiles
  {
    id: "mb-17",
    category: "Embroidery",
    material: "Mulberry Silk Thread on Khadi Cotton",
    craft_name: "Sujani Kantha Hand-Embroidered Bed Runner",
    region: "Bihar / West Bengal (Birbhum)",
    price_low: 2100,
    price_high: 4400,
    average_price: 3100,
    typical_middleman_cut: 64,
    source: "curated",
    recorded_at: "2026-03-01"
  },
  {
    id: "mb-18",
    category: "Embroidery",
    material: "Untwisted Floss Silk on Handloom Georgette",
    craft_name: "Lucknowi Chikankari Shadow-Work Kurta",
    region: "Uttar Pradesh (Lucknow)",
    price_low: 1900,
    price_high: 4200,
    average_price: 2850,
    typical_middleman_cut: 63,
    source: "curated",
    recorded_at: "2026-03-01"
  },
  {
    id: "mb-19",
    category: "Embroidery",
    material: "Cotton Thread & Mirror Glass Inlay",
    craft_name: "Kutch Rabari Mirrorwork Wall Hanging",
    region: "Gujarat (Kutch / Bhuj)",
    price_low: 1500,
    price_high: 3600,
    average_price: 2400,
    typical_middleman_cut: 65,
    source: "curated",
    recorded_at: "2026-03-01"
  },

  // Folk & Tribal Painting
  {
    id: "mb-20",
    category: "Folk Painting",
    material: "Handmade Cow-Dung Paper & Natural Mineral Pigments",
    craft_name: "Madhubani Kohbar Traditional Painting (18x24)",
    region: "Bihar (Madhubani / Jitwarpur)",
    price_low: 3200,
    price_high: 6800,
    average_price: 4800,
    typical_middleman_cut: 67,
    source: "curated",
    recorded_at: "2026-03-01"
  },
  {
    id: "mb-21",
    category: "Folk Painting",
    material: "Rice Paste on Mud-Plastered Cotton Canvas",
    craft_name: "Warli Tribal Harvest Celebration Canvas",
    region: "Maharashtra (Dahanu / Palghar)",
    price_low: 1800,
    price_high: 3900,
    average_price: 2700,
    typical_middleman_cut: 62,
    source: "curated",
    recorded_at: "2026-03-01"
  },
  {
    id: "mb-22",
    category: "Folk Painting",
    material: "Natural Stone Colors on Treated Cloth",
    craft_name: "Raghurajpur Pattachitra Tree of Life Scroll",
    region: "Odisha (Puri)",
    price_low: 3500,
    price_high: 8000,
    average_price: 5200,
    typical_middleman_cut: 65,
    source: "curated",
    recorded_at: "2026-03-01"
  }
];

export const BUYER_CHANNELS: BuyerChannel[] = [
  {
    id: "ch-01",
    name: "Fabindia & Jaypore Artisan Guild",
    channel_type: "boutique",
    typical_price_tier: "premium",
    category_fit: ["Weaving", "Embroidery", "Pottery", "Folk Painting"],
    description: "Curated lifestyle brands looking for authentic regional heritage crafts with certified GI origin tag.",
    margin_fee_pct: 18,
    settlement_speed: "14 days directly to bank"
  },
  {
    id: "ch-02",
    name: "Etsy Global & Fair Trade Export Network",
    channel_type: "export",
    typical_price_tier: "luxury",
    category_fit: ["Weaving", "Metalcraft", "Folk Painting", "Woodwork", "Embroidery"],
    description: "International conscious consumers in US/EU/UK paying 2.5x-3.5x premium for verified handmade artisan crafts.",
    margin_fee_pct: 12,
    settlement_speed: "Instant upon verified dispatch"
  },
  {
    id: "ch-03",
    name: "Dastkar & Shilparamam Craft Haat (Direct)",
    channel_type: "local_retail",
    typical_price_tier: "mid",
    category_fit: ["Pottery", "Woodwork", "Weaving", "Embroidery", "Metalcraft"],
    description: "High-footfall direct artisan exhibitions where buyers purchase in person with zero middlemen cut.",
    margin_fee_pct: 5,
    settlement_speed: "Immediate cash or UPI direct"
  },
  {
    id: "ch-04",
    name: "TRIFED & GeM Govt Bulk Procurement",
    channel_type: "institutional",
    typical_price_tier: "mid",
    category_fit: ["Metalcraft", "Woodwork", "Weaving", "Folk Painting"],
    description: "Government and corporate institutional orders for bulk corporate gifting (50-500 units) with guaranteed advance payment.",
    margin_fee_pct: 8,
    settlement_speed: "30 days net with 30% advance"
  },
  {
    id: "ch-05",
    name: "Artisan Direct WhatsApp & Social Showcase",
    channel_type: "direct_social",
    typical_price_tier: "budget",
    category_fit: ["Pottery", "Weaving", "Embroidery", "Woodwork", "Metalcraft", "Folk Painting"],
    description: "Zero-commission direct catalog sharing with local connoisseurs, returning patrons, and community groups.",
    margin_fee_pct: 0,
    settlement_speed: "Instant UPI straight to artisan"
  }
];

export const SAMPLE_ARTISANS: Artisan[] = [
  {
    id: "art-01",
    user_id: "usr-01",
    name: "Rameshwar Rao",
    category: "Weaving",
    state: "Telangana",
    district: "Yadadri Bhoodan Pochampally",
    bio: "4th generation master weaver practicing double-ikat geometric tie-dye on pure mulberry silk pit looms.",
    experience_years: 28,
    profile_image_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
    phone: "+91 98480 12345"
  },
  {
    id: "art-02",
    user_id: "usr-02",
    name: "Gita Devi",
    category: "Folk Painting",
    state: "Bihar",
    district: "Madhubani",
    bio: "National awardee folk artist specializing in Kachni and Bharni styles using handmade bamboo nibs and natural stone dyes.",
    experience_years: 22,
    profile_image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    phone: "+91 94310 98765"
  },
  {
    id: "art-03",
    user_id: "usr-03",
    name: "Kripal Singh Kumhar",
    category: "Pottery",
    state: "Rajasthan",
    district: "Jaipur",
    bio: "Heritage Blue Pottery craftsman molding non-clay quartz minerals with Egyptian paste and cobalt turquoise glazes.",
    experience_years: 19,
    profile_image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    phone: "+91 94140 33445"
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-01",
    artisan_id: "art-01",
    artisan_name: "Rameshwar Rao",
    artisan_category: "Weaving",
    artisan_district: "Pochampally",
    artisan_state: "Telangana",
    artisan_phone: "+91 98480 12345",
    title: "Mastercrafted Pochampally Double-Ikat Silk Saree",
    description: "Intricately handwoven double-ikat silk saree featuring ancestral geometric motifs dyed with pomegranate peel and natural indigo. Woven continuously over 18 days on traditional pit looms in the UNESCO heritage village of Pochampally.",
    category: "Weaving",
    subcategory: "Handloom Silk Saree",
    tags: ["Pochampally Ikat", "GI Tagged", "Pure Mulberry Silk", "Double Ikat", "Natural Dyes"],
    material: "100% Pure Mulberry Silk & Fine Zari Border",
    est_dimensions: "6.2 meters (with running blouse piece) x 46 inches",
    weight: "620 grams",
    base_language: "en",
    original_image_url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    enhanced_image_url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=90",
    enhancement_applied: true,
    status: "published",
    cost: {
      material_cost: 3200,
      labor_hours: 45,
      hourly_rate: 90,
      other_cost: 250
    },
    pricing: {
      suggested_min: 7500,
      suggested_max: 9800,
      target_recommended: 8400,
      rationale: "Curated Pochampally double-ikat comparable benchmarks trade at ₹7,400-₹9,500 in boutique urban retail. Material (₹3,200) + 45 hours labor at ₹90/hr establishes fair direct floor of ₹7,500, guaranteeing artisan retains 54% profit vs middleman ₹3,400 offer.",
      comparable_average: 7400,
      typical_middleman_price: 3400,
      artisan_profit_gain: 5000,
      margin_percentage: 56
    },
    final_price: 8400,
    translations: {
      en: {
        title: "Mastercrafted Pochampally Double-Ikat Silk Saree",
        description: "Intricately handwoven double-ikat silk saree featuring ancestral geometric motifs dyed with natural pigments. Woven on traditional pit looms in Telangana.",
        tags: ["Pochampally Ikat", "GI Tagged", "Pure Mulberry Silk", "Double Ikat"],
        translated_at: "2026-03-01",
        source: "ai"
      },
      hi: {
        title: "पारंपरिक पोचमपल्ली डबल-इकात शुद्ध रेशम साड़ी",
        description: "तेलंगाना के पोचमपल्ली की ऐतिहासिक हथकरघा परंपरा में बुनी गई डबल-इकात सिल्क साड़ी। प्राकृतिक रंगों और पारंपरिक ज्यामितीय डिजाइनों से सजी यह साड़ी कारीगर की 18 दिनों की अनवरत मेहनत का प्रतीक है।",
        tags: ["पोचमपल्ली इकात", "जीआई टैग", "शुद्ध रेशम", "हथकरघा"],
        translated_at: "2026-03-01",
        source: "ai"
      },
      te: {
        title: "హస్తకళా ప్రావీణ్యం కలిగిన పోచంపల్లి డబుల్ ఇకత్ పట్టు చీర",
        description: "తెలంగాణలోని ప్రఖ్యాత పోచంపల్లి చేనేత మగ్గాలపై 18 రోజుల పాటు శ్రమించి నేసిన స్వచ్ఛమైన పట్టు చీర. సహజ రంగులు, సాంప్రదాయ జ్యామితీయ నమూనాలతో తీర్చిదిద్దబడిన వారసత్వ సంపద.",
        tags: ["పోచంపల్లి ఇకత్", "స్వచ్ఛమైన పట్టు", "చేనేత చీర", "డబుల్ ఇకత్"],
        translated_at: "2026-03-01",
        source: "ai"
      }
    },
    market_linkage: [
      {
        channel_id: "ch-01",
        channel_name: "Fabindia & Jaypore Artisan Guild",
        channel_type: "boutique",
        match_score: 95,
        reason: "GI-tagged Pochampally double-ikat meets premium handloom aesthetic criteria with high luxury buyer willingness.",
        target_audience: "Urban handloom connoisseurs and wedding shoppers",
        recommended_price_tier: "₹8,000 - ₹9,500",
        action_cta: "Submit to Curated Boutique Portal",
        platform_tag: "GI Handloom Certified"
      },
      {
        channel_id: "ch-02",
        channel_name: "Etsy Global & Fair Trade Export Network",
        channel_type: "export",
        match_score: 88,
        reason: "High export demand for sustainable slow-fashion wearable art in US/European markets.",
        target_audience: "Conscious diaspora & international ethical fashion buyers",
        recommended_price_tier: "$110 - $140 USD",
        action_cta: "Export Listing Ready",
        platform_tag: "Global Slow Fashion"
      }
    ],
    views_count: 342,
    enquiry_count: 8,
    created_at: "2026-03-01T10:00:00Z",
    published_at: "2026-03-01T12:00:00Z"
  },
  {
    id: "prod-02",
    artisan_id: "art-03",
    artisan_name: "Kripal Singh Kumhar",
    artisan_category: "Pottery",
    artisan_district: "Jaipur",
    artisan_state: "Rajasthan",
    artisan_phone: "+91 94140 33445",
    title: "Jaipur Handcrafted Blue Art Pottery Floral Amphora Vase",
    description: "Non-clay heritage ceramic vase crafted from crushed quartz stone powder, raw glass, multani mitti, and natural gum. Hand-painted with traditional Persian cobalt blue and turquoise floral arabesque patterns, fired once at low heat.",
    category: "Pottery",
    subcategory: "Blue Ceramic Pottery",
    tags: ["Jaipur Blue Pottery", "Cobalt Glaze", "Quartz Stone", "Hand-Painted Vase", "GI Craft"],
    material: "Quartz Stone Powder, Glass, Natural Oxide Pigments",
    est_dimensions: "12 inches Height x 6 inches Diameter",
    weight: "1.4 kg",
    base_language: "en",
    original_image_url: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
    enhanced_image_url: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=90",
    enhancement_applied: true,
    status: "published",
    cost: {
      material_cost: 650,
      labor_hours: 14,
      hourly_rate: 80,
      other_cost: 150
    },
    pricing: {
      suggested_min: 1950,
      suggested_max: 2800,
      target_recommended: 2350,
      rationale: "Curated benchmark for Jaipur Blue Pottery vases of this scale averages ₹2,100. Cost of raw materials (₹650) plus 14 crafting hours guarantees healthy artisan earnings of ₹1,430 above raw costs vs middlemen offering only ₹750.",
      comparable_average: 2100,
      typical_middleman_price: 750,
      artisan_profit_gain: 1600,
      margin_percentage: 61
    },
    final_price: 2350,
    translations: {
      en: {
        title: "Jaipur Handcrafted Blue Art Pottery Floral Amphora Vase",
        description: "Non-clay heritage ceramic vase crafted from crushed quartz powder and natural gum. Hand-painted with cobalt floral motifs.",
        tags: ["Jaipur Blue Pottery", "Handmade Vase", "Cobalt Glaze"],
        translated_at: "2026-03-02",
        source: "ai"
      },
      hi: {
        title: "जयपुर हस्तनिर्मित ब्लू आर्ट पॉटरी फ्लोरल फूलदान",
        description: "क्वार्ट्ज पत्थर पाउडर और प्राकृतिक रंगों से बना पारंपरिक ब्लू पॉटरी फूलदान। इसमें मिट्टी का प्रयोग नहीं होता। हाथ से कोबाल्ट नीले रंगों से बनाई गई मनमोहक चित्रकारी इसे अनूठी बनाती है।",
        tags: ["जयपुर ब्लू पॉटरी", "हस्तशिल्प फूलदान", "पारंपरिक शिल्प"],
        translated_at: "2026-03-02",
        source: "ai"
      },
      te: {
        title: "జైపూర్ సాంప్రదాయ బ్లూ ఆర్ట్ పాట్ పూలకుండీ (వాజ్)",
        description: "స్ఫటిక పొడి, సహజ రంగులతో మట్టి లేకుండా తయారు చేయబడిన ప్రసిద్ధ జైపూర్ బ్లూ పాట్. కోబాల్ట్ నీలి రంగు పూల డిజైన్లు కళాకారుడి చేతితో సున్నితంగా చిత్రించబడ్డాయి.",
        tags: ["జైపూర్ బ్లూ పాట్", "చేతితో చేసిన కుండీ", "సాంప్రదాయ కళ"],
        translated_at: "2026-03-02",
        source: "ai"
      }
    },
    market_linkage: [
      {
        channel_id: "ch-01",
        channel_name: "Fabindia & Jaypore Artisan Guild",
        channel_type: "boutique",
        match_score: 92,
        reason: "Decorative home accents have rapid turnaround in contemporary lifestyle retail stores.",
        target_audience: "Interior designers & home decor enthusiasts",
        recommended_price_tier: "₹2,200 - ₹2,600",
        action_cta: "Submit to Home Decor Catalog",
        platform_tag: "Contemporary Heritage"
      },
      {
        channel_id: "ch-03",
        channel_name: "Dastkar & Shilparamam Craft Haat",
        channel_type: "local_retail",
        match_score: 90,
        reason: "High impulse buy product during craft exhibitions with instant cash collection.",
        target_audience: "Tourists, exhibition visitors, gift buyers",
        recommended_price_tier: "₹2,000 - ₹2,400",
        action_cta: "Display at Craft Stall",
        platform_tag: "Direct Cash Haat"
      }
    ],
    views_count: 219,
    enquiry_count: 5,
    created_at: "2026-03-02T11:30:00Z",
    published_at: "2026-03-02T14:00:00Z"
  },
  {
    id: "prod-03",
    artisan_id: "art-02",
    artisan_name: "Gita Devi",
    artisan_category: "Folk Painting",
    artisan_district: "Madhubani",
    artisan_state: "Bihar",
    artisan_phone: "+91 94310 98765",
    title: "Madhubani Kohbar Tree of Life Hand-Painted Folk Canvas",
    description: "Authentic Mithila folk painting executed using nib pens, bamboo twigs, and pigments ground from soot, turmeric, and aparajita flowers on handmade paper. Symbolizes auspicious union, nature harmony, and prosperity.",
    category: "Folk Painting",
    subcategory: "Mithila / Madhubani Art",
    tags: ["Madhubani Painting", "Mithila Art", "Tree of Life", "Natural Pigments", "Handmade Paper"],
    material: "Handmade Cowdung-Treated Paper & Natural Mineral Pigments",
    est_dimensions: "24 inches x 18 inches (Unframed)",
    weight: "250 grams",
    base_language: "en",
    original_image_url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
    enhanced_image_url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=90",
    enhancement_applied: true,
    status: "published",
    cost: {
      material_cost: 450,
      labor_hours: 32,
      hourly_rate: 85,
      other_cost: 120
    },
    pricing: {
      suggested_min: 3600,
      suggested_max: 5400,
      target_recommended: 4500,
      rationale: "Curated benchmark for 24x18 authentic Madhubani hand-inked works is ₹4,800. 32 hours of painstaking fine-line hatching (Kachni) with natural dyes commands ₹4,500 direct market value vs exploitative middlemen paying merely ₹1,200.",
      comparable_average: 4800,
      typical_middleman_price: 1200,
      artisan_profit_gain: 3300,
      margin_percentage: 73
    },
    final_price: 4500,
    translations: {
      en: {
        title: "Madhubani Kohbar Tree of Life Hand-Painted Folk Canvas",
        description: "Authentic Mithila folk painting executed with nibs and natural stone dyes on handmade paper. Depicts the sacred Tree of Life.",
        tags: ["Madhubani Painting", "Mithila Folk Art", "Tree of Life"],
        translated_at: "2026-03-03",
        source: "ai"
      },
      hi: {
        title: "मधुबनी कोहबर 'जीवन का वृक्ष' हस्तनिर्मित पारंपरिक पेंटिंग",
        description: "बिहार के मिथिलांचल की प्रसिद्ध हस्तनिर्मित मधुबनी चित्रकारी। बांस की तीलियों और प्राकृतिक रंगों (हल्दी, नील, काजल) से हस्तनिर्मित कागज पर उकेरी गई पावन कलाकृति।",
        tags: ["मधुबनी पेंटिंग", "मिथिला लोककला", "जीवन का वृक्ष", "प्राकृतिक रंग"],
        translated_at: "2026-03-03",
        source: "ai"
      },
      te: {
        title: "మధుబని 'ట్రీ ఆఫ్ లైఫ్' చేతితో గీసిన సాంప్రదాయ జానపద చిత్రలేఖనం",
        description: "వెదురు పుల్లలు, పసుపు, సహజ మూలికా రంగులతో చేతితో తయారు చేసిన కాగితంపై గీసిన ప్రసిద్ధ మధుబని జానపద కళారూపం. సమృద్ధికి, పవిత్రతకు ప్రతీక.",
        tags: ["మధుబని చిత్రకళ", "జానపద పెయింటింగ్", "సహజ రంగులు"],
        translated_at: "2026-03-03",
        source: "ai"
      }
    },
    market_linkage: [
      {
        channel_id: "ch-02",
        channel_name: "Etsy Global & Fair Trade Export Network",
        channel_type: "export",
        match_score: 96,
        reason: "Original tribal and folk fine art has highest appreciation among global art collectors and diaspora.",
        target_audience: "Global folk art collectors & cultural curators",
        recommended_price_tier: "$60 - $85 USD",
        action_cta: "Publish to International Art Gallery",
        platform_tag: "Verified Original Artwork"
      },
      {
        channel_id: "ch-04",
        channel_name: "TRIFED & GeM Govt Bulk Procurement",
        channel_type: "institutional",
        match_score: 89,
        reason: "Govt departments and public institutions frequently purchase framed tribal artwork for official felicitations.",
        target_audience: "Public sector enterprises & corporate gifting desks",
        recommended_price_tier: "₹4,200 - ₹5,000",
        action_cta: "Register with Institutional Vendor Desk",
        platform_tag: "Tribal Heritage Registered"
      }
    ],
    views_count: 412,
    enquiry_count: 11,
    created_at: "2026-03-03T09:00:00Z",
    published_at: "2026-03-03T11:00:00Z"
  }
];

export const DEMO_PRESET_CRAFTS = [
  {
    name: "Bastar Dhokra Lost-Wax Bell Metal Bull",
    category: "Metalcraft",
    material: "Lost-Wax Cast Bell Metal (Bronze & Brass)",
    region: "Chhattisgarh (Bastar)",
    image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    cost: { material_cost: 950, labor_hours: 24, hourly_rate: 80, other_cost: 200 },
    hint: "Ancient 4,000-year-old Harappan lost-wax casting technique"
  },
  {
    name: "Channapatna Non-Toxic Lacquered Wooden Stacker",
    category: "Woodwork",
    material: "Ivory Wood (Wrightia Tinctoria) & Natural Lacquer",
    region: "Karnataka (Ramanagara)",
    image_url: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80",
    cost: { material_cost: 220, labor_hours: 6, hourly_rate: 75, other_cost: 50 },
    hint: "Eco-friendly vegetable dyed wooden toy safe for children"
  },
  {
    name: "Bidriware Pure Silver Inlay Black Metal Goblet",
    category: "Metalcraft",
    material: "Zinc-Copper Alloy with Pure Silver 99.9% Inlay",
    region: "Karnataka (Bidar) / Telangana",
    image_url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    cost: { material_cost: 1600, labor_hours: 28, hourly_rate: 90, other_cost: 300 },
    hint: "Blackened with special fort soil and inlaid with genuine silver wire"
  }
];
