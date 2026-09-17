import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Camera, Upload, Sparkles, CheckCircle2, ArrowRight, ArrowLeft,
  Volume2, RotateCcw, Edit3, Globe, Tag, DollarSign, Eye, RefreshCw,
  AlertCircle, ShieldCheck, Check, MapPin
} from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { getRegionalCraftsForState } from '../../config/stateLanguageMap';
import { translations, speakText } from '../../lib/i18n';
import { formatINR } from '../../lib/billingService';
import { useTutorial } from '../tutorial/TutorialContext';
import { ShowMeButton } from '../tutorial/ContextualHelp';
import {
  CraftInspectionResult,
  CraftAttributes,
} from './CraftAttributeInspector';
import { VoiceProductDetailsPricingWizard, PricingResultData } from './VoiceProductDetailsPricingWizard';
import { DevAiDebugPanel, DevDebugTelemetry } from './DevAiDebugPanel';
import { getCraftAttributeLabels } from '../../lib/craftAttributeLabels';
import { CameraCaptureModal } from '../common/CameraCaptureModal';
import { LanguageCode } from '../../types';

const FAIR_PRICING_EXPLANATIONS: Record<LanguageCode, (mat: number, hours: number, price: number) => string> = {
  en: (mat, hours, price) => `Based on your material cost of ₹${mat} and ${hours} hours of labor, the recommended fair price is ₹${price}. This guarantees fair wages for your craftsmanship.`,
  hi: (mat, hours, price) => `आपकी ₹${mat} सामग्री लागत और ${hours} घंटे के श्रम के आधार पर, अनुशंसित उचित मूल्य ₹${price} है। यह आपकी कारीगरी के लिए उचित पारिश्रमिक सुनिश्चित करता है।`,
  te: (mat, hours, price) => `మీ మెటీరియల్ ఖర్చు ₹${mat} మరియు ${hours} గంటల శ్రమ ఆధారంగా, సిఫార్సు చేయబడిన న్యాయమైన ధర ₹${price}. ఇది మీ నైపుణ్యానికి సరైన వేతనాన్ని అందిస్తుంది.`,
  ta: (mat, hours, price) => `உங்கள் மூலப்பொருள் செலவு ₹${mat} மற்றும் ${hours} மணிநேர உழைப்பின் அடிப்படையில், நியாயமான விலை ₹${price}.`,
  kn: (mat, hours, price) => `ನಿಮ್ಮ ಕಚ್ಚಾ ಸಾಮಗ್ರಿಯ ವೆಚ್ಚ ₹${mat} ಮತ್ತು ${hours} ಗಂಟೆಗಳ ಶ್ರಮದ ಆಧಾರದ ಮೇಲೆ, ನ್ಯಾಯಯುತ ಬೆಲೆ ₹${price}.`,
  ml: (mat, hours, price) => `നിങ്ങളുടെ അസംസ്കൃത വസ്തുക്കളുടെ ചിലവ് ₹${mat}, ${hours} മണിക്കൂർ ജോലി എന്നിവ അടിസ്ഥാനമാക്കി, ശുപാർശ ചെയ്യുന്ന ന്യായമായ വില ₹${price}.`,
  mr: (mat, hours, price) => `तुमचा ₹${mat} कच्चा माल खर्च आणि ${hours} तासांच्या श्रमावर आधारित, योग्य किंमत ₹${price} आहे.`,
  gu: (mat, hours, price) => `તમારા ₹${mat} સામગ્રી ખર્ચ અને ${hours} કલાકના શ્રમના આધારે, ભલામણ કરેલ વાજબી કિંમત ₹${price} છે.`,
  bn: (mat, hours, price) => `আপনার ₹${mat} উপাদান খরচ এবং ${hours} ঘণ্টার শ্রমের ভিত্তিতে প্রস্তাবিত ন্যায্য মূল্য ₹${price}।`,
  or: (mat, hours, price) => `ଆପଣଙ୍କର ₹${mat} ସାମଗ୍ରୀ ଖର୍ଚ୍ଚ ଏବଂ ${hours} ଘଣ୍ଟା ପରିଶ୍ରମ ଆଧାରରେ ଉଚିତ ମୂଲ୍ୟ ₹${price} ଅଟେ।`,
  pa: (mat, hours, price) => `ਤੁਹਾਡੀ ₹${mat} ਸਮੱਗਰੀ ਲਾਗਤ ਅਤੇ ${hours} ਘੰਟੇ ਦੀ ਮਿਹਨਤ ਦੇ ਆਧਾਰ 'ਤੇ, ਸਿਫਾਰਸ਼ ਕੀਤੀ ਕੀਮਤ ₹${price} ਹੈ।`,
  as: (mat, hours, price) => `আপোনাৰ ₹${mat} সামগ্ৰীৰ খৰচ আৰু ${hours} ঘণ্টাৰ পৰিশ্ৰমৰ ভিত্তিত উচিত মূল্য ₹${price}।`,
};

const SAMPLE_PRESETS = [
  {
    name: 'Handwoven Kalamkari Cotton Saree',
    category: 'Handloom',
    material: '100% Handspun Organic Cotton & Natural Vegetable Dyes',
    craftType: 'Machilipatnam Kalamkari Hand-Block Printing',
    colors: 'Earthy Terracotta, Indigo & Mustard',
    dimensions: '5.5 meters length with 80cm blouse piece',
    handmadeFeatures: 'Hand-carved teak block prints, washed in flowing canal waters, zero toxic chemicals',
    suggestedPrice: 1850,
    cost: 1100,
    rawImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    enhancedImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=95',
    title: 'Handwoven Kalamkari Cotton Saree with Heritage Motifs',
    shortDesc: 'Authentic hand-block printed Kalamkari cotton saree created by master hereditary artisans using 100% natural plant dyes.',
    story: 'Handcrafted in the coastal Andhra craft cluster using centuries-old Kalamkari block-printing tradition. The motifs draw from traditional folklore, dried under the open sky and bathed in river waters for rich permanent earthy tones.',
    care: 'Gentle hand wash in cold water with mild detergent. Dry in shade.',
    occasions: 'Festive celebrations, office wear, cultural gatherings, sustainable gifting',
  },
  {
    name: 'Terracotta Hand-Molded Chai Cup Set (Pack of 6)',
    category: 'Pottery',
    material: 'Purified Alluvial Riverbed Clay',
    craftType: 'Traditional Wheel-Thrown Terracotta',
    colors: 'Natural Clay Red & Burnt Earth',
    dimensions: '180 ml capacity each, 3.5 inches height',
    handmadeFeatures: '100% natural terracotta, kiln-fired with rice husk, food safe without glaze',
    suggestedPrice: 650,
    cost: 320,
    rawImage: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    enhancedImage: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=95',
    title: 'Handcrafted Natural Terracotta Kulhar Chai Cups (Set of 6)',
    shortDesc: 'Artisanal wheel-thrown terracotta cups providing natural earthy aroma to tea and coffee.',
    story: 'Molded on traditional foot-operated potters wheels in rural clay clusters. Fired in wood-burning country kilns using dried leaves and rice husks, infusing each cup with a distinctive smoky rustic charm.',
    care: 'Soak in warm water before first use. Hand wash without chemical soap.',
    occasions: 'Daily conscious tea rituals, housewarming gifts, Indian festive hospitality',
  },
  {
    name: 'Channapatna Non-Toxic Lacquered Wooden Stacker',
    category: 'Woodcraft',
    material: 'Natural Ivory Wood (Aale Mara) & Vegetable Lacquer',
    craftType: 'Channapatna GI Toy Craft',
    colors: 'Vibrant Saffron Yellow, Lac Red & Leaf Green',
    dimensions: '7 inches height x 4 inches base diameter',
    handmadeFeatures: 'Lead-free, baby-safe natural colors made from turmeric, kumkum and indigo',
    suggestedPrice: 890,
    cost: 440,
    rawImage: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
    enhancedImage: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1200&q=95',
    title: 'Channapatna Eco-Friendly Lacquered Wooden Ring Stacker',
    shortDesc: 'Safe, smooth, and sustainable wooden rainbow stacker handcrafted by certified GI artisans.',
    story: 'Turned on high-speed hand lathes from sustainably grown soft ivory wood. High-friction polishing with natural palm leaves creates an ultra-smooth, glossy finish without harmful polyurethane chemicals.',
    care: 'Wipe with a soft damp cloth. Keep away from direct water immersion.',
    occasions: 'Child development toy, birthday gifts, eco-conscious nursery decor',
  },
];

