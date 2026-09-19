import React, { useState, useCallback } from 'react';
import { LanguageCode } from '../../types';
import { useVoiceForm } from '../../lib/useVoiceForm';
import { VOICE_QUESTIONS } from '../../lib/voiceQuestionsI18n';
import {
  parseQuantityTranscript,
} from '../../lib/voiceParsingService';
import {
  Tag, Palette, MapPin, Hash, IndianRupee, Clock, FileText,
  Sparkles, Check, Package, AlertCircle
} from 'lucide-react';
import { VoiceTypeButton, VoiceState } from './ui/VoiceTypeButton';
import { formatINR } from '../../lib/billingService';

export interface VoiceProductFormData {
  product_name: string;
  category: string;
  material: string;
  color: string;
  address: string;
  quantity: string | number;
  material_cost: string | number;
  labor_hours: string | number;
  description: string;
}

interface SimpleVoiceProductFormProps {
  initialData?: Partial<VoiceProductFormData>;
  language?: LanguageCode | string;
  photoError?: string | null;
  detectedAiAttributes?: any | null;
  productImage?: string;
  onSave: (data: VoiceProductFormData) => void;
  onCancel?: () => void;
}

const CRAFT_CATEGORIES = [
  'Handloom',
  'Pottery',
  'Woodcraft',
  'Metalcraft',
  'Jewellery',
  'Painting',
  'Embroidery',
  'Bamboo/Cane',
  'Terracotta',
  'Stone Craft',
  'Leathercraft',
  'Tribal Art',
];

