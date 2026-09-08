import { LanguageCode } from '../types';

export interface UIStrings {
  appName: string;
  tagline: string;
  forArtisans: string;
  forBuyers: string;
  evaluatorDefense: string;
  selectLanguage: string;
  english: string;
  hindi: string;
  telugu: string;
  audioGuide: string;
  listening: string;
  listenToGuide: string;
  stopAudio: string;

  // Onboarding
  welcomeTitle: string;
  welcomeSub: string;
  enterPhone: string;
  sendOtp: string;
  enterOtp: string;
  verifyOtp: string;
  resendOtp: string;
  artisanDetails: string;
  fullName: string;
  craftCategory: string;
  stateDistrict: string;
  state: string;
  district: string;
  yearsOfExperience: string;
  completeProfile: string;

  // Dashboard
  myArtisanStudio: string;
  publishedProducts: string;
  draftProducts: string;
  buyerEnquiries: string;
  incomeImpactTitle: string;
  middlemanComparison: string;
  addNewCraft: string;
  viewEnquiries: string;
  noProductsYet: string;
  startFirstListing: string;

  // Creation Wizard
  stepPhoto: string;
  stepEnhance: string;
  stepCatalog: string;
  stepPricing: string;
  stepLinkage: string;
  stepPublish: string;

  // Step 1 Photo
  captureOrUpload: string;
  takePhoto: string;
  uploadGallery: string;
  orTrySampleCrafts: string;

  // Step 2 Enhance
  aiEnhancementTitle: string;
  aiEnhancementSub: string;
  before: string;
  after: string;
  enhancementApplied: string;
  originalUnmodified: string;

  // Step 3 Catalog
  smartCatalogTitle: string;
  smartCatalogSub: string;
  productTitle: string;
  productDesc: string;
  material: string;
  estDimensions: string;
  tags: string[];
  aiGeneratedBadge: string;
  voiceDictate: string;

  // Step 4 Pricing
  smartPricingTitle: string;
  smartPricingSub: string;
  rawMaterialCost: string;
  laborHours: string;
  fairHourlyWage: string;
  suggestedFairRange: string;
  recommendedPrice: string;
  middlemanPayout: string;
  fairMarketGain: string;
  acceptSuggested: string;
  setCustomPrice: string;
  pricingRationale: string;

  // Step 5 Market Linkage
  marketLinkageTitle: string;
  marketLinkageSub: string;
  matchingChannels: string;
  matchScore: string;
  shareWhatsApp: string;
  shareDirectLink: string;

  // Step 6 Publish
  publishTitle: string;
  publishSuccess: string;
  viewInMarketplace: string;
  publishListing: string;

  // Buyer Marketplace
  browseCatalog: string;
  searchCrafts: string;
  filterCategory: string;
  allCategories: string;
  priceRange: string;
  enquireNow: string;
  authenticHandmade: string;
  artisanOrigin: string;
  sendEnquiryTitle: string;
  buyerName: string;
  buyerPhone: string;
  buyerQuantity: string;
  buyerMessage: string;
  submitEnquiry: string;
  enquirySentSuccess: string;
  close: string;
  back: string;
  next: string;

  // ---- LANDING PAGE ----
  landingHeroTitle: string;
  landingHeroSub: string;
  choosePortal: string;
  seller: string;
  buyer: string;
  admin: string;
  sellerDesc: string;
  buyerDesc: string;
  adminDesc: string;
  enterPortal: string;
  howItWorks: string;
  howItWorksSellerFlow: string;
  howItWorksBuyerFlow: string;
  howItWorksAdminFlow: string;
  manageHandicrafts: string;
  addProducts: string;
  compareMarketPrices: string;
  generateBills: string;
  manageOrders: string;
  trackSales: string;
  discoverHandicrafts: string;
  searchProducts: string;
  viewArtisanInfo: string;
  compareProducts: string;
  purchaseProducts: string;
  trackOrders: string;
  manageUsers: string;
  manageSellers: string;
  manageBuyers: string;
  manageProductsAdmin: string;
  monitorOrders: string;
  monitorActivity: string;
  viewAnalytics: string;

  // ---- SELLER PORTAL ----
  sellerDashboard: string;
  myHandicrafts: string;
  addHandicraft: string;
  marketPriceAnalysis: string;
  createBill: string;
  orders: string;
  salesHistory: string;
  profile: string;
  customerCare: string;
  logout: string;
  totalProducts: string;
  activeProducts: string;
  totalSales: string;
  pendingOrders: string;
  billsGenerated: string;
  recentOrders: string;
  quickActions: string;
  productName: string;
  productCategory: string;
  artisanName: string;
  craftType: string;
  description: string;
  quantity: string;
  productionCost: string;
  labourCost: string;
  materialCost: string;
  additionalExpenses: string;
  suggestedSellingPrice: string;
  productImage: string;
  location: string;
  craftOrigin: string;
  availableStock: string;
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  view: string;
  search: string;
  filter: string;
  sort: string;
  actions: string;
  status: string;
  price: string;
  date: string;
  noResults: string;
  confirmDelete: string;
  deleteSuccess: string;
  saveSuccess: string;
  required: string;
  invalidValue: string;
  mustBePositive: string;

  // ---- BILL / INVOICE ----
  billTitle: string;
  invoiceNumber: string;
  billDate: string;
  sellerInfo: string;
  productDetails: string;
  costBreakdown: string;
  transportationCost: string;
  otherExpenses: string;
  totalCost: string;
  proposedPrice: string;
  finalSellingPrice: string;
  profitLabel: string;
  profitPercentage: string;
  marketPriceSection: string;
  marketMinPrice: string;
  marketAvgPrice: string;
  marketMaxPrice: string;
  aiRecommendedPrice: string;
  finalizeBill: string;
  printBill: string;
  downloadBill: string;
  billFinalized: string;
  previewBill: string;
  adjustPrice: string;
  selectHandicraft: string;
  enterCostDetails: string;
  enterProposedPrice: string;
  reviewRecommendation: string;
  confirmFinalize: string;
  priceRecommendation: string;
  priceRecommendationText: string;
  financialSummary: string;
  totalAmount: string;

  // ---- MARKET PRICE ANALYSIS ----
  yourCost: string;
  yourProposedPrice: string;
  marketComparison: string;
  priceTrend: string;
  competitiveAnalysis: string;
  demoDataNotice: string;
  belowMarket: string;
  atMarket: string;
  aboveMarket: string;

  // ---- BUYER PORTAL ----
  buyerHome: string;
  products: string;
  categories: string;
  wishlist: string;
  cart: string;
  newArrivals: string;
  popularProducts: string;
  recommendedForYou: string;
  addToCart: string;
  buyNow: string;
  addToWishlist: string;
  removeFromWishlist: string;
  contactSeller: string;
  viewDetails: string;
  productInfo: string;
  artisanInfo: string;
  authenticity: string;
  availableQty: string;
  cartEmpty: string;
  cartSummary: string;
  proceedToCheckout: string;
  removeFromCart: string;
  orderPlaced: string;
  orderStatus: string;
  orderDate: string;
  orderTotal: string;
  orderTracking: string;
  orderCreated: string;
  orderPaid: string;
  orderShipped: string;
  orderDelivered: string;
  wishlistEmpty: string;
  moveToCart: string;

  // ---- ADMIN PORTAL ----
  adminDashboard: string;
  sellers: string;
  buyers: string;
  handicrafts: string;
  bills: string;
  marketPrices: string;
  reports: string;
  analytics: string;
  settings: string;
  totalUsersLabel: string;
  totalSellersLabel: string;
  totalBuyersLabel: string;
  totalHandicraftsLabel: string;
  totalOrdersLabel: string;
  totalSalesLabel: string;
  pendingApprovalsLabel: string;
  salesTrend: string;
  categoryDistribution: string;
  topSellers: string;
  recentActivity: string;
  revenue: string;

  // ---- CUSTOMER CARE ----
  customerCareTitle: string;
  typeMessage: string;
  sendMessage: string;
  clearChat: string;
  suggestedQuestions: string;
  aiThinking: string;
  welcomeMessage: string;

  // ---- COMMON ----
  loading: string;
  error: string;
  retry: string;
  noData: string;
  comingSoon: string;
  poweredBy: string;
  fairTrade: string;
  giCertified: string;
  handmade: string;
  verified: string;
  home: string;
  about: string;
}

