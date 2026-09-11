import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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

import { useLanguage } from './lib/LanguageContext';
import { useAuth } from './lib/AuthContext';

// Artisan Journey Game-Style Tutorial Components
import { TutorialProvider } from './components/tutorial/TutorialContext';
import { GameHUD } from './components/tutorial/GameHUD';
import { TutorialOverlay } from './components/tutorial/TutorialOverlay';
import { WelcomeJourneyModal } from './components/tutorial/WelcomeJourneyModal';
import { RewardCelebrationModal } from './components/tutorial/RewardCelebrationModal';
import { CompletionJourneyModal } from './components/tutorial/CompletionJourneyModal';
import { ReturningArtisanBanner } from './components/tutorial/ReturningArtisanBanner';
import { OfflineBanner } from './components/common/OfflineBanner';
import { initNativeAppChrome } from './lib/nativeBridge';

export default function App() {
  const { language } = useLanguage();
  const { user, role, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    initNativeAppChrome();
  }, []);

  return (
    <TutorialProvider>
      <div className="min-h-screen bg-stone-50 font-sans relative">
        <OfflineBanner />
        <GameHUD />
        <TutorialOverlay />
        <WelcomeJourneyModal />
        <RewardCelebrationModal />
        <CompletionJourneyModal />
        <ReturningArtisanBanner />

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
    </div>
    </TutorialProvider>
  );
}
