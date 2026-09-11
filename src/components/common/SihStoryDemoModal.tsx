import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, X, ChevronRight, ChevronLeft, CheckCircle2,
  Volume2, Camera, Tag, DollarSign, ShoppingBag, Truck,
  ArrowRight, ShieldCheck, Heart
} from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { speakText } from '../../lib/i18n';

interface SihStoryDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SihStoryDemoModal: React.FC<SihStoryDemoModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const scenes = [
    {
      title: '1. The Rural Artisan & Raw Photo',
      subtitle: 'Rameshwar Rao, hereditary weaver in Pochampally',
      desc: 'Rameshwar takes a photo of his handwoven Ikat saree with a budget smartphone on his earthen workshop floor with dim, uneven lighting.',
      icon: Camera,
      tag: 'Field Reality',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      stat: 'Challenge: Poor photos previously forced 65% discounts to predatory middlemen.',
      action: { label: 'Try Photo Studio', path: '/seller/add' },
    },
    {
      title: '2. AI Image Studio (Before | After)',
      subtitle: 'Autonomous background cleanup & studio illumination',
      desc: 'ShilpSetu AI isolates the saree, removes workshop clutter, centers the fabric, and adjusts lighting to professional catalogue standards without hiding the original photo.',
      icon: Sparkles,
      tag: 'AI Enhancement',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=95',
      stat: 'Output: 1080p studio finish ready for national e-commerce standards in 2 seconds.',
      action: { label: 'View Image Studio', path: '/seller/add?step=2' },
    },
    {
      title: '3. AI Product Understanding & Story',
      subtitle: 'Deep craft classification and multilingual cataloging',
      desc: 'AI detects 100% Mulberry Silk, identifies authentic tie-and-dye resist motifs, confirms Telangana GI heritage provenance, and writes a poignant product story in English, Hindi, and Telugu.',
      icon: Tag,
      tag: 'Cultural Heritage AI',
      image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
      stat: 'Language: Rural artisans speak or review details in their native mother tongue.',
      action: { label: 'Explore Craft Attributes', path: '/seller/add?step=3' },
    },
    {
      title: '4. "What Should I Charge?" Fair Pricing',
      subtitle: 'Cost-plus living wage calculation vs middleman distress',
      desc: 'Instead of accepting a distress middleman purchase of ₹2,200, ShilpSetu transparently factors in ₹1,100 raw materials and 18 hours of labor at ₹85/hr, recommending ₹4,850 with ₹1,850 direct profit.',
      icon: DollarSign,
      tag: 'Fair Living Wage',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      stat: 'Impact: +₹2,650 extra income retained per craft piece by cutting out middlemen.',
      action: { label: 'Open Price Calculator', path: '/seller/market-analysis' },
    },
    {
      title: '5. Direct Marketplace Discovery & Patron Purchase',
      subtitle: 'Conscious buyer connects directly with maker',
      desc: 'Conscious buyer Ananya discovers the Pochampally saree on ShilpSetu, reads Rameshwar’s personal story in "Meet the Maker", inspects the digital provenance certificate, and pays via UPI.',
      icon: ShoppingBag,
      tag: 'Direct Connection',
      image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
      stat: 'Fee: 0% platform commission. 100% of the buyer payment is settled to the artisan.',
      action: { label: 'Explore Marketplace', path: '/buyer' },
    },
    {
      title: '6. Artisan Order & Financial Independence',
      subtitle: 'Full circle: instant order, packing & earnings growth',
      desc: 'Rameshwar receives an audio SMS alert on his phone, marks the order as "Preparing", packs it in eco-friendly paper, and his earnings dashboard reflects the new sales trajectory.',
      icon: Truck,
      tag: 'Completed Cycle',
      image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
      stat: 'Outcome: Sustainable year-round livelihood beyond seasonal physical craft fairs.',
      action: { label: 'View Orders & Earnings', path: '/seller/sales' },
    },
  ];

  const scene = scenes[currentStep];

  const handleListen = () => {
    speakText(`${scene.title}. ${scene.desc}`, language);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-[#eadfd4] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#eadfd4] flex items-center justify-between bg-[#faf7f2]">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#9c4124] text-white flex items-center justify-center text-xs font-black">
              SS
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[#262220] font-['Rozha_One',serif]">
                  ShilpSetu Complete Artisan Journey
                </span>
                <span className="text-[10px] bg-[#fdf2e9] text-[#9c4124] px-2 py-0.2 rounded-full font-bold border border-[#f8d7c2]">
                  SIH Story Demo
                </span>
              </div>
              <span className="text-[11px] text-stone-500">
                Scene {currentStep + 1} of {scenes.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleListen}
              className="p-2 rounded-xl bg-white border border-[#eadfd4] text-[#9c4124] hover:bg-[#fdf2e9] cursor-pointer"
              title="Listen to Scene"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scene Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#9c4124] bg-[#fdf2e9] px-3 py-1 rounded-full border border-[#f8d7c2] uppercase">
              {scene.tag}
            </span>
            <span className="text-xs text-stone-500 font-semibold">{scene.subtitle}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-[#262220] font-['Rozha_One',serif]">
            {scene.title}
          </h3>

          <div className="relative rounded-2xl overflow-hidden aspect-16/9 bg-stone-100 border border-[#eadfd4]">
            <img src={scene.image} alt={scene.title} className="w-full h-full object-cover" />
          </div>

          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
            {scene.desc}
          </p>

          <div className="p-3.5 rounded-2xl bg-[#faf7f2] border border-[#eadfd4] text-xs font-bold text-[#9c4124] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{scene.stat}</span>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-[#eadfd4] bg-[#faf7f2] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="p-2 rounded-xl bg-white border border-[#eadfd4] text-stone-700 disabled:opacity-30 cursor-pointer hover:bg-stone-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Progress Dots */}
            <div className="flex items-center gap-1.5 px-2">
              {scenes.map((_, i) => (
                <span
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    currentStep === i ? 'bg-[#9c4124] w-5' : 'bg-stone-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentStep(Math.min(scenes.length - 1, currentStep + 1))}
              disabled={currentStep === scenes.length - 1}
              className="p-2 rounded-xl bg-white border border-[#eadfd4] text-stone-700 disabled:opacity-30 cursor-pointer hover:bg-stone-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              navigate(scene.action.path);
            }}
            className="artisan-btn-primary py-2 px-4 text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>{scene.action.label}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
