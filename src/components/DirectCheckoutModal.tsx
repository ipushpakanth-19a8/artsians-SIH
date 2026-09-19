import React, { useState } from 'react';
import {
  X, ShieldCheck, CheckCircle2, CreditCard, Lock, Sparkles,
  ArrowRight, Download, Printer, User, Phone, Mail, MapPin,
  Award, ExternalLink, HeartHandshake, QrCode, Store
} from 'lucide-react';
import { Product, LanguageCode, Order } from '../types';
import { translations } from '../lib/i18n';

interface DirectCheckoutModalProps {
  product: Product;
  language: LanguageCode;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const DirectCheckoutModal: React.FC<DirectCheckoutModalProps> = ({
  product,
  language,
  onClose,
  onOrderSuccess
}) => {
  const t = translations[language];

  const [quantity, setQuantity] = useState(1);
  const [buyerName, setBuyerName] = useState('Ananya Sen');
  const [buyerPhone, setBuyerPhone] = useState('+91 98301 22334');
  const [buyerEmail, setBuyerEmail] = useState('ananya.sen@ecocraft.in');
  const [buyerAddress, setBuyerAddress] = useState('Flat 4B, Heritage Enclave, South Extension, New Delhi - 110049');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay_test' | 'upi_direct'>('razorpay_test');

  // Exhibition Stall-to-Digital Re-Order Feature
  const [isExhibitionReorder, setIsExhibitionReorder] = useState(false);
  const [exhibitionName, setExhibitionName] = useState(
    product.seen_at_exhibition?.event_name || 'Surajkund International Crafts Mela'
  );
  const [stallNumber, setStallNumber] = useState(product.seen_at_exhibition?.stall_number || '');

  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const unitPrice = product.final_price || product.pricing?.target_recommended || 1500;
  const subtotal = unitPrice * quantity;
  const shipping = 0; // Free direct shipping subsidy
  const totalAmount = subtotal + shipping;

  // Living Wage Impact Metrics
  const rawMaterialCost = Math.round((product.materialCost || product.cost?.material_cost || unitPrice * 0.35) * quantity);
  const laborHours = ((product.laborHours || product.cost?.labor_hours || 10) * quantity);
  const hourlyWageRate = product.fairHourlyWage || product.cost?.hourly_rate || 95;
  const artisanLaborEarnings = Math.round(laborHours * hourlyWageRate);
  const middlemanSaved = Math.round(subtotal * 0.55);

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerPhone) {
      setErrorMessage("Please provide your name and phone number");
      return;
    }

    setErrorMessage(null);
    setStep('processing');

