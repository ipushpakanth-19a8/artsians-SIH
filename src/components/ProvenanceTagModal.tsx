import React, { useState } from 'react';
import { X, QrCode, Sparkles, Printer, Share2, ShieldCheck, MapPin, CheckCircle2, Globe2, ExternalLink } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#29221D]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      <div className="bg-[#FFFDF8] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#D9CEB8] relative animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none print:max-w-none">
        
        {/* Modal Header (Hidden during Print) */}
        <div className="p-4 bg-[#29221D] text-[#FFFDF8] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#C88732]" />
            <span className="font-bold text-sm font-serif tracking-wide">
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
        <div className="p-3 bg-[#F7F2E8] border-b border-[#D9CEB8] flex items-center justify-between gap-2 print:hidden text-xs">
          <div className="flex items-center gap-1">
            <span className="text-stone-600 font-semibold mr-1">Tag Language:</span>
            {(['en', 'hi', 'te'] as LanguageCode[]).map((code) => (
              <button
                key={code}
                onClick={() => setTagLang(code)}
                className={`px-2.5 py-1 rounded-lg font-bold uppercase transition-all ${
                  tagLang === code
                    ? 'bg-[#A8462D] text-white shadow-xs'
                    : 'bg-white text-stone-700 hover:bg-[#FDF6F0] border border-[#D9CEB8]'
                }`}
              >
                {code}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`/provenance/${product.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-[#FDF6F0] hover:bg-[#F7E7CE] text-[#A8462D] border border-[#D9CEB8] font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Certificate</span>
            </a>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-[#29221D] hover:bg-[#A8462D] text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#C88732]" />
              <span>Print Tag</span>
            </button>
          </div>
        </div>

        {/* PHYSICAL STALL TAG CARD (Printable) */}
        <div className="p-6 text-[#29221D] bg-gradient-to-b from-[#FDF6F0]/60 via-[#FFFDF8] to-[#F7F2E8] print:p-8">
          
          {/* Certificate Header Banner */}
          <div className="border-2 border-dashed border-[#A8462D]/60 rounded-3xl p-5 bg-[#FFFDF8] shadow-sm relative overflow-hidden">
            
            <div className="flex items-start justify-between gap-3 border-b border-[#D9CEB8] pb-3.5 mb-3.5">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase text-[#A8462D]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#A8462D]" />
                  <span>Verified Fair Trade Heritage Craft</span>
                </div>
                <h3 className="text-lg font-bold font-serif text-[#29221D] mt-0.5 leading-snug">
                  {translation.title}
                </h3>
                <p className="text-xs text-stone-600 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#A8462D]" />
                  <span>{product.artisan_district}, {product.artisan_state}</span>
                </p>
              </div>

              {/* Verified Badge */}
              <div className="w-12 h-12 rounded-2xl bg-[#FDF6F0] border border-[#D9CEB8] flex flex-col items-center justify-center shrink-0 text-center p-1">
                <Sparkles className="w-4 h-4 text-[#A8462D] mb-0.5" />
                <span className="text-[8px] font-black uppercase text-[#A8462D] leading-tight">Direct 100%</span>
              </div>
            </div>

            {/* Middle Grid: Photo & QR Code */}
            <div className="grid grid-cols-2 gap-3 mb-4 items-center">
              <div className="rounded-2xl overflow-hidden aspect-square border border-[#D9CEB8] bg-stone-100 shadow-inner">
                <img
                  src={product.enhanced_image_url || product.original_image_url}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Stylized QR Code Display */}
              <div className="border border-[#D9CEB8] rounded-2xl p-2.5 bg-[#FFFDF8] flex flex-col items-center justify-center text-center aspect-square">
                {/* Simulated High-Res SVG QR Code */}
                <svg
                  viewBox="0 0 100 100"
                  className="w-24 h-24 text-[#29221D]"
                  fill="currentColor"
                >
                  <path d="M0 0h30v30H0zm5 5v20h20V5zm5 5h10v10H10zM70 0h30v30H70zm5 5v20h20V5zm5 5h10v10H80zM0 70h30v30H0zm5 5v20h20V75zm5 5h10v10H10zM40 10h10v10H40zm10 20h10v10H50zm10-10h10v10H60zM40 40h20v10H40zm-10 10h10v10H30zm30 0h10v10H60zm10-10h20v10H70zm10 20h10v20H80zm-40 0h10v10H40zm10 10h10v20H50zm10-10h10v10H60zm-20 20h10v10H40zm30 0h20v10H70z" />
                </svg>
                <span className="text-[9px] font-extrabold uppercase text-[#29221D]/70 mt-1 tracking-wider">
                  Scan to View & Buy
                </span>
              </div>
            </div>

            {/* Craft Specs & Fair Price Guarantee */}
            <div className="bg-[#F7F2E8] rounded-2xl p-3 border border-[#D9CEB8] mb-3 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-stone-600 font-medium">Master Artisan:</span>
                <span className="font-bold text-[#29221D]">{product.artisan_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-600 font-medium">Authentic Material:</span>
                <span className="font-bold text-[#29221D]">{product.material || product.category}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-600 font-medium">Dimensions:</span>
                <span className="font-bold text-[#29221D]">{product.est_dimensions || 'Handcrafted Standard'}</span>
              </div>
              {/* Exhibition Metadata if set */}
              {product.seen_at_exhibition && (
                <div className="flex justify-between items-center py-1 border-t border-[#D9CEB8]">
                  <span className="text-stone-600 font-medium">Exhibition Provenance:</span>
                  <span className="font-bold text-[#29221D]">
                    {product.seen_at_exhibition.event_name} ({product.seen_at_exhibition.stall_number}, {product.seen_at_exhibition.city})
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-[#D9CEB8] flex justify-between items-center">
                <span className="font-bold text-[#A8462D] text-xs">Direct Artisan Fair Asking Price:</span>
                <span className="text-base font-bold text-[#29221D] font-mono">
                  ₹{product.final_price?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* B2B / Reorder QR Note */}
            <div className="text-center pt-2 text-[10px] text-stone-500 flex flex-col items-center justify-center gap-0.5 border-t border-[#D9CEB8]">
              <div className="flex items-center gap-1 text-[#273B59] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Scan QR for Online Re-Orders & Direct Artisan Contact</span>
              </div>
              <span className="text-stone-400 text-[9px]">Verified GI / Fair Trade Handloom • ShilpSetu AI Provenance</span>
            </div>

          </div>

          <p className="text-[11px] text-stone-500 text-center mt-3 print:hidden">
            Print this tag and hang it with your craft in exhibitions, Shilparamam, Dastkar, or your workshop.
          </p>
        </div>

      </div>
    </div>
  );
};
