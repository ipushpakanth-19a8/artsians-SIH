import { LanguageCode } from '../types';

export interface StateLanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  primaryLanguage: LanguageCode;
  recommendedLanguages: LanguageCode[];
  districts: string[];
  regionalCrafts: string[];
}

/**
 * Centralized State to Language and Craft mapping for all Indian States & Union Territories.
 * Follows multi-language recommendations (location never forces language).
 */
export const STATE_LANGUAGE_MAP: Record<string, StateLanguageConfig> = {
  'Andhra Pradesh': {
    code: 'AP',
    name: 'Andhra Pradesh',
    nativeName: 'ఆంధ్రప్రదేశ్',
    primaryLanguage: 'te',
    recommendedLanguages: ['te', 'en', 'hi'],
    districts: [
      'Vizianagaram',
      'Prakasam',
      'Srikakulam',
      'Visakhapatnam',
      'East Godavari',
      'West Godavari',
      'Krishna',
      'Guntur',
      'Nellore',
      'Chittoor',
      'YSR Kadapa',
      'Anantapur',
      'Kurnool'
    ],
    regionalCrafts: [
      'Handloom Weaving',
      'Kalamkari Art & Textiles',
      'Kondapalli Wooden Toys',
      'Etikoppaka Lacquer Toys',
      'Dharmavaram Silk Sarees',
      'Uppada Jamdani Sarees',
      'Mangalagiri Cotton Fabrics',
      'Machilipatnam Block Prints'
    ]
  },
  'Telangana': {
    code: 'TS',
    name: 'Telangana',
    nativeName: 'తెలంగాణ',
    primaryLanguage: 'te',
    recommendedLanguages: ['te', 'en', 'hi'],
    districts: [
      'Yadadri Bhuvanagiri',
      'Nalgonda',
      'Hyderabad',
      'Warangal',
      'Karimnagar',
      'Nizamabad',
      'Mahabubnagar',
      'Medak',
      'Adilabad',
      'Khammam'
    ],
    regionalCrafts: [
      'Pochampally Ikat Weaving',
      'Gadwal Silk & Cotton Sarees',
      'Bidriware Metalcraft',
      'Warangal Cotton & Jute Dhurries',
      'Nirmal Lacquerware & Paintings',
      'Cheriyal Scroll Paintings',
      'Dokra Bell Metal Casting'
    ]
  },
  'Tamil Nadu': {
    code: 'TN',
    name: 'Tamil Nadu',
    nativeName: 'தமிழ்நாடு',
    primaryLanguage: 'ta',
    recommendedLanguages: ['ta', 'en'],
    districts: [
      'Kanchipuram',
      'Madurai',
      'Thanjavur',
      'Salem',
      'Coimbatore',
      'Tirunelveli',
      'Vellore',
      'Tiruchirappalli',
      'Dindigul',
      'Chennai'
    ],
    regionalCrafts: [
      'Kanchipuram Silk Weaving',
      'Thanjavur Paintings & Art Plates',
      'Swamimalai Bronze Icons',
      'Chettinad Kottan Baskets',
      'Bhavani Jamakkalam Carpets',
      'Toda Tribal Embroidery',
      'Pattamadai Pai Mats'
    ]
  },
  'Karnataka': {
    code: 'KA',
    name: 'Karnataka',
    nativeName: 'ಕರ್ನಾಟಕ',
    primaryLanguage: 'kn',
    recommendedLanguages: ['kn', 'en', 'hi'],
    districts: [
      'Ramanagara',
      'Mysuru',
      'Dharwad',
      'Belagavi',
      'Bagalkot',
      'Bidar',
      'Shivamogga',
      'Ballari',
      'Dakshina Kannada',
      'Bengaluru'
    ],
    regionalCrafts: [
      'Channapatna Wooden Toys',
      'Mysore Silk Weaving',
      'Ilkal & Guledgudd Khun Fabrics',
      'Bidriware Metal Craft',
      'Sandalwood Woodcarving',
      'Kasuti Traditional Embroidery',
      'Kinhal Wood Painting'
    ]
  },
  'Kerala': {
    code: 'KL',
    name: 'Kerala',
    nativeName: 'കേരളം',
    primaryLanguage: 'ml',
    recommendedLanguages: ['ml', 'en', 'hi'],
    districts: [
      'Palakkad',
      'Alappuzha',
      'Kozhikode',
      'Thrissur',
      'Thiruvananthapuram',
      'Kannur',
      'Wayanad',
      'Kollam',
      'Kottayam',
      'Malappuram'
    ],
    regionalCrafts: [
      'Balaramapuram & Kasaragod Handlooms',
      'Aranmula Metal Mirror (Kannadi)',
      'Nettur Petti Wooden Jewel Box',
      'Screw Pine & Coir Craft',
      'Bell Metal Lamp Casting',
      'Kathakali Wood Carvings'
    ]
  },
  'Maharashtra': {
    code: 'MH',
    name: 'Maharashtra',
    nativeName: 'महाराष्ट्र',
    primaryLanguage: 'mr',
    recommendedLanguages: ['mr', 'hi', 'en'],
    districts: [
      'Chhatrapati Sambhajinagar',
      'Kolhapur',
      'Nagpur',
      'Nashik',
      'Pune',
      'Solapur',
      'Palghar',
      'Amravati',
      'Satara',
      'Mumbai'
    ],
    regionalCrafts: [
      'Paithani Silk Sarees',
      'Kolhapuri Leather Chappals',
      'Warli Tribal Wall Painting',
      'Solapur Terry Chaddar & Towels',
      'Himroo & Mashru Fabrics',
      'Sawantwadi Lacquerware'
    ]
  },
  'Gujarat': {
    code: 'GJ',
    name: 'Gujarat',
    nativeName: 'ગુજરાત',
    primaryLanguage: 'gu',
    recommendedLanguages: ['gu', 'hi', 'en'],
    districts: [
      'Kutch',
      'Patan',
      'Surendranagar',
      'Surat',
      'Ahmedabad',
      'Rajkot',
      'Jamnagar',
      'Bhavnagar',
      'Vadodara',
      'Junagadh'
    ],
    regionalCrafts: [
      'Patan Patola Double Ikat',
      'Kutch Rogan Art',
      'Ajrakh Block Print',
      'Bandhani Tie & Dye',
      'Sankheda Lacquered Furniture',
      'Tangaliya Weaving',
      'Kutch Beadwork & Embroidery'
    ]
  },
  'West Bengal': {
    code: 'WB',
    name: 'West Bengal',
    nativeName: 'পশ্চিমবঙ্গ',
    primaryLanguage: 'bn',
    recommendedLanguages: ['bn', 'en', 'hi'],
    districts: [
      'Bankura',
      'Purba Bardhaman',
      'Nadia',
      'Murshidabad',
      'Hooghly',
      'Birbhum',
      'Darjeeling',
      'Kolkata',
      'South 24 Parganas',
      'Maldah'
    ],
    regionalCrafts: [
      'Bankura Terracotta Horses',
      'Jamdani & Baluchari Silk Sarees',
      'Kantha Traditional Embroidery',
      'Sholapith Craft',
      'Dokra Metal Bell Casting',
      'Purulia Chhau Dance Masks'
    ]
  },
  'Odisha': {
    code: 'OD',
    name: 'Odisha',
    nativeName: 'ଓଡ଼ିଶା',
    primaryLanguage: 'or',
    recommendedLanguages: ['or', 'hi', 'en'],
    districts: [
      'Puri',
      'Bargarh',
      'Cuttack',
      'Ganjam',
      'Mayurbhanj',
      'Khordha',
      'Balasore',
      'Sambalpur',
      'Koraput',
      'Kendujhar'
    ],
    regionalCrafts: [
      'Raghurajpur Pattachitra Paintings',
      'Cuttack Silver Filigree (Tarakasi)',
      'Sambalpuri Bandha Ikat Weaving',
      'Pipli Applique Patchwork',
      'Dhokra Bell Metal Castings',
      'Stone & Wood Sculpture'
    ]
  },
  'Punjab': {
    code: 'PB',
    name: 'Punjab',
    nativeName: 'ਪੰਜਾਬ',
    primaryLanguage: 'pa',
    recommendedLanguages: ['pa', 'hi', 'en'],
    districts: [
      'Amritsar',
      'Ludhiana',
      'Jalandhar',
      'Patiala',
      'Bathinda',
      'Hoshiarpur',
      'Gurdaspur',
      'Fatehgarh Sahib'
    ],
    regionalCrafts: [
      'Phulkari Silk Embroidery',
      'Patiala Juttis (Leather Footwear)',
      'Wood Inlay Work of Hoshiarpur',
      'Traditional Durries & Khes',
      'Punjabi Parandi & Tilla Work'
    ]
  },
  'Assam': {
    code: 'AS',
    name: 'Assam',
    nativeName: 'অসম',
    primaryLanguage: 'as',
    recommendedLanguages: ['as', 'bn', 'en', 'hi'],
    districts: [
      'Kamrup',
      'Barpeta',
      'Sivasagar',
      'Jorhat',
      'Sonitpur',
      'Nagaon',
      'Majuli',
      'Darrang'
    ],
    regionalCrafts: [
      'Muga & Eri Golden Silk Weaving',
      'Majuli Mask Making',
      'Assam Bamboo & Cane Works',
      'Sarthebari Bell Metal Works',
      'Jaapi Traditional Headgear'
    ]
  },
  'Bihar': {
    code: 'BR',
    name: 'Bihar',
    nativeName: 'बिहार',
    primaryLanguage: 'hi',
    recommendedLanguages: ['hi', 'en'],
    districts: [
      'Madhubani',
      'Bhagalpur',
      'Gaya',
      'Patna',
      'Muzaffarpur',
      'Nalanda',
      'Darbhanga',
      'Purnia'
    ],
    regionalCrafts: [
      'Madhubani (Mithila) Folk Paintings',
      'Bhagalpuri Tussar Silk Weaving',
      'Sikki Grass Basketry',
      'Sujani Narrative Embroidery',
      'Tikuli Glass & Wood Craft'
    ]
  },
  'Jharkhand': {
    code: 'JH',
    name: 'Jharkhand',
    nativeName: 'झारखंड',
    primaryLanguage: 'hi',
    recommendedLanguages: ['hi', 'en'],
    districts: [
      'Ranchi',
      'Hazaribagh',
      'Dumka',
      'East Singhbhum',
      'Bokaro',
      'Dhanbad',
      'Gumla'
    ],
    regionalCrafts: [
      'Sohrai & Khovar Mural Art',
      'Dhokra Lost-Wax Casting',
      'Pyatkar Scroll Paintings',
      'Tribal Bamboo & Wood Crafts'
    ]
  },
  'Chhattisgarh': {
    code: 'CG',
    name: 'Chhattisgarh',
    nativeName: 'छत्तीसगढ़',
    primaryLanguage: 'hi',
    recommendedLanguages: ['hi', 'en'],
    districts: [
      'Bastar',
      'Kondagaon',
      'Raipur',
      'Rajnandgaon',
      'Bilaspur',
      'Dhamtari',
      'Surguja'
    ],
    regionalCrafts: [
      'Bastar Dhokra Bell Metal Art',
      'Bastar Wrought Iron (Loha Shilp)',
      'Kosa Silk Fabric Weaving',
      'Wood Carving & Terracotta Craft',
      'Godna Tattoo Pattern Textiles'
    ]
  },
  'Madhya Pradesh': {
    code: 'MP',
    name: 'Madhya Pradesh',
    nativeName: 'मध्य प्रदेश',
    primaryLanguage: 'hi',
    recommendedLanguages: ['hi', 'en'],
    districts: [
      'Chanderi',
      'Khargone (Maheshwar)',
      'Dhar',
      'Bhopal',
      'Indore',
      'Gwalior',
      'Tikamgarh',
      'Ujjain'
    ],
    regionalCrafts: [
      'Chanderi Silk-Cotton Sarees',
      'Maheshwari Handloom Sarees',
      'Bagh Block Printing',
      'Gond Tribal Paintings',
      'Tikamgarh Bell Metal Toys',
      'Bhairavgarh Batik Prints'
    ]
  },
  'Rajasthan': {
    code: 'RJ',
    name: 'Rajasthan',
    nativeName: 'राजस्थान',
    primaryLanguage: 'hi',
    recommendedLanguages: ['hi', 'en'],
    districts: [
      'Jaipur',
      'Jodhpur',
      'Udaipur',
      'Barmer',
      'Bikaner',
      'Kota',
      'Jaisalmer',
      'Chittorgarh'
    ],
    regionalCrafts: [
      'Jaipur Blue Pottery',
      'Sanganeri & Bagru Block Prints',
      'Kota Doria Handloom Weaves',
      'Thewa Gold-on-Glass Jewellery',
      'Molela Terracotta Clay Plaques',
      'Mojari Leather Embroidered Footwear',
      'Phad Folk Paintings'
    ]
  },
  'Uttar Pradesh': {
    code: 'UP',
    name: 'Uttar Pradesh',
    nativeName: 'उत्तर प्रदेश',
    primaryLanguage: 'hi',
    recommendedLanguages: ['hi', 'en'],
    districts: [
      'Varanasi',
      'Lucknow',
      'Moradabad',
      'Bhadohi',
      'Gorakhpur',
      'Khurja',
      'Firozabad',
      'Saharanpur',
      'Agra',
      'Kannauj'
    ],
    regionalCrafts: [
      'Banarasi Brocade & Silk Weaving',
      'Lucknowi Chikankari & Zardozi',
      'Moradabad Brass Handicrafts',
      'Bhadohi Hand-Knotted Carpets',
      'Gorakhpur Terracotta Craft',
      'Khurja Ceramic Pottery',
      'Firozabad Glassware',
      'Saharanpur Wooden Carvings'
    ]
  },
  'Uttarakhand': {
    code: 'UK',
    name: 'Uttarakhand',
    nativeName: 'उत्तराखंड',
    primaryLanguage: 'hi',
    recommendedLanguages: ['hi', 'en'],
    districts: [
      'Almora',
      'Chamoli',
      'Dehradun',
      'Nainital',
      'Pithoragarh',
      'Haridwar',
      'Tehri Garhwal'
    ],
    regionalCrafts: [
      'Aipan Folk Ritual Art',
      'Almora Copperware (Tamta)',
      'Ringal Bamboo Craft',
      'Bhotia Woolen Shawls & Blankets'
    ]
  },
  'Himachal Pradesh': {
    code: 'HP',
    name: 'Himachal Pradesh',
    nativeName: 'हिमाचल प्रदेश',
    primaryLanguage: 'hi',
    recommendedLanguages: ['hi', 'en'],
    districts: [
      'Kullu',
      'Kinnaur',
      'Kangra',
      'Chamba',
      'Shimla',
      'Mandi',
      'Lahaul & Spiti'
    ],
    regionalCrafts: [
      'Kullu & Kinnauri Woolen Shawls',
      'Chamba Rumal Needlework',
      'Kangra Miniature Paintings',
      'Himachali Hand-Knitted Woolens'
    ]
  },
  'Haryana': {
    code: 'HR',
    name: 'Haryana',
    nativeName: 'हरियाणा',
    primaryLanguage: 'hi',
    recommendedLanguages: ['hi', 'pa', 'en'],
    districts: [
      'Panipat',
      'Faridabad',
      'Rewari',
      'Rohtak',
      'Karnal',
      'Gurugram',
      'Hisar'
    ],
    regionalCrafts: [
      'Panipat Handloom Durries & Rugs',
      'Rewari Tilla Jutti & Brass Work',
      'Surajkund Clay Pottery',
      'Handloom Woolen Weaving'
    ]
  },
  'Goa': {
    code: 'GA',
    name: 'Goa',
    nativeName: 'गोंय',
    primaryLanguage: 'mr',
    recommendedLanguages: ['mr', 'en', 'hi'],
    districts: ['North Goa', 'South Goa'],
    regionalCrafts: [
      'Goan Terracotta Craft',
      'Coconut Shell Carving',
      'Brass Lamp Casting',
      'Seashell & Bamboo Craft'
    ]
  },
  'Sikkim': {
    code: 'SK',
    name: 'Sikkim',
    nativeName: 'सिक्किम',
    primaryLanguage: 'hi',
    recommendedLanguages: ['hi', 'en'],
    districts: ['East Sikkim (Gangtok)', 'West Sikkim', 'North Sikkim', 'South Sikkim'],
    regionalCrafts: [
      'Thangka Religious Paintings',
      'Choktse Foldable Carved Wooden Tables',
      'Tibetan Hand-Knotted Woolen Carpets',
      'Lepcha Handloom Weaves'
    ]
  },
  'Tripura': {
    code: 'TR',
    name: 'Tripura',
    nativeName: 'ত্রিপুরা',
    primaryLanguage: 'bn',
    recommendedLanguages: ['bn', 'en', 'hi'],
    districts: ['West Tripura (Agartala)', 'Gomati', 'South Tripura', 'Dhalai', 'Unakoti'],
    regionalCrafts: [
      'Tripura Bamboo & Cane Screen Work',
      'Risa Traditional Handloom Weaving',
      'Tripura Woodcarving & Mat Making'
    ]
  },
  'Meghalaya': {
    code: 'ML',
    name: 'Meghalaya',
    nativeName: 'Meghalaya',
    primaryLanguage: 'en',
    recommendedLanguages: ['en', 'hi'],
    districts: ['East Khasi Hills (Shillong)', 'West Garo Hills', 'Ri-Bhoi', 'West Jaintia Hills'],
    regionalCrafts: [
      'Khasi Cane & Bamboo Baskets',
      'Eri Silk Ryndia Weaving',
      'Black Clay Pottery of Larnai'
    ]
  },
  'Manipur': {
    code: 'MN',
    name: 'Manipur',
    nativeName: 'মণিপুর',
    primaryLanguage: 'en',
    recommendedLanguages: ['en', 'hi'],
    districts: ['Imphal West', 'Imphal East', 'Bishnupur', 'Ukhrul', 'Churachandpur'],
    regionalCrafts: [
      'Longpi Black Stone Pottery',
      'Shaphee Lanphee Embroidered Shawls',
      'Kauna Water Reed Craft',
      'Moirang Phee Traditional Fabrics'
    ]
  },
  'Mizoram': {
    code: 'MZ',
    name: 'Mizoram',
    nativeName: 'Mizoram',
    primaryLanguage: 'en',
    recommendedLanguages: ['en', 'hi'],
    districts: ['Aizawl', 'Lunglei', 'Champhai', 'Kolasib', 'Serchhip'],
    regionalCrafts: [
      'Puan Traditional Handloom Fabrics',
      'Mizo Bamboo Hats & Baskets',
      'Handmade Wooden Pipe & Woodcraft'
    ]
  },
  'Nagaland': {
    code: 'NL',
    name: 'Nagaland',
    nativeName: 'Nagaland',
    primaryLanguage: 'en',
    recommendedLanguages: ['en', 'hi'],
    districts: ['Kohima', 'Dimapur', 'Mokokchung', 'Mon', 'Wokha'],
    regionalCrafts: [
      'Naga Tribal Shawls & Waistcoats',
      'Naga Woodcarvings & Shields',
      'Cane & Bamboo Rain Hats',
      'Traditional Tribal Beadwork'
    ]
  },
  'Arunachal Pradesh': {
    code: 'AR',
    name: 'Arunachal Pradesh',
    nativeName: 'अरुणाचल प्रदेश',
    primaryLanguage: 'hi',
    recommendedLanguages: ['hi', 'en'],
    districts: ['Papum Pare (Itanagar)', 'Tawang', 'West Kameng', 'Lower Subansiri', 'Changlang'],
    regionalCrafts: [
      'Monpa Traditional Wood Carvings',
      'Apatani Handloom Weaving',
      'Wancho Wood & Bead Craft',
      'Mishmi Textiles'
    ]
  },
  'Delhi': {
    code: 'DL',
    name: 'Delhi',
    nativeName: 'दिल्ली',
    primaryLanguage: 'hi',
    recommendedLanguages: ['hi', 'en', 'pa'],
    districts: ['Central Delhi', 'New Delhi', 'South Delhi', 'North Delhi', 'East Delhi', 'West Delhi'],
    regionalCrafts: [
      'Zari & Zardozi Embroidery',
      'Meenakari Enameling & Silverware',
      'Bone Carving & Paper Mache',
      'Contemporary Fusion Crafts'
    ]
  },
  'Jammu and Kashmir': {
    code: 'JK',
    name: 'Jammu and Kashmir',
    nativeName: 'जम्मू और कश्मीर',
    primaryLanguage: 'hi',
    recommendedLanguages: ['hi', 'en'],
    districts: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Budgam', 'Udhampur'],
    regionalCrafts: [
      'Pashmina & Kani Shawl Weaving',
      'Kashmir Paper Mache Art',
      'Walnut Woodcarving',
      'Sozni Embroidery',
      'Kashmiri Hand-Knotted Silk Carpets'
    ]
  },
  'Ladakh': {
    code: 'LA',
    name: 'Ladakh',
    nativeName: 'लद्दाख',
    primaryLanguage: 'hi',
    recommendedLanguages: ['hi', 'en'],
    districts: ['Leh', 'Kargil'],
    regionalCrafts: [
      'Ladakhi Pashmina Shawls & Fabrics',
      'Chulli Apricot Wood Carvings',
      'Thangka Painting & Clay Statues',
      'Chamsen Metalwork'
    ]
  },
  'Puducherry': {
    code: 'PY',
    name: 'Puducherry',
    nativeName: 'புதுச்சேரி',
    primaryLanguage: 'ta',
    recommendedLanguages: ['ta', 'en', 'te', 'ml'],
    districts: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
    regionalCrafts: [
      'Handmade Paper Products',
      'Terracotta Pottery',
      'Leather Crafts',
      'Aromatherapy & Incense Making'
    ]
  },
  'Chandigarh': {
    code: 'CH',
    name: 'Chandigarh',
    nativeName: 'ਚੰਡੀਗੜ੍ਹ',
    primaryLanguage: 'pa',
    recommendedLanguages: ['pa', 'hi', 'en'],
    districts: ['Chandigarh'],
    regionalCrafts: [
      'Phulkari Shawls & Textiles',
      'Contemporary Terracotta Art',
      'Modern Woodcraft'
    ]
  }
};

