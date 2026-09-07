import React, { useState, useRef, useEffect } from 'react';
import {
  Camera, Upload, Sparkles, CheckCircle2, ArrowRight, ArrowLeft,
  Sliders, Mic, MicOff, DollarSign, TrendingUp, Share2, Tag,
  ExternalLink, Layers, Eye, RefreshCw, AlertCircle, ShoppingBag, Globe2,
  Wifi, WifiOff, QrCode, FileText, Trash2
} from 'lucide-react';
import { LanguageCode, Product, Artisan, BuyerChannelMatch, PriceRecommendation } from '../types';
import { translations, speakText } from '../lib/i18n';
import { DEMO_PRESET_CRAFTS } from '../data/seedData';
import { ProvenanceTagModal } from './ProvenanceTagModal';

interface ProductCreationWizardProps {
  artisan: Artisan;
  language: LanguageCode;
  onFinished: (product: Product) => void;
  onCancel: () => void;
}

export const ProductCreationWizard: React.FC<ProductCreationWizardProps> = ({
  artisan,
  language,
  onFinished,
  onCancel
}) => {
  const t = translations[language];

  // Steps: 1: photo -> 2: enhance -> 3: catalog -> 4: pricing -> 5: linkage -> 6: publish
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Offline draft caching (T21)
  const [hasSavedDraft, setHasSavedDraft] = useState<boolean>(false);
  const [savedDraftTimestamp, setSavedDraftTimestamp] = useState<string>('');
  const [isOfflineSimulated, setIsOfflineSimulated] = useState<boolean>(false);
  const [showProvenanceModal, setShowProvenanceModal] = useState<boolean>(false);

  // Active product state
  const [productId, setProductId] = useState<string | null>(null);
  const [rawImage, setRawImage] = useState<string>('');
  const [enhancedImage, setEnhancedImage] = useState<string>('');
  const [showEnhancedToggle, setShowEnhancedToggle] = useState<boolean>(true);

  // Catalog fields (Step 3)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(artisan.category || 'Weaving');
  const [subcategory, setSubcategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [material, setMaterial] = useState('');
  const [estDimensions, setEstDimensions] = useState('');
  const [weight, setWeight] = useState('');

  // Voice dictation state
  const [isRecording, setIsRecording] = useState(false);

  // Pricing fields (Step 4)
  const [materialCost, setMaterialCost] = useState<number>(850);
  const [laborHours, setLaborHours] = useState<number>(18);
  const [hourlyWage, setHourlyWage] = useState<number>(85);
  const [pricingRec, setPricingRec] = useState<PriceRecommendation | null>(null);
  const [finalPrice, setFinalPrice] = useState<number>(2400);

  // Market Linkage (Step 5)
  const [channelMatches, setChannelMatches] = useState<BuyerChannelMatch[]>([]);

  // Published product (Step 6)
  const [publishedProduct, setPublishedProduct] = useState<Product | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for offline saved draft on mount (T21)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('antigravity_artisan_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.rawImage || parsed.title)) {
          setHasSavedDraft(true);
          setSavedDraftTimestamp(parsed.savedAt || new Date().toISOString());
        }
      }
    } catch (e) {
      console.warn('Draft retrieval error', e);
    }
  }, []);

  // Auto-save draft changes to localStorage for offline resilience
  useEffect(() => {
    if (rawImage || title || description) {
      const draft = {
        currentStep,
        productId,
        rawImage,
        enhancedImage,
        title,
        description,
        category,
        subcategory,
        tags,
        material,
        estDimensions,
        weight,
        materialCost,
        laborHours,
        hourlyWage,
        finalPrice,
        savedAt: new Date().toISOString()
      };
      try {
        localStorage.setItem('antigravity_artisan_draft', JSON.stringify(draft));
      } catch (e) {
        // quota exceeded / private mode
      }
    }
  }, [currentStep, productId, rawImage, enhancedImage, title, description, category, tags, material, estDimensions, materialCost, laborHours, hourlyWage, finalPrice]);

  const resumeSavedDraft = () => {
    try {
      const saved = localStorage.getItem('antigravity_artisan_draft');
      if (saved) {
        const d = JSON.parse(saved);
        if (d.productId) setProductId(d.productId);
        if (d.rawImage) setRawImage(d.rawImage);
        if (d.enhancedImage) setEnhancedImage(d.enhancedImage);
        if (d.title) setTitle(d.title);
        if (d.description) setDescription(d.description);
        if (d.category) setCategory(d.category);
        if (d.subcategory) setSubcategory(d.subcategory);
        if (d.tags) setTags(d.tags);
        if (d.material) setMaterial(d.material);
        if (d.estDimensions) setEstDimensions(d.estDimensions);
        if (d.weight) setWeight(d.weight);
        if (d.materialCost) setMaterialCost(d.materialCost);
        if (d.laborHours) setLaborHours(d.laborHours);
        if (d.hourlyWage) setHourlyWage(d.hourlyWage);
        if (d.finalPrice) setFinalPrice(d.finalPrice);
        if (d.currentStep) setCurrentStep(d.currentStep);
        setHasSavedDraft(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const discardSavedDraft = () => {
    localStorage.removeItem('antigravity_artisan_draft');
    setHasSavedDraft(false);
  };

  // STEP 1: Handle Image Selection or Preset
  const handleSelectPreset = (preset: typeof DEMO_PRESET_CRAFTS[0]) => {
    setRawImage(preset.image_url);
    setEnhancedImage(preset.image_url);
    setCategory(preset.category);
    setMaterialCost(preset.cost.material_cost);
    setLaborHours(preset.cost.labor_hours);
    setHourlyWage(preset.cost.hourly_rate);
    createDraftProduct(preset.image_url, preset.category, preset.cost);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setRawImage(dataUrl);
        setEnhancedImage(dataUrl);
        createDraftProduct(dataUrl, category, {
          material_cost: materialCost,
          labor_hours: laborHours,
          hourly_rate: hourlyWage,
          other_cost: 100
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const createDraftProduct = async (
    imgUrl: string,
    cat: string,
    cost: { material_cost: number; labor_hours: number; hourly_rate: number; other_cost?: number }
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imgUrl,
          artisan_id: artisan.id,
          artisan_name: artisan.name,
          artisan_category: artisan.category,
          artisan_district: artisan.district,
          artisan_state: artisan.state,
          category_hint: cat,
          cost
        })
      });
      const data = await res.json();
      if (res.ok && data.product_id) {
        setProductId(data.product_id);
        setCurrentStep(2); // Proceed to Enhancement preview
      } else {
        setError(data.error || 'Failed to create draft');
      }
    } catch (err: any) {
      setError('Network error while creating draft');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 -> 3: Run Enhancement & Generate Catalog
  const handleEnhanceAndProceedToCatalog = async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Call image enhance
      await fetch(`/api/v1/products/${productId}/enhance`, { method: 'POST' });

      // 2. Call multimodal catalog generation
      const catRes = await fetch(`/api/v1/products/${productId}/generate-catalog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_hint: category,
          region: `${artisan.district}, ${artisan.state}`
        })
      });
      const catData = await catRes.json();

      if (catRes.ok) {
        setTitle(catData.title || '');
        setDescription(catData.description || '');
        setCategory(catData.category || category);
        setSubcategory(catData.subcategory || '');
        setTags(catData.tags || ['Handmade', category]);
        setMaterial(catData.material || '');
        setEstDimensions(catData.est_dimensions || '');
        setWeight(catData.weight || '');
        setCurrentStep(3);
      } else {
        setError(catData.error || 'Failed to analyze craft');
        setCurrentStep(3); // allow manual entry fallback
      }
    } catch (err) {
      setCurrentStep(3);
    } finally {
      setLoading(false);
    }
  };

  // Voice dictation simulation/Web Speech Recognition
  const toggleVoiceDictation = () => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN';

        if (!isRecording) {
          setIsRecording(true);
          recognition.start();
          recognition.onresult = (event: any) => {
            const spokenText = event.results[0][0].transcript;
            setDescription((prev) => prev ? `${prev} ${spokenText}` : spokenText);
            setIsRecording(false);
          };
          recognition.onerror = () => setIsRecording(false);
          recognition.onend = () => setIsRecording(false);
        } else {
          recognition.stop();
          setIsRecording(false);
        }
        return;
      } catch (e) {
        console.warn('Speech recognition not available', e);
      }
    }

    // Fallback dictation prompt for low-literacy demo
    setIsRecording(true);
    setTimeout(() => {
      const sampleDictated = language === 'hi'
        ? 'यह उत्पाद हमारे गांव की शुद्ध मिट्टी और पारंपरिक हाथ के पहिये से तैयार किया गया है।'
        : language === 'te'
        ? 'ఈ వస్తువు మా గ్రామంలో సాంప్రదాయ పద్ధతిలో చేతితో తయారు చేయబడింది.'
        : 'This piece is made entirely by hand using heirloom techniques passed down through our family.';
      setDescription((prev) => prev ? `${prev} ${sampleDictated}` : sampleDictated);
      setIsRecording(false);
    }, 1500);
  };

  // STEP 3 -> 4: Save catalog edits and run Smart Pricing
  const handleProceedToPricing = async () => {
    if (!productId) return;
    setLoading(true);

    try {
      // Save updated fields
      await fetch(`/api/v1/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          subcategory,
          tags,
          material,
          est_dimensions: estDimensions,
          weight
        })
      });

      // Calculate fair price
      const priceRes = await fetch(`/api/v1/products/${productId}/price-recommendation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          material_cost: materialCost,
          labor_hours: laborHours,
          hourly_rate: hourlyWage
        })
      });
      const priceData: PriceRecommendation = await priceRes.json();
      setPricingRec(priceData);
      setFinalPrice(priceData.target_recommended || 2400);

      setCurrentStep(4);
    } catch (err) {
      console.error(err);
      setCurrentStep(4);
    } finally {
      setLoading(false);
    }
  };

  // Recalculate price dynamically if costs change in Step 4
  const recalculatePrice = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const priceRes = await fetch(`/api/v1/products/${productId}/price-recommendation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          material_cost: materialCost,
          labor_hours: laborHours,
          hourly_rate: hourlyWage
        })
      });
      const priceData: PriceRecommendation = await priceRes.json();
      setPricingRec(priceData);
      setFinalPrice(priceData.target_recommended || 2400);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // STEP 4 -> 5: Save Price and Fetch Market Linkage
  const handleProceedToMarketLinkage = async () => {
    if (!productId) return;
    setLoading(true);

    try {
      // Save final price
      await fetch(`/api/v1/products/${productId}/price`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ final_price: finalPrice })
      });

      // Get buyer channel matching
      const linkRes = await fetch(`/api/v1/products/${productId}/market-linkage`);
      const linkData = await linkRes.json();
      setChannelMatches(linkData.recommendations || []);

      setCurrentStep(5);
    } catch (err) {
      console.error(err);
      setCurrentStep(5);
    } finally {
      setLoading(false);
    }
  };

  // STEP 5 -> 6: Publish Listing
  const handlePublish = async () => {
    if (!productId) return;
    setLoading(true);

    try {
      const pubRes = await fetch(`/api/v1/products/${productId}/publish`, {
        method: 'POST'
      });
      const pubData = await pubRes.json();
      if (pubRes.ok && pubData.product) {
        setPublishedProduct(pubData.product);
        setCurrentStep(6);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-3 sm:px-6">

      {/* Offline Draft Recovery Banner (T21) */}
      {hasSavedDraft && (
        <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-900 block">
                Saved Offline Draft Detected
              </span>
              <p className="text-xs text-stone-600">
                You have an uncommitted product draft stored safely in your device storage.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resumeSavedDraft}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Resume Saved Draft</span>
            </button>
            <button
              onClick={discardSavedDraft}
              className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
              title="Discard saved draft"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Connectivity & Step Header Toolbar */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-stone-500 font-semibold">Rural Network Mode:</span>
          <button
            onClick={() => setIsOfflineSimulated(!isOfflineSimulated)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 border transition-all ${
              isOfflineSimulated
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            {isOfflineSimulated ? (
              <>
                <WifiOff className="w-3 h-3 text-amber-700" />
                <span>Simulated Offline Mode (Local Rules Active)</span>
              </>
            ) : (
              <>
                <Wifi className="w-3 h-3 text-emerald-600" />
                <span>Online (Cloud Gemini Vision Connected)</span>
              </>
            )}
          </button>
        </div>

        <button
          onClick={onCancel}
          className="text-stone-500 hover:text-stone-800 font-bold"
        >
          Cancel & Close
        </button>
      </div>
      
      {/* Step Navigation Pill Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-2.5 shadow-sm mb-6 flex items-center justify-between overflow-x-auto gap-1">
        {[
          { num: 1, label: t.stepPhoto },
          { num: 2, label: t.stepEnhance },
          { num: 3, label: t.stepCatalog },
          { num: 4, label: t.stepPricing },
          { num: 5, label: t.stepLinkage },
          { num: 6, label: t.stepPublish },
        ].map((s) => (
          <div
            key={s.num}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              currentStep === s.num
                ? 'bg-amber-600 text-white shadow-sm'
                : currentStep > s.num
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'text-stone-400 bg-stone-50'
            }`}
          >
            <span>{s.label}</span>
            {currentStep > s.num && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
          </div>
        ))}
      </div>

      {/* ================= STEP 1: PHOTO CAPTURE ================= */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200">
          <div className="text-center max-w-lg mx-auto mb-8">
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold mb-2">
              Step 1 of 5
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-['Rozha_One',serif] text-stone-900">
              {t.captureOrUpload}
            </h2>
            <p className="text-stone-500 text-sm mt-1">
              Capture your craft under natural light. Our AI will automatically enhance clarity and prepare standard catalog listings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
            {/* Open Camera / File button */}
            <button
              id="upload-craft-photo-btn"
              onClick={() => fileInputRef.current?.click()}
              className="p-6 border-2 border-dashed border-amber-400 hover:border-amber-600 rounded-3xl bg-amber-50/50 hover:bg-amber-50 transition-all flex flex-col items-center justify-center gap-3 group text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-900/10 group-hover:scale-105 transition-transform">
                <Camera className="w-7 h-7" />
              </div>
              <div>
                <span className="block font-bold text-stone-900 text-sm">{t.takePhoto}</span>
                <span className="text-xs text-stone-500">{t.uploadGallery}</span>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Quick Demo Upload */}
            <div className="p-6 border border-stone-200 rounded-3xl bg-stone-50 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-xs uppercase tracking-wider text-stone-700">Evaluation Speed-Dial</span>
                </div>
                <p className="text-xs text-stone-500 mb-3">
                  Test the complete end-to-end multimodal pipeline instantly using pre-verified authentic crafts.
                </p>
              </div>
              <button
                id="quick-demo-craft-btn"
                onClick={() => handleSelectPreset(DEMO_PRESET_CRAFTS[0])}
                className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <span>Instant Test (Bastar Dhokra)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Preset Craft Selector */}
          <div className="border-t border-stone-100 pt-6">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-600 mb-3 text-center sm:text-left">
              {t.orTrySampleCrafts}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DEMO_PRESET_CRAFTS.map((craft, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(craft)}
                  className="p-3 border border-stone-200 rounded-2xl hover:border-amber-500 hover:bg-amber-50/40 transition-all flex items-center gap-3 text-left group"
                >
                  <img
                    src={craft.image_url}
                    alt={craft.name}
                    className="w-14 h-14 object-cover rounded-xl border border-stone-200 shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div>
                    <span className="block text-xs font-bold text-stone-900 leading-tight">
                      {craft.name}
                    </span>
                    <span className="block text-[11px] text-amber-800 font-semibold mt-0.5">
                      {craft.region}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 2: BEFORE/AFTER ENHANCEMENT ================= */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200">
          <div className="text-center max-w-lg mx-auto mb-6">
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold mb-2">
              Step 2 of 5
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-['Rozha_One',serif] text-stone-900">
              {t.aiEnhancementTitle}
            </h2>
            <p className="text-stone-500 text-sm mt-1">
              {t.aiEnhancementSub}
            </p>
          </div>

          {/* Interactive Before/After Preview */}
          <div className="max-w-xl mx-auto mb-6">
            <div className="relative rounded-3xl overflow-hidden border border-stone-200 bg-stone-950 aspect-[4/3] shadow-md">
              <img
                src={rawImage}
                alt="Product Craft"
                className={`w-full h-full object-cover transition-all duration-500 ${
                  showEnhancedToggle
                    ? 'filter contrast-110 saturate-115 brightness-105 drop-shadow-md'
                    : 'filter brightness-90'
                }`}
              />

              {/* Status Badge */}
              <div className="absolute top-4 left-4 bg-stone-900/85 backdrop-blur text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{showEnhancedToggle ? t.after : t.before}</span>
              </div>

              {/* Toggle Switch */}
              <div className="absolute bottom-4 left-4 right-4 bg-stone-900/90 backdrop-blur rounded-2xl p-2 flex items-center justify-between border border-white/15">
                <span className="text-xs text-stone-300 font-medium px-2">
                  {showEnhancedToggle ? t.enhancementApplied : t.originalUnmodified}
                </span>
                <button
                  id="toggle-enhancement-btn"
                  onClick={() => setShowEnhancedToggle(!showEnhancedToggle)}
                  className="px-3 py-1.5 bg-amber-500 text-stone-950 font-extrabold rounded-xl text-xs hover:bg-amber-400 transition-colors"
                >
                  {showEnhancedToggle ? 'View Raw' : 'View AI Enhanced'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between max-w-xl mx-auto pt-4 border-t border-stone-100">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.back}</span>
            </button>

            <button
              id="proceed-to-catalog-btn"
              onClick={handleEnhanceAndProceedToCatalog}
              disabled={loading}
              className="px-6 py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold rounded-2xl shadow-md flex items-center gap-2 text-sm transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gemini Multimodal Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Extract Smart Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 3: SMART CATALOG REVIEW ================= */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-stone-100">
            <div>
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold mb-1">
                Step 3 of 5
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-['Rozha_One',serif] text-stone-900">
                {t.smartCatalogTitle}
              </h2>
              <p className="text-stone-500 text-xs mt-0.5">
                {t.aiGeneratedBadge}
              </p>
            </div>

            {/* Voice Dictation Button (Microphone for low literacy) */}
            <button
              id="voice-dictation-btn"
              onClick={toggleVoiceDictation}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all border ${
                isRecording
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              }`}
              title={t.voiceDictate}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-amber-600" />}
              <span>{isRecording ? t.listening : t.voiceDictate}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Left Column: Product Photo & AI tags */}
            <div>
              <img
                src={enhancedImage || rawImage}
                alt="Catalog preview"
                className="w-full aspect-square object-cover rounded-2xl border border-stone-200 shadow-sm mb-3"
              />
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-2">
                  Keywords / Search Tags
                </span>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tags.map((tg, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 flex items-center gap-1"
                    >
                      <span>{tg}</span>
                      <button
                        type="button"
                        onClick={() => setTags(tags.filter((_, i) => i !== idx))}
                        className="text-stone-400 hover:text-stone-800 ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="Add tag..."
                    className="flex-1 px-2.5 py-1 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTagInput.trim()) {
                        e.preventDefault();
                        setTags([...tags, newTagInput.trim()]);
                        setNewTagInput('');
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newTagInput.trim()) {
                        setTags([...tags, newTagInput.trim()]);
                        setNewTagInput('');
                      }
                    }}
                    className="px-2 py-1 bg-stone-800 text-white rounded-lg text-xs font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Editable Title, Narrative & Specs */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  {t.productTitle}
                </label>
                <input
                  id="catalog-title-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  {t.productDesc}
                </label>
                <textarea
                  id="catalog-desc-input"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm font-medium text-stone-800 leading-relaxed focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    {t.material}
                  </label>
                  <input
                    id="catalog-material-input"
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    {t.estDimensions}
                  </label>
                  <input
                    id="catalog-dimensions-input"
                    type="text"
                    value={estDimensions}
                    onChange={(e) => setEstDimensions(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.back}</span>
            </button>

            <button
              id="proceed-to-pricing-btn"
              onClick={handleProceedToPricing}
              disabled={loading || !title}
              className="px-6 py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold rounded-2xl shadow-md flex items-center gap-2 text-sm transition-all disabled:opacity-50"
            >
              <span>{t.smartPricingTitle}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 4: SMART PRICING ENGINE ================= */}
      {currentStep === 4 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200">
          <div className="text-center max-w-lg mx-auto mb-6">
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold mb-1">
              Step 4 of 5
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-['Rozha_One',serif] text-stone-900">
              {t.smartPricingTitle}
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
              {t.smartPricingSub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Cost Input Controls */}
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-600" />
                <span>Artisan Production Cost Inputs</span>
              </h3>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.rawMaterialCost}
                </label>
                <input
                  id="pricing-material-cost-input"
                  type="number"
                  value={materialCost}
                  onChange={(e) => setMaterialCost(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm font-bold text-stone-900"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-1">
                  <span>{t.laborHours}: {laborHours} Hours</span>
                </div>
                <input
                  id="pricing-labor-hours-range"
                  type="range"
                  min="1"
                  max="60"
                  value={laborHours}
                  onChange={(e) => setLaborHours(Number(e.target.value))}
                  className="w-full accent-amber-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.fairHourlyWage}
                </label>
                <input
                  id="pricing-hourly-rate-input"
                  type="number"
                  value={hourlyWage}
                  onChange={(e) => setHourlyWage(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm font-bold text-stone-900"
                />
              </div>

              <button
                type="button"
                onClick={recalculatePrice}
                disabled={loading}
                className="w-full py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Recalculate with Curated Benchmarks</span>
              </button>
            </div>

            {/* AI Recommendation Output Card */}
            <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-white rounded-2xl p-5 border border-stone-800 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-extrabold uppercase">
                    Fair Market Pricing Engine
                  </span>
                  <span className="text-xs text-stone-400">
                    Category: <strong className="text-white">{category}</strong>
                  </span>
                </div>

                <div className="bg-stone-800/80 rounded-xl p-3 border border-stone-700 mb-3">
                  <span className="text-xs text-stone-400 block">{t.suggestedFairRange}</span>
                  <div className="text-xl sm:text-2xl font-black font-mono text-amber-400 mt-0.5">
                    ₹{pricingRec?.suggested_min?.toLocaleString() || '1,800'} – ₹{pricingRec?.suggested_max?.toLocaleString() || '2,900'}
                  </div>
                  <span className="text-[11px] text-stone-400">
                    Recommended Target: <strong className="text-white">₹{pricingRec?.target_recommended?.toLocaleString() || '2,400'}</strong>
                  </span>
                </div>

                {/* Middleman Exploitation Comparison Card */}
                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-stone-300">{t.middlemanPayout}:</span>
                    <span className="text-rose-400 font-bold line-through">₹{pricingRec?.typical_middleman_price || 900}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span>{t.fairMarketGain}:</span>
                    <span className="text-sm font-extrabold">+₹{pricingRec?.artisan_profit_gain || 1500}</span>
                  </div>
                </div>

                <p className="text-[11px] text-stone-300 leading-relaxed italic bg-stone-800/40 p-2.5 rounded-lg border border-stone-700/50">
                  "{pricingRec?.rationale || 'Fair cost-plus pricing protects artisan labor while benchmark comparisons ensure realistic buyer conversion.'}"
                </p>
              </div>

              {/* Set Custom or Apply Final Price */}
              <div className="mt-4 pt-3 border-t border-stone-800">
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  Your Final Published Price (₹):
                </label>
                <div className="flex gap-2">
                  <input
                    id="final-price-input"
                    type="number"
                    value={finalPrice}
                    onChange={(e) => setFinalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-base font-mono font-bold text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setFinalPrice(pricingRec?.target_recommended || 2400)}
                    className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shrink-0 transition-colors"
                  >
                    {t.acceptSuggested}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.back}</span>
            </button>

            <button
              id="proceed-to-linkage-btn"
              onClick={handleProceedToMarketLinkage}
              disabled={loading || !finalPrice}
              className="px-6 py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold rounded-2xl shadow-md flex items-center gap-2 text-sm transition-all disabled:opacity-50"
            >
              <span>{t.marketLinkageTitle}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 5: MARKET LINKAGE MATCHING ================= */}
      {currentStep === 5 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200">
          <div className="text-center max-w-lg mx-auto mb-6">
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold mb-1">
              Step 5 of 5
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-['Rozha_One',serif] text-stone-900">
              {t.marketLinkageTitle}
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
              {t.marketLinkageSub}
            </p>
          </div>

          {/* Channels matched */}
          <div className="space-y-4 mb-6">
            {channelMatches.map((ch, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-white hover:border-amber-400 transition-all shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-md text-[11px] font-bold">
                      {ch.platform_tag}
                    </span>
                    <h3 className="font-extrabold text-stone-900 text-base">
                      {ch.channel_name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-500">{t.matchScore}:</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-black">
                      {ch.match_score}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 mb-3 leading-relaxed">
                  {ch.reason}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-stone-200/60 text-xs">
                  <div>
                    <span className="text-stone-500">Target Segment: </span>
                    <strong className="text-stone-800">{ch.target_audience}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500">Tier: </span>
                    <strong className="text-amber-800">{ch.recommended_price_tier}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <button
              onClick={() => setCurrentStep(4)}
              className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.back}</span>
            </button>

            <button
              id="confirm-publish-btn"
              onClick={handlePublish}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-95 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-900/20 flex items-center gap-2 text-base transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{t.publishListing}</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 6: PUBLISH CONFIRMATION ================= */}
      {currentStep === 6 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 border border-emerald-300">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-['Rozha_One',serif] text-stone-900 mb-2">
            {t.publishSuccess}
          </h2>
          <p className="text-stone-600 text-sm mb-6">
            Your craft is now live in the global catalog, fully accessible in English, Hindi, and Telugu with direct buyer contact channels.
          </p>

          {/* Multilingual Cards Preview */}
          <div className="bg-stone-50 rounded-2xl p-4 text-left border border-stone-200 mb-6 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider">
              <Globe2 className="w-4 h-4 text-amber-600" />
              <span>Active Multilingual Catalog Editions</span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-stone-200">
              <span className="text-[10px] font-bold text-amber-700 block">English</span>
              <p className="text-xs font-bold text-stone-800">{publishedProduct?.translations.en?.title || title}</p>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-stone-200">
              <span className="text-[10px] font-bold text-amber-700 block">हिन्दी (Hindi)</span>
              <p className="text-xs font-bold text-stone-800">{publishedProduct?.translations.hi?.title || `पारंपरिक ${title}`}</p>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-stone-200">
              <span className="text-[10px] font-bold text-amber-700 block">తెలుగు (Telugu)</span>
              <p className="text-xs font-bold text-stone-800">{publishedProduct?.translations.te?.title || `సాంప్రదాయ ${title}`}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <button
              id="view-marketplace-btn"
              onClick={() => {
                localStorage.removeItem('antigravity_artisan_draft');
                if (publishedProduct) onFinished(publishedProduct);
              }}
              className="flex-1 py-3.5 px-6 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-2xl shadow-md text-sm transition-all"
            >
              {t.viewInMarketplace}
            </button>
            <button
              id="return-studio-btn"
              onClick={() => {
                localStorage.removeItem('antigravity_artisan_draft');
                if (publishedProduct) onFinished(publishedProduct);
              }}
              className="py-3.5 px-6 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-2xl text-sm transition-all"
            >
              Back to Studio Dashboard
            </button>
          </div>

          {/* Physical Stall Provenance Tag Generator */}
          {publishedProduct && (
            <button
              id="print-stall-tag-btn"
              onClick={() => setShowProvenanceModal(true)}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 border border-stone-700 transition-colors shadow-sm"
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>Generate Authentic Craft Stall Tag & QR Provenance</span>
            </button>
          )}
        </div>
      )}

      {/* Global Stall Tag Modal */}
      {showProvenanceModal && publishedProduct && (
        <ProvenanceTagModal
          product={publishedProduct}
          language={language}
          onClose={() => setShowProvenanceModal(false)}
        />
      )}

    </div>
  );
};
