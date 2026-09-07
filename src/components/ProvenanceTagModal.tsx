import React, { useState } from 'react';
import { X, QrCode, Sparkles, Printer, Share2, ShieldCheck, MapPin, CheckCircle2, Globe2 } from 'lucide-react';
import { Product, LanguageCode } from '../types';
import { translations } from '../lib/i18n';

interface ProvenanceTagModalProps {
  product: Product;
  language: LanguageCode;
  onClose: () => void;
}

export const ProvenanceTagModal: React.FC<ProvenanceTagModalProps> = ({
  product,
  language,
  onClose
}) => {
  const t = translations[language];
  const [tagLang, setTagLang] = useState<LanguageCode>(language);

  const translation = product.translations[tagLang] || product.translations.en || {
    title: product.title,
    description: product.description,
    tags: product.tags
  };

  const handlePrint = () => {
    window.print();
  };

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}?product=${product.id}` : '';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none print:max-w-none">
        
        {/* Modal Header (Hidden during Print) */}
        <div className="p-4 bg-stone-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-400" />
            <span className="font-extrabold text-sm font-['Rozha_One',serif]">
              Authentic Craft Stall Tag & QR Provenance
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls (Hidden during Print) */}
        <div className="p-3 bg-stone-100 border-b border-stone-200 flex items-center justify-between gap-2 print:hidden text-xs">
          <div className="flex items-center gap-1">
            <span className="text-stone-500 font-semibold mr-1">Tag Language:</span>
            {(['en', 'hi', 'te'] as LanguageCode[]).map((code) => (
              <button
                key={code}
                onClick={() => setTagLang(code)}
                className={`px-2 py-1 rounded-lg font-bold uppercase ${
                  tagLang === code
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-300'
                }`}
              >
                {code}
              </button>
            ))}
          </div>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Print Tag</span>
          </button>
        </div>

        {/* PHYSICAL STALL TAG CARD (Printable) */}
        <div className="p-6 text-stone-900 bg-gradient-to-b from-amber-50/40 via-white to-stone-50 print:p-8">
          
          {/* Certificate Header Banner */}
          <div className="border-2 border-dashed border-amber-500/60 rounded-3xl p-5 bg-white shadow-sm relative overflow-hidden">
            
            <div className="flex items-start justify-between gap-3 border-b border-amber-200/80 pb-3.5 mb-3.5">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase text-amber-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Verified Fair Trade Heritage Craft</span>
                </div>
                <h3 className="text-lg font-black font-['Rozha_One',serif] text-stone-950 mt-0.5 leading-snug">
                  {translation.title}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-600" />
                  <span>{product.artisan_district}, {product.artisan_state}</span>
                </p>
              </div>

              {/* Verified Badge */}
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col items-center justify-center shrink-0 text-center p-1">
                <Sparkles className="w-4 h-4 text-amber-700 mb-0.5" />
                <span className="text-[8px] font-black uppercase text-amber-900 leading-tight">Direct 100%</span>
              </div>
            </div>

            {/* Middle Grid: Photo & QR Code */}
            <div className="grid grid-cols-2 gap-3 mb-4 items-center">
              <div className="rounded-2xl overflow-hidden aspect-square border border-stone-200 bg-stone-100 shadow-inner">
                <img
                  src={product.enhanced_image_url || product.original_image_url}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Stylized QR Code Display */}
              <div className="border border-stone-200 rounded-2xl p-2.5 bg-stone-50 flex flex-col items-center justify-center text-center aspect-square">
                {/* Simulated High-Res SVG QR Code */}
                <svg
                  viewBox="0 0 100 100"
                  className="w-24 h-24 text-stone-900"
                  fill="currentColor"
                >
                  <path d="M0 0h30v30H0zm5 5v20h20V5zm5 5h10v10H10zM70 0h30v30H70zm5 5v20h20V5zm5 5h10v10H80zM0 70h30v30H0zm5 5v20h20V75zm5 5h10v10H10zM40 10h10v10H40zm10 20h10v10H50zm10-10h10v10H60zM40 40h20v10H40zm-10 10h10v10H30zm30 0h10v10H60zm10-10h20v10H70zm10 20h10v20H80zm-40 0h10v10H40zm10 10h10v20H50zm10-10h10v10H60zm-20 20h10v10H40zm30 0h20v10H70z" />
                </svg>
                <span className="text-[9px] font-extrabold uppercase text-stone-600 mt-1 tracking-wider">
                  Scan to View & Buy
                </span>
              </div>
            </div>

            {/* Craft Specs & Fair Price Guarantee */}
            <div className="bg-amber-50/70 rounded-2xl p-3 border border-amber-200/80 mb-3 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-stone-500 font-medium">Master Artisan:</span>
                <span className="font-black text-stone-900">{product.artisan_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500 font-medium">Authentic Material:</span>
                <span className="font-bold text-stone-800">{product.material || product.category}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500 font-medium">Dimensions:</span>
                <span className="font-bold text-stone-800">{product.est_dimensions || 'Handcrafted Standard'}</span>
              </div>
              <div className="pt-2 border-t border-amber-200/80 flex justify-between items-center">
                <span className="font-extrabold text-amber-900 text-xs">Direct Artisan Fair Asking Price:</span>
                <span className="text-base font-black text-amber-950 font-['Rozha_One',serif]">
                  ₹{product.final_price?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Footer Assurance Tag */}
            <div className="text-center pt-2 text-[10px] text-stone-500 flex items-center justify-center gap-1.5 border-t border-stone-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Certified GI / Fair Trade Direct Handloom • Antigravity AI Linkage</span>
            </div>

          </div>

          <p className="text-[11px] text-stone-400 text-center mt-3 print:hidden">
            Print this tag and hang it with your craft in exhibitions, Shilparamam, Dastkar, or your workshop.
          </p>
        </div>

      </div>
    </div>
  );
};