/**
 * Normalizes input state names (e.g. "Delhi (NCT)", "State of Andhra Pradesh", "Andhra")
 * to the canonical key in STATE_LANGUAGE_MAP.
 */
export function normalizeStateName(rawState?: string | null): string | null {
  if (!rawState) return null;
  const clean = rawState.trim().toLowerCase();

  for (const [key, cfg] of Object.entries(STATE_LANGUAGE_MAP)) {
    if (
      key.toLowerCase() === clean ||
      cfg.code.toLowerCase() === clean ||
      cfg.nativeName.toLowerCase() === clean ||
      clean.includes(key.toLowerCase()) ||
      key.toLowerCase().includes(clean)
    ) {
      return key;
    }
  }

  // Common aliases
  if (clean.includes('andhra')) return 'Andhra Pradesh';
  if (clean.includes('telangana')) return 'Telangana';
  if (clean.includes('tamil') || clean.includes('nadu')) return 'Tamil Nadu';
  if (clean.includes('karnataka') || clean.includes('bangalore') || clean.includes('bengaluru')) return 'Karnataka';
  if (clean.includes('kerala')) return 'Kerala';
  if (clean.includes('maharashtra') || clean.includes('bombay') || clean.includes('mumbai')) return 'Maharashtra';
  if (clean.includes('gujarat')) return 'Gujarat';
  if (clean.includes('bengal') || clean.includes('kolkata')) return 'West Bengal';
  if (clean.includes('odisha') || clean.includes('orissa')) return 'Odisha';
  if (clean.includes('punjab')) return 'Punjab';
  if (clean.includes('assam')) return 'Assam';
  if (clean.includes('bihar')) return 'Bihar';
  if (clean.includes('jharkhand')) return 'Jharkhand';
  if (clean.includes('chhattisgarh')) return 'Chhattisgarh';
  if (clean.includes('madhya') || clean.includes('mp')) return 'Madhya Pradesh';
  if (clean.includes('rajasthan') || clean.includes('jaipur')) return 'Rajasthan';
  if (clean.includes('uttar pradesh') || clean === 'up') return 'Uttar Pradesh';
  if (clean.includes('uttarakhand')) return 'Uttarakhand';
  if (clean.includes('himachal')) return 'Himachal Pradesh';
  if (clean.includes('haryana')) return 'Haryana';
  if (clean.includes('delhi')) return 'Delhi';
  if (clean.includes('kashmir') || clean.includes('jammu')) return 'Jammu and Kashmir';
  if (clean.includes('ladakh')) return 'Ladakh';
  if (clean.includes('goa')) return 'Goa';

  return null;
}