export const translations: Record<LanguageCode, UIStrings> = {
  en: {
    appName: "KALAtech",
    tagline: "AI Market Linkage & Smart Cataloging for Artisans",
    forArtisans: "Artisan Studio",
    forBuyers: "Buyer Marketplace",
    evaluatorDefense: "AI Audit & Data Proof",
    selectLanguage: "Language",
    english: "English",
    hindi: "हिन्दी (Hindi)",
    telugu: "తెలుగు (Telugu)",
    audioGuide: "Audio Guide",
    listening: "Listening...",
    listenToGuide: "Tap to listen to screen instructions",
    stopAudio: "Stop audio",

    welcomeTitle: "Empowering Rural & Folk Artisans",
    welcomeSub: "Turn your handmade crafts into professional multilingual catalogs with fair pricing in minutes.",
    enterPhone: "Mobile Phone Number",
    sendOtp: "Send OTP Code",
    enterOtp: "Enter 6-Digit OTP",
    verifyOtp: "Verify & Enter Studio",
    resendOtp: "Resend Code (Demo: 123456)",
    artisanDetails: "Artisan Profile Setup",
    fullName: "Your Full Name",
    craftCategory: "Primary Craft Tradition",
    stateDistrict: "Your Region / Village",
    state: "State",
    district: "District / Town",
    yearsOfExperience: "Years Practicing Craft",
    completeProfile: "Enter Artisan Studio",

    myArtisanStudio: "Artisan Workshop Dashboard",
    publishedProducts: "Active Listings",
    draftProducts: "Draft Creations",
    buyerEnquiries: "Buyer Inquiries",
    incomeImpactTitle: "Direct-to-Market Income Gain",
    middlemanComparison: "Extra income earned compared to local middleman cuts",
    addNewCraft: "Add New Handcrafted Product",
    viewEnquiries: "View Buyer Messages",
    noProductsYet: "No handcrafted listings yet",
    startFirstListing: "Capture a photo of your craft to begin smart cataloging",

    stepPhoto: "1. Photo",
    stepEnhance: "2. Clean Up",
    stepCatalog: "3. Catalog",
    stepPricing: "4. Fair Price",
    stepLinkage: "5. Buyers",
    stepPublish: "6. Publish",

    captureOrUpload: "Upload or Snap Craft Photo",
    takePhoto: "Open Camera",
    uploadGallery: "Upload from Gallery",
    orTrySampleCrafts: "Or test instantly with authentic Indian craft samples:",

    aiEnhancementTitle: "AI Photo Studio Enhancement",
    aiEnhancementSub: "Automatically normalizes shadows, enhances vibrant natural craft colors, and cleans backgrounds.",
    before: "Raw Photo",
    after: "AI Studio Enhanced",
    enhancementApplied: "Studio Lighting & Sharpness Optimized",
    originalUnmodified: "Original Camera Capture",

    smartCatalogTitle: "AI Smart Catalog Generator",
    smartCatalogSub: "Gemini Vision extracts product title, heritage description, materials, and tags automatically.",
    productTitle: "Craft Title",
    productDesc: "Authentic Heritage Story & Description",
    material: "Traditional Materials Used",
    estDimensions: "Estimated Dimensions / Size",
    tags: ["Handmade", "Heritage", "Traditional"],
    aiGeneratedBadge: "AI Extracted — You can edit anything",
    voiceDictate: "Tap to Speak (Voice Dictation)",

    smartPricingTitle: "Fair Economic Pricing Engine",
    smartPricingSub: "Combines your raw costs with curated market benchmarks to prevent undervaluation and middleman exploitation.",
    rawMaterialCost: "Raw Materials Cost (₹)",
    laborHours: "Hours of Dedicated Handcrafting",
    fairHourlyWage: "Fair Hourly Wage Standard (₹/hr)",
    suggestedFairRange: "Recommended Fair Market Range",
    recommendedPrice: "Target Recommended Price",
    middlemanPayout: "Typical Middleman Offer",
    fairMarketGain: "Artisan Profit Gain",
    acceptSuggested: "Apply Suggested Price",
    setCustomPrice: "Set Custom Selling Price",
    pricingRationale: "Market Rationale & Economic Proof",

    marketLinkageTitle: "Market Linkage & Buyer Matching",
    marketLinkageSub: "AI matches this specific craft to the highest-margin commercial channels and institutional buyers.",
    matchingChannels: "Recommended Sales Channels",
    matchScore: "Fit Match",
    shareWhatsApp: "Share to WhatsApp Buyers",
    shareDirectLink: "Copy Verified Product Link",

    publishTitle: "Multilingual Publishing Complete",
    publishSuccess: "Your product is now listed in English, Hindi, and Telugu!",
    viewInMarketplace: "View in Buyer Marketplace",
    publishListing: "Publish to Marketplace",

    browseCatalog: "Direct Artisan Marketplace",
    searchCrafts: "Search pottery, ikat silks, woodwork, tribal art...",
    filterCategory: "Filter by Tradition",
    allCategories: "All Crafts",
    priceRange: "Price Range",
    enquireNow: "Enquire Directly with Artisan",
    authenticHandmade: "100% Certified Artisan Handmade",
    artisanOrigin: "Craft Origin",
    sendEnquiryTitle: "Send Inquiry to Master Artisan",
    buyerName: "Your Name / Organization",
    buyerPhone: "Phone or WhatsApp Number",
    buyerQuantity: "Quantity Needed (Units)",
    buyerMessage: "Inquiry Details or Custom Order Request",
    submitEnquiry: "Send Direct Inquiry",
    enquirySentSuccess: "Inquiry sent successfully! The artisan has been notified directly.",
    close: "Close",
    back: "Back",
    next: "Continue",

    // Landing Page
    landingHeroTitle: "Empowering Indian Artisans, Connecting Them to Better Markets",
    landingHeroSub: "KALAtech bridges traditional craftsmanship with modern digital markets through AI-powered cataloging, fair pricing, and direct market linkage.",
    choosePortal: "Choose Your Portal",
    seller: "Seller",
    buyer: "Buyer",
    admin: "Admin",
    sellerDesc: "Manage your handicrafts, add products, compare market prices, generate bills, manage orders, and track sales.",
    buyerDesc: "Discover authentic handicrafts, search products, view artisan stories, compare prices, and purchase directly.",
    adminDesc: "Manage users, sellers, buyers, products, monitor orders, marketplace activity, and view analytics.",
    enterPortal: "Enter Portal",
    howItWorks: "How KALAtech Works",
    howItWorksSellerFlow: "Seller adds handicraft → Market-price comparison → Finalizes price → Generates bill → Product becomes available to buyers",
    howItWorksBuyerFlow: "Buyer browses handicrafts → Views details → Purchases → Tracks order",
    howItWorksAdminFlow: "Admin monitors platform → Manages users/products/orders → Reviews analytics",
    manageHandicrafts: "Manage Handicrafts",
    addProducts: "Add Products",
    compareMarketPrices: "Compare Market Prices",
    generateBills: "Generate Bills",
    manageOrders: "Manage Orders",
    trackSales: "Track Sales",
    discoverHandicrafts: "Discover Handicrafts",
    searchProducts: "Search Products",
    viewArtisanInfo: "View Artisan Info",
    compareProducts: "Compare Products & Prices",
    purchaseProducts: "Purchase Products",
    trackOrders: "Track Orders",
    manageUsers: "Manage Users",
    manageSellers: "Manage Sellers",
    manageBuyers: "Manage Buyers",
    manageProductsAdmin: "Manage Products",
    monitorOrders: "Monitor Orders",
    monitorActivity: "Monitor Activity",
    viewAnalytics: "View Analytics",

    // Seller Portal
    sellerDashboard: "Seller Dashboard",
    myHandicrafts: "My Handicrafts",
    addHandicraft: "Add Handicraft",
    marketPriceAnalysis: "Market Price Analysis",
    createBill: "Create Bill",
    orders: "Orders",
    salesHistory: "Sales History",
    profile: "Profile",
    customerCare: "Customer Care",
    logout: "Logout",
    totalProducts: "Total Products",
    activeProducts: "Active Products",
    totalSales: "Total Sales",
    pendingOrders: "Pending Orders",
    billsGenerated: "Bills Generated",
    recentOrders: "Recent Orders",
    quickActions: "Quick Actions",
    productName: "Product Name",
    productCategory: "Product Category",
    artisanName: "Artisan Name",
    craftType: "Craft Type",
    description: "Description",
    quantity: "Quantity",
    productionCost: "Production Cost",
    labourCost: "Labour Cost",
    materialCost: "Material Cost",
    additionalExpenses: "Additional Expenses",
    suggestedSellingPrice: "Suggested Selling Price",
    productImage: "Product Image",
    location: "Location",
    craftOrigin: "Craft Origin / State",
    availableStock: "Available Stock",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    view: "View",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    actions: "Actions",
    status: "Status",
    price: "Price",
    date: "Date",
    noResults: "No results found",
    confirmDelete: "Are you sure you want to delete this item?",
    deleteSuccess: "Item deleted successfully",
    saveSuccess: "Saved successfully",
    required: "This field is required",
    invalidValue: "Invalid value",
    mustBePositive: "Value must be greater than 0",

    // Bill / Invoice
    billTitle: "Handicraft Bill / Invoice",
    invoiceNumber: "Invoice Number",
    billDate: "Bill Date",
    sellerInfo: "Seller Information",
    productDetails: "Product Details",
    costBreakdown: "Cost Breakdown",
    transportationCost: "Transportation Cost",
    otherExpenses: "Other Expenses",
    totalCost: "Total Cost",
    proposedPrice: "Proposed Price",
    finalSellingPrice: "Final Selling Price",
    profitLabel: "Profit",
    profitPercentage: "Profit %",
    marketPriceSection: "Market Price Analysis",
    marketMinPrice: "Market Minimum",
    marketAvgPrice: "Market Average",
    marketMaxPrice: "Market Maximum",
    aiRecommendedPrice: "AI Recommended Price",
    finalizeBill: "Finalize Bill",
    printBill: "Print Bill",
    downloadBill: "Download Bill",
    billFinalized: "Bill has been finalized successfully!",
    previewBill: "Preview Bill",
    adjustPrice: "Adjust Price",
    selectHandicraft: "Select Handicraft",
    enterCostDetails: "Enter Cost Details",
    enterProposedPrice: "Enter Proposed Price",
    reviewRecommendation: "Review Recommendation",
    confirmFinalize: "Confirm & Finalize",
    priceRecommendation: "Price Recommendation",
    priceRecommendationText: "Based on market analysis, we recommend a price between ₹{min} and ₹{max} for optimal balance of competitiveness and artisan profit.",
    financialSummary: "Financial Summary",
    totalAmount: "Total Amount",

    // Market Price Analysis
    yourCost: "Your Cost",
    yourProposedPrice: "Your Proposed Price",
    marketComparison: "Market Comparison",
    priceTrend: "Price Trend",
    competitiveAnalysis: "Competitive Analysis",
    demoDataNotice: "Note: Market data shown is from curated demo datasets for demonstration purposes.",
    belowMarket: "Below Market Average",
    atMarket: "At Market Average",
    aboveMarket: "Above Market Average",

    // Buyer Portal
    buyerHome: "Buyer Home",
    products: "Products",
    categories: "Categories",
    wishlist: "Wishlist",
    cart: "Cart",
    newArrivals: "New Arrivals",
    popularProducts: "Popular Products",
    recommendedForYou: "Recommended For You",
    addToCart: "Add to Cart",
    buyNow: "Buy Now",
    addToWishlist: "Add to Wishlist",
    removeFromWishlist: "Remove from Wishlist",
    contactSeller: "Contact Seller",
    viewDetails: "View Details",
    productInfo: "Product Information",
    artisanInfo: "Artisan Information",
    authenticity: "Authenticity & Certification",
    availableQty: "Available Quantity",
    cartEmpty: "Your cart is empty",
    cartSummary: "Cart Summary",
    proceedToCheckout: "Proceed to Checkout",
    removeFromCart: "Remove",
    orderPlaced: "Order Placed Successfully!",
    orderStatus: "Order Status",
    orderDate: "Order Date",
    orderTotal: "Order Total",
    orderTracking: "Order Tracking",
    orderCreated: "Order Created",
    orderPaid: "Payment Confirmed",
    orderShipped: "Shipped",
    orderDelivered: "Delivered",
    wishlistEmpty: "Your wishlist is empty",
    moveToCart: "Move to Cart",

    // Admin Portal
    adminDashboard: "Admin Dashboard",
    sellers: "Sellers",
    buyers: "Buyers",
    handicrafts: "Handicrafts",
    bills: "Bills",
    marketPrices: "Market Prices",
    reports: "Reports",
    analytics: "Analytics",
    settings: "Settings",
    totalUsersLabel: "Total Users",
    totalSellersLabel: "Total Sellers",
    totalBuyersLabel: "Total Buyers",
    totalHandicraftsLabel: "Total Handicrafts",
    totalOrdersLabel: "Total Orders",
    totalSalesLabel: "Total Sales",
    pendingApprovalsLabel: "Pending Approvals",
    salesTrend: "Sales Trend",
    categoryDistribution: "Category Distribution",
    topSellers: "Top Sellers",
    recentActivity: "Recent Activity",
    revenue: "Revenue",

    // Customer Care
    customerCareTitle: "AI Customer Care",
    typeMessage: "Type your message...",
    sendMessage: "Send",
    clearChat: "Clear Chat",
    suggestedQuestions: "Suggested Questions",
    aiThinking: "AI is thinking...",
    welcomeMessage: "Hello! I'm KALAtech's AI assistant. How can I help you today?",

    // Common
    loading: "Loading...",
    error: "Something went wrong",
    retry: "Retry",
    noData: "No data available",
    comingSoon: "Coming Soon",
    poweredBy: "Powered by Gemini AI",
    fairTrade: "Fair Trade Verified",
    giCertified: "GI Certified",
    handmade: "Handmade",
    verified: "Verified",
    home: "Home",
    about: "About",
  },

  hi: {
    appName: "KALAtech",
    tagline: "कारीगरों के लिए AI बाज़ार लिंकेज एवं स्मार्ट कैटलॉगिंग",
    forArtisans: "कारीगर स्टूडियो (Artisan)",
    forBuyers: "ग्राहक बाज़ार (Buyer)",
    evaluatorDefense: "AI ऑडिट और डेटा प्रमाण",
    selectLanguage: "भाषा चुनें",
    english: "English",
    hindi: "हिन्दी (Hindi)",
    telugu: "తెలుగు (Telugu)",
    audioGuide: "ऑडियो सहायता",
    listening: "सुन रहे हैं...",
    listenToGuide: "स्क्रीन निर्देश सुनने के लिए टैप करें",
    stopAudio: "ऑडियो रोकें",

    welcomeTitle: "कारीगरों और शिल्पकारों का सशक्तिकरण",
    welcomeSub: "अपनी हस्तकला की फोटो लें और कुछ ही मिनटों में बहुभाषी कैटलॉग तथा उचित मूल्य प्राप्त करें।",
    enterPhone: "मोबाइल नंबर दर्ज करें",
    sendOtp: "OTP कोड भेजें",
    enterOtp: "6-अंकों का OTP डालें",
    verifyOtp: "सत्यापित करें और आगे बढ़ें",
    resendOtp: "पुनः भेजें (डेमो: 123456)",
    artisanDetails: "कारीगर प्रोफ़ाइल सेटअप",
    fullName: "आपका पूरा नाम",
    craftCategory: "शिल्प परंपरा / श्रेणी",
    stateDistrict: "आपका गाँव / जिला",
    state: "राज्य",
    district: "जिला",
    yearsOfExperience: "शिल्पकला का अनुभव (वर्ष)",
    completeProfile: "स्टूडियो में प्रवेश करें",

    myArtisanStudio: "कारीगर कार्यशाला डैशबोर्ड",
    publishedProducts: "सक्रिय उत्पाद",
    draftProducts: "अधूरे ड्राफ्ट",
    buyerEnquiries: "खरीदारों की पूछताछ",
    incomeImpactTitle: "सीधे बाज़ार से बढ़ी हुई आय",
    middlemanComparison: "बिचौलियों के मुकाबले कारीगर की अतिरिक्त सीधी बचत",
    addNewCraft: "नया हस्तशिल्प उत्पाद जोड़ें",
    viewEnquiries: "खरीदार संदेश देखें",
    noProductsYet: "अभी तक कोई उत्पाद सूचीबद्ध नहीं है",
    startFirstListing: "स्मार्ट कैटलॉगिंग शुरू करने के लिए अपने उत्पाद की तस्वीर लें",

    stepPhoto: "1. फोटो",
    stepEnhance: "2. संवारें",
    stepCatalog: "3. विवरण",
    stepPricing: "4. सही मूल्य",
    stepLinkage: "5. खरीदार",
    stepPublish: "6. प्रकाशित",

    captureOrUpload: "उत्पाद की तस्वीर लें या अपलोड करें",
    takePhoto: "कैमरा खोलें",
    uploadGallery: "गैलरी से चुनें",
    orTrySampleCrafts: "या तुरंत इन पारंपरिक शिल्प नमूनों से आज़माएं:",

    aiEnhancementTitle: "AI फोटो स्टूडियो सुधार",
    aiEnhancementSub: "छाया को हटाता है, शिल्प के प्राकृतिक रंगों को निखारता है और पृष्ठभूमि साफ करता है।",
    before: "मूल फोटो (Before)",
    after: "AI स्टूडियो फिनिश (After)",
    enhancementApplied: "स्टूडियो लाइटिंग और स्पष्टता लागू",
    originalUnmodified: "कैमरे की मूल तस्वीर",

    smartCatalogTitle: "AI स्मार्ट कैटलॉग निर्माण",
    smartCatalogSub: "Gemini AI तस्वीर देखकर शीर्षक, पारंपरिक कहानी, सामग्री और टैग स्वचालित भरता है।",
    productTitle: "उत्पाद का नाम",
    productDesc: "पारंपरिक विरासत और निर्माण कहानी",
    material: "प्रयुक्त पारंपरिक सामग्री",
    estDimensions: "अनुमानित माप / आकार",
    tags: ["हस्तनिर्मित", "पारंपरिक", "विरासत"],
    aiGeneratedBadge: "AI द्वारा सुझाया गया — आप बदलाव कर सकते हैं",
    voiceDictate: "बोलकर दर्ज करें (आवाज इनपुट)",

    smartPricingTitle: "उचित आर्थिक मूल्य कैलकुलेटर",
    smartPricingSub: "आपकी लागत और बाज़ार के शोधित डेटा का विश्लेषण कर सही मूल्य सीमा तय करता है।",
    rawMaterialCost: "कच्चे माल की लागत (₹)",
    laborHours: "शिल्प बनाने में लगे कुल घंटे",
    fairHourlyWage: "उचित पारिश्रमिक दर (₹/घंटा)",
    suggestedFairRange: "अनुशंसित उचित बाज़ार मूल्य सीमा",
    recommendedPrice: "सर्वोत्तम अनुशंसित मूल्य",
    middlemanPayout: "बिचौलिए द्वारा दी जाने वाली आम कीमत",
    fairMarketGain: "कारीगर को सीधा शुद्ध लाभ",
    acceptSuggested: "सुझाया गया मूल्य लागू करें",
    setCustomPrice: "अपनी पसंद का मूल्य रखें",
    pricingRationale: "मूल्य निर्धारण का आर्थिक आधार",

    marketLinkageTitle: "बाज़ार लिंकेज एवं खरीदार मिलान",
    marketLinkageSub: "AI आपके उत्पाद को उपयुक्त खुदरा, बुटीक और निर्यात खरीदारों से जोड़ता है।",
    matchingChannels: "अनुशंसित बिक्री माध्यम",
    matchScore: "मिलान स्कोर",
    shareWhatsApp: "WhatsApp पर खरीदारों को भेजें",
    shareDirectLink: "उत्पाद लिंक कॉपी करें",

    publishTitle: "बहुभाषी प्रकाशन संपन्न",
    publishSuccess: "आपका उत्पाद अंग्रेजी, हिन्दी और तेलुगु में तैयार है!",
    viewInMarketplace: "ग्राहक बाज़ार में देखें",
    publishListing: "बाज़ार में प्रकाशित करें",

    browseCatalog: "कारीगरों का सीधा बाज़ार",
    searchCrafts: "मिट्टी के बर्तन, साड़ियां, लकड़ी के शिल्प, कलाकृतियां खोजें...",
    filterCategory: "शिल्प परंपरा के अनुसार",
    allCategories: "सभी हस्तशिल्प",
    priceRange: "मूल्य सीमा",
    enquireNow: "कारीगर से सीधे संपर्क करें",
    authenticHandmade: "100% प्रमाणित हस्तनिर्मित शिल्प",
    artisanOrigin: "शिल्प की उत्पत्ति",
    sendEnquiryTitle: "मास्टर कारीगर को पूछताछ भेजें",
    buyerName: "आपका नाम या संस्था",
    buyerPhone: "फोन या WhatsApp नंबर",
    buyerQuantity: "आवश्यक मात्रा (संख्या)",
    buyerMessage: "ऑर्डर या विशेष पूछताछ का विवरण",
    submitEnquiry: "सीधी पूछताछ भेजें",
    enquirySentSuccess: "पूछताछ सफलतापूर्वक भेजी गई! कारीगर को सूचित कर दिया गया है।",
    close: "बंद करें",
    back: "पीछे",
    next: "आगे बढ़ें",

    // Landing
    landingHeroTitle: "भारतीय कारीगरों का सशक्तिकरण, बेहतर बाज़ारों से जोड़ना",
    landingHeroSub: "KALAtech AI-संचालित कैटलॉगिंग, उचित मूल्य निर्धारण और प्रत्यक्ष बाज़ार लिंकेज के माध्यम से पारंपरिक शिल्पकला को आधुनिक डिजिटल बाज़ारों से जोड़ता है।",
    choosePortal: "अपना पोर्टल चुनें",
    seller: "विक्रेता",
    buyer: "खरीदार",
    admin: "व्यवस्थापक",
    sellerDesc: "अपने हस्तशिल्प प्रबंधित करें, उत्पाद जोड़ें, बाज़ार मूल्य तुलना करें, बिल बनाएं, ऑर्डर प्रबंधित करें और बिक्री ट्रैक करें।",
    buyerDesc: "प्रामाणिक हस्तशिल्प खोजें, उत्पाद खोजें, कारीगर कहानियां देखें, मूल्य तुलना करें और सीधे खरीदें।",
    adminDesc: "उपयोगकर्ता, विक्रेता, खरीदार, उत्पाद प्रबंधित करें, ऑर्डर की निगरानी करें और विश्लेषण देखें।",
    enterPortal: "पोर्टल में प्रवेश करें",
    howItWorks: "KALAtech कैसे काम करता है",
    howItWorksSellerFlow: "विक्रेता हस्तशिल्प जोड़ता है → बाज़ार मूल्य तुलना → मूल्य निर्धारित करता है → बिल बनाता है → उत्पाद खरीदारों के लिए उपलब्ध",
    howItWorksBuyerFlow: "खरीदार हस्तशिल्प ब्राउज़ करता है → विवरण देखता है → खरीदता है → ऑर्डर ट्रैक करता है",
    howItWorksAdminFlow: "व्यवस्थापक प्लेटफ़ॉर्म की निगरानी करता है → उपयोगकर्ता/उत्पाद/ऑर्डर प्रबंधित करता है → विश्लेषण समीक्षा करता है",
    manageHandicrafts: "हस्तशिल्प प्रबंधित करें",
    addProducts: "उत्पाद जोड़ें",
    compareMarketPrices: "बाज़ार मूल्य तुलना",
    generateBills: "बिल बनाएं",
    manageOrders: "ऑर्डर प्रबंधित करें",
    trackSales: "बिक्री ट्रैक करें",
    discoverHandicrafts: "हस्तशिल्प खोजें",
    searchProducts: "उत्पाद खोजें",
    viewArtisanInfo: "कारीगर जानकारी देखें",
    compareProducts: "उत्पाद और मूल्य तुलना",
    purchaseProducts: "उत्पाद खरीदें",
    trackOrders: "ऑर्डर ट्रैक करें",
    manageUsers: "उपयोगकर्ता प्रबंधित करें",
    manageSellers: "विक्रेता प्रबंधित करें",
    manageBuyers: "खरीदार प्रबंधित करें",
    manageProductsAdmin: "उत्पाद प्रबंधित करें",
    monitorOrders: "ऑर्डर की निगरानी",
    monitorActivity: "गतिविधि की निगरानी",
    viewAnalytics: "विश्लेषण देखें",

    // Seller
    sellerDashboard: "विक्रेता डैशबोर्ड",
    myHandicrafts: "मेरे हस्तशिल्प",
    addHandicraft: "हस्तशिल्प जोड़ें",
    marketPriceAnalysis: "बाज़ार मूल्य विश्लेषण",
    createBill: "बिल बनाएं",
    orders: "ऑर्डर",
    salesHistory: "बिक्री इतिहास",
    profile: "प्रोफ़ाइल",
    customerCare: "ग्राहक सहायता",
    logout: "लॉगआउट",
    totalProducts: "कुल उत्पाद",
    activeProducts: "सक्रिय उत्पाद",
    totalSales: "कुल बिक्री",
    pendingOrders: "लंबित ऑर्डर",
    billsGenerated: "बनाए गए बिल",
    recentOrders: "हाल के ऑर्डर",
    quickActions: "त्वरित कार्रवाई",
    productName: "उत्पाद का नाम",
    productCategory: "उत्पाद श्रेणी",
    artisanName: "कारीगर का नाम",
    craftType: "शिल्प प्रकार",
    description: "विवरण",
    quantity: "मात्रा",
    productionCost: "उत्पादन लागत",
    labourCost: "श्रम लागत",
    materialCost: "सामग्री लागत",
    additionalExpenses: "अतिरिक्त खर्च",
    suggestedSellingPrice: "सुझाया गया बिक्री मूल्य",
    productImage: "उत्पाद छवि",
    location: "स्थान",
    craftOrigin: "शिल्प मूल / राज्य",
    availableStock: "उपलब्ध स्टॉक",
    save: "सहेजें",
    cancel: "रद्द करें",
    edit: "संपादित करें",
    delete: "हटाएं",
    view: "देखें",
    search: "खोजें",
    filter: "फ़िल्टर",
    sort: "क्रमबद्ध",
    actions: "कार्रवाई",
    status: "स्थिति",
    price: "मूल्य",
    date: "तारीख",
    noResults: "कोई परिणाम नहीं मिला",
    confirmDelete: "क्या आप वाकई इसे हटाना चाहते हैं?",
    deleteSuccess: "सफलतापूर्वक हटा दिया गया",
    saveSuccess: "सफलतापूर्वक सहेजा गया",
    required: "यह फ़ील्ड आवश्यक है",
    invalidValue: "अमान्य मान",
    mustBePositive: "मान 0 से अधिक होना चाहिए",

    // Bill
    billTitle: "हस्तशिल्प बिल / चालान",
    invoiceNumber: "चालान संख्या",
    billDate: "बिल तिथि",
    sellerInfo: "विक्रेता जानकारी",
    productDetails: "उत्पाद विवरण",
    costBreakdown: "लागत विवरण",
    transportationCost: "परिवहन लागत",
    otherExpenses: "अन्य खर्च",
    totalCost: "कुल लागत",
    proposedPrice: "प्रस्तावित मूल्य",
    finalSellingPrice: "अंतिम बिक्री मूल्य",
    profitLabel: "लाभ",
    profitPercentage: "लाभ प्रतिशत",
    marketPriceSection: "बाज़ार मूल्य विश्लेषण",
    marketMinPrice: "बाज़ार न्यूनतम",
    marketAvgPrice: "बाज़ार औसत",
    marketMaxPrice: "बाज़ार अधिकतम",
    aiRecommendedPrice: "AI अनुशंसित मूल्य",
    finalizeBill: "बिल अंतिम करें",
    printBill: "बिल प्रिंट करें",
    downloadBill: "बिल डाउनलोड करें",
    billFinalized: "बिल सफलतापूर्वक अंतिम किया गया!",
    previewBill: "बिल पूर्वावलोकन",
    adjustPrice: "मूल्य समायोजित करें",
    selectHandicraft: "हस्तशिल्प चुनें",
    enterCostDetails: "लागत विवरण दर्ज करें",
    enterProposedPrice: "प्रस्तावित मूल्य दर्ज करें",
    reviewRecommendation: "सिफारिश समीक्षा करें",
    confirmFinalize: "पुष्टि करें और अंतिम करें",
    priceRecommendation: "मूल्य सिफारिश",
    priceRecommendationText: "बाज़ार विश्लेषण के आधार पर, प्रतिस्पर्धात्मकता और कारीगर लाभ के इष्टतम संतुलन के लिए हम ₹{min} से ₹{max} के बीच मूल्य की सिफारिश करते हैं।",
    financialSummary: "वित्तीय सारांश",
    totalAmount: "कुल राशि",

    // Market
    yourCost: "आपकी लागत",
    yourProposedPrice: "आपका प्रस्तावित मूल्य",
    marketComparison: "बाज़ार तुलना",
    priceTrend: "मूल्य रुझान",
    competitiveAnalysis: "प्रतिस्पर्धी विश्लेषण",
    demoDataNotice: "नोट: दिखाया गया बाज़ार डेटा प्रदर्शन उद्देश्यों के लिए क्यूरेटेड डेमो डेटासेट से है।",
    belowMarket: "बाज़ार औसत से नीचे",
    atMarket: "बाज़ार औसत पर",
    aboveMarket: "बाज़ार औसत से ऊपर",

    // Buyer
    buyerHome: "खरीदार होम",
    products: "उत्पाद",
    categories: "श्रेणियां",
    wishlist: "इच्छा सूची",
    cart: "कार्ट",
    newArrivals: "नए उत्पाद",
    popularProducts: "लोकप्रिय उत्पाद",
    recommendedForYou: "आपके लिए अनुशंसित",
    addToCart: "कार्ट में जोड़ें",
    buyNow: "अभी खरीदें",
    addToWishlist: "इच्छा सूची में जोड़ें",
    removeFromWishlist: "इच्छा सूची से हटाएं",
    contactSeller: "विक्रेता से संपर्क करें",
    viewDetails: "विवरण देखें",
    productInfo: "उत्पाद जानकारी",
    artisanInfo: "कारीगर जानकारी",
    authenticity: "प्रामाणिकता और प्रमाणन",
    availableQty: "उपलब्ध मात्रा",
    cartEmpty: "आपकी कार्ट खाली है",
    cartSummary: "कार्ट सारांश",
    proceedToCheckout: "चेकआउट पर जाएं",
    removeFromCart: "हटाएं",
    orderPlaced: "ऑर्डर सफलतापूर्वक दिया गया!",
    orderStatus: "ऑर्डर स्थिति",
    orderDate: "ऑर्डर तिथि",
    orderTotal: "ऑर्डर कुल",
    orderTracking: "ऑर्डर ट्रैकिंग",
    orderCreated: "ऑर्डर बनाया गया",
    orderPaid: "भुगतान पुष्टि",
    orderShipped: "भेज दिया गया",
    orderDelivered: "वितरित",
    wishlistEmpty: "आपकी इच्छा सूची खाली है",
    moveToCart: "कार्ट में ले जाएं",

    // Admin
    adminDashboard: "व्यवस्थापक डैशबोर्ड",
    sellers: "विक्रेता",
    buyers: "खरीदार",
    handicrafts: "हस्तशिल्प",
    bills: "बिल",
    marketPrices: "बाज़ार मूल्य",
    reports: "रिपोर्ट",
    analytics: "विश्लेषण",
    settings: "सेटिंग्स",
    totalUsersLabel: "कुल उपयोगकर्ता",
    totalSellersLabel: "कुल विक्रेता",
    totalBuyersLabel: "कुल खरीदार",
    totalHandicraftsLabel: "कुल हस्तशिल्प",
    totalOrdersLabel: "कुल ऑर्डर",
    totalSalesLabel: "कुल बिक्री",
    pendingApprovalsLabel: "लंबित अनुमोदन",
    salesTrend: "बिक्री रुझान",
    categoryDistribution: "श्रेणी वितरण",
    topSellers: "शीर्ष विक्रेता",
    recentActivity: "हाल की गतिविधि",
    revenue: "राजस्व",

    // Customer Care
    customerCareTitle: "AI ग्राहक सहायता",
    typeMessage: "अपना संदेश लिखें...",
    sendMessage: "भेजें",
    clearChat: "चैट साफ करें",
    suggestedQuestions: "सुझाए गए प्रश्न",
    aiThinking: "AI सोच रहा है...",
    welcomeMessage: "नमस्ते! मैं KALAtech का AI सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",

    // Common
    loading: "लोड हो रहा है...",
    error: "कुछ गलत हो गया",
    retry: "पुनः प्रयास करें",
    noData: "कोई डेटा उपलब्ध नहीं",
    comingSoon: "जल्द आ रहा है",
    poweredBy: "Gemini AI द्वारा संचालित",
    fairTrade: "फेयर ट्रेड सत्यापित",
    giCertified: "GI प्रमाणित",
    handmade: "हस्तनिर्मित",
    verified: "सत्यापित",
    home: "होम",
    about: "परिचय",
  },

  te: {
    appName: "KALAtech",
    tagline: "చేతివృత్తి కళాకారుల కోసం AI మార్కెట్ లింకేజ్ & స్మార్ట్ క్యాటలాగ్",
    forArtisans: "కళాకారుల స్టూడియో (Artisan)",
    forBuyers: "కొనుగోలుదారుల మార్కెట్ (Buyer)",
    evaluatorDefense: "AI ఆడిట్ & డేటా ఆధారం",
    selectLanguage: "భాష ఎంచుకోండి",
    english: "English",
    hindi: "हिन्दी (Hindi)",
    telugu: "తెలుగు (Telugu)",
    audioGuide: "ఆడియో సహాయం",
    listening: "వింటున్నారు...",
    listenToGuide: "సూచనలను వినడానికి నొక్కండి",
    stopAudio: "ఆడియో ఆపు",

    welcomeTitle: "గ్రామీణ చేతివృత్తి కళాకారుల సాధికారత",
    welcomeSub: "మీ చేతివృత్తి వస్తువుల ఫోటో తీయండి - కొద్ది నిమిషాల్లో బహుభాషా క్యాటలాగ్ మరియు న్యాయమైన ధరను పొందండి.",
    enterPhone: "మొబైల్ ఫోన్ నంబర్",
    sendOtp: "OTP పంపండి",
    enterOtp: "6 అంకెల OTP నమోదు చేయండి",
    verifyOtp: "ధృవీకరించి స్టూడియోలోకి వెళ్లండి",
    resendOtp: "మళ్ళీ పంపండి (డెమో: 123456)",
    artisanDetails: "కళాకారుల ప్రొఫైల్ సెటప్",
    fullName: "మీ పూర్తి పేరు",
    craftCategory: "చేతివృత్తి సంప్రదాయం",
    stateDistrict: "మీ గ్రామం / ప్రాంతం",
    state: "రాష్ట్రం",
    district: "జిల్లా",
    yearsOfExperience: "చేతివృత్తి అనుభవం (సంవత్సరాలు)",
    completeProfile: "స్టూడియో తెరవండి",

    myArtisanStudio: "కళాకారుల వర్క్‌షాప్ డాష్‌బోర్డ్",
    publishedProducts: "విక్రయానికి సిద్ధంగా ఉన్నవి",
    draftProducts: "డ్రాఫ్ట్ వస్తువులు",
    buyerEnquiries: "కొనుగోలుదారుల విచారణలు",
    incomeImpactTitle: "నేరుగా మార్కెట్ ద్వారా వచ్చిన అదనపు ఆదాయం",
    middlemanComparison: "దళారీల కంటే కళాకారుడికి దక్కిన అదనపు లాభం",
    addNewCraft: "కొత్త చేతిపని వస్తువును చేర్చండి",
    viewEnquiries: "కొనుగోలుదారుల సందేశాలు చూడండి",
    noProductsYet: "ఇంకా ఏ ఉత్పత్తులు చేర్చబడలేదు",
    startFirstListing: "స్మార్ట్ క్యాటలాగింగ్ ప్రారంభించడానికి మీ వస్తువు ఫోటో తీయండి",

    stepPhoto: "1. ఫోటో",
    stepEnhance: "2. మెరుగుపరచండి",
    stepCatalog: "3. వివరాలు",
    stepPricing: "4. సరసమైన ధర",
    stepLinkage: "5. కొనుగోలుదారులు",
    stepPublish: "6. ప్రచురించండి",

    captureOrUpload: "వస్తువు ఫోటో తీయండి లేదా అప్‌లోడ్ చేయండి",
    takePhoto: "కెమెరా తెరవండి",
    uploadGallery: "గ్యాలరీ నుండి ఎంచుకోండి",
    orTrySampleCrafts: "లేదా ఈ ప్రసిద్ధ సాంప్రదాయ కళా నమూనాలను పరీక్షించండి:",

    aiEnhancementTitle: "AI ఫోటో స్టూడియో మెరుగుదల",
    aiEnhancementSub: "నీడలను తొలగిస్తుంది, రంగులను ప్రకాశవంతం చేస్తుంది మరియు నేపథ్యాన్ని శుభ్రపరుస్తుంది.",
    before: "అసలు ఫోటో (Before)",
    after: "AI మెరుగుపరిచిన ఫోటో (After)",
    enhancementApplied: "స్టూడియో వెలుతురు & స్పష్టత వర్తించబడింది",
    originalUnmodified: "కెమెరా నుండి నేరుగా వచ్చిన ఫోటో",

    smartCatalogTitle: "AI స్మార్ట్ క్యాటలాగ్ సృష్టికర్త",
    smartCatalogSub: "Gemini AI ఫోటోను విశ్లేషించి శీర్షిక, సంప్రదాయ కథనం, ముడిసరుకు వివరాలను ఆటోమేటిక్‌గా ఇస్తుంది.",
    productTitle: "వస్తువు పేరు",
    productDesc: "సాంప్రదాయ వారసత్వం & తయారీ వివరణ",
    material: "ఉపయోగించిన సాంప్రదాయ ముడిసరుకు",
    estDimensions: "అంచనా కొలతలు / పరిమాణం",
    tags: ["చేతిపని", "సాంప్రదాయం", "వారసత్వం"],
    aiGeneratedBadge: "AI అందించిన వివరాలు — మీరు సవరించవచ్చు",
    voiceDictate: "మాట్లాడి నమోదు చేయండి (వాయిస్ టైపింగ్)",

    smartPricingTitle: "న్యాయమైన ఆర్థిక ధర గణన",
    smartPricingSub: "మీ ఖర్చులు మరియు మార్కెట్ ధరలను పోల్చి సరసమైన ధర పరిధిని నిర్ణయిస్తుంది.",
    rawMaterialCost: "ముడిసరుకు ఖర్చు (₹)",
    laborHours: "వస్తువు తయారీకి పట్టిన గంటలు",
    fairHourlyWage: "గంటకు న్యాయమైన కూలి (₹/గం)",
    suggestedFairRange: "సిఫార్సు చేయబడిన సరసమైన మార్కెట్ ధర పరిధి",
    recommendedPrice: "సరైన లక్ష్య ధర",
    middlemanPayout: "సాధారణంగా దళారీ ఇచ్చే మొత్తం",
    fairMarketGain: "కళాకారుడికి దక్కే అదనపు లాభం",
    acceptSuggested: "సిఫార్సు చేసిన ధరను వర్తింపజేయండి",
    setCustomPrice: "మీకు కావలసిన ధరను నిర్ణయించండి",
    pricingRationale: "ధర నిర్ణయానికి ఆర్థిక కారణం",

    marketLinkageTitle: "మార్కెట్ లింకేజ్ & కొనుగోలుదారుల అనుసంధానం",
    marketLinkageSub: "ఈ చేతిపనికి సరిపోయే ఉత్తమ దుకాణాలు, బొటిక్‌లు మరియు ఎగుమతి ఛానెళ్లను AI కనుగొంటుంది.",
    matchingChannels: "సిఫార్సు చేయబడిన అమ్మకపు మార్గాలు",
    matchScore: "సరిపోలిక స్కోరు",
    shareWhatsApp: "WhatsApp ద్వారా పంపండి",
    shareDirectLink: "లింక్ కాపీ చేయండి",

    publishTitle: "బహుభాషా ప్రచురణ పూర్తయింది",
    publishSuccess: "మీ వస్తువు ఇంగ్లీష్, హిందీ మరియు తెలుగులో సిద్ధంగా ఉంది!",
    viewInMarketplace: "కొనుగోలుదారుల మార్కెట్‌లో చూడండి",
    publishListing: "మార్కెట్‌లోకి విడుదల చేయండి",

    browseCatalog: "కళాకారుల ప్రత్యక్ష మార్కెట్",
    searchCrafts: "మట్టి పాత్రలు, పోచంపల్లి ఇక్కత్, చెక్క బొమ్మలు, చేతివృత్తులు వెతకండి...",
    filterCategory: "సంప్రదాయ విభాగం",
    allCategories: "అన్ని రకాలు",
    priceRange: "ధర పరిధి",
    enquireNow: "కళాకారుడిని నేరుగా సంప్రదించండి",
    authenticHandmade: "100% ప్రామాణిక చేతితో చేసిన వస్తువు",
    artisanOrigin: "కళ పుట్టిన ప్రాంతం",
    sendEnquiryTitle: "కళాకారునికి విచారణ సందేశం పంపండి",
    buyerName: "మీ పేరు లేదా సంస్థ",
    buyerPhone: "ఫోన్ లేదా WhatsApp నంబర్",
    buyerQuantity: "కావలసిన పరిమాణం (యూనిట్లు)",
    buyerMessage: "ఆర్డర్ వివరాలు లేదా ప్రత్యేక అభ్యర్థన",
    submitEnquiry: "సందేశం పంపండి",
    enquirySentSuccess: "సందేశం విజయవంతంగా పంపబడింది! కళాకారుడికి సమాచారం అందింది.",
    close: "మూసివేయి",
    back: "వెనుకకు",
    next: "తదుపరి",

    // Landing
    landingHeroTitle: "భారతీయ కళాకారులను బలపరచడం, మెరుగైన మార్కెట్లకు అనుసంధానం",
    landingHeroSub: "KALAtech AI-ఆధారిత క్యాటలాగింగ్, సరసమైన ధర నిర్ణయం మరియు ప్రత్యక్ష మార్కెట్ లింకేజ్ ద్వారా సాంప్రదాయ చేతివృత్తిని ఆధునిక డిజిటల్ మార్కెట్లతో అనుసంధానం చేస్తుంది.",
    choosePortal: "మీ పోర్టల్ ఎంచుకోండి",
    seller: "విక్రేత",
    buyer: "కొనుగోలుదారు",
    admin: "అడ్మిన్",
    sellerDesc: "మీ చేతివృత్తులను నిర్వహించండి, ఉత్పత్తులు జోడించండి, మార్కెట్ ధరలు పోల్చండి, బిల్లులు తయారు చేయండి, ఆర్డర్లను నిర్వహించండి మరియు అమ్మకాలను ట్రాక్ చేయండి.",
    buyerDesc: "ప్రామాణిక చేతివృత్తులను కనుగొనండి, ఉత్పత్తులను వెతకండి, కళాకారుల కథలు చూడండి, ధరలు పోల్చండి మరియు నేరుగా కొనుగోలు చేయండి.",
    adminDesc: "వినియోగదారులు, విక్రేతలు, కొనుగోలుదారులు, ఉత్పత్తులను నిర్వహించండి, ఆర్డర్లను పర్యవేక్షించండి మరియు విశ్లేషణలు చూడండి.",
    enterPortal: "పోర్టల్‌లోకి ప్రవేశించండి",
    howItWorks: "KALAtech ఎలా పని చేస్తుంది",
    howItWorksSellerFlow: "విక్రేత చేతివృత్తిని జోడిస్తారు → మార్కెట్ ధర పోలిక → ధరను ఖరారు చేస్తారు → బిల్లు తయారు చేస్తారు → ఉత్పత్తి కొనుగోలుదారులకు అందుబాటులో ఉంటుంది",
    howItWorksBuyerFlow: "కొనుగోలుదారు చేతివృత్తులను బ్రౌజ్ చేస్తారు → వివరాలు చూస్తారు → కొనుగోలు చేస్తారు → ఆర్డర్ ట్రాక్ చేస్తారు",
    howItWorksAdminFlow: "అడ్మిన్ ప్లాట్‌ఫారమ్‌ను పర్యవేక్షిస్తారు → వినియోగదారులు/ఉత్పత్తులు/ఆర్డర్లను నిర్వహిస్తారు → విశ్లేషణలను సమీక్షిస్తారు",
    manageHandicrafts: "చేతివృత్తులను నిర్వహించండి",
    addProducts: "ఉత్పత్తులు జోడించండి",
    compareMarketPrices: "మార్కెట్ ధరలు పోల్చండి",
    generateBills: "బిల్లులు తయారు చేయండి",
    manageOrders: "ఆర్డర్లను నిర్వహించండి",
    trackSales: "అమ్మకాలను ట్రాక్ చేయండి",
    discoverHandicrafts: "చేతివృత్తులను కనుగొనండి",
    searchProducts: "ఉత్పత్తులను వెతకండి",
    viewArtisanInfo: "కళాకారుల సమాచారం చూడండి",
    compareProducts: "ఉత్పత్తులు & ధరలు పోల్చండి",
    purchaseProducts: "ఉత్పత్తులను కొనుగోలు చేయండి",
    trackOrders: "ఆర్డర్లను ట్రాక్ చేయండి",
    manageUsers: "వినియోగదారులను నిర్వహించండి",
    manageSellers: "విక్రేతలను నిర్వహించండి",
    manageBuyers: "కొనుగోలుదారులను నిర్వహించండి",
    manageProductsAdmin: "ఉత్పత్తులను నిర్వహించండి",
    monitorOrders: "ఆర్డర్లను పర్యవేక్షించండి",
    monitorActivity: "కార్యకలాపాలను పర్యవేక్షించండి",
    viewAnalytics: "విశ్లేషణలు చూడండి",

    // Seller
    sellerDashboard: "విక్రేత డాష్‌బోర్డ్",
    myHandicrafts: "నా చేతివృత్తులు",
    addHandicraft: "చేతివృత్తి జోడించండి",
    marketPriceAnalysis: "మార్కెట్ ధర విశ్లేషణ",
    createBill: "బిల్లు తయారు చేయండి",
    orders: "ఆర్డర్లు",
    salesHistory: "అమ్మకాల చరిత్ర",
    profile: "ప్రొఫైల్",
    customerCare: "కస్టమర్ కేర్",
    logout: "లాగ్అవుట్",
    totalProducts: "మొత్తం ఉత్పత్తులు",
    activeProducts: "సక్రియ ఉత్పత్తులు",
    totalSales: "మొత్తం అమ్మకాలు",
    pendingOrders: "పెండింగ్ ఆర్డర్లు",
    billsGenerated: "తయారు చేసిన బిల్లులు",
    recentOrders: "ఇటీవల ఆర్డర్లు",
    quickActions: "త్వరిత చర్యలు",
    productName: "ఉత్పత్తి పేరు",
    productCategory: "ఉత్పత్తి విభాగం",
    artisanName: "కళాకారుని పేరు",
    craftType: "చేతివృత్తి రకం",
    description: "వివరణ",
    quantity: "పరిమాణం",
    productionCost: "ఉత్పత్తి ఖర్చు",
    labourCost: "శ్రమ ఖర్చు",
    materialCost: "ముడిసరుకు ఖర్చు",
    additionalExpenses: "అదనపు ఖర్చులు",
    suggestedSellingPrice: "సూచించిన అమ్మకం ధర",
    productImage: "ఉత్పత్తి చిత్రం",
    location: "స్థానం",
    craftOrigin: "చేతివృత్తి మూలం / రాష్ట్రం",
    availableStock: "అందుబాటులో ఉన్న స్టాక్",
    save: "సేవ్ చేయండి",
    cancel: "రద్దు చేయండి",
    edit: "సవరించండి",
    delete: "తొలగించండి",
    view: "చూడండి",
    search: "వెతకండి",
    filter: "ఫిల్టర్",
    sort: "క్రమం",
    actions: "చర్యలు",
    status: "స్థితి",
    price: "ధర",
    date: "తేదీ",
    noResults: "ఫలితాలు కనుగొనబడలేదు",
    confirmDelete: "మీరు దీన్ని తొలగించాలనుకుంటున్నారా?",
    deleteSuccess: "విజయవంతంగా తొలగించబడింది",
    saveSuccess: "విజయవంతంగా సేవ్ చేయబడింది",
    required: "ఈ ఫీల్డ్ అవసరం",
    invalidValue: "చెల్లని విలువ",
    mustBePositive: "విలువ 0 కంటే ఎక్కువ ఉండాలి",

    // Bill
    billTitle: "చేతివృత్తి బిల్లు / ఇన్వాయిస్",
    invoiceNumber: "ఇన్వాయిస్ నంబర్",
    billDate: "బిల్లు తేదీ",
    sellerInfo: "విక్రేత సమాచారం",
    productDetails: "ఉత్పత్తి వివరాలు",
    costBreakdown: "ఖర్చుల వివరాలు",
    transportationCost: "రవాణా ఖర్చు",
    otherExpenses: "ఇతర ఖర్చులు",
    totalCost: "మొత్తం ఖర్చు",
    proposedPrice: "ప్రతిపాదిత ధర",
    finalSellingPrice: "తుది అమ్మకం ధర",
    profitLabel: "లాభం",
    profitPercentage: "లాభ శాతం",
    marketPriceSection: "మార్కెట్ ధర విశ్లేషణ",
    marketMinPrice: "మార్కెట్ కనిష్టం",
    marketAvgPrice: "మార్కెట్ సగటు",
    marketMaxPrice: "మార్కెట్ గరిష్టం",
    aiRecommendedPrice: "AI సిఫార్సు ధర",
    finalizeBill: "బిల్లును ఖరారు చేయండి",
    printBill: "బిల్లు ప్రింట్ చేయండి",
    downloadBill: "బిల్లు డౌన్‌లోడ్ చేయండి",
    billFinalized: "బిల్లు విజయవంతంగా ఖరారు చేయబడింది!",
    previewBill: "బిల్లు ప్రివ్యూ",
    adjustPrice: "ధరను సర్దుబాటు చేయండి",
    selectHandicraft: "చేతివృత్తిని ఎంచుకోండి",
    enterCostDetails: "ఖర్చు వివరాలు నమోదు చేయండి",
    enterProposedPrice: "ప్రతిపాదిత ధరను నమోదు చేయండి",
    reviewRecommendation: "సిఫార్సు సమీక్షించండి",
    confirmFinalize: "నిర్ధారించి ఖరారు చేయండి",
    priceRecommendation: "ధర సిఫార్సు",
    priceRecommendationText: "మార్కెట్ విశ్లేషణ ఆధారంగా, పోటీ మరియు కళాకారుల లాభం యొక్క సరైన సమతుల్యత కోసం ₹{min} నుండి ₹{max} మధ్య ధరను సిఫార్సు చేస్తున్నాము.",
    financialSummary: "ఆర్థిక సారాంశం",
    totalAmount: "మొత్తం మొత్తం",

    // Market
    yourCost: "మీ ఖర్చు",
    yourProposedPrice: "మీ ప్రతిపాదిత ధర",
    marketComparison: "మార్కెట్ పోలిక",
    priceTrend: "ధర ధోరణి",
    competitiveAnalysis: "పోటీ విశ్లేషణ",
    demoDataNotice: "గమనిక: చూపబడిన మార్కెట్ డేటా ప్రదర్శన ప్రయోజనాల కోసం క్యూరేటెడ్ డెమో డేటాసెట్ల నుండి.",
    belowMarket: "మార్కెట్ సగటు కంటే తక్కువ",
    atMarket: "మార్కెట్ సగటులో",
    aboveMarket: "మార్కెట్ సగటు కంటే ఎక్కువ",

    // Buyer
    buyerHome: "కొనుగోలుదారు హోమ్",
    products: "ఉత్పత్తులు",
    categories: "విభాగాలు",
    wishlist: "విష్ లిస్ట్",
    cart: "కార్ట్",
    newArrivals: "కొత్త రాకలు",
    popularProducts: "జనాదరణ పొందిన ఉత్పత్తులు",
    recommendedForYou: "మీ కోసం సిఫార్సు",
    addToCart: "కార్ట్‌కు జోడించండి",
    buyNow: "ఇప్పుడే కొనండి",
    addToWishlist: "విష్ లిస్ట్‌కు జోడించండి",
    removeFromWishlist: "విష్ లిస్ట్ నుండి తొలగించండి",
    contactSeller: "విక్రేతను సంప్రదించండి",
    viewDetails: "వివరాలు చూడండి",
    productInfo: "ఉత్పత్తి సమాచారం",
    artisanInfo: "కళాకారుల సమాచారం",
    authenticity: "ప్రామాణికత & ధృవీకరణ",
    availableQty: "అందుబాటులో ఉన్న పరిమాణం",
    cartEmpty: "మీ కార్ట్ ఖాళీగా ఉంది",
    cartSummary: "కార్ట్ సారాంశం",
    proceedToCheckout: "చెకౌట్‌కు కొనసాగండి",
    removeFromCart: "తొలగించండి",
    orderPlaced: "ఆర్డర్ విజయవంతంగా ఇవ్వబడింది!",
    orderStatus: "ఆర్డర్ స్థితి",
    orderDate: "ఆర్డర్ తేదీ",
    orderTotal: "ఆర్డర్ మొత్తం",
    orderTracking: "ఆర్డర్ ట్రాకింగ్",
    orderCreated: "ఆర్డర్ సృష్టించబడింది",
    orderPaid: "చెల్లింపు నిర్ధారణ",
    orderShipped: "షిప్ చేయబడింది",
    orderDelivered: "డెలివరీ అయింది",
    wishlistEmpty: "మీ విష్ లిస్ట్ ఖాళీగా ఉంది",
    moveToCart: "కార్ట్‌కు తరలించండి",

    // Admin
    adminDashboard: "అడ్మిన్ డాష్‌బోర్డ్",
    sellers: "విక్రేతలు",
    buyers: "కొనుగోలుదారులు",
    handicrafts: "చేతివృత్తులు",
    bills: "బిల్లులు",
    marketPrices: "మార్కెట్ ధరలు",
    reports: "నివేదికలు",
    analytics: "విశ్లేషణలు",
    settings: "సెట్టింగ్‌లు",
    totalUsersLabel: "మొత్తం వినియోగదారులు",
    totalSellersLabel: "మొత్తం విక్రేతలు",
    totalBuyersLabel: "మొత్తం కొనుగోలుదారులు",
    totalHandicraftsLabel: "మొత్తం చేతివృత్తులు",
    totalOrdersLabel: "మొత్తం ఆర్డర్లు",
    totalSalesLabel: "మొత్తం అమ్మకాలు",
    pendingApprovalsLabel: "పెండింగ్ ఆమోదాలు",
    salesTrend: "అమ్మకాల ధోరణి",
    categoryDistribution: "విభాగ పంపిణీ",
    topSellers: "అగ్ర విక్రేతలు",
    recentActivity: "ఇటీవల కార్యకలాపాలు",
    revenue: "ఆదాయం",

    // Customer Care
    customerCareTitle: "AI కస్టమర్ కేర్",
    typeMessage: "మీ సందేశాన్ని టైప్ చేయండి...",
    sendMessage: "పంపండి",
    clearChat: "చాట్ క్లియర్ చేయండి",
    suggestedQuestions: "సూచించిన ప్రశ్నలు",
    aiThinking: "AI ఆలోచిస్తోంది...",
    welcomeMessage: "హలో! నేను KALAtech AI సహాయకుడిని. ఈ రోజు మీకు ఎలా సహాయం చేయగలను?",

    // Common
    loading: "లోడ్ అవుతోంది...",
    error: "ఏదో తప్పు జరిగింది",
    retry: "మళ్ళీ ప్రయత్నించండి",
    noData: "డేటా అందుబాటులో లేదు",
    comingSoon: "త్వరలో వస్తుంది",
    poweredBy: "Gemini AI ద్వారా ఆధారితం",
    fairTrade: "ఫెయిర్ ట్రేడ్ ధృవీకరించబడింది",
    giCertified: "GI ధృవీకరించబడింది",
    handmade: "చేతితో చేసిన",
    verified: "ధృవీకరించబడింది",
    home: "హోమ్",
    about: "గురించి",
  }
};

export function speakText(text: string, lang: LanguageCode = 'en') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (lang === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (lang === 'te') {
      utterance.lang = 'te-IN';
    } else {
      utterance.lang = 'en-IN';
    }
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error('Speech synthesis error:', e);
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
