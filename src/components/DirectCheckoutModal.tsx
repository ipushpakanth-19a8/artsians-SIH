import React, { useState } from 'react';
import {
  X, ShieldCheck, CheckCircle2, CreditCard, Lock, Sparkles,
  ArrowRight, Download, Printer, User, Phone, Mail, MapPin
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

  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const unitPrice = product.final_price || product.pricing?.target_recommended || 1500;
  const subtotal = unitPrice * quantity;
  const shipping = 0; // Free direct shipping subsidy
  const totalAmount = subtotal + shipping;

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerPhone) {
      setErrorMessage("Please provide your name and phone number");
      return;
    }

    setErrorMessage(null);
    setStep('processing');

    try {
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
          buyer_address: buyerAddress,
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
              buyer_address: buyerAddress,
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
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              ₹
            </div>
            <div>
              <h3 className="font-extrabold text-sm font-['Rozha_One',serif]">
                Direct Fair-Trade Checkout
              </h3>
              <p className="text-[11px] text-stone-400">
                100% of proceeds transferred directly to {product.artisan_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step: FORM */}
        {step === 'form' && (
          <form onSubmit={handlePayNow} className="p-6 space-y-4">
            {/* Product Summary Card */}
            <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/80 flex items-center gap-3">
              <img
                src={product.enhanced_image_url || product.original_image_url}
                alt={product.title}
                className="w-16 h-16 object-cover rounded-xl border border-amber-300/60 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                  {product.category} • {product.artisan_district}
                </span>
                <h4 className="text-xs font-bold text-stone-900 truncate">
                  {product.title}
                </h4>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-stone-600 font-medium">
                    Direct Fair Price: <b className="text-amber-950 font-['Rozha_One',serif]">₹{unitPrice}</b>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-6 h-6 rounded-md bg-white border border-stone-300 text-stone-700 font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold px-1.5">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-6 h-6 rounded-md bg-white border border-stone-300 text-stone-700 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Buyer Delivery Form */}
            <div className="space-y-3">
              <h5 className="text-xs font-extrabold uppercase tracking-wider text-stone-600">
                Buyer Delivery Details
              </h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-0.5">Your Name</label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-0.5">Phone Number (UPI / SMS)</label>
                  <input
                    type="text"
                    required
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-600 block mb-0.5">Email Address</label>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-600 block mb-0.5">Shipping Address</label>
                <textarea
                  rows={2}
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-1 focus:ring-amber-500 focus:outline-none font-semibold"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-stone-600 block">
                Payment Channel (Razorpay Test Mode)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('razorpay_test')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    paymentMethod === 'razorpay_test'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-stone-200 bg-white text-stone-700'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs block">Razorpay Test Checkout</span>
                    <span className="text-[10px] text-stone-500">Cards, Netbanking & UPI</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi_direct')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    paymentMethod === 'upi_direct'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-stone-200 bg-white text-stone-700'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-emerald-700 text-white font-black text-[9px] flex items-center justify-center shrink-0">
                    U
                  </div>
                  <div>
                    <span className="text-xs block">Direct Artisan UPI QR</span>
                    <span className="text-[10px] text-stone-500">Zero Gateway Fee</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Price Breakdown Banner */}
            <div className="p-3 bg-stone-100 rounded-2xl space-y-1 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Direct Artisan Price ({quantity} item):</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Middleman Platform Cut:</span>
                <span className="text-emerald-700 font-bold">₹0 (Zero Deduction)</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Direct Packaging & Delivery:</span>
                <span className="text-stone-500">Subsidized / Free</span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between font-black text-stone-900 text-sm">
                <span>Total Amount:</span>
                <span className="font-['Rozha_One',serif] text-base text-amber-900">
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
              className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold rounded-2xl shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2 text-sm transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>Authorize & Pay ₹{totalAmount.toLocaleString('en-IN')}</span>
            </button>
          </form>
        )}

        {/* Step: PROCESSING */}
        {step === 'processing' && (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <h4 className="text-base font-bold text-stone-900">
              Connecting to Razorpay Test Gateway...
            </h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Authorizing ₹{totalAmount.toLocaleString('en-IN')} with server-side price lock. Confirming instant bank settlement to {product.artisan_name}.
            </p>
          </div>
        )}

        {/* Step: SUCCESS RECEIPT */}
        {step === 'success' && completedOrder && (
          <div className="p-6 space-y-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider rounded-full">
                Order Confirmed • Fair Trade Certified
              </span>
              <h3 className="text-xl font-black font-['Rozha_One',serif] text-stone-950 mt-2">
                Thank You for Supporting Authentic Heritage!
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Order Reference: <b className="font-mono text-stone-800">{completedOrder.id}</b>
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-stone-500">Craft:</span>
                <span className="font-bold text-stone-900">{completedOrder.product_title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Artisan Beneficiary:</span>
                <span className="font-bold text-stone-900">{completedOrder.artisan_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Payment ID:</span>
                <span className="font-mono text-stone-800">{completedOrder.payment_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Delivery To:</span>
                <span className="text-stone-800">{completedOrder.buyer_address}</span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between font-black text-sm">
                <span>Amount Paid:</span>
                <span className="text-emerald-700 font-['Rozha_One',serif]">
                  ₹{completedOrder.total_amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-emerald-800 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200">
              ✓ 100% of this payment has been routed directly into the artisan's registered bank/UPI account with zero deductions.
            </p>

            <button
              onClick={onClose}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Close & View Marketplace
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
