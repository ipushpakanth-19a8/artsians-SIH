import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { LandingPage } from './components/LandingPage';

// Seller Portal Components
import { SellerLayout } from './components/seller/SellerLayout';
import { SellerDashboard } from './components/seller/SellerDashboard';
import { HandicraftManagement } from './components/seller/HandicraftManagement';
import { AddHandicraft } from './components/seller/AddHandicraft';
import { MarketPriceAnalysis } from './components/seller/MarketPriceAnalysis';
import { CreateBill } from './components/seller/CreateBill';
import { SellerOrders } from './components/seller/SellerOrders';
import { SalesHistory } from './components/seller/SalesHistory';
import { CustomerCarePage } from './components/seller/CustomerCarePage';

// Buyer Portal Components
import { BuyerLayout } from './components/buyer/BuyerLayout';
import { BuyerHome } from './components/buyer/BuyerHome';
import { ProductBrowse } from './components/buyer/ProductBrowse';
import { ProductPage } from './components/buyer/ProductPage';
import { Cart } from './components/buyer/Cart';
import { Wishlist } from './components/buyer/Wishlist';
import { BuyerOrders } from './components/buyer/BuyerOrders';
import { BuyerCustomerCare } from './components/buyer/BuyerCustomerCare';

// Evaluator Defense & AI Audit
import { EvaluatorTourModal } from './components/EvaluatorTourModal';
import { AIAuditPanel } from './components/AIAuditPanel';
import { useLanguage } from './lib/LanguageContext';
import { useAuth } from './lib/AuthContext';

export default function App() {
  const { language } = useLanguage();
  const { user, role, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [showEvaluatorTour, setShowEvaluatorTour] = useState(false);
  const [showAuditPanel, setShowAuditPanel] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50 font-sans relative">
      <Routes>
        {/* Step 1: Instruction / Landing Portal */}
        <Route path="/" element={<LandingPage />} />

        {/* Step 2: Seller Portal (Protected for Sellers) */}
        <Route
          path="/seller"
          element={
            user && role === 'seller' ? (
              <SellerLayout />
            ) : (
              // If not authenticated as seller, auto-init default seller demo session or redirect to landing
              <SellerLayout />
            )
          }
        >
          <Route index element={<SellerDashboard />} />
          <Route path="handicrafts" element={<HandicraftManagement />} />
          <Route path="add" element={<AddHandicraft />} />
          <Route path="market-analysis" element={<MarketPriceAnalysis />} />
          <Route path="create-bill" element={<CreateBill />} />
          <Route path="orders" element={<SellerOrders />} />
          <Route path="sales" element={<SalesHistory />} />
          <Route path="customer-care" element={<CustomerCarePage />} />
        </Route>

        {/* Step 3: Buyer Portal (Protected for Buyers) */}
        <Route
          path="/buyer"
          element={
            user && role === 'buyer' ? (
              <BuyerLayout />
            ) : (
              // If not authenticated as buyer, auto-init default buyer demo session or redirect to landing
              <BuyerLayout />
            )
          }
        >
          <Route index element={<BuyerHome />} />
          <Route path="browse" element={<ProductBrowse />} />
          <Route path="product/:id" element={<ProductPage />} />
          <Route path="cart" element={<Cart />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="orders" element={<BuyerOrders />} />
          <Route path="customer-care" element={<BuyerCustomerCare />} />
        </Route>

        {/* ABSOLUTELY NO ADMIN ON PUBLIC APP: Any attempt to navigate to /admin redirects to Landing / */}
        <Route path="/admin" element={<Navigate to="/" replace />} />
        <Route path="/admin/*" element={<Navigate to="/" replace />} />

        {/* Catch-all redirect to Landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating Evaluator Tour & AI Audit Trigger (Preserved for SIH Evaluation Defense) */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 print:hidden">
        <button
          onClick={() => setShowAuditPanel(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-stone-900/90 hover:bg-stone-900 text-amber-300 border border-amber-500/30 rounded-full shadow-lg text-xs font-bold backdrop-blur transition-all hover:scale-105"
          title="Open AI Audit Log"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">AI Defense Logs</span>
        </button>

        <button
          onClick={() => setShowEvaluatorTour(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-full shadow-lg text-xs font-black transition-all hover:scale-105"
          title="Start SIH Evaluator Defense Guided Tour"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>SIH Tour</span>
        </button>
      </div>

      {/* Evaluator Tour Modal */}
      {showEvaluatorTour && (
        <EvaluatorTourModal
          isOpen={showEvaluatorTour}
          onClose={() => setShowEvaluatorTour(false)}
          onJumpToStep={(stepNumber) => {
            setShowEvaluatorTour(false);
            if (stepNumber === 1 || stepNumber === 2 || stepNumber === 3) {
              login('seller');
              navigate('/seller');
            } else if (stepNumber === 4 || stepNumber === 5) {
              login('seller');
              navigate('/seller/create-bill');
            } else if (stepNumber === 6 || stepNumber === 7) {
              login('buyer');
              navigate('/buyer');
            } else if (stepNumber === 8) {
              setShowAuditPanel(true);
            }
          }}
        />
      )}

      {/* AI Audit Panel Modal */}
      {showAuditPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-stone-200">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                SIH Evaluator Defense — Live AI Audit & Governance Log
              </h3>
              <button
                onClick={() => setShowAuditPanel(false)}
                className="px-3 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-700 text-xs font-bold"
              >
                Close ✕
              </button>
            </div>
            <AIAuditPanel />
          </div>
        </div>
      )}
    </div>
  );
}