    try {
      const shippingNote = isExhibitionReorder
        ? ` [🎪 Exhibition Stall Re-Order: ${exhibitionName}${stallNumber ? ' - Stall #' + stallNumber : ''}]`
        : '';
      const finalAddress = buyerAddress + shippingNote;

      // Step 1: Create checkout session on backend (locks price)
      const sessionRes = await fetch('/api/v1/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          quantity,
          buyer_name: buyerName,
          buyer_contact: buyerPhone,
          buyer_email: buyerEmail,
          buyer_address: finalAddress,
          payment_method: paymentMethod
        })
      });
      const sessionData = await sessionRes.json();
      if (!sessionRes.ok) throw new Error(sessionData.error || "Failed to initialize order");

      // Step 2: Simulate Razorpay Gateway authorization
      setTimeout(async () => {
        try {
          const verifyRes = await fetch('/api/v1/orders/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              product_id: product.id,
              quantity,
              buyer_name: buyerName,
              buyer_contact: buyerPhone,
              buyer_email: buyerEmail,
              buyer_address: finalAddress,
              payment_method: paymentMethod,
              razorpay_payment_id: `pay_test_rp_${Date.now()}`
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.order) {
            setCompletedOrder(verifyData.order);
            setStep('success');
            onOrderSuccess(verifyData.order);
          } else {
            throw new Error(verifyData.error || "Payment verification failed");
          }
        } catch (err: any) {
          setErrorMessage(err.message || "Payment failed");
          setStep('form');
        }
      }, 1500);

    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initiate payment");
      setStep('form');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-[#FFFDF8] rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#D9CEB8] relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#A8462D] via-[#8D3823] to-[#29221D] text-white p-5 flex items-center justify-between border-b border-[#3E342B]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center font-bold text-xs">
              ₹
            </div>
            <div>
              <h3 className="font-black text-sm font-serif">
                Direct Fair-Trade Checkout
              </h3>
              <p className="text-[11px] text-[#F3E5AB]">
                100% of proceeds transferred directly to {product.artisan_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#F3E5AB] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step: FORM */}
        {step === 'form' && (
          <form onSubmit={handlePayNow} className="p-6 space-y-4">
            {/* Product Summary Card */}
            <div className="p-3.5 bg-[#F7F2E8] rounded-2xl border border-[#D9CEB8] flex items-center gap-3">
              <img
                src={product.enhanced_image_url || product.original_image_url}
                alt={product.title}
                className="w-16 h-16 object-cover rounded-xl border border-[#D9CEB8] bg-[#FFFDF8] shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-[#A8462D] uppercase tracking-wider block">
                  {product.category} • {product.artisan_district}
                </span>
                <h4 className="text-xs font-bold text-[#29221D] truncate">
                  {product.title}
                </h4>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-[#6B5E55] font-medium">
                    Direct Fair Price: <b className="text-[#29221D] font-mono font-black">₹{unitPrice}</b>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-6 h-6 rounded-md bg-[#FFFDF8] border border-[#D9CEB8] text-[#29221D] font-bold text-xs cursor-pointer hover:bg-[#F7F2E8]"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold px-1.5 font-mono text-[#29221D]">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-6 h-6 rounded-md bg-[#FFFDF8] border border-[#D9CEB8] text-[#29221D] font-bold text-xs cursor-pointer hover:bg-[#F7F2E8]"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Living Wage Ethical Price Impact Transparency Card */}
            <div className="p-3.5 bg-[#FDF6F0] border border-[#D9CEB8] rounded-2xl text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-[#29221D]">
                <span className="flex items-center gap-1.5 text-[#A8462D]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Living-Wage Impact Transparency</span>
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded-full uppercase font-black">
                  100% Direct Payout
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[#29221D] text-[11px] pt-1.5 border-t border-[#D9CEB8]/70">
                <div>
                  <span className="text-[#6B5E55] block text-[10px]">🧵 Materials:</span>
                  <b className="font-mono">₹{rawMaterialCost.toLocaleString('en-IN')}</b>
                </div>
                <div>
                  <span className="text-[#6B5E55] block text-[10px]">👩‍🎨 Craft Work:</span>
                  <b className="text-emerald-800 font-mono">{laborHours} hrs living wage</b>
                </div>
                <div>
                  <span className="text-[#6B5E55] block text-[10px]">⚖️ Wage Rate:</span>
                  <b className="font-mono">₹{hourlyWageRate}/hr</b>
                </div>
              </div>
              <div className="bg-white/80 p-2 rounded-xl border border-[#D9CEB8]/50 flex items-center justify-between text-[11px] text-[#4A7A52] font-semibold">
                <span>Direct Artisan Earning: +₹{middlemanSaved.toLocaleString('en-IN')} extra vs middleman cut</span>
                <span className="text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">0% Commission</span>
              </div>
            </div>

            {/* Exhibition Stall-to-Digital Re-Order Linkage */}
            <div className="p-3.5 bg-[#FFFDF8] rounded-2xl border border-[#D9CEB8] space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isExhibitionReorder}
                  onChange={(e) => setIsExhibitionReorder(e.target.checked)}
                  className="w-4 h-4 rounded text-[#A8462D] accent-[#A8462D] cursor-pointer"
                />
                <span className="text-xs font-bold text-[#29221D] flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-[#C88732]" />
                  <span>Reconnecting with this artisan from a Craft Fair / Exhibition?</span>
                </span>
              </label>

              {isExhibitionReorder && (
                <div className="pt-2 border-t border-[#D9CEB8]/60 space-y-2 text-xs">
                  <p className="text-[11px] text-[#7A6E65]">
                    Tell {product.artisan_name} where you saw their craft to bridge offline stall memories to year-round direct support:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-[#6B5E55] block mb-0.5">Exhibition / Craft Mela</label>
                      <input
                        type="text"
                        value={exhibitionName}
                        onChange={(e) => setExhibitionName(e.target.value)}
                        placeholder="e.g. Surajkund Mela, Dastkar, SARAS"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D9CEB8] rounded-lg text-[#29221D] focus:ring-1 focus:ring-[#A8462D] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#6B5E55] block mb-0.5">Stall / Pavilion # (Optional)</label>
                      <input
                        type="text"
                        value={stallNumber}
                        onChange={(e) => setStallNumber(e.target.value)}
                        placeholder="e.g. Stall #42, Hall B"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D9CEB8] rounded-lg text-[#29221D] focus:ring-1 focus:ring-[#A8462D] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Buyer Delivery Form */}
            <div className="space-y-3">
              <h5 className="text-xs font-black uppercase tracking-wider text-[#6B5E55]">
                Buyer Delivery Details
              </h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-[#6B5E55] block mb-0.5">Your Name</label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#D9CEB8] rounded-xl text-[#29221D] focus:ring-1 focus:ring-[#A8462D] focus:outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#6B5E55] block mb-0.5">Phone Number (UPI / SMS)</label>
                  <input
                    type="text"
                    required
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#D9CEB8] rounded-xl text-[#29221D] focus:ring-1 focus:ring-[#A8462D] focus:outline-none font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#6B5E55] block mb-0.5">Email Address</label>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#D9CEB8] rounded-xl text-[#29221D] focus:ring-1 focus:ring-[#A8462D] focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#6B5E55] block mb-0.5">Shipping Address</label>
                <textarea
                  rows={2}
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FFFDF8] border border-[#D9CEB8] rounded-xl text-[#29221D] focus:ring-1 focus:ring-[#A8462D] focus:outline-none font-semibold"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-[#6B5E55] block">
                Payment Channel (Razorpay Test Mode)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('razorpay_test')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    paymentMethod === 'razorpay_test'
                      ? 'border-[#A8462D] bg-[#A8462D]/10 text-[#29221D] font-bold'
                      : 'border-[#D9CEB8] bg-[#FFFDF8] text-[#6B5E55]'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-[#A8462D] shrink-0" />
                  <div>
                    <span className="text-xs block">Razorpay Test Checkout</span>
                    <span className="text-[10px] text-[#8C827A]">Cards, Netbanking & UPI</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi_direct')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    paymentMethod === 'upi_direct'
                      ? 'border-[#A8462D] bg-[#A8462D]/10 text-[#29221D] font-bold'
                      : 'border-[#D9CEB8] bg-[#FFFDF8] text-[#6B5E55]'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-[#A8462D] text-white font-black text-[9px] flex items-center justify-center shrink-0">
                    U
                  </div>
                  <div>
                    <span className="text-xs block">Direct Artisan UPI QR</span>
                    <span className="text-[10px] text-[#8C827A]">Zero Gateway Fee</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Price Breakdown Banner */}
            <div className="p-3 bg-[#F7F2E8] border border-[#D9CEB8] rounded-2xl space-y-1 text-xs">
              <div className="flex justify-between text-[#6B5E55]">
                <span>Direct Artisan Price ({quantity} item):</span>
                <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#6B5E55]">
                <span>Middleman Platform Cut:</span>
                <span className="text-emerald-800 font-bold">₹0 (Zero Deduction)</span>
              </div>
              <div className="flex justify-between text-[#6B5E55]">
                <span>Direct Packaging & Delivery:</span>
                <span className="text-emerald-800 font-bold">Subsidized / Free</span>
              </div>
              <div className="pt-2 border-t border-[#D9CEB8] flex justify-between font-black text-[#29221D] text-sm">
                <span>Total Amount:</span>
                <span className="font-mono text-base text-[#A8462D]">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200">
                {errorMessage}
              </div>
            )}

            {/* Pay Button */}
            <button
              type="submit"
              className="artisan-btn-primary w-full py-3.5 bg-[#A8462D] hover:bg-[#8D3823] text-white font-extrabold rounded-2xl shadow-lg flex items-center justify-center gap-2 text-sm transition-all cursor-pointer active:scale-[0.99]"
            >
              <Lock className="w-4 h-4" />
              <span>Authorize & Pay ₹{totalAmount.toLocaleString('en-IN')}</span>
            </button>
          </form>
        )}

        {/* Step: PROCESSING */}
        {step === 'processing' && (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 border-4 border-[#D9CEB8] border-t-[#A8462D] rounded-full animate-spin mx-auto" />
            <h4 className="text-base font-bold text-[#29221D] font-serif">
              Connecting to Razorpay Test Gateway...
            </h4>
            <p className="text-xs text-[#6B5E55] max-w-sm mx-auto">
              Authorizing ₹{totalAmount.toLocaleString('en-IN')} with server-side price lock. Confirming instant bank settlement to {product.artisan_name}.
            </p>
          </div>
        )}

        {/* Step: SUCCESS RECEIPT */}
        {step === 'success' && completedOrder && (
          <div className="p-6 space-y-5 text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Fair Trade Verified • Order Confirmed</span>
              </div>
              <h3 className="text-xl font-black font-serif text-[#29221D] mt-2">
                Thank You for Supporting Authentic Heritage!
              </h3>
              <p className="text-xs text-[#6B5E55] mt-1">
                Order ID: <b className="font-mono text-[#29221D]">{completedOrder.id}</b>
              </p>
            </div>

            {/* Exhibition Re-Order Linkage Banner */}
            {isExhibitionReorder && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-left flex items-start gap-3">
                <Store className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-amber-900">
                    🎪 Exhibition Stall-to-Digital Connection Linked!
                  </div>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Re-ordered from <b>{exhibitionName}</b> {stallNumber ? `(Stall #${stallNumber})` : ''}. The artisan will ship this freshly handcrafted piece directly to your doorstep.
                  </p>
                </div>
              </div>
            )}

            {/* Living Wage Impact Receipt Breakdown */}
            <div className="bg-[#F7F2E8] p-4 rounded-2xl border border-[#D9CEB8] text-left text-xs space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#D9CEB8] pb-2">
                <span className="font-bold font-serif text-sm text-[#29221D] flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-[#A8462D]" />
                  Living Wage Impact Receipt
                </span>
                <span className="text-[10px] font-mono bg-[#EAE2D2] px-2 py-0.5 rounded-full text-[#6B5E55]">
                  100% Direct Artisan Payout
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2.5 bg-white rounded-xl border border-[#EAE2D2]">
                  <div className="text-[#8C827A]">Artisan Labor Funded</div>
                  <div className="font-bold text-[#29221D] text-sm mt-0.5">
                    {laborHours * quantity} Hours
                  </div>
                  <div className="text-[10px] text-emerald-700 font-medium">
                    @ ₹{hourlyWageRate}/hr fair wage
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-[#EAE2D2]">
                  <div className="text-[#8C827A]">Raw Materials Reimbursed</div>
                  <div className="font-bold text-[#29221D] text-sm mt-0.5">
                    ₹{(rawMaterialCost * quantity).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-medium">
                    Natural organic supplies
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#6B5E55]">Craft Item:</span>
                  <span className="font-bold text-[#29221D]">{completedOrder.product_title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B5E55]">Master Artisan Beneficiary:</span>
                  <span className="font-bold text-[#29221D]">{completedOrder.artisan_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B5E55]">Direct Bank/UPI Settlement:</span>
                  <span className="font-mono text-emerald-700 font-bold">100% Immediate</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B5E55]">Middleman Platform Commission:</span>
                  <span className="text-emerald-700 font-bold">₹0.00 (Zero Cut)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B5E55]">Delivery Address:</span>
                  <span className="text-[#29221D] text-right truncate max-w-[200px]">{completedOrder.buyer_address}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#D9CEB8] flex justify-between font-black text-sm">
                <span>Total Amount Paid:</span>
                <span className="text-[#A8462D] font-mono text-base">
                  ₹{completedOrder.total_amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Actions: Provenance Passport Certificate & Print */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <a
                href={`/provenance/${completedOrder.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 bg-[#29221D] hover:bg-[#3D332C] text-amber-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-amber-500/30 transition-all shadow-md"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>Digital Provenance Passport</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

              <button
                onClick={() => window.print()}
                className="py-3 px-4 bg-white hover:bg-[#F7F2E8] text-[#29221D] border border-[#D9CEB8] rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4 text-[#6B5E55]" />
                <span>Print Living Wage Receipt</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="artisan-btn-primary w-full py-3 bg-[#A8462D] hover:bg-[#8D3823] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Continue Exploring Authentic Crafts
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
