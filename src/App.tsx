import React, { useState } from 'react';
import { Header } from './components/Header';
import { ArtisanOnboarding } from './components/ArtisanOnboarding';
import { ArtisanDashboard } from './components/ArtisanDashboard';
import { ProductCreationWizard } from './components/ProductCreationWizard';
import { BuyerMarketplace } from './components/BuyerMarketplace';
import { AIAuditPanel } from './components/AIAuditPanel';
import { ProductDetailModal } from './components/ProductDetailModal';
import { LanguageCode, Artisan, Product } from './types';
import { translations } from './lib/i18n';

export default function App() {
  const [currentRole, setRole] = useState<'artisan' | 'buyer' | 'audit'>('artisan');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Active artisan session
  const [artisan, setArtisan] = useState<Artisan>({
    id: 'art-01',
    user_id: 'usr-01',
    name: 'Rameshwar Rao',
    category: 'Weaving',
    state: 'Telangana',
    district: 'Yadadri Bhoodan Pochampally',
    bio: 'Master weaver carrying forward hereditary double-ikat Pochampally handloom traditions for over 25 years.',
    experience_years: 25,
    profile_image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    phone: '+91 98480 12345'
  });

  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState<boolean>(false);
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);

  const t = translations[language];

  const handleProductCreated = (product: Product) => {
    setIsCreatingProduct(false);
    // Switch to buyer marketplace to immediately preview the newly published craft!
    setRole('buyer');
    setSelectedProductModal(product);
  };

  const mainContent = (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans flex flex-col justify-between">
      <div>
        {/* Navigation & Toolbar */}
        <Header
          currentRole={currentRole}
          setRole={setRole}
          language={language}
          setLanguage={setLanguage}
          isMobileFrame={isMobileFrame}
          setIsMobileFrame={setIsMobileFrame}
          isSpeaking={isSpeaking}
          setIsSpeaking={setIsSpeaking}
        />

        {/* View Router */}
        <main className="pb-16">
          {currentRole === 'artisan' && (
            <>
              {showOnboarding ? (
                <ArtisanOnboarding
                  language={language}
                  onComplete={(newArtisan) => {
                    setArtisan(newArtisan);
                    setShowOnboarding(false);
                  }}
                />
              ) : isCreatingProduct ? (
                <ProductCreationWizard
                  artisan={artisan}
                  language={language}
                  onFinished={handleProductCreated}
                  onCancel={() => setIsCreatingProduct(false)}
                />
              ) : (
                <ArtisanDashboard
                  artisan={artisan}
                  language={language}
                  onAddNewProduct={() => setIsCreatingProduct(true)}
                  onViewProduct={(prod) => setSelectedProductModal(prod)}
                />
              )}
            </>
          )}

          {currentRole === 'buyer' && (
            <BuyerMarketplace
              language={language}
              onEnquirySubmitted={() => {
                // If enquiry submitted, refresh or notify
              }}
            />
          )}

          {currentRole === 'audit' && (
            <AIAuditPanel language={language} />
          )}
        </main>
      </div>

      {/* Global Product Detail Modal if opened */}
      {selectedProductModal && (
        <ProductDetailModal
          product={selectedProductModal}
          language={language}
          onClose={() => setSelectedProductModal(null)}
        />
      )}

      {/* Subtle Footer with Heritage & AI Provenance Credits */}
      <footer className="border-t border-stone-200 bg-white py-6 px-4 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-800 font-['Rozha_One',serif]">Antigravity</span>
            <span>• Multimodal Artisan Market Linkage & Smart Cataloging</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowOnboarding(true)}
              className="text-stone-600 hover:text-amber-700 underline"
            >
              Switch Artisan Profile
            </button>
            <span>•</span>
            <span className="text-stone-400">Powered by Gemini 2.5 Flash</span>
          </div>
        </div>
      </footer>
    </div>
  );

  // If Mobile Frame Simulator is active:
  if (isMobileFrame) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="text-center mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full">
            Artisan Field Simulation (Mobile Android Viewport)
          </span>
          <p className="text-stone-400 text-xs mt-1">
            Simulating low-literacy responsive UI for rural smartphone users.
          </p>
        </div>

        {/* Smartphone Mockup Chassis */}
        <div className="w-full max-w-[420px] h-[850px] bg-stone-900 rounded-[50px] p-3 shadow-2xl border-4 border-stone-800 relative flex flex-col ring-1 ring-white/10">
          {/* Top speaker & camera punch hole */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-4 bg-stone-950 rounded-full flex items-center justify-center gap-2 z-50">
            <div className="w-2.5 h-2.5 rounded-full bg-stone-800" />
            <div className="w-10 h-1 rounded-full bg-stone-800" />
          </div>

          {/* Screen Content Container */}
          <div className="w-full h-full bg-stone-100 rounded-[40px] overflow-y-auto overflow-x-hidden pt-8 scrollbar-none relative">
            {mainContent}
          </div>

          {/* Bottom Home Indicator */}
          <div className="w-32 h-1 bg-stone-700 rounded-full mx-auto my-2 shrink-0" />
        </div>
      </div>
    );
  }

  return mainContent;
}
