import React, { useState } from 'react';
import { Hammer, Plus, ShoppingBag, ShieldCheck, Sparkles, Smartphone, Monitor } from 'lucide-react';
import { Header } from './components/Header';
import { ArtisanOnboarding } from './components/ArtisanOnboarding';
import { ArtisanDashboard } from './components/ArtisanDashboard';
import { ProductCreationWizard } from './components/ProductCreationWizard';
import { BuyerMarketplace } from './components/BuyerMarketplace';
import { AIAuditPanel } from './components/AIAuditPanel';
import { MobileAppDesign } from './components/MobileAppDesign';
import { ProductDetailModal } from './components/ProductDetailModal';
import { EvaluatorTourModal } from './components/EvaluatorTourModal';
import { LanguageCode, Artisan, Product } from './types';
import { translations } from './lib/i18n';

export default function App() {
  const [currentRole, setRole] = useState<'artisan' | 'buyer' | 'audit' | 'mobile-design'>('artisan');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showEvaluatorTour, setShowEvaluatorTour] = useState<boolean>(false);

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

  const handleJumpToTourStep = (stepNumber: number) => {
    if (stepNumber === 1) {
      setRole('artisan');
      setShowOnboarding(true);
      setIsCreatingProduct(false);
    } else if (stepNumber === 2 || stepNumber === 3 || stepNumber === 4 || stepNumber === 5) {
      setRole('artisan');
      setShowOnboarding(false);
      setIsCreatingProduct(true);
    } else if (stepNumber === 6 || stepNumber === 7) {
      setRole('buyer');
      setShowOnboarding(false);
      setIsCreatingProduct(false);
    } else if (stepNumber === 8) {
      setRole('audit');
      setShowOnboarding(false);
      setIsCreatingProduct(false);
    }
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
          onOpenEvaluatorTour={() => setShowEvaluatorTour(true)}
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
                  onOpenMobileDesign={() => setRole('mobile-design')}
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

          {currentRole === 'mobile-design' && (
            <MobileAppDesign
              language={language}
              onNavigateToWizard={() => {
                setRole('artisan');
                setIsCreatingProduct(true);
              }}
              onNavigateToMarket={() => {
                setRole('buyer');
              }}
            />
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

      {/* Evaluator 5-Min Tour Modal */}
      {showEvaluatorTour && (
        <EvaluatorTourModal
          language={language}
          onClose={() => setShowEvaluatorTour(false)}
          onJumpToStep={handleJumpToTourStep}
        />
      )}

      {/* Mobile App Bottom Navigation Bar (Persistent on mobile viewports) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-900/95 backdrop-blur border-t border-stone-800 py-1.5 px-3 flex items-center justify-around text-[10px] text-stone-400 font-bold shadow-2xl">
        <button
          onClick={() => {
            setRole('artisan');
            setShowOnboarding(false);
            setIsCreatingProduct(false);
          }}
          className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${
            currentRole === 'artisan' && !isCreatingProduct && !showOnboarding ? 'text-amber-400 font-black' : 'hover:text-white'
          }`}
        >
          <Hammer className="w-4 h-4" />
          <span>Studio</span>
        </button>

        <button
          onClick={() => {
            setRole('mobile-design');
            setShowOnboarding(false);
            setIsCreatingProduct(false);
          }}
          className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${
            currentRole === 'mobile-design' ? 'text-amber-400 font-black' : 'hover:text-white'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>App Design</span>
        </button>

        <button
          onClick={() => {
            setRole('artisan');
            setShowOnboarding(false);
            setIsCreatingProduct(true);
          }}
          className="flex flex-col items-center gap-0.5 -mt-4 bg-gradient-to-tr from-amber-500 to-orange-600 text-stone-950 p-2.5 rounded-full shadow-lg border-2 border-stone-900 active:scale-95 transition-transform"
          title="Add New Craft"
        >
          <Plus className="w-5 h-5 text-stone-950 stroke-[3]" />
        </button>

        <button
          onClick={() => {
            setRole('buyer');
            setShowOnboarding(false);
            setIsCreatingProduct(false);
          }}
          className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${
            currentRole === 'buyer' ? 'text-emerald-400 font-black' : 'hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Market</span>
        </button>

        <button
          onClick={() => {
            setRole('audit');
            setShowOnboarding(false);
            setIsCreatingProduct(false);
          }}
          className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${
            currentRole === 'audit' ? 'text-indigo-400 font-black' : 'hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Audit</span>
        </button>
      </div>

      {/* Subtle Footer with Heritage & AI Provenance Credits */}
      <footer className="border-t border-stone-200 bg-white py-6 px-4 text-center text-xs text-stone-500 pb-20 md:pb-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-800 font-['Rozha_One',serif]">KALAtech</span>
            <span>• Multimodal Artisan Market Linkage & Smart Cataloging Mobile App</span>
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
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-3 sm:p-6">
        <div className="text-center mb-3 flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full">
            Artisan Mobile App (Android Phone Viewport)
          </span>
          <button
            onClick={() => setIsMobileFrame(false)}
            className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-full border border-stone-700 flex items-center gap-1.5 transition-colors"
          >
            <Monitor className="w-3.5 h-3.5 text-amber-400" />
            <span>Switch to Responsive Desktop View</span>
          </button>
        </div>

        {/* Smartphone Mockup Chassis */}
        <div className="w-full max-w-[420px] h-[860px] bg-stone-900 rounded-[50px] p-3 shadow-2xl border-4 border-stone-800 relative flex flex-col ring-1 ring-white/10">
          {/* Top speaker & camera punch hole */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-4 bg-stone-950 rounded-full flex items-center justify-center gap-2 z-50">
            <div className="w-2.5 h-2.5 rounded-full bg-stone-800" />
            <div className="w-10 h-1 rounded-full bg-stone-800" />
          </div>

          {/* Screen Content Container */}
          <div className="w-full h-full bg-stone-100 rounded-[40px] overflow-y-auto overflow-x-hidden pt-7 scrollbar-none relative">
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