export function AddHandicraft() {
  const { language, artisanLocation } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const t = translations[language];

  // Guided 4-Step flow: 1: Photo -> 2: Studio -> 3: Understanding -> 4: Description
  const initialStep = Number(searchParams.get('step')) || 1;
  const [step, setStep] = useState<number>(initialStep);

  // Images state
  const [rawImage, setRawImage] = useState<string>('');
  const [enhancedImage, setEnhancedImage] = useState<string>('');
  const [activeImageView, setActiveImageView] = useState<'enhanced' | 'original'>('enhanced');
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [backgroundTheme, setBackgroundTheme] = useState<'studio-linen' | 'terracotta' | 'natural'>('studio-linen');

  // Product details
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Handloom');
  const [material, setMaterial] = useState('');
  const [craftType, setCraftType] = useState('');
  const [colors, setColors] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [handmadeFeatures, setHandmadeFeatures] = useState('');
  const [madeInLocation, setMadeInLocation] = useState<string>(() => {
    if (artisanLocation.district && artisanLocation.district !== 'Not available') {
      const placePrefix = artisanLocation.place && artisanLocation.place !== 'Not available' && artisanLocation.place !== artisanLocation.district
        ? `${artisanLocation.place}, `
        : '';
      return `${placePrefix}${artisanLocation.district}, ${artisanLocation.state}`;
    }
    return `${artisanLocation.state || 'Telangana'}, India`;
  });
  const [shortDesc, setShortDesc] = useState('');
  const [story, setStory] = useState('');
  const [care, setCare] = useState('');
  const [occasions, setOccasions] = useState('');
  const [suggestedPrice, setSuggestedPrice] = useState<number>(1850);
  const [materialCost, setMaterialCost] = useState<number>(0);
  const [laborHours, setLaborHours] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);
  const [publishing, setPublishing] = useState<boolean>(false);
  const [draftSaved, setDraftSaved] = useState<boolean>(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [originalAiValues, setOriginalAiValues] = useState<Record<string, string>>({});

  // AI Craft Attribute Inspection state
  const [inspectionResult, setInspectionResult] = useState<CraftInspectionResult | null>(null);
  const [isAnalyzingCraft, setIsAnalyzingCraft] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Camera & Image Preview Gate state
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [imageMeta, setImageMeta] = useState<{
    width?: number;
    height?: number;
    sizeBytes?: number;
    type?: string;
  } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // DEV Diagnostic Telemetry State
  const [telemetry, setTelemetry] = useState<DevDebugTelemetry>({
    imageCaptured: false,
    aiRequestSent: false,
    aiResponseStatus: 'not sent',
    detectedFields: [],
    missingFields: [],
    selectedLanguage: language,
    speechLocale: 'en-IN',
    speechRecognitionSupported: typeof window !== 'undefined' && Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition),
    ttsSupported: typeof window !== 'undefined' && Boolean(window.speechSynthesis),
    currentVoiceState: 'idle',
    lastTranscript: '',
    lastExtractedField: '',
    lastError: null,
  });

  const labels = getCraftAttributeLabels(language);

  const calculateFairPrice = (matCost: number, hours: number, hourlyRate: number = 90) => {
    const validCost = matCost > 0 ? matCost : 800;
    const validHours = hours > 0 ? hours : 12;
    const laborCost = Math.round(validHours * hourlyRate);
    const overhead = Math.round(validCost * 0.15);
    const margin = Math.round((validCost + laborCost) * 0.20);
    return Math.max(validCost + laborCost + overhead + margin, 450);
  };

  const explainPricingViaVoice = (cost: number, hours: number, price: number) => {
    const fn = FAIR_PRICING_EXPLANATIONS[language] || FAIR_PRICING_EXPLANATIONS.en;
    const text = fn(cost || materialCost || 800, hours || laborHours || 15, price || suggestedPrice || 1850);
    speakText(text, language);
  };

  const handleVoiceFieldUpdated = (field: string, canonicalVal: any, localizedVal: any) => {
    if (field === 'material') {
      setMaterial(localizedVal || canonicalVal);
    } else if (field === 'dimensions') {
      setDimensions(localizedVal || canonicalVal);
    } else if (field === 'laborHours') {
      const num = Number(canonicalVal);
      if (!isNaN(num) && num > 0) {
        setLaborHours(num);
        const newPrice = calculateFairPrice(materialCost || 850, num);
        setSuggestedPrice(newPrice);
      }
    } else if (field === 'materialCost') {
      const num = Number(canonicalVal);
      if (!isNaN(num) && num > 0) {
        setMaterialCost(num);
        const newPrice = calculateFairPrice(num, laborHours || 15);
        setSuggestedPrice(newPrice);
      }
    } else if (field === 'quantity') {
      const num = Number(canonicalVal);
      if (!isNaN(num) && num > 0) {
        setQuantity(num);
      }
    }
  };

  const runCraftInspection = async (img: string, catHint?: string) => {
    if (!img) return;
    setIsAnalyzingCraft(true);
    setAnalysisError(null);
    setTelemetry(prev => ({
      ...prev,
      aiRequestSent: true,
      aiResponseStatus: 'analyzing',
    }));

    try {
      const res = await fetch('/api/v1/ai/inspect-craft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: img,
          language,
          categoryHint: catHint || category,
          regionHint: madeInLocation
        })
      });
      if (res.ok) {
        const data: CraftInspectionResult = await res.json();
        setInspectionResult(data);
        const loc = data.localizedAttributes;
        const can = data.canonicalAttributes;

        // Save original AI values for AI vs User comparison (Req 24)
        const orig: Record<string, string> = {};
        if (loc.material || can.material) orig.material = loc.material || can.material || '';
        if (loc.craftName || can.craftName) orig.craftName = loc.craftName || can.craftName || '';
        if (loc.technique || can.technique) orig.technique = loc.technique || can.technique || '';
        setOriginalAiValues(orig);

        if (loc.craftName || can.craftName) setTitle(loc.craftName || can.craftName || '');
        if (loc.craftCategory || can.craftCategory) setCategory(loc.craftCategory || can.craftCategory || 'Handloom');
        if (loc.material || can.material) setMaterial(loc.material || can.material || '');
        if (loc.technique || can.technique) setCraftType(loc.technique || can.technique || '');
        if (loc.colors && loc.colors.length) setColors(loc.colors.join(', '));
        if (loc.description || can.description) {
          setStory(loc.description || can.description || '');
          setShortDesc(loc.description || can.description || '');
        }
        if (loc.region || can.region) setMadeInLocation(loc.region || can.region || madeInLocation);

        const detected: string[] = [];
        if (can.craftName) detected.push('craftName');
        if (can.craftCategory) detected.push('craftCategory');
        if (can.technique) detected.push('technique');
        if (can.motif) detected.push('motif');
        if (can.material) detected.push('material');
        if (can.colors?.length) detected.push('colors');

        setTelemetry(prev => ({
          ...prev,
          aiResponseStatus: 'success',
          aiProvider: data.aiProvider === 'gemini' ? 'Gemini 2.5 Flash' : 'Demo Heuristic',
          detectedFields: detected,
          missingFields: data.uncertainAttributes || [],
        }));
      } else {
        const errData = await res.json().catch(() => ({}));
        setAnalysisError(errData.error || "We couldn't analyze the image.");
        setTelemetry(prev => ({
          ...prev,
          aiResponseStatus: 'failure',
          lastError: errData.error || 'Inspection failed',
        }));
      }
    } catch (err: any) {
      setAnalysisError("We couldn't analyze the image.");
      setTelemetry(prev => ({
        ...prev,
        aiResponseStatus: 'failure',
        lastError: err?.message || 'Network error',
      }));
    } finally {
      setIsAnalyzingCraft(false);
    }
  };



  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const { isActive: isTutorialActive, isPaused: isTutorialPaused, currentLevel, completeCurrentMission } = useTutorial();

  // If tutorial is active, automatically advance wizard step to match current mission
  useEffect(() => {
    if (isTutorialActive && !isTutorialPaused) {
      if (currentLevel === 3) {
        setStep(1);
      } else if (currentLevel === 4) {
        setStep(2);
        if (!rawImage) {
          handleSelectPreset(SAMPLE_PRESETS[0]);
        }
      } else if (currentLevel === 5) {
        setStep(3);
      } else if (currentLevel === 6 || currentLevel === 7) {
        setStep(4);
      }
    }
  }, [isTutorialActive, isTutorialPaused, currentLevel]);

  // Restore saved draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('shilpsetu_artisan_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.rawImage) setRawImage(parsed.rawImage);
        if (parsed.enhancedImage) setEnhancedImage(parsed.enhancedImage);
        if (parsed.material) setMaterial(parsed.material);
        if (parsed.craftType) setCraftType(parsed.craftType);
        if (parsed.colors) setColors(parsed.colors);
        if (parsed.dimensions) setDimensions(parsed.dimensions);
        if (parsed.handmadeFeatures) setHandmadeFeatures(parsed.handmadeFeatures);
        if (parsed.shortDesc) setShortDesc(parsed.shortDesc);
        if (parsed.story) setStory(parsed.story);
        if (parsed.suggestedPrice) setSuggestedPrice(parsed.suggestedPrice);
      }
    } catch {}
  }, []);

  // Autosave draft
  useEffect(() => {
    if (title || rawImage || craftType) {
      try {
        const draft = {
          title, category, rawImage, enhancedImage, material, craftType,
          colors, dimensions, handmadeFeatures, shortDesc, story, care, occasions,
          suggestedPrice, savedAt: new Date().toISOString()
        };
        localStorage.setItem('shilpsetu_artisan_draft', JSON.stringify(draft));
        setDraftSaved(true);
        const timer = setTimeout(() => setDraftSaved(false), 2000);
        return () => clearTimeout(timer);
      } catch {}
    }
  }, [title, category, rawImage, enhancedImage, material, craftType, colors, dimensions, shortDesc, story, suggestedPrice]);

  // Load preset sample
  const handleSelectPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    setRawImage(preset.rawImage);
    setEnhancedImage(preset.enhancedImage);
    setTitle(preset.title);
    setCategory(preset.category);
    setMaterial(preset.material);
    setCraftType(preset.craftType);
    setColors(preset.colors);
    setDimensions(preset.dimensions);
    setHandmadeFeatures(preset.handmadeFeatures);
    setShortDesc(preset.shortDesc);
    setStory(preset.story);
    setCare(preset.care);
    setOccasions(preset.occasions);
    setSuggestedPrice(preset.suggestedPrice);
    setMaterialCost(preset.cost);
    setStep(3);
    // Trigger real AI craft attribute inspection
    runCraftInspection(preset.rawImage, preset.category);
  };

  // Automatically launch camera viewfinder when arriving via "Scan Product"
  useEffect(() => {
    if (searchParams.get('action') === 'scan' && !rawImage) {
      setIsCameraModalOpen(true);
    }
  }, [searchParams, rawImage]);

  const handleImageCapture = (dataUrl: string) => {
    setValidationError(null);
    if (!dataUrl || (!dataUrl.startsWith('data:image/') && !dataUrl.startsWith('http'))) {
      setValidationError('Invalid image format. Please capture or upload a valid photo.');
      return;
    }

    const img = new Image();
    img.onload = () => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;
      if (width < 40 || height < 40) {
        setValidationError('Image resolution is too low. Please provide a clear, focused craft photo.');
        return;
      }

      // Auto-bound oversized images (> 1920px) to prevent network and storage bottlenecks
      let finalDataUrl = dataUrl;
      const maxDim = 1920;
      if (width > maxDim || height > maxDim) {
        try {
          const ratio = Math.min(maxDim / width, maxDim / height);
          const targetW = Math.round(width * ratio);
          const targetH = Math.round(height * ratio);
          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, targetW, targetH);
            finalDataUrl = canvas.toDataURL('image/jpeg', 0.88);
            width = targetW;
            height = targetH;
          }
        } catch (e) {
          console.warn('Canvas resize notice:', e);
        }
      }

      const base64Part = finalDataUrl.includes(',') ? finalDataUrl.split(',')[1] : '';
      const sizeBytes = base64Part ? Math.round((base64Part.length * 3) / 4) : undefined;
      const mimeType = finalDataUrl.startsWith('data:')
        ? finalDataUrl.substring(finalDataUrl.indexOf(':') + 1, finalDataUrl.indexOf(';'))
        : 'image/jpeg';

      setImageMeta({ width, height, sizeBytes, type: mimeType });
      setRawImage(finalDataUrl);
      setEnhancedImage(finalDataUrl);
      setInspectionResult(null);
      setAnalysisError(null);
      setIsCameraModalOpen(false);

      // Record telemetry
      setTelemetry(prev => ({
        ...prev,
        imageCaptured: true,
        imageSizeBytes: sizeBytes,
        imageMime: mimeType,
        imageDimensions: { width, height },
      }));

      // Automatically proceed to AI craft inspection
      setStep(3);
      runCraftInspection(finalDataUrl, category);
    };
    img.onerror = () => {
      setValidationError('Could not load captured craft image. Please try again.');
    };
    img.src = dataUrl;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Support broad image types across all mobile & desktop operating systems
    const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|heic|heif|gif|bmp|svg|avif)$/i.test(file.name) || !file.type;
    if (!isImage) {
      setValidationError('Please upload a valid image file (JPEG, PNG, WebP, HEIC).');
      return;
    }
    if (file.size === 0) {
      setValidationError('The selected image file is empty (0 bytes).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      if (src) {
        handleImageCapture(src);
      }
    };
    reader.onerror = () => {
      setValidationError('Could not read the selected image file. Please try again.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleStartAnalysis = () => {
    const targetImage = enhancedImage || rawImage;
    if (!targetImage || isAnalyzingCraft) return;
    setStep(3);
    runCraftInspection(targetImage, category);
  };

  const handleListen = (text: string) => {
    speakText(text, language);
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await fetch('/api/v1/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artisan_id: 'art-01',
          artisan_name: 'Rameshwar Rao',
          artisan_category: category,
          artisan_district: 'Pochampally',
          artisan_state: 'Telangana',
          category_hint: category,
          image: enhancedImage || rawImage,
          cost: {
            material_cost: materialCost || 850,
            labor_hours: laborHours || 15,
            hourly_rate: 90,
            other_cost: Math.round((materialCost || 850) * 0.15)
          }
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const prodId = data.product?.id || data.product_id;
        if (prodId) {
          await fetch(`/api/v1/products/${prodId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title,
              description: story || shortDesc,
              material,
              category,
              final_price: suggestedPrice,
              status: 'published',
            }),
          });
        }
        localStorage.removeItem('shilpsetu_artisan_draft');
        if (isTutorialActive && !isTutorialPaused && currentLevel === 7) {
          completeCurrentMission();
          navigate('/seller/orders');
        } else {
          navigate('/seller/handicrafts');
        }
      }
    } catch (err) {
      console.error(err);
      if (isTutorialActive && !isTutorialPaused && currentLevel === 7) {
        completeCurrentMission();
        navigate('/seller/orders');
      } else {
        navigate('/seller/handicrafts');
      }
    }
    setPublishing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header & Steps Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => navigate('/seller/handicrafts')}
          className="inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-900 text-xs font-bold self-start cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'hi' ? '← उत्पादों पर वापस जाएं' : language === 'te' ? '← వెనుకకు' : '← Back to Products'}</span>
        </button>

        {draftSaved && (
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1 self-start sm:self-auto">
            <Check className="w-3.5 h-3.5" />
            <span>Draft automatically saved</span>
          </span>
        )}
      </div>

      {/* Progress Step Indicator (1 to 4) */}
      <div className="bg-white rounded-3xl p-5 border border-[#eadfd4] shadow-xs">
        <div className="flex items-center justify-between gap-2">
          {[
            { num: 1, label: '1. Photo 📷', sub: 'Take Photo' },
            { num: 2, label: '2. Studio ✨', sub: 'AI Enhance' },
            { num: 3, label: '3. Details 🏷️', sub: 'Craft Info' },
            { num: 4, label: '4. Story 📝', sub: 'Review & Publish' },
          ].map((s) => {
            const isActive = step === s.num;
            const isDone = step > s.num;
            return (
              <button
                key={s.num}
                onClick={() => { if (rawImage || s.num === 1) setStep(s.num); }}
                className={`flex-1 text-center py-2 px-1 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#9c4124] text-white shadow-xs font-black'
                    : isDone
                    ? 'bg-[#fdf2e9] text-[#9c4124] font-bold'
                    : 'text-stone-400 font-medium'
                }`}
              >
                <div className="text-xs font-extrabold">{s.label}</div>
                <div className="text-[10px] hidden sm:block opacity-90">{s.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================================================== */}
      {/* STEP 1: TAKE PRODUCT PHOTO */}
      {/* ================================================== */}
      {step === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eadfd4] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#eadfd4]">
            <div>
              <span className="text-[10px] font-extrabold text-[#9c4124] bg-[#fdf2e9] px-2.5 py-0.5 rounded-full border border-[#f8d7c2] uppercase">
                Step 1 of 4
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#262220] font-['Rozha_One',serif] mt-1">
                {language === 'hi' ? 'अपने उत्पाद की साफ़ फ़ोटो लें' : language === 'te' ? 'మీ ఉత్పత్తి ఫోటో తీయండి' : 'Take a clear photo of your product'}
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Use your phone camera or select from gallery. AI will automatically enhance the background and lighting.
              </p>
            </div>

            <button
              onClick={() => handleListen(
                language === 'hi'
                  ? 'पहला चरण: अपने मोबाइल कैमरे से उत्पाद की फ़ोटो लें या गैलरी से चुनें। AI बैकग्राउंड और रोशनी खुद सुधार देगा।'
                  : language === 'te'
                  ? 'దశ 1: మీ మొబైల్ కెమెరాతో ఉత్పత్తి ఫోటో తీయండి లేదా గ్యాలరీ నుండి ఎంచుకోండి. AI కాంతిని మెరుగుపరుస్తుంది.'
                  : language === 'ta'
                  ? 'படி 1: உங்கள் கைவினைப் பொருளை கேமராவில் படம் எடுக்கவும் அல்லது கேலரியில் இருந்து தேர்வு செய்யவும். AI பின்னணியையும் வெளிச்சத்தையும் தானாகவே சரிசெய்யும்.'
                  : language === 'kn'
                  ? 'ಹಂತ 1: ನಿಮ್ಮ ಕರಕುಶಲ ವಸ್ತುವಿನ ಫೋಟೋವನ್ನು ಕ್ಯಾಮೆರಾದಿಂದ ತೆಗೆಯಿರಿ ಅಥವಾ ಗ್ಯಾಲರಿಯಿಂದ ಆಯ್ಕೆಮಾಡಿ. AI ಹಿನ್ನೆಲೆ ಮತ್ತು ಬೆಳಕನ್ನು ಸುಧಾರಿಸುತ್ತದೆ.'
                  : language === 'ml'
                  ? 'ഘട്ടം 1: നിങ്ങളുടെ കരകൗశല ഉൽപ്പന്നത്തിന്റെ ഫോട്ടോ ക്യാമറ വഴി എടുക്കുക അല്ലെങ്കിൽ ഗാലറിയിൽ നിന്ന് തിരഞ്ഞെടുക്കുക. AI പശ്ചാത്തಲവും വെളിച്ചവും മെച്ചപ്പെടുത്തും.'
                  : language === 'mr'
                  ? 'पायरी 1: आपल्या हस्तकलेचा फोटो कॅमेऱ्याने काढा किंवा गॅलरीतून निवडा. AI पार्श्वभूमी आणि प्रकाश सुधारेल.'
                  : language === 'gu'
                  ? 'પગલું 1: તમારા હસ્તકલાનો ફોટો કૅમેરાથી લો અથવા ગેલેરીમાંથી પસંદ કરો. AI બેકગ્રાઉન્ડ અને લાઇટિંગ સુધારશે.'
                  : language === 'bn'
                  ? 'ধাপ 1: আপনার হস্তশিল্পের ছবি ক্যামেরায় তুলুন বা গ্যালারি থেকে নির্বাচন করুন। AI ব্যাকগ্রাউন্ড ও আলো উন্নত করবে।'
                  : language === 'or'
                  ? 'ପଦକ୍ଷେପ 1: ନିଜ ହସ୍ତଶିଳ୍ପର ଫଟୋ କ୍ୟାମେରାରେ ନିଅନ୍ତୁ କିମ୍ବା ଗ୍ୟାଲେରୀରୁ ବାଛନ୍ତୁ। AI ପୃଷ୍ଠଭୂମି ଓ ଆଲୋକ ସୁଧାରିବ।'
                  : language === 'pa'
                  ? 'ਕਦਮ 1: ਆਪਣੇ ਦਸਤਕਾਰੀ ਦੀ ਫੋਟੋ ਕੈਮਰੇ ਨਾਲ ਲਓ ਜਾਂ ਗੈਲਰੀ ਵਿੱਚੋਂ ਚੁਣੋ। AI ਬੈਕਗ੍ਰਾਊਂਡ ਅਤੇ ਰੋਸ਼ਨੀ ਸੁਧਾਰੇਗਾ।'
                  : language === 'as'
                  ? 'পদক্ষেপ ১: আপোনাৰ হস্তশিল্পৰ ফটো কেমেৰাৰে তোলক বা গেলেৰীৰ পৰা বাছক। AI বেকগ্ৰাউণ্ড আৰু পোহৰ উন্নত কৰিব।'
                  : 'Step 1: Take a photo of your handicraft using your phone camera or select from gallery. AI will automatically enhance the background and lighting.'
              )}
              className="artisan-listen-btn cursor-pointer self-start sm:self-auto"
            >
              <Volume2 className="w-4 h-4" />
              <span>{t.listenToGuide || 'Listen 🔊'}</span>
            </button>
          </div>

          {/* Hardware Camera Viewfinder Modal */}
          <CameraCaptureModal
            isOpen={isCameraModalOpen}
            onClose={() => setIsCameraModalOpen(false)}
            onCapture={handleImageCapture}
            title={language === 'hi' ? '📷 शिल्प की फ़ोटो लें' : language === 'te' ? '📷 హస్తకళ ఫోటో తీయండి' : '📷 Capture Craft Photo'}
          />

          {/* Hidden file inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          {/* Validation Error Banner for initial upload */}
          {validationError && !rawImage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{validationError}</span>
              </div>
              <button
                type="button"
                onClick={() => setValidationError(null)}
                className="text-rose-600 hover:text-rose-900 text-xs font-black cursor-pointer px-2 py-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Image Preview Gate Card vs Capture Options */}
          {rawImage ? (
            <div className="bg-[#faf7f2] rounded-3xl p-5 sm:p-6 border-2 border-[#9c4124]/30 space-y-4 shadow-sm animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-[#eadfd4]">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#9c4124] tracking-wider bg-[#fdf2e9] px-2.5 py-0.5 rounded-md border border-[#f8d7c2]">
                    Image Preview Gate
                  </span>
                  <h3 className="text-base font-extrabold text-[#262220] mt-1">
                    {language === 'te' ? 'క్రాఫ్ట్ ఫోటో ప్రివ్యూ' : language === 'hi' ? 'शिल्प फोटो पूर्वावलोकन' : 'Craft Photo Preview'}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 font-mono">
                  {imageMeta?.width && imageMeta?.height && (
                    <span className="bg-white px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs">
                      {imageMeta.width} × {imageMeta.height} px
                    </span>
                  )}
                  {imageMeta?.sizeBytes && (
                    <span className="bg-white px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs">
                      {Math.round(imageMeta.sizeBytes / 1024)} KB
                    </span>
                  )}
                  {imageMeta?.type && (
                    <span className="bg-white px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs uppercase">
                      {imageMeta.type.replace('image/', '')}
                    </span>
                  )}
                </div>
              </div>

              {/* Viewfinder Preview */}
              <div className="relative max-h-[360px] sm:max-h-[440px] rounded-2xl overflow-hidden bg-stone-950 flex items-center justify-center border border-stone-800">
                <img
                  src={rawImage}
                  alt="Captured craft preview"
                  className="max-h-[360px] sm:max-h-[440px] w-auto object-contain rounded-xl"
                />
                <div className="absolute top-3 left-3 bg-stone-900/85 backdrop-blur text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ready for AI Craft Inspection</span>
                </div>
              </div>

              {validationError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Actions: Retake vs Analyze Craft */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRawImage('');
                    setEnhancedImage('');
                    setImageMeta(null);
                    setInspectionResult(null);
                    setAnalysisError(null);
                    setValidationError(null);
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{language === 'te' ? 'మరలా తీయండి' : language === 'hi' ? 'पुनः फोटो लें' : 'Retake / Choose Another'}</span>
                </button>

                <button
                  type="button"
                  disabled={isAnalyzingCraft}
                  onClick={handleStartAnalysis}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl text-xs font-black text-white bg-[#9c4124] hover:bg-[#83341b] disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all min-h-[44px]"
                >
                  {isAnalyzingCraft ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Analyzing Craft...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{language === 'te' ? 'క్రాఫ్ట్ వివరాలు విశ్లేషించండి ✨' : language === 'hi' ? 'शिल्प विवरण विश्लेषण करें ✨' : 'Analyze Craft ✨'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Option 1: Live Viewfinder Camera */}
              <div
                onClick={() => setIsCameraModalOpen(true)}
                className="p-6 rounded-3xl border-2 border-dashed border-[#eadfd4] hover:border-[#9c4124] bg-[#faf7f2] flex flex-col items-center justify-center text-center cursor-pointer transition-all group hover:bg-[#fdfbf7]"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#fdf2e9] text-[#9c4124] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Camera className="w-7 h-7" />
                </div>
                <h3 className="font-extrabold text-sm text-[#262220]">
                  {language === 'hi' ? '📷 लाइव कैमरा' : language === 'te' ? '📷 లైవ్ కెమెరా' : '📷 Live Viewfinder'}
                </h3>
                <p className="text-[11px] text-stone-500 mt-1">
                  HD viewfinder with guide grid
                </p>
              </div>

              {/* Option 2: Direct Phone Camera */}
              <div
                onClick={() => cameraInputRef.current?.click()}
                className="p-6 rounded-3xl border-2 border-dashed border-[#eadfd4] hover:border-[#9c4124] bg-[#faf7f2] flex flex-col items-center justify-center text-center cursor-pointer transition-all group hover:bg-[#fdfbf7]"
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Camera className="w-7 h-7" />
                </div>
                <h3 className="font-extrabold text-sm text-[#262220]">
                  {language === 'hi' ? '📱 फ़ोन कैमरा' : language === 'te' ? '📱 మొబైల్ కెమెరా' : '📱 Direct Camera'}
                </h3>
                <p className="text-[11px] text-stone-500 mt-1">
                  Snap instantly with your device camera
                </p>
              </div>

              {/* Option 3: Gallery Upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-6 rounded-3xl border-2 border-dashed border-[#eadfd4] hover:border-[#9c4124] bg-[#faf7f2] flex flex-col items-center justify-center text-center cursor-pointer transition-all group hover:bg-[#fdfbf7]"
              >
                <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <h3 className="font-extrabold text-sm text-[#262220]">
                  {language === 'hi' ? '🖼️ गैलरी से चुनें' : language === 'te' ? '🖼️ గ్యాలరీ నుండి' : '🖼️ Upload from Gallery'}
                </h3>
                <p className="text-[11px] text-stone-500 mt-1">
                  Choose JPG, PNG, WebP, HEIC
                </p>
              </div>
            </div>
          )}

          {/* Quick Demo Sample Crafts */}
          <div className="pt-4 border-t border-[#eadfd4]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-stone-700">
                Or tap a sample craft to test instantly:
              </span>
              <span className="text-[10px] text-stone-500">1-Click Demo Presets</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SAMPLE_PRESETS.map((preset, idx) => (
                <div
                  key={idx}
                  data-tutorial={idx === 0 ? 'photo-preset-sample' : undefined}
                  onClick={() => handleSelectPreset(preset)}
                  className="p-3 rounded-2xl bg-[#faf7f2] border border-[#eadfd4] hover:border-[#9c4124] flex items-center gap-3 cursor-pointer transition-all hover:bg-[#fdfbf7]"
                >
                  <img
                    src={preset.rawImage}
                    alt={preset.name}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#262220] truncate">{preset.name}</p>
                    <p className="text-[11px] text-[#9c4124] font-semibold">{preset.category} • ₹{preset.suggestedPrice}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* STEP 2: AI IMAGE STUDIO (BEFORE | AFTER) */}
      {/* ================================================== */}
      {step === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eadfd4] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#eadfd4]">
            <div>
              <span className="text-[10px] font-extrabold text-[#9c4124] bg-[#fdf2e9] px-2.5 py-0.5 rounded-full border border-[#f8d7c2] uppercase">
                Step 2 of 4 • AI Image Studio
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#262220] font-['Rozha_One',serif] mt-1">
                Make My Photo Better ✨
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Original photo is preserved. AI cleans background, balances studio lighting, and centers your craft.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveImageView('original')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeImageView === 'original' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600'
                }`}
              >
                Before (Original)
              </button>
              <button
                onClick={() => setActiveImageView('enhanced')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeImageView === 'enhanced' ? 'bg-[#9c4124] text-white' : 'bg-stone-100 text-stone-600'
                }`}
              >
                After (AI Enhanced ✨)
              </button>
            </div>
          </div>

          {/* Interactive Before | After Display */}
          <div className="relative rounded-3xl overflow-hidden border border-[#eadfd4] bg-stone-50 aspect-4/3 max-w-lg mx-auto flex items-center justify-center">
            {isEnhancing ? (
              <div className="text-center p-8">
                <div className="w-12 h-12 border-3 border-[#eadfd4] border-t-[#9c4124] rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-bold text-stone-800">Cleaning background & lighting...</p>
                <p className="text-xs text-stone-500 mt-1">Highlighting authentic handmade texture</p>
              </div>
            ) : (
              <>
                <img
                  src={activeImageView === 'enhanced' ? enhancedImage || rawImage : rawImage}
                  alt="Product view"
                  className="w-full h-full object-cover"
                />

                {/* Badge Overlay */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-md ${
                    activeImageView === 'enhanced'
                      ? 'bg-[#9c4124] text-white'
                      : 'bg-stone-900/80 text-stone-200'
                  }`}>
                    {activeImageView === 'enhanced' ? '✨ AI Enhanced Studio View' : 'Original Raw Photo'}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Background Selection Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-bold text-stone-600 mr-1">Studio Background:</span>
            {[
              { id: 'studio-linen', label: 'Clean Studio Linen' },
              { id: 'terracotta', label: 'Warm Terracotta Clay' },
              { id: 'natural', label: 'Artisan Workshop' },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setBackgroundTheme(b.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  backgroundTheme === b.id
                    ? 'bg-[#fdf2e9] text-[#9c4124] border-[#f8d7c2]'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Navigation to Step 3 */}
          <div className="flex items-center justify-between pt-4 border-t border-[#eadfd4]">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 cursor-pointer"
            >
              ← Retake Photo
            </button>

            <button
              data-tutorial="ai-studio-compare"
              onClick={() => {
                if (!inspectionResult && !isAnalyzingCraft) {
                  runCraftInspection(enhancedImage || rawImage, category);
                }
                setStep(3);
              }}
              className="artisan-btn-primary cursor-pointer flex items-center gap-2"
            >
              <span>Inspect Craft Attributes ✨</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* STEP 3: AI PRODUCT UNDERSTANDING & CRAFT ATTRIBUTES */}
      {/* ================================================== */}
      {step === 3 && (
        <div>
          {isAnalyzingCraft ? (
            <div className="bg-white rounded-3xl p-12 border border-[#eadfd4] shadow-xs text-center space-y-4">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="w-20 h-20 border-4 border-[#eadfd4] border-t-[#9c4124] rounded-full animate-spin" />
                <Sparkles className="w-8 h-8 text-[#9c4124] absolute animate-pulse" />
              </div>
              <h3 className="text-xl font-black text-[#262220] font-['Rozha_One',serif]">
                {labels.analyzingCraftMsg}
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Analyzing visible weave patterns, regional craft technique, authentic materials, and color motifs...
              </p>
            </div>
          ) : analysisError ? (
            <div className="bg-white rounded-3xl p-8 border border-red-200 shadow-xs text-center space-y-4">
              <div className="w-14 h-14 bg-red-100 text-red-700 rounded-2xl flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-extrabold text-stone-900">
                We couldn't analyze the image.
              </h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto">
                {analysisError}
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => runCraftInspection(enhancedImage || rawImage, category)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#9c4124] hover:bg-[#83341b] cursor-pointer shadow-xs"
                >
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAnalysisError(null);
                    setStep(4);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 cursor-pointer"
                >
                  Enter Details Manually
                </button>
              </div>
            </div>
          ) : inspectionResult ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-900 text-xs font-bold cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{language === 'hi' ? '← फोटो स्टूडियो (बैकग्राउंड)' : language === 'te' ? '← ఫోటో స్టూడియో' : '← Photo Studio (Lighting & Background)'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => runCraftInspection(enhancedImage || rawImage, category)}
                  disabled={isAnalyzingCraft}
                  className="inline-flex items-center gap-1.5 text-[#9c4124] hover:text-[#83341b] text-xs font-bold cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzingCraft ? 'animate-spin' : ''}`} />
                  <span>{language === 'hi' ? 'फिर से जांचें' : language === 'te' ? 'మళ్ళీ పరిశీలించు' : 'Re-inspect Image'}</span>
                </button>
              </div>

              {/* ================================================== */}
              {/* VOICE-GUIDED PRODUCT DETAILS + PRICING WIZARD */}
              {/* ================================================== */}
              <VoiceProductDetailsPricingWizard
                language={language}
                imageUrl={enhancedImage || rawImage}
                detectedCraft={inspectionResult ? inspectionResult.canonicalAttributes : null}
                currentFormState={{
                  title,
                  category,
                  material,
                  craftType,
                  colors,
                  dimensions,
                  story,
                  shortDesc,
                  suggestedPrice,
                  materialCost,
                  laborHours,
                  quantity,
                  madeInLocation,
                }}
                onFieldUpdated={handleVoiceFieldUpdated}
                onProductConfirmed={(confirmedProduct) => {
                  if (confirmedProduct.productName) setTitle(confirmedProduct.productName);
                  if (confirmedProduct.craftCategory || confirmedProduct.category) setCategory(confirmedProduct.craftCategory || confirmedProduct.category);
                  if (confirmedProduct.material) setMaterial(confirmedProduct.material);
                  if (confirmedProduct.technique || confirmedProduct.craftType) setCraftType(confirmedProduct.technique || confirmedProduct.craftType);
                  if (confirmedProduct.colors) setColors(confirmedProduct.colors);
                  if (confirmedProduct.dimensions) setDimensions(confirmedProduct.dimensions);
                  if (confirmedProduct.region || confirmedProduct.madeInLocation) setMadeInLocation(confirmedProduct.region || confirmedProduct.madeInLocation);
                  if (confirmedProduct.quantity) setQuantity(Number(confirmedProduct.quantity));
                  if (confirmedProduct.description) {
                    setStory(confirmedProduct.description);
                    setShortDesc(confirmedProduct.description);
                  }
                  setStep(4);
                }}
                onPricingCompleted={(pricingData) => {
                  setMaterialCost(pricingData.materialCost);
                  setLaborHours(pricingData.laborHours);
                  setQuantity(pricingData.quantity);
                  setSuggestedPrice(pricingData.artisanApprovedPrice);
                  setTelemetry(prev => ({
                    ...prev,
                    pricingTelemetry: {
                      materialCost: pricingData.materialCost,
                      laborHours: pricingData.laborHours,
                      fairHourlyWage: pricingData.fairHourlyWage,
                      laborCost: pricingData.laborCost,
                      productionCost: pricingData.productionCost,
                      targetMargin: pricingData.targetMargin,
                      recommendedFairPrice: pricingData.recommendedFairPrice,
                      marketMedian: pricingData.marketBenchmarks?.median,
                      marketMin: pricingData.marketBenchmarks?.min,
                      marketMax: pricingData.marketBenchmarks?.max,
                      marketAvailable: pricingData.marketBenchmarks?.available,
                      artisanApprovedPrice: pricingData.artisanApprovedPrice,
                    }
                  }));
                  setStep(4);
                }}
                onTelemetryUpdate={(data) => {
                  setTelemetry(prev => ({
                    ...prev,
                    currentVoiceState: data.voiceState,
                    speechLocale: data.speechLocale,
                    speechRecognitionSupported: data.speechRecognitionSupported,
                    ttsSupported: data.ttsSupported,
                    lastTranscript: data.transcript,
                    lastExtractedField: data.currentField ? `${data.currentField}: ${data.extractedValue}` : prev.lastExtractedField,
                    lastError: data.lastError,
                    pricingTelemetry: data.pricingData ? {
                      materialCost: data.pricingData.materialCost,
                      laborHours: data.pricingData.laborHours,
                      fairHourlyWage: data.pricingData.fairHourlyWage,
                      laborCost: data.pricingData.laborCost,
                      productionCost: data.pricingData.productionCost,
                      targetMargin: data.pricingData.targetMargin,
                      recommendedFairPrice: data.pricingData.recommendedFairPrice,
                      marketMedian: data.pricingData.marketBenchmarks?.median,
                      marketMin: data.pricingData.marketBenchmarks?.min,
                      marketMax: data.pricingData.marketBenchmarks?.max,
                      marketAvailable: data.pricingData.marketBenchmarks?.available,
                      artisanApprovedPrice: data.pricingData.artisanApprovedPrice,
                    } : prev.pricingTelemetry,
                  }));
                }}
              />
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-[#eadfd4] shadow-xs text-center space-y-4">
              <Sparkles className="w-10 h-10 text-[#9c4124] mx-auto" />
              <h3 className="text-lg font-black text-[#262220]">
                Ready to Analyze Craft Details
              </h3>
              <button
                type="button"
                onClick={() => runCraftInspection(enhancedImage || rawImage, category)}
                className="px-6 py-2.5 bg-[#9c4124] hover:bg-[#83341b] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Analyze Craft Image Now ✨
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================================================== */}
      {/* STEP 4: AI DESCRIPTION & REVIEW & FAIR PRICING */}
      {/* ================================================== */}
      {step === 4 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eadfd4] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#eadfd4]">
            <div>
              <span className="text-[10px] font-extrabold text-[#9c4124] bg-[#fdf2e9] px-2.5 py-0.5 rounded-full border border-[#f8d7c2] uppercase">
                Step 4 of 4 • Final Product Review & Fair Pricing
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#262220] font-['Rozha_One',serif] mt-1">
                Product Details Complete ✓
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Review your handcrafted product details. AI calculates a fair price based on your materials and labor hours.
              </p>
            </div>

            <button
              onClick={() => explainPricingViaVoice(materialCost, laborHours, suggestedPrice)}
              className="artisan-listen-btn cursor-pointer self-start sm:self-auto"
            >
              <Volume2 className="w-4 h-4" />
              <span>Listen to Pricing Breakdown 🔊</span>
            </button>
          </div>

          {/* REQUIREMENT 29: PRODUCT DETAILS COMPLETE SUMMARY CARD */}
          <div className="bg-[#faf7f2] rounded-3xl p-5 sm:p-6 border border-[#eadfd4] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#9c4124] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Verified Product Attributes
              </span>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-xs text-[#9c4124] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit via Voice/Form
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-3 rounded-2xl border border-stone-200">
                <span className="text-[10px] font-bold text-stone-400 block uppercase">Craft Type</span>
                <span className="font-extrabold text-[#262220]">{craftType || category}</span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-stone-200">
                <span className="text-[10px] font-bold text-stone-400 block uppercase">Material</span>
                <span className="font-extrabold text-[#262220]">{material || 'Pure Cotton'}</span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-stone-200">
                <span className="text-[10px] font-bold text-stone-400 block uppercase">Handcrafted Labor</span>
                <span className="font-extrabold text-[#262220]">{laborHours || 15} hours</span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-stone-200">
                <span className="text-[10px] font-bold text-stone-400 block uppercase">Material Cost</span>
                <span className="font-extrabold text-[#262220]">₹{materialCost || 850}</span>
              </div>
            </div>

            {/* REQUIREMENT 24: SHOW AI VS USER VALUES */}
            {originalAiValues.material && material && originalAiValues.material.toLowerCase() !== material.toLowerCase() && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 space-y-1">
                <div className="font-extrabold flex items-center gap-1 text-[#9c4124]">
                  <Sparkles className="w-3.5 h-3.5" /> AI vs Artisan Correction
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-stone-500 font-medium">AI detected: </span>
                    <span className="line-through text-stone-600">{originalAiValues.material}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 font-medium">Your correction: </span>
                    <span className="font-bold text-[#9c4124]">{material}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 font-medium">Final saved value: </span>
                    <span className="font-extrabold text-emerald-800">✓ {material}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Title and Short Description */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-extrabold text-stone-700">Product Title</label>
                <button onClick={() => setEditingField(editingField === 'title' ? null : 'title')} className="text-xs text-[#9c4124] font-bold flex items-center gap-1 cursor-pointer">
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#eadfd4] font-extrabold text-base text-[#262220] focus:ring-2 focus:ring-[#9c4124] focus:outline-none"
              />
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-xs font-extrabold text-stone-700 mb-1">Short Description (for marketplace cards)</label>
              <textarea
                rows={2}
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#eadfd4] text-xs font-medium text-stone-800 focus:ring-2 focus:ring-[#9c4124] focus:outline-none"
              />
            </div>

            {/* Full Craft Heritage Story */}
            <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#eadfd4] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#9c4124] uppercase flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#c85a32]" />
                  AI Craft Heritage Story
                </span>
                <span className="text-[10px] text-stone-500 font-semibold">Ready for English, Hindi, Telugu buyers</span>
              </div>
              <textarea
                rows={4}
                value={story}
                onChange={(e) => setStory(e.target.value)}
                className="w-full p-3 bg-white rounded-xl border border-stone-200 text-xs text-stone-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#9c4124]"
              />
            </div>

            {/* Verified Origin / Made in Badge */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#9c4124] shrink-0" />
                <div>
                  <span className="text-xs font-bold text-stone-800">
                    Made in: <span className="text-[#9c4124] font-extrabold">{madeInLocation}</span>
                  </span>
                  <span className="text-[10px] text-stone-500 block">
                    Regional artisan place (Does not automatically imply GI certification)
                  </span>
                </div>
              </div>
              <button
                onClick={() => setStep(3)}
                className="text-xs font-bold text-[#9c4124] hover:underline shrink-0"
              >
                Edit
              </button>
            </div>

            {/* REQUIREMENT 30: FAIR PRICING ENGINE CALCULATION BOX */}
            <div data-tutorial="ai-price-box" className="p-5 rounded-3xl bg-emerald-50/60 border border-emerald-300 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-emerald-200/80 pb-3">
                <div>
                  <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Fair Pricing Engine (Cost-Plus Methodology)
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-3xl font-black text-emerald-950">₹{suggestedPrice}</span>
                    <span className="text-xs text-emerald-800 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-md">
                      Net Profit: ~₹{Math.max(suggestedPrice - (materialCost || 850), 0)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs font-bold text-stone-700">Set Custom Price: ₹</span>
                  <input
                    type="number"
                    value={suggestedPrice}
                    onChange={(e) => setSuggestedPrice(Number(e.target.value))}
                    className="w-28 px-3 py-1.5 bg-white rounded-xl border border-emerald-300 text-base font-extrabold text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Formula Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-stone-500 font-semibold block">Material Cost</span>
                  <span className="font-extrabold text-stone-900">₹{materialCost || 850}</span>
                </div>
                <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-stone-500 font-semibold block">Artisan Labor ({laborHours || 15}h @ ₹90/h)</span>
                  <span className="font-extrabold text-stone-900">₹{(laborHours || 15) * 90}</span>
                </div>
                <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-stone-500 font-semibold block">Tooling & Overhead (15%)</span>
                  <span className="font-extrabold text-stone-900">₹{Math.round((materialCost || 850) * 0.15)}</span>
                </div>
                <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-stone-500 font-semibold block">Fair Profit Margin (20%)</span>
                  <span className="font-extrabold text-stone-900">₹{Math.round(((materialCost || 850) + ((laborHours || 15) * 90)) * 0.20)}</span>
                </div>
              </div>

              <p className="text-[11px] text-emerald-900/80 font-medium">
                Fair price dynamically calculated to prevent artisan exploitation and ensure liveable wage rates.
              </p>
            </div>
          </div>

          {/* Publish CTA Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#eadfd4]">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 cursor-pointer"
            >
              ← Back to Details
            </button>

            <button
              data-tutorial="publish-product-btn"
              onClick={handlePublish}
              disabled={publishing}
              className="artisan-btn-primary cursor-pointer flex items-center gap-2 min-h-[48px] px-8"
            >
              {publishing ? (
                <span>Publishing to Marketplace...</span>
              ) : (
                <>
                  <span>Publish Product to Marketplace 🚀</span>
                  <CheckCircle2 className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* REQUIREMENT 32: DEV ONLY AI / CAMERA / VOICE TELEMETRY PANEL */}
      <DevAiDebugPanel telemetry={telemetry} />
    </div>
  );
}
