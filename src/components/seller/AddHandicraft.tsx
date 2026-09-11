import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Camera, Upload, Sparkles, CheckCircle2, ArrowRight, ArrowLeft,
  Volume2, RotateCcw, Edit3, Globe, Tag, DollarSign, Eye, RefreshCw,
  AlertCircle, ShieldCheck, Check
} from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { translations, speakText } from '../../lib/i18n';
import { formatINR } from '../../lib/billingService';
import { useTutorial } from '../tutorial/TutorialContext';
import { ShowMeButton } from '../tutorial/ContextualHelp';

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
  const { language } = useLanguage();
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
  const [shortDesc, setShortDesc] = useState('');
  const [story, setStory] = useState('');
  const [care, setCare] = useState('');
  const [occasions, setOccasions] = useState('');
  const [suggestedPrice, setSuggestedPrice] = useState<number>(1850);
  const [materialCost, setMaterialCost] = useState<number>(850);
  const [publishing, setPublishing] = useState<boolean>(false);
  const [draftSaved, setDraftSaved] = useState<boolean>(false);
  const [editingField, setEditingField] = useState<string | null>(null);

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
    setStep(2);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setRawImage(src);
      setEnhancedImage(src);
      // Run simulated enhancement pipeline
      setIsEnhancing(true);
      setStep(2);
      setTimeout(() => {
        setIsEnhancing(false);
        // Default AI attributes for custom uploads
        if (!title) {
          setTitle('Handcrafted Artisan Craft Piece');
          setCategory('Handloom');
          setMaterial('Natural organic materials');
          setCraftType('Traditional Handcraft');
          setColors('Earthy warm tones');
          setDimensions('Standard size');
          setHandmadeFeatures('100% handmade, ethical artisan labor');
          setShortDesc('Carefully handcrafted piece created with heritage techniques and natural materials.');
          setStory('Made by hand by traditional village craftspeople honoring multigenerational Indian craftsmanship.');
          setCare('Handle with care. Gentle hand cleaning recommended.');
          setOccasions('Festivals, thoughtful gifting, sustainable living');
        }
      }, 1500);
    };
    reader.readAsDataURL(file);
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
            material_cost: materialCost,
            labor_hours: 18,
            hourly_rate: 85,
            other_cost: 150
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
              onClick={() => handleListen('Step 1: Take a clear photo of your product. Use your phone camera or select from your gallery. You do not need professional lighting.')}
              className="artisan-listen-btn cursor-pointer self-start sm:self-auto"
            >
              <Volume2 className="w-4 h-4" />
              <span>Listen 🔊</span>
            </button>
          </div>

          {/* Hidden inputs */}
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

          {/* Large Camera & Upload Trigger Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Camera Button */}
            <div
              onClick={() => cameraInputRef.current?.click()}
              className="p-8 rounded-3xl border-2 border-dashed border-[#eadfd4] hover:border-[#9c4124] bg-[#faf7f2] flex flex-col items-center justify-center text-center cursor-pointer transition-all group hover:bg-[#fdfbf7]"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#fdf2e9] text-[#9c4124] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-base text-[#262220]">
                {language === 'hi' ? '📷 कैमरा चालू करें' : language === 'te' ? '📷 కెమెరా ఉపయోగించండి' : '📷 Take with Camera'}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Use hardware smartphone camera
              </p>
            </div>

            {/* Gallery Upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 rounded-3xl border-2 border-dashed border-[#eadfd4] hover:border-[#9c4124] bg-[#faf7f2] flex flex-col items-center justify-center text-center cursor-pointer transition-all group hover:bg-[#fdfbf7]"
            >
              <div className="w-16 h-16 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-base text-[#262220]">
                {language === 'hi' ? '🖼️ गैलरी से चुनें' : language === 'te' ? '🖼️ గ్యాలరీ నుండి ఎంచుకోండి' : '🖼️ Upload from Gallery'}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Select existing photo from phone
              </p>
            </div>
          </div>

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
              onClick={() => setStep(3)}
              className="artisan-btn-primary cursor-pointer flex items-center gap-2"
            >
              <span>Approve Enhanced Photo ✨</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* STEP 3: AI PRODUCT UNDERSTANDING */}
      {/* ================================================== */}
      {step === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eadfd4] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#eadfd4]">
            <div>
              <span className="text-[10px] font-extrabold text-[#9c4124] bg-[#fdf2e9] px-2.5 py-0.5 rounded-full border border-[#f8d7c2] uppercase">
                Step 3 of 4 • AI Understanding
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#262220] font-['Rozha_One',serif] mt-1">
                AI Detected Craft Attributes
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Review and tap any chip to edit. You have complete control over your craft details.
              </p>
            </div>

            <button
              onClick={() => handleListen('Step 3: Review the details our system detected. You can tap on any box to correct category, materials, or dimensions.')}
              className="artisan-listen-btn cursor-pointer self-start sm:self-auto"
            >
              <Volume2 className="w-4 h-4" />
              <span>Listen 🔊</span>
            </button>
          </div>

          {/* Editable Field Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#eadfd4]">
              <label className="block text-xs font-extrabold text-[#9c4124] uppercase mb-1">
                Product Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white px-3 py-2 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#9c4124]"
              >
                {['Handloom', 'Pottery', 'Woodcraft', 'Metalcraft', 'Jewellery', 'Painting', 'Embroidery', 'Bamboo/Cane', 'Other'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Material */}
            <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#eadfd4]">
              <label className="block text-xs font-extrabold text-[#9c4124] uppercase mb-1">
                Primary Material
              </label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="e.g. Mulberry Silk, Riverbed Clay, Teak Wood"
                className="w-full bg-white px-3 py-2 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#9c4124]"
              />
            </div>

            {/* Craft Type */}
            <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#eadfd4]">
              <label className="block text-xs font-extrabold text-[#9c4124] uppercase mb-1">
                Craft Technique / Heritage
              </label>
              <input
                type="text"
                value={craftType}
                onChange={(e) => setCraftType(e.target.value)}
                placeholder="e.g. Kalamkari Hand-block, Pochampally Ikat"
                className="w-full bg-white px-3 py-2 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#9c4124]"
              />
            </div>

            {/* Dimensions */}
            <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#eadfd4]">
              <label className="block text-xs font-extrabold text-[#9c4124] uppercase mb-1">
                Approximate Dimensions
              </label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                placeholder="e.g. 5.5m saree, 10 x 6 inches, 250 grams"
                className="w-full bg-white px-3 py-2 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#9c4124]"
              />
            </div>

            {/* Handmade Features */}
            <div className="sm:col-span-2 p-4 rounded-2xl bg-[#faf7f2] border border-[#eadfd4]">
              <label className="block text-xs font-extrabold text-[#9c4124] uppercase mb-1">
                Handmade Characteristics & Authenticity
              </label>
              <input
                type="text"
                value={handmadeFeatures}
                onChange={(e) => setHandmadeFeatures(e.target.value)}
                placeholder="e.g. 100% natural dyes, GI tag certified, hand-spun on traditional pit-loom"
                className="w-full bg-white px-3 py-2 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#9c4124]"
              />
            </div>
          </div>

          {/* Navigation to Step 4 */}
          <div className="flex items-center justify-between pt-4 border-t border-[#eadfd4]">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 cursor-pointer"
            >
              ← Back to Studio
            </button>

            <button
              data-tutorial="ai-craft-attributes"
              onClick={() => setStep(4)}
              className="artisan-btn-primary cursor-pointer flex items-center gap-2"
            >
              <span>Continue to AI Story & Description →</span>
            </button>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* STEP 4: AI DESCRIPTION & REVIEW & PUBLISH */}
      {/* ================================================== */}
      {step === 4 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eadfd4] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#eadfd4]">
            <div>
              <span className="text-[10px] font-extrabold text-[#9c4124] bg-[#fdf2e9] px-2.5 py-0.5 rounded-full border border-[#f8d7c2] uppercase">
                Step 4 of 4 • Final Review
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#262220] font-['Rozha_One',serif] mt-1">
                Your AI Product Story & Pricing
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Ready to publish. Buyers will read your authentic craft heritage story.
              </p>
            </div>

            <button
              onClick={() => handleListen(story || shortDesc)}
              className="artisan-listen-btn cursor-pointer self-start sm:self-auto"
            >
              <Volume2 className="w-4 h-4" />
              <span>Listen to Story 🔊</span>
            </button>
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

            {/* Fair Price Box */}
            <div data-tutorial="ai-price-box" className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold text-emerald-800 uppercase">AI Recommended Selling Price</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-2xl font-black text-emerald-950">₹{suggestedPrice}</span>
                  <span className="text-xs text-emerald-700 font-bold">(Your profit: ~₹{suggestedPrice - materialCost})</span>
                </div>
                <p className="text-[11px] text-stone-600 mt-0.5">
                  Fair price based on your material cost of ₹{materialCost} and fair labor wages.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs font-bold text-stone-700">Set Price: ₹</span>
                <input
                  type="number"
                  value={suggestedPrice}
                  onChange={(e) => setSuggestedPrice(Number(e.target.value))}
                  className="w-24 px-2 py-1 bg-white rounded-lg border border-stone-300 text-sm font-extrabold text-stone-900"
                />
              </div>
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
    </div>
  );
}
