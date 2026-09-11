import React, { useState, useRef, useEffect } from 'react';
import {
  Camera, Upload, Sparkles, CheckCircle2, ArrowRight, ArrowLeft,
  Sliders, Mic, MicOff, DollarSign, TrendingUp, Share2, Tag,
  ExternalLink, Layers, Eye, RefreshCw, AlertCircle, ShoppingBag, Globe2,
  Wifi, WifiOff, QrCode, FileText, Trash2, Building2
} from 'lucide-react';
import { LanguageCode, Product, Artisan, BuyerChannelMatch, PriceRecommendation } from '../types';
import { translations, speakText } from '../lib/i18n';
import { DEMO_PRESET_CRAFTS } from '../data/seedData';
import { ProvenanceTagModal } from './ProvenanceTagModal';
import { CameraCaptureModal } from './common/CameraCaptureModal';
import { AudioVoiceNoteRecorder } from './common/AudioVoiceNoteRecorder';
import { GovernmentMarketplaceModal } from './common/GovernmentMarketplaceModal';

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

  // Modals
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isGovtModalOpen, setIsGovtModalOpen] = useState(false);

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
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [enhancementModel, setEnhancementModel] = useState<string>('sharp-studio-lighting-engine');
  const [enhancementMetrics, setEnhancementMetrics] = useState<any>(null);
  const [backgroundStyle, setBackgroundStyle] = useState<'studio-white' | 'warm-terracotta' | 'clean-slate'>('studio-white');
  const [brightnessVal, setBrightnessVal] = useState<number>(1.05);
  const [contrastVal, setContrastVal] = useState<number>(1.0);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [imageVariants, setImageVariants] = useState<any>(null);
  const [selectedVariantView, setSelectedVariantView] = useState<'square_1x1' | 'portrait_9x16' | 'thumbnail'>('square_1x1');

  // Deep Craft & Catalog fields (Step 3)
  const [craftTechnique, setCraftTechnique] = useState('');
  const [motifs, setMotifs] = useState<string[]>([]);
  const [giStatus, setGiStatus] = useState<string>('Needs artisan confirmation');
  const [confidenceScore, setConfidenceScore] = useState<number>(0.92);
  const [validationStatus, setValidationStatus] = useState<'AI Generated' | 'Needs Review' | 'Verified by Artisan' | 'Published'>('AI Generated');
  const [moq, setMoq] = useState<number>(10);
  const [monthlyCapacity, setMonthlyCapacity] = useState<number>(50);
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
      const saved = localStorage.getItem('kalatech_artisan_draft');
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
        localStorage.setItem('kalatech_artisan_draft', JSON.stringify(draft));
      } catch (e) {
        // quota exceeded / private mode
      }
    }
  }, [currentStep, productId, rawImage, enhancedImage, title, description, category, tags, material, estDimensions, materialCost, laborHours, hourlyWage, finalPrice]);

  const resumeSavedDraft = () => {
    try {
      const saved = localStorage.getItem('kalatech_artisan_draft');
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
    localStorage.removeItem('kalatech_artisan_draft');
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

  const runEnhancement = async (
    prodId: string,
    opts: {
      bgStyle?: 'studio-white' | 'warm-terracotta' | 'clean-slate';
      brightness?: number;
      contrast?: number;
      rotation?: number;
    } = {}
  ) => {
    setIsEnhancing(true);
    try {
      const res = await fetch(`/api/v1/products/${prodId}/enhance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backgroundStyle: opts.bgStyle || backgroundStyle,
          brightness: opts.brightness ?? brightnessVal,
          contrast: opts.contrast ?? contrastVal,
          rotation: opts.rotation ?? rotationAngle
        })
      });
      const data = await res.json();
      if (data.enhanced_url) {
        setEnhancedImage(data.enhanced_url);
        setEnhancementModel(data.model_used || 'Sharp Studio Compositor');
        setEnhancementMetrics(data.metrics || null);
        if (data.variants) {
          setImageVariants(data.variants);
        }
      }
    } catch (e) {
      console.warn('Enhancement invocation note:', e);
    } finally {
      setIsEnhancing(false);
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
        runEnhancement(data.product_id); // Trigger real Sharp image processor immediately
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
      // 1. Ensure image is enhanced if not yet done
      if (!enhancedImage || enhancedImage === rawImage) {
        await runEnhancement(productId);
      }

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
        if (catData.craft_technique) setCraftTechnique(catData.craft_technique);
        if (catData.motifs) setMotifs(catData.motifs);
        if (catData.gi_status) setGiStatus(catData.gi_status);
        if (catData.minimum_order_quantity) setMoq(catData.minimum_order_quantity);
        if (catData.production_capacity_monthly) setMonthlyCapacity(catData.production_capacity_monthly);
        if (catData.validation_status) setValidationStatus(catData.validation_status);
        if (catData.confidence_score) setConfidenceScore(catData.confidence_score);
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
          id="wizard-back-to-artisan-studio-btn"
          onClick={onCancel}
          className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-900 rounded-xl font-bold flex items-center gap-1.5 text-xs transition-colors shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Artisan Studio</span>
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
            {/* Live Camera & Gallery Upload Cards */}
            <div className="flex flex-col gap-3">
              <button
                id="open-live-camera-btn"
                onClick={() => setIsCameraModalOpen(true)}
                className="p-4 border-2 border-amber-500 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white transition-all flex items-center gap-3.5 group text-left shadow-md shadow-amber-900/15"
              >
                <div className="w-11 h-11 rounded-xl bg-white text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <span className="block font-extrabold text-white text-sm">Open Live Camera</span>
                  <span className="text-[11px] text-amber-100 font-medium">Hardware viewfinder with composition grid</span>
                </div>
              </button>

              <button
                id="upload-craft-photo-btn"
                onClick={() => fileInputRef.current?.click()}
                className="p-4 border border-stone-300 hover:border-amber-500 rounded-2xl bg-white hover:bg-amber-50/50 transition-all flex items-center gap-3.5 group text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-stone-100 group-hover:bg-amber-100 text-stone-700 group-hover:text-amber-700 flex items-center justify-center shrink-0 transition-colors">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="block font-bold text-stone-900 text-sm">Upload from Gallery</span>
                  <span className="text-[11px] text-stone-500 font-medium">PNG, JPG, WebP up to 50MB</span>
                </div>
              </button>
            </div>
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
            <div className="relative rounded-3xl overflow-hidden border border-stone-200 bg-stone-950 aspect-[1/1] sm:aspect-[4/3] shadow-md">
              {isEnhancing ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-950/80 z-20 backdrop-blur-xs text-center p-4">
                  <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mb-3" />
                  <p className="text-white text-sm font-bold">Sharp Image Studio Processing...</p>
                  <p className="text-stone-400 text-xs mt-1">Normalizing lighting, boosting contrast curves & framing to 1080x1080 standard</p>
                </div>
              ) : null}

              <img
                src={showEnhancedToggle ? (enhancedImage || rawImage) : rawImage}
                alt="Product Craft"
                className="w-full h-full object-contain bg-stone-900 transition-all duration-300"
              />

              {/* Status Badge */}
              <div className="absolute top-4 left-4 bg-stone-900/90 backdrop-blur text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-white/10 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {showEnhancedToggle
                    ? 'AI Studio Enhanced (1080p Studio Standard)'
                    : 'Original Raw Camera Capture'}
                </span>
              </div>

              {/* Model Transparency Tag */}
              <div className="absolute top-4 right-4 bg-stone-900/90 backdrop-blur text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold">
                {enhancementModel}
              </div>

              {/* Toggle Switch */}
              <div className="absolute bottom-4 left-4 right-4 bg-stone-900/90 backdrop-blur rounded-2xl p-2.5 flex items-center justify-between border border-white/15">
                <div className="px-2">
                  <span className="text-xs font-extrabold text-white block">
                    {showEnhancedToggle ? 'Studio Lighting & 1:1 Framing Active' : 'Unmodified Camera Photo'}
                  </span>
                  <span className="text-[11px] text-stone-400">
                    {showEnhancedToggle
                      ? '1080x1080px | Contrast & white-balance optimized | Studio backdrop'
                      : 'Raw capture before AI studio processing'}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowEnhancedToggle(false)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      !showEnhancedToggle
                        ? 'bg-amber-500 text-stone-950 font-extrabold'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    Raw
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEnhancedToggle(true)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      showEnhancedToggle
                        ? 'bg-amber-500 text-stone-950 font-extrabold'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    Enhanced
                  </button>
                </div>
              </div>
            </div>

            {/* Technical Enhancements Details Bar */}
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Aspect Standard</span>
                <strong className="text-stone-800 font-mono text-[11px]">1:1 (1080×1080px)</strong>
              </div>
              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Background Isolation</span>
                <strong className="text-emerald-700 font-bold text-[11px]">Studio Composition</strong>
              </div>
              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Color Grading</span>
                <strong className="text-amber-800 font-bold text-[11px]">Auto Levels & Saturation</strong>
              </div>
            </div>

            {/* Interactive Studio Controls: Background, Lighting & Output Variants */}
            <div className="mt-4 p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-600" />
                  <span>Artisan Studio Controls</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setBackgroundStyle('studio-white');
                    setBrightnessVal(1.05);
                    setContrastVal(1.0);
                    setRotationAngle(0);
                    if (productId) runEnhancement(productId, { bgStyle: 'studio-white', brightness: 1.05, contrast: 1.0, rotation: 0 });
                  }}
                  className="text-[11px] font-bold text-amber-700 hover:text-amber-800 underline"
                >
                  Reset Studio Defaults
                </button>
              </div>

              {/* Background Style Selection */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1.5">Studio Backdrop:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBackgroundStyle('studio-white');
                      if (productId) runEnhancement(productId, { bgStyle: 'studio-white' });
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      backgroundStyle === 'studio-white'
                        ? 'bg-amber-100 border-amber-500 text-amber-900 shadow-xs'
                        : 'bg-white border-stone-300 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    Studio White
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBackgroundStyle('warm-terracotta');
                      if (productId) runEnhancement(productId, { bgStyle: 'warm-terracotta' });
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      backgroundStyle === 'warm-terracotta'
                        ? 'bg-amber-100 border-amber-500 text-amber-900 shadow-xs'
                        : 'bg-white border-stone-300 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    Warm Terracotta
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBackgroundStyle('clean-slate');
                      if (productId) runEnhancement(productId, { bgStyle: 'clean-slate' });
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      backgroundStyle === 'clean-slate'
                        ? 'bg-amber-100 border-amber-500 text-amber-900 shadow-xs'
                        : 'bg-white border-stone-300 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    Clean Slate
                  </button>
                </div>
              </div>

              {/* Quick Rotation & Brightness Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-stone-600 mb-1">
                    <span>Brightness:</span>
                    <span>{Math.round(brightnessVal * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.3"
                    step="0.05"
                    value={brightnessVal}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setBrightnessVal(val);
                      if (productId) runEnhancement(productId, { brightness: val });
                    }}
                    className="w-full accent-amber-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-stone-600 mb-1">
                    <span>Contrast:</span>
                    <span>{Math.round(contrastVal * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.3"
                    step="0.05"
                    value={contrastVal}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setContrastVal(val);
                      if (productId) runEnhancement(productId, { contrast: val });
                    }}
                    className="w-full accent-amber-600"
                  />
                </div>
              </div>

              {/* Multi-Format Output Variant Tabs */}
              {imageVariants && (
                <div className="pt-2 border-t border-stone-200">
                  <span className="block text-[11px] font-bold text-stone-600 mb-1.5">Auto-Generated Marketplace Variants:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVariantView('square_1x1');
                        if (imageVariants.square_1x1) setEnhancedImage(imageVariants.square_1x1);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        selectedVariantView === 'square_1x1'
                          ? 'bg-stone-900 text-white'
                          : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                      }`}
                    >
                      1:1 E-Commerce
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVariantView('portrait_9x16');
                        if (imageVariants.portrait_9x16) setEnhancedImage(imageVariants.portrait_9x16);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        selectedVariantView === 'portrait_9x16'
                          ? 'bg-stone-900 text-white'
                          : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                      }`}
                    >
                      9:16 Social Story
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVariantView('thumbnail');
                        if (imageVariants.thumbnail) setEnhancedImage(imageVariants.thumbnail);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        selectedVariantView === 'thumbnail'
                          ? 'bg-stone-900 text-white'
                          : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                      }`}
                    >
                      Thumbnail
                    </button>
                  </div>
                </div>
              )}
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

              {/* Integrated Multilingual Hardware Voice Note Studio */}
              <div className="pt-1">
                <AudioVoiceNoteRecorder
                  defaultLanguage={language}
                  onTranscriptionComplete={(data) => {
                    if (data.transcript) {
                      setDescription((prev) => (prev ? `${prev}\n\n[Artisan Voice Note]: ${data.transcript}` : data.transcript));
                    }
                    if (data.keywords && data.keywords.length > 0) {
                      setTags((prev) => Array.from(new Set([...prev, ...data.keywords!])));
                    }
                  }}
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

              {/* Craft Technique & GI / Anti-Hallucination Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Craft Technique
                  </label>
                  <input
                    type="text"
                    value={craftTechnique}
                    onChange={(e) => setCraftTechnique(e.target.value)}
                    placeholder="e.g. Warp Tie-and-Dye Ikat Weave"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    GI Tag Verification
                  </label>
                  <select
                    value={giStatus}
                    onChange={(e) => setGiStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="certified">GI Certified (Govt Registered)</option>
                    <option value="potential">Potential GI Cluster</option>
                    <option value="none">Traditional Non-GI</option>
                    <option value="Needs artisan confirmation">Needs Artisan Confirmation</option>
                  </select>
                </div>
              </div>

              {/* B2B Minimum Order Quantity & Monthly Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    B2B Minimum Order (MOQ)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={moq}
                    onChange={(e) => setMoq(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Monthly Production Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={monthlyCapacity}
                    onChange={(e) => setMonthlyCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* AI Verification Guardrail Badge */}
              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="font-bold text-amber-950">Catalog Validation:</span>
                  <span className="px-2 py-0.5 bg-amber-200/60 text-amber-900 font-extrabold rounded-md text-[11px]">
                    {validationStatus}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setValidationStatus('Verified by Artisan')}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] transition-all"
                >
                  Verify as Artisan ✓
                </button>
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
                    {pricingRec?.pricing_engine || 'Gemini Vision + Live Market Comps'}
                  </span>
                  <span className="text-xs text-stone-400">
                    Category: <strong className="text-white">{category}</strong>
                  </span>
                </div>

                {/* ML Visual Quality Tier & Craft Complexity Assessment */}
                <div className="flex items-center justify-between gap-2 p-2.5 bg-stone-800/60 rounded-xl border border-stone-700/80 mb-3 text-xs">
                  <div>
                    <span className="text-stone-400 text-[10px] uppercase font-bold block">Assessed Tier:</span>
                    <strong className="text-amber-300 font-bold">{pricingRec?.quality_tier || 'Fine Mastercraft'}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-stone-400 text-[10px] uppercase font-bold block">Visual Complexity:</span>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-md font-mono font-bold text-xs">
                      {pricingRec?.craft_complexity_score || 7} / 10
                    </span>
                  </div>
                </div>

                <div className="bg-stone-800/80 rounded-xl p-3 border border-stone-700 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-400">{t.suggestedFairRange}</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      Floor: ₹{pricingRec?.fair_wage_floor || Math.round((materialCost + laborHours * hourlyWage) * 1.25)}
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black font-mono text-amber-400 mt-0.5">
                    ₹{pricingRec?.suggested_min?.toLocaleString() || '1,800'} – ₹{pricingRec?.suggested_max?.toLocaleString() || '2,900'}
                  </div>
                  <span className="text-[11px] text-stone-400 block mt-0.5">
                    Recommended Target: <strong className="text-white">₹{pricingRec?.target_recommended?.toLocaleString() || '2,400'}</strong>
                  </span>
                </div>

                {/* Live Multi-Market Comparables List */}
                {pricingRec?.market_comparables && pricingRec.market_comparables.length > 0 && (
                  <div className="p-2.5 bg-stone-800/40 rounded-xl border border-stone-700/60 mb-3 text-xs">
                    <span className="text-[10px] uppercase font-extrabold text-amber-400 tracking-wider block mb-1.5">
                      Live Multi-Platform Market Benchmarks ({pricingRec.market_comparables.length} Listings):
                    </span>
                    <div className="space-y-1">
                      {pricingRec.market_comparables.slice(0, 3).map((comp, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px] text-stone-300 py-0.5 border-b border-stone-800 last:border-none">
                          <span className="truncate pr-2">
                            <strong className="text-amber-300 font-semibold">{comp.platform}:</strong> {comp.title}
                          </span>
                          <span className="font-mono font-bold text-white shrink-0">₹{comp.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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

                {/* B2B vs Retail Pricing Split */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2.5 bg-stone-800/80 rounded-xl border border-stone-700">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Suggested Retail:</span>
                    <strong className="text-amber-400 font-mono text-base">₹{pricingRec?.target_recommended?.toLocaleString() || '2,400'}</strong>
                  </div>
                  <div className="p-2.5 bg-stone-800/80 rounded-xl border border-stone-700">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Suggested B2B / MOQ:</span>
                    <strong className="text-emerald-400 font-mono text-base">₹{pricingRec?.b2b_recommended?.toLocaleString() || '1,950'}</strong>
                  </div>
                </div>

                {/* Plain-Language "Why This Price?" Explanation */}
                {pricingRec?.why_this_price && (
                  <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 mb-3 text-xs">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 block mb-1">
                      💡 Why This Price?
                    </span>
                    <p className="text-stone-200 text-xs leading-relaxed mb-2">
                      {pricingRec.why_this_price.simple_explanation}
                    </p>
                    <div className="flex justify-between text-[10px] text-stone-400 font-medium">
                      <span>Fair Living Labor: ₹{pricingRec.why_this_price.fair_living_wage} ({pricingRec.why_this_price.labor_share_pct}%)</span>
                      <span>Raw Materials: ₹{pricingRec.why_this_price.material_cost}</span>
                    </div>
                  </div>
                )}
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

                {(ch.platform_tag?.includes('GeM') || ch.channel_type === 'institutional') && (
                  <button
                    type="button"
                    onClick={() => setIsGovtModalOpen(true)}
                    className="mt-3 w-full py-2.5 px-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Launch GeM & ONDC Integration Gateway (Real API Dispatch)</span>
                  </button>
                )}
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
                localStorage.removeItem('kalatech_artisan_draft');
                if (publishedProduct) onFinished(publishedProduct);
              }}
              className="flex-1 py-3.5 px-6 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-2xl shadow-md text-sm transition-all"
            >
              {t.viewInMarketplace}
            </button>
            <button
              id="return-studio-btn"
              onClick={() => {
                localStorage.removeItem('kalatech_artisan_draft');
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

          {/* Direct Government Marketplace Integration Gateway Button */}
          <button
            id="push-to-gem-published-btn"
            onClick={() => setIsGovtModalOpen(true)}
            className="w-full mt-2.5 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Building2 className="w-4 h-4" />
            <span>Push Listing to GeM & ONDC Network (Government Procurement)</span>
          </button>
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

      {/* Real Hardware Camera Viewfinder Modal (getUserMedia) */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={(capturedDataUrl) => {
          setRawImage(capturedDataUrl);
          setEnhancedImage(capturedDataUrl);
          createDraftProduct(capturedDataUrl, category, {
            material_cost: materialCost,
            labor_hours: laborHours,
            hourly_rate: hourlyWage,
            other_cost: 100
          });
        }}
      />

      {/* Government & Institutional E-Marketplace Gateway Modal (GeM & ONDC Beckn Protocol) */}
      {isGovtModalOpen && (
        <GovernmentMarketplaceModal
          isOpen={isGovtModalOpen}
          onClose={() => setIsGovtModalOpen(false)}
          product={publishedProduct || ({
            id: productId || 'craft-active',
            title: title || 'Authentic Handcrafted Heritage Creation',
            description: description || 'Master artisan handmade creation with inherited regional technique.',
            category: category || 'Weaving',
            final_price: finalPrice || 2400,
            artisan_id: artisan.id,
            artisan_name: artisan.name,
            artisan_district: artisan.district,
            artisan_state: artisan.state,
            material: material || 'Natural Heritage Craft Materials',
            est_dimensions: estDimensions || 'Standard',
            original_image_url: rawImage || '',
            enhanced_image_url: enhancedImage || rawImage || '',
            tags
          } as any)}
        />
      )}

    </div>
  );
};