export const SimpleVoiceProductForm: React.FC<SimpleVoiceProductFormProps> = ({
  initialData,
  language = 'en',
  photoError = null,
  detectedAiAttributes = null,
  productImage,
  onSave,
  onCancel,
}) => {
  const lang = (language as LanguageCode) || 'en';
  const vq = VOICE_QUESTIONS[lang] || VOICE_QUESTIONS.en;
  const { speak, listen, stopAll } = useVoiceForm(lang);

  const [formData, setFormData] = useState<VoiceProductFormData>({
    product_name: initialData?.product_name || detectedAiAttributes?.craftName || detectedAiAttributes?.title || '',
    category: initialData?.category || detectedAiAttributes?.craftCategory || 'Handloom',
    material: initialData?.material || detectedAiAttributes?.material || '',
    color: initialData?.color || (Array.isArray(detectedAiAttributes?.colors) ? detectedAiAttributes.colors.join(', ') : detectedAiAttributes?.colors) || '',
    address: initialData?.address || detectedAiAttributes?.region || 'Andhra Pradesh',
    quantity: initialData?.quantity || '1',
    material_cost: initialData?.material_cost || '850',
    labor_hours: initialData?.labor_hours || '15',
    description: initialData?.description || detectedAiAttributes?.story || detectedAiAttributes?.description || '',
  });

  // State tracking per field for VoiceTypeButton: 'idle' | 'speaking' | 'listening' | 'processing' | 'added'
  const [fieldStates, setFieldStates] = useState<Record<string, VoiceState>>({});
  const [activeVoiceField, setActiveVoiceField] = useState<string | null>(null);

  const handleInputChange = (fieldKey: keyof VoiceProductFormData, val: string | number) => {
    setFormData(prev => ({ ...prev, [fieldKey]: val }));
  };

  // Explicit Mic Trigger on button click ONLY
  const handleMicClick = useCallback(
    (fieldKey: keyof VoiceProductFormData, isNumeric: boolean = false) => {
      if (activeVoiceField === fieldKey) {
        stopAll();
        setActiveVoiceField(null);
        setFieldStates(prev => ({ ...prev, [fieldKey]: 'idle' }));
        return;
      }

      stopAll();
      setActiveVoiceField(fieldKey);
      setFieldStates(prev => ({ ...prev, [fieldKey]: 'listening' }));

      // Listen directly upon button press (zero auto-prompt delay)
      listen((spokenText: string) => {
        const raw = spokenText.trim();
        if (!raw) {
          setActiveVoiceField(null);
          setFieldStates(prev => ({ ...prev, [fieldKey]: 'idle' }));
          return;
        }

        setFieldStates(prev => ({ ...prev, [fieldKey]: 'processing' }));

        if (isNumeric) {
          const parsed = parseQuantityTranscript(raw);
          if (parsed !== null && parsed >= 0) {
            setFormData(prev => ({ ...prev, [fieldKey]: parsed }));
          } else {
            const digits = raw.replace(/[^\d]/g, '');
            if (digits) {
              const num = parseInt(digits, 10);
              if (!isNaN(num) && num >= 0) {
                setFormData(prev => ({ ...prev, [fieldKey]: num }));
              }
            }
          }
        } else {
          const cleaned = raw.replace(/[.,!?;:]/g, '').trim();
          setFormData(prev => ({ ...prev, [fieldKey]: cleaned }));
        }

        setActiveVoiceField(null);
        setFieldStates(prev => ({ ...prev, [fieldKey]: 'added' }));
        setTimeout(() => {
          setFieldStates(prev => ({ ...prev, [fieldKey]: 'idle' }));
        }, 2500);
      });
    },
    [activeVoiceField, stopAll, listen]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // Calculate estimated fair preview price
  const matCost = Number(formData.material_cost) || 0;
  const hours = Number(formData.labor_hours) || 0;
  const estPreviewPrice = Math.round((matCost + hours * 85 + 100) * 1.35);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {photoError && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-[#29221D] flex items-center gap-2.5 text-xs">
          <AlertCircle className="w-4 h-4 text-[#C88732] shrink-0" />
          <span>{photoError}</span>
        </div>
      )}

      {/* Two-Column Desktop Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================================================== */}
        {/* LEFT COLUMN: Input Fields with Voice Type Buttons  */}
        {/* ================================================== */}
        <div className="lg:col-span-7 bg-[#FFFDF8] border border-[#D9CEB8] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-[#D9CEB8]/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#A8462D] uppercase tracking-[0.16em] block">
                ✦ Step 3
              </span>
              <h3 className="font-serif font-bold text-lg text-[#29221D]">
                Product Details
              </h3>
            </div>
            <span className="text-[11px] text-[#7A6E65] font-medium">
              Optional voice dictation available
            </span>
          </div>

          {/* 1. Handicraft Name */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#29221D] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#A8462D]" />
                <span>Handicraft Name *</span>
              </label>
              <VoiceTypeButton
                state={fieldStates['product_name']}
                onClick={() => handleMicClick('product_name', false)}
              />
            </div>
            <input
              type="text"
              required
              value={formData.product_name}
              onChange={e => handleInputChange('product_name', e.target.value)}
              placeholder="e.g. Handwoven Silk Saree"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CEB8] bg-[#FFFDF8] text-sm text-[#29221D] focus:outline-none focus:border-[#A8462D] focus:ring-2 focus:ring-[#A8462D]/15 font-medium"
            />
          </div>

          {/* 2. Handicraft Type (Category) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#29221D]">
                Handicraft Type *
              </label>
              <VoiceTypeButton
                state={fieldStates['category']}
                onClick={() => handleMicClick('category', false)}
              />
            </div>
            <select
              value={formData.category}
              onChange={e => handleInputChange('category', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CEB8] bg-[#FFFDF8] text-sm text-[#29221D] focus:outline-none focus:border-[#A8462D] cursor-pointer font-medium"
            >
              {CRAFT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Color & Material */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#29221D] flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#C88732]" />
                  <span>Color</span>
                </label>
                <VoiceTypeButton
                  state={fieldStates['color']}
                  onClick={() => handleMicClick('color', false)}
                />
              </div>
              <input
                type="text"
                value={formData.color}
                onChange={e => handleInputChange('color', e.target.value)}
                placeholder="e.g. Terracotta & Indigo"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D9CEB8] bg-[#FFFDF8] text-sm text-[#29221D] focus:outline-none focus:border-[#A8462D] font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#29221D]">
                  Primary Material
                </label>
                <VoiceTypeButton
                  state={fieldStates['material']}
                  onClick={() => handleMicClick('material', false)}
                />
              </div>
              <input
                type="text"
                value={formData.material}
                onChange={e => handleInputChange('material', e.target.value)}
                placeholder="e.g. Pure Mulberry Silk"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D9CEB8] bg-[#FFFDF8] text-sm text-[#29221D] focus:outline-none focus:border-[#A8462D] font-medium"
              />
            </div>
          </div>

          {/* 4. Address (Craft Origin Cluster) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#29221D] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#A8462D]" />
                <span>Crafting Cluster / Address</span>
              </label>
              <VoiceTypeButton
                state={fieldStates['address']}
                onClick={() => handleMicClick('address', false)}
              />
            </div>
            <input
              type="text"
              value={formData.address}
              onChange={e => handleInputChange('address', e.target.value)}
              placeholder="e.g. Pochampally, Yadadri Bhuvanagiri, Telangana"
              className="w-full px-3.5 py-2 rounded-xl border border-[#D9CEB8] bg-[#FFFDF8] text-sm text-[#29221D] focus:outline-none focus:border-[#A8462D] font-medium"
            />
          </div>

          {/* 5. Quantity & Fair Wage Cost Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#29221D] flex items-center gap-1">
                  <Hash className="w-3 h-3 text-[#7A6E65]" />
                  <span>Quantity</span>
                </label>
                <VoiceTypeButton
                  state={fieldStates['quantity']}
                  onClick={() => handleMicClick('quantity', true)}
                />
              </div>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={e => handleInputChange('quantity', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D9CEB8] bg-[#FFFDF8] text-sm font-mono font-bold text-[#29221D] focus:outline-none focus:border-[#A8462D]"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#29221D] flex items-center gap-1">
                  <IndianRupee className="w-3 h-3 text-[#4A7A52]" />
                  <span>Materials</span>
                </label>
                <VoiceTypeButton
                  state={fieldStates['material_cost']}
                  onClick={() => handleMicClick('material_cost', true)}
                />
              </div>
              <input
                type="number"
                min="0"
                value={formData.material_cost}
                onChange={e => handleInputChange('material_cost', e.target.value)}
                placeholder="₹"
                className="w-full px-3 py-2 rounded-xl border border-[#D9CEB8] bg-[#FFFDF8] text-sm font-mono font-bold text-[#29221D] focus:outline-none focus:border-[#A8462D]"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#29221D] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#C88732]" />
                  <span>Hours</span>
                </label>
                <VoiceTypeButton
                  state={fieldStates['labor_hours']}
                  onClick={() => handleMicClick('labor_hours', true)}
                />
              </div>
              <input
                type="number"
                min="0"
                value={formData.labor_hours}
                onChange={e => handleInputChange('labor_hours', e.target.value)}
                placeholder="hrs"
                className="w-full px-3 py-2 rounded-xl border border-[#D9CEB8] bg-[#FFFDF8] text-sm font-mono font-bold text-[#29221D] focus:outline-none focus:border-[#A8462D]"
              />
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* RIGHT COLUMN: Description & Live Product Preview   */}
        {/* ================================================== */}
        <div className="lg:col-span-5 space-y-6">
          {/* Description Card */}
          <div className="bg-[#FFFDF8] border border-[#D9CEB8] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#D9CEB8]/60">
              <label className="text-xs font-bold text-[#29221D] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#273B59]" />
                <span>Description / Artisan Story</span>
              </label>
              <VoiceTypeButton
                state={fieldStates['description']}
                onClick={() => handleMicClick('description', false)}
              />
            </div>

            <textarea
              rows={4}
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              placeholder="Tell buyers about how this piece was crafted, the natural pigments used, or the hereditary techniques passed down through generations..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CEB8] bg-[#FFFDF8] text-xs sm:text-sm text-[#29221D] focus:outline-none focus:border-[#A8462D] font-medium resize-none leading-relaxed"
            />

            {detectedAiAttributes?.story && (
              <div className="p-3 rounded-xl bg-[#F7F2E8]/80 border border-[#D9CEB8] text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[10px] text-[#C88732] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI Detected Story
                  </span>
                  <button
                    type="button"
                    onClick={() => handleInputChange('description', detectedAiAttributes.story)}
                    className="text-[10px] font-bold text-[#A8462D] hover:underline cursor-pointer"
                  >
                    Use this
                  </button>
                </div>
                <p className="text-[#5C4A3A] italic line-clamp-2">
                  "{detectedAiAttributes.story}"
                </p>
              </div>
            )}
          </div>

          {/* Live Product Card Preview */}
          <div className="bg-[#FFFDF8] border border-[#D9CEB8] rounded-2xl p-5 shadow-2xs space-y-3">
            <span className="text-[10px] font-bold text-[#7A6E65] uppercase tracking-[0.16em] block">
              Live Listing Preview
            </span>

            <div className="rounded-xl border border-[#D9CEB8] overflow-hidden bg-[#FFFDF8]">
              <div className="aspect-[4/3] bg-[#F7F2E8] relative overflow-hidden">
                <img
                  src={
                    productImage ||
                    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'
                  }
                  alt="Product preview"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-[#4A7A52] border border-emerald-200">
                  Ready to Publish
                </span>
              </div>

              <div className="p-3.5 space-y-1.5">
                <span className="text-[10px] font-bold text-[#C88732] uppercase tracking-wider block">
                  {formData.category}
                </span>
                <h4 className="font-serif font-bold text-sm text-[#29221D] line-clamp-1">
                  {formData.product_name || 'Handicraft Name'}
                </h4>
                <div className="flex items-center justify-between pt-1 border-t border-[#D9CEB8]/40">
                  <div>
                    <span className="text-[9px] text-[#7A6E65] block">Est. Fair Price</span>
                    <span className="font-mono font-bold text-sm text-[#29221D]">
                      {formatINR(estPreviewPrice)}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-[#4A7A52] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    Stock: {formData.quantity || 1}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D9CEB8]">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-full border border-[#D9CEB8] text-xs font-bold text-[#5C4A3A] hover:bg-[#F7F2E8] transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2.5 rounded-full bg-[#A8462D] hover:bg-[#8E3822] text-[#FFFDF8] font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer active:scale-95"
        >
          Save Details & Continue →
        </button>
      </div>
    </form>
  );
};
