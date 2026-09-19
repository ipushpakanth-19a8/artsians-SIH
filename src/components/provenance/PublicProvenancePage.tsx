import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, ShieldCheck, MapPin, Calendar, QrCode, ArrowLeft, ExternalLink, CheckCircle, Sparkles, AlertCircle } from 'lucide-react';
import { formatINR } from '../../lib/billingService';

interface ProvenanceData {
  provenanceId: string;
  productId: string;
  craftName: string;
  craftType: string;
  color?: string;
  origin: {
    district: string;
    state: string;
    address: string;
  };
  artisan: {
    id: string;
    name: string;
    phone?: string;
  };
  creationDetails: {
    materials: string;
    technique: string;
    verifiedDate: string;
  };
  pricing: {
    artisanApprovedPrice: number;
    fairTradeVerified: boolean;
  };
  tamperHash: string;
  status: string;
  verifiedAuthenticity: boolean;
  statement: string;
}

export const PublicProvenancePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ProvenanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/v1/provenance/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Provenance certificate not found');
        }
        return res.json();
      })
      .then((json) => {
        setData(json.provenance);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Could not load provenance data');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F2E8] flex items-center justify-center p-4">
        <div className="bg-[#FFFDF8] rounded-3xl p-8 border border-[#D9CEB8] shadow-sm text-center max-w-sm w-full">
          <div className="w-12 h-12 border-4 border-[#D9CEB8] border-t-[#A8462D] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#29221D] font-bold">Verifying Craft Provenance...</p>
          <p className="text-stone-500 text-xs mt-1">Reading cryptographic authenticity ledger</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F7F2E8] flex items-center justify-center p-4">
        <div className="bg-[#FFFDF8] rounded-3xl p-8 border border-[#D9CEB8] shadow-sm text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-[#A8462D] mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[#29221D] font-serif">Certificate Not Found</h2>
          <p className="text-stone-600 text-sm mt-2">{error || 'This provenance ID does not correspond to an active published craft.'}</p>
          <Link
            to="/buyer/browse"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#A8462D] text-white rounded-xl text-sm font-bold shadow hover:bg-[#8E3822] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse Authentic Marketplace</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F2E8] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            to={`/buyer/product/${data.productId}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#A8462D] bg-[#FFFDF8] px-3.5 py-2 rounded-xl border border-[#D9CEB8] shadow-2xs hover:border-[#A8462D] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>View in Marketplace</span>
          </Link>
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#273B59] bg-[#EAEFF5] border border-[#BAC7D5] px-3 py-1 rounded-full flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#273B59]" />
            <span>Authoritative Craft Provenance</span>
          </span>
        </div>

        {/* Main Certificate Card */}
        <div className="bg-[#FFFDF8] rounded-3xl border-2 border-[#D9CEB8] shadow-md p-6 sm:p-10 relative overflow-hidden">
          {/* Subtle watermarked background seal */}
          <div className="absolute -right-12 -bottom-12 opacity-5 pointer-events-none">
            <Award className="w-72 h-72 text-[#29221D]" />
          </div>

          {/* Header */}
          <div className="text-center pb-6 border-b border-[#D9CEB8]">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FDF6F0] text-[#A8462D] border border-[#D9CEB8] mb-3 shadow-inner">
              <Award className="w-7 h-7" />
            </div>
            <p className="text-[11px] font-bold tracking-widest text-[#A8462D] uppercase">Artisans Digital Provenance Registry</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#29221D] font-serif mt-1">
              Certificate of Craft Authenticity
            </h1>
            <p className="text-xs text-stone-500 font-medium mt-1">
              Provenance ID: <code className="bg-[#F7F2E8] border border-[#D9CEB8] px-2 py-0.5 rounded font-mono font-bold text-[#29221D]">{data.provenanceId}</code>
            </p>
          </div>

          {/* Core Craft Identity Grid */}
          <div className="mt-8 space-y-6">
            <div className="bg-[#FDF6F0] rounded-2xl p-5 border border-[#D9CEB8] grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Handicraft Name</span>
                <p className="text-base font-bold text-[#29221D] mt-0.5">{data.craftName}</p>
              </div>
              <div>
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Craft Type</span>
                <p className="text-base font-bold text-[#29221D] mt-0.5">{data.craftType}</p>
              </div>
              <div>
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Color Palette</span>
                <p className="text-sm font-semibold text-[#29221D] mt-0.5">{data.color || 'Traditional Natural Tones'}</p>
              </div>
              <div>
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Fair Artisan Price</span>
                <p className="text-base font-bold text-[#A8462D] font-mono mt-0.5">{formatINR(data.pricing.artisanApprovedPrice)}</p>
              </div>
            </div>

            {/* Artisan Origin Section */}
            <div className="border border-[#D9CEB8] rounded-2xl p-5 bg-[#FFFDF8]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#A8462D] flex items-center gap-1.5 mb-3">
                <MapPin className="w-4 h-4" />
                <span>Artisan-Provided Origin</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-stone-500 font-medium block">Maker:</span>
                  <strong className="text-[#29221D] font-bold text-sm">{data.artisan.name}</strong>
                </div>
                <div>
                  <span className="text-stone-500 font-medium block">Craft District & State:</span>
                  <strong className="text-[#29221D] font-bold text-sm">{data.origin.district}, {data.origin.state}</strong>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-stone-500 font-medium block">Confirmed Workshop Address:</span>
                  <span className="text-stone-700 font-medium">{data.origin.address}</span>
                </div>
              </div>
            </div>

            {/* Materials & Technique actually provided */}
            <div className="border border-[#D9CEB8] rounded-2xl p-5 bg-[#FFFDF8]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#A8462D] flex items-center gap-1.5 mb-3">
                <Sparkles className="w-4 h-4 text-[#C88732]" />
                <span>Creation Details Actually Provided</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-stone-500 font-medium block">Raw Materials:</span>
                  <p className="text-stone-800 font-semibold">{data.creationDetails.materials}</p>
                </div>
                <div>
                  <span className="text-stone-500 font-medium block">Craft Technique:</span>
                  <p className="text-stone-800 font-semibold">{data.creationDetails.technique}</p>
                </div>
                <div>
                  <span className="text-stone-500 font-medium block">Verification Timestamp:</span>
                  <span className="text-stone-600 font-mono">{new Date(data.creationDetails.verifiedDate).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Cryptographic Seal & Accuracy Guarantee */}
            <div className="bg-[#EAEFF5] border border-[#BAC7D5] rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-[#273B59] font-bold text-xs">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Truth in Craftsmanship Guarantee</span>
              </div>
              <p className="text-[#273B59] text-xs leading-relaxed">
                {data.statement}
              </p>
              <div className="pt-2 border-t border-[#BAC7D5]">
                <span className="text-[10px] uppercase tracking-wider text-[#273B59] font-bold block mb-1">
                  Tamper-Evident Ledger Hash
                </span>
                <code className="text-[10px] font-mono text-[#273B59] break-all bg-white p-1.5 rounded border border-[#BAC7D5] block">
                  {data.tamperHash}
                </code>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-8 pt-6 border-t border-[#D9CEB8] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
            <span>Verified by Artisans • National Initiative for Marginalized Artisans</span>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-[#F7F2E8] hover:bg-[#D9CEB8] text-[#29221D] font-bold rounded-xl transition cursor-pointer text-xs border border-[#D9CEB8]"
            >
              Print Stall Provenance Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