export function getLanguagesForState(stateName: string): LanguageCode[] {
  const norm = normalizeStateName(stateName);
  if (norm && STATE_LANGUAGE_MAP[norm]) {
    return STATE_LANGUAGE_MAP[norm].recommendedLanguages;
  }
  return ['en', 'hi', 'te'];
}

export function getPrimaryLanguageForState(stateName: string): LanguageCode {
  const norm = normalizeStateName(stateName);
  if (norm && STATE_LANGUAGE_MAP[norm]) {
    return STATE_LANGUAGE_MAP[norm].primaryLanguage;
  }
  return 'en';
}

export function getDistrictsForState(stateName: string): string[] {
  const norm = normalizeStateName(stateName);
  if (norm && STATE_LANGUAGE_MAP[norm]) {
    return STATE_LANGUAGE_MAP[norm].districts;
  }
  return [];
}

export function getRegionalCraftsForState(stateName: string): string[] {
  const norm = normalizeStateName(stateName);
  if (norm && STATE_LANGUAGE_MAP[norm]) {
    return STATE_LANGUAGE_MAP[norm].regionalCrafts;
  }
  return [
    'Handloom Weaving',
    'Pottery & Clay Work',
    'Woodcraft & Carving',
    'Metalcraft & Casting',
    'Traditional Embroidery'
  ];
}
