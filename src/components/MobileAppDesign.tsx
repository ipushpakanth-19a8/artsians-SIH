import React, { useState } from 'react';
import {
  Smartphone, Sparkles, Camera, Mic, Volume2, ShieldCheck,
  ShoppingBag, QrCode, ArrowRight, CheckCircle2, ChevronRight,
  TrendingUp, Share2, Phone, MessageSquare, Sliders, Layers,
  ExternalLink, Info, Check, Play, RotateCcw, Battery, Wifi, Signal,
  Palette, Grid, Maximize2, Apple, Disc, ArrowLeft
} from 'lucide-react';
import { LanguageCode } from '../types';
import { translations, speakText } from '../lib/i18n';

interface MobileAppDesignProps {
  language: LanguageCode;
  onNavigateToWizard?: () => void;
  onNavigateToMarket?: () => void;
}

type DeviceType = 'iphone' | 'pixel';
type MobileScreen = 'studio' | 'camera' | 'pricing' | 'provenance' | 'buyer';
type ActiveTab = 'simulator' | 'specs' | 'flows';

export const MobileAppDesign: React.FC<MobileAppDesignProps> = ({
  language,
  onNavigateToWizard,
  onNavigateToMarket
}) => {
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<ActiveTab>('simulator');
  const [deviceType, setDeviceType] = useState<DeviceType>('iphone');
  const [currentScreen, setCurrentScreen] = useState<MobileScreen>('studio');

  // Simulator interactive states
  const [simRawPhoto, setSimRawPhoto] = useState(false);
  const [simAudioPlaying, setSimAudioPlaying] = useState(false);
  const [simMaterialCost, setSimMaterialCost] = useState(850);
  const [simLaborHours, setSimLaborHours] = useState(16);
  const [simHourlyWage, setSimHourlyWage] = useState(85);

  const calculatedBase = simMaterialCost + (simLaborHours * simHourlyWage);
  const calculatedRecommended = Math.round(calculatedBase * 1.25);
  const middlemanCutLoss = Math.round(calculatedRecommended * 0.55);

  const handleSimVoice = (text: string) => {
    if (simAudioPlaying) {
      setSimAudioPlaying(false);
    } else {
      setSimAudioPlaying(true);
      speakText(text, language);
      setTimeout(() => setSimAudioPlaying(false), 4500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-8">
      
      {/* Hero Header: Mobile App Design Showcase */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950/80 to-stone-950 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-full text-xs font-bold text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>SIH Flagship • Mobile-First Low-Literacy Architecture</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-['Rozha_One',serif] tracking-tight text-white">
              KALAtech Native Mobile App Design
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              Designed specifically for marginalized rural Indian artisans with voice-first Vernacular UI (Hindi/Telugu), 48px+ touch targets, instant on-device AI camera cataloging, and direct buyer WhatsApp commerce.
            </p>
          </div>

          {/* Top Mode Tabs */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-stone-950/80 border border-stone-800 rounded-2xl shrink-0">
            <button
              id="tab-mobile-simulator-btn"
              onClick={() => setActiveTab('simulator')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'simulator'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 shadow-md shadow-orange-950/40'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Interactive Phone Simulator</span>
            </button>

            <button
              id="tab-mobile-specs-btn"
              onClick={() => setActiveTab('specs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'specs'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 shadow-md shadow-orange-950/40'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Design System & Tokens</span>
            </button>

            <button
              id="tab-mobile-flows-btn"
              onClick={() => setActiveTab('flows')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'flows'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 shadow-md shadow-orange-950/40'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Screen Flows & Wireframes</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: INTERACTIVE SMARTPHONE SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls & Screen Selector Sidebar */}
          <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-600" />
                  <span>Interactive Device Controls</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Experience how a rural weaver or pottery artisan interacts with KALAtech on their handheld phone.
                </p>
              </div>

              {/* Device Chassis Switcher */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Device Hardware Chassis</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDeviceType('iphone')}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      deviceType === 'iphone'
                        ? 'bg-stone-900 text-white border-stone-800 shadow-sm'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <Apple className="w-3.5 h-3.5" />
                    <span>iPhone 16 Pro</span>
                  </button>

                  <button
                    onClick={() => setDeviceType('pixel')}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      deviceType === 'pixel'
                        ? 'bg-stone-900 text-white border-stone-800 shadow-sm'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <Disc className="w-3.5 h-3.5" />
                    <span>Google Pixel 9</span>
                  </button>
                </div>
              </div>

              {/* Mobile Screen Navigation */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Select Mobile Screen</label>
                <div className="space-y-1.5">
                  {[
                    { id: 'studio', label: '1. Artisan Studio & Voice Hub', sub: 'Voice prompt, daily earnings, order notifications', icon: HammerIcon },
                    { id: 'camera', label: '2. Multimodal AI Camera', sub: 'Instant background removal & studio relighting', icon: Camera },
                    { id: 'pricing', label: '3. Fair Wage Calculator', sub: 'Cost-plus formula, middleman cut prevention', icon: Sliders },
                    { id: 'provenance', label: '4. Provenance QR Certificate', sub: 'Tamper-evident blockchain GI tag card', icon: QrCode },
                    { id: 'buyer', label: '5. Buyer Direct WhatsApp', sub: 'Consumer story feed & 1-tap direct checkout', icon: ShoppingBag }
                  ].map((scr) => {
                    const Icon = scr.icon;
                    const isSelected = currentScreen === scr.id;
                    return (
                      <button
                        key={scr.id}
                        id={`select-mobile-screen-${scr.id}-btn`}
                        onClick={() => setCurrentScreen(scr.id as MobileScreen)}
                        className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 text-amber-950 font-semibold shadow-sm'
                            : 'bg-stone-50/70 border-stone-200 hover:bg-stone-100 text-stone-800'
                        }`}
                      >
                        <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-amber-500 text-stone-950' : 'bg-stone-200 text-stone-700'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold leading-tight">{scr.label}</p>
                          <p className="text-[11px] text-stone-500 truncate mt-0.5">{scr.sub}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Low-Literacy Accessibility Highlight */}
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                  <Volume2 className="w-4 h-4 text-amber-600" />
                  <span>Vernacular Audio Feedback Built-In</span>
                </div>
                <p className="text-[11px] text-amber-900/80 leading-relaxed">
                  Every button, price breakdown, and instruction in the mobile app features a single-tap audio speaker icon so illiterate artisans can hear instructions in spoken Telugu, Hindi, or English.
                </p>
              </div>

            </div>
          </div>

          {/* Center/Right: Realistic Device Mockup */}
          <div className="lg:col-span-8 flex flex-col items-center justify-center order-1 lg:order-2">
            
            {/* Device Mockup Shell */}
            <div
              className={`relative shadow-2xl transition-all duration-300 ${
                deviceType === 'iphone'
                  ? 'w-[360px] sm:w-[390px] h-[780px] sm:h-[820px] bg-stone-950 rounded-[54px] p-3.5 border-[6px] border-stone-800 ring-1 ring-white/10'
                  : 'w-[360px] sm:w-[390px] h-[780px] sm:h-[820px] bg-stone-900 rounded-[44px] p-3 border-[5px] border-stone-750 ring-1 ring-white/10'
              }`}
            >
              {/* iPhone Dynamic Island OR Pixel Punch Hole */}
              {deviceType === 'iphone' ? (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-6 bg-stone-950 rounded-full flex items-center justify-between px-2.5 z-50 shadow-inner">
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-900 border border-stone-800" />
                  <div className="w-2 h-2 rounded-full bg-amber-500/80 animate-pulse" title="Microphone / Camera Active" />
                  <div className="w-3 h-3 rounded-full bg-stone-900 border border-stone-800" />
                </div>
              ) : (
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-stone-950 rounded-full z-50 border border-stone-800" />
              )}

              {/* Status Bar */}
              <div className="absolute top-4 left-8 right-8 flex items-center justify-between text-[11px] font-bold text-stone-400 z-40 px-1">
                <span>9:41</span>
                <div className="flex items-center gap-1.5">
                  <Signal className="w-3 h-3" />
                  <Wifi className="w-3 h-3" />
                  <div className="flex items-center gap-0.5">
                    <span className="text-[10px]">98%</span>
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                </div>
              </div>

              {/* Phone Screen Canvas */}
              <div className="w-full h-full bg-stone-100 rounded-[40px] overflow-hidden flex flex-col pt-10 pb-4 relative select-none">
                
                {/* Screen Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 scrollbar-thin">
                  
                  {/* SCREEN 1: ARTISAN STUDIO HOME */}
                  {currentScreen === 'studio' && (
                    <div className="space-y-4 animate-fadeIn">
                      {/* Vernacular Greeting Card */}
                      <div className="bg-gradient-to-br from-stone-900 to-stone-850 text-white p-4 rounded-2xl shadow-md border border-stone-800 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <img
                              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80"
                              alt="Rameshwar"
                              className="w-10 h-10 rounded-xl object-cover border-2 border-amber-500"
                            />
                            <div>
                              <h4 className="text-xs font-bold text-white font-['Rozha_One',serif]">
                                Namaste, Rameshwar ji
                              </h4>
                              <p className="text-[10px] text-amber-300">Pochampally Weaving Guild</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleSimVoice("Namaste Rameshwar ji! You have 3 buyer inquiries today and ₹42,800 direct revenue.")}
                            className={`p-2 rounded-xl ${simAudioPlaying ? 'bg-amber-500 text-stone-950 animate-pulse' : 'bg-stone-800 text-amber-400'}`}
                            title="Listen in Telugu"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Middleman Savings Banner */}
                        <div className="mt-3 grid grid-cols-2 gap-2 pt-2.5 border-t border-stone-800 text-[11px]">
                          <div>
                            <span className="text-stone-400 text-[10px]">Direct Revenue</span>
                            <p className="text-emerald-400 font-extrabold text-sm">₹42,800</p>
                          </div>
                          <div>
                            <span className="text-stone-400 text-[10px]">Middleman Cut Saved</span>
                            <p className="text-amber-400 font-extrabold text-sm">+₹18,200</p>
                          </div>
                        </div>
                      </div>

                      {/* Low-Literacy Action Tiles */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          onClick={() => setCurrentScreen('camera')}
                          className="bg-gradient-to-br from-amber-600 to-orange-600 text-white p-3.5 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-transform"
                        >
                          <Camera className="w-6 h-6 text-amber-100" />
                          <span className="text-xs font-extrabold">Photo Catalog</span>
                          <span className="text-[9px] text-amber-200">AI Enhancer</span>
                        </button>

                        <button
                          onClick={() => setCurrentScreen('pricing')}
                          className="bg-stone-900 text-white p-3.5 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-1.5 border border-stone-800 active:scale-95 transition-transform"
                        >
                          <Sliders className="w-6 h-6 text-amber-400" />
                          <span className="text-xs font-extrabold">Fair Price</span>
                          <span className="text-[9px] text-stone-400">Cost-Plus Audit</span>
                        </button>
                      </div>

                      {/* WhatsApp Orders Quick List */}
                      <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-stone-900">
                          <span className="flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Recent Buyer Enquiries</span>
                          </span>
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] rounded-full font-bold">
                            3 New
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-stone-900">Ananya Sen (Delhi)</p>
                              <p className="text-[10px] text-stone-500">Pochampally Silk Saree • ₹8,400</p>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                              WhatsApp
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Offline Sync Indicator */}
                      <div className="p-2.5 bg-stone-200/70 rounded-xl flex items-center justify-between text-[10px] text-stone-600 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          <span>Local SQLite Synced • Ready for ONDC</span>
                        </span>
                        <span className="text-stone-500">Offline-Safe</span>
                      </div>
                    </div>
                  )}

                  {/* SCREEN 2: MULTIMODAL AI CAMERA */}
                  {currentScreen === 'camera' && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="relative rounded-2xl overflow-hidden bg-stone-950 aspect-[4/5] border border-stone-800 shadow-inner flex flex-col justify-between p-3">
                        
                        {/* Camera Top HUD */}
                        <div className="flex items-center justify-between text-white text-xs z-20">
                          <span className="px-2 py-0.5 bg-black/60 backdrop-blur rounded-full text-[10px] font-bold text-amber-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Auto AI Lighting
                          </span>
                          <button
                            onClick={() => setSimRawPhoto(!simRawPhoto)}
                            className="px-2.5 py-1 bg-white/20 hover:bg-white/30 backdrop-blur text-white text-[10px] font-bold rounded-full border border-white/30"
                          >
                            {simRawPhoto ? "Show Studio AI" : "Show Raw Photo"}
                          </button>
                        </div>

                        {/* Viewfinder Image */}
                        <img
                          src={simRawPhoto
                            ? "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=70"
                            : "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=85"}
                          alt="Craft Photo"
                          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                            simRawPhoto ? 'filter brightness-90 contrast-90' : 'filter brightness-105 contrast-105 saturate-110'
                          }`}
                        />

                        {/* Viewfinder Grid Overlay */}
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20 border border-white/40">
                          <div className="border-r border-b border-white" />
                          <div className="border-r border-b border-white" />
                          <div className="border-b border-white" />
                          <div className="border-r border-b border-white" />
                          <div className="border-r border-b border-white" />
                          <div className="border-b border-white" />
                          <div className="border-r border-white" />
                          <div className="border-r border-white" />
                          <div />
                        </div>

                        {/* Camera Bottom Shutter / Shutter Bar */}
                        <div className="relative z-20 flex items-center justify-between pt-2">
                          <button
                            onClick={() => handleSimVoice("Gemini Vision identified Pochampally double-ikat pure silk saree with natural madder dyes.")}
                            className="p-2.5 rounded-full bg-black/60 text-amber-400 border border-white/20"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>

                          {/* Shutter Button */}
                          <button
                            onClick={() => setSimRawPhoto(!simRawPhoto)}
                            className="w-12 h-12 rounded-full border-4 border-white bg-amber-500 shadow-lg flex items-center justify-center active:scale-90 transition-transform"
                          >
                            <div className="w-9 h-9 rounded-full bg-white" />
                          </button>

                          <button
                            onClick={() => setCurrentScreen('pricing')}
                            className="p-2.5 rounded-full bg-black/60 text-white border border-white/20"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* AI Vision Chips */}
                      <div className="bg-white p-3 rounded-2xl border border-stone-200 text-xs space-y-1.5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-800">Detected Craft Details</span>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                            99.4% Match
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md text-[10px] font-semibold">Pochampally Ikat</span>
                          <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md text-[10px] font-semibold">Mulberry Silk</span>
                          <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md text-[10px] font-semibold">Natural Dyes</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SCREEN 3: FAIR WAGE CALCULATOR */}
                  {currentScreen === 'pricing' && (
                    <div className="space-y-3.5 animate-fadeIn">
                      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-stone-900">Cost-Plus Fair Wage Engine</h4>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            Transparent
                          </span>
                        </div>

                        {/* Interactive Sliders */}
                        <div className="space-y-2.5 text-xs">
                          <div>
                            <div className="flex justify-between text-[11px] text-stone-600 mb-1">
                              <span>Raw Silk & Dye Cost</span>
                              <span className="font-bold text-stone-900">₹{simMaterialCost}</span>
                            </div>
                            <input
                              type="range"
                              min="300"
                              max="2500"
                              step="50"
                              value={simMaterialCost}
                              onChange={(e) => setSimMaterialCost(Number(e.target.value))}
                              className="w-full accent-amber-600 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] text-stone-600 mb-1">
                              <span>Loom Weaving Hours</span>
                              <span className="font-bold text-stone-900">{simLaborHours} hrs</span>
                            </div>
                            <input
                              type="range"
                              min="4"
                              max="48"
                              step="2"
                              value={simLaborHours}
                              onChange={(e) => setSimLaborHours(Number(e.target.value))}
                              className="w-full accent-amber-600 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] text-stone-600 mb-1">
                              <span>Living Wage Protection</span>
                              <span className="font-bold text-stone-900">₹{simHourlyWage}/hr</span>
                            </div>
                            <input
                              type="range"
                              min="50"
                              max="200"
                              step="5"
                              value={simHourlyWage}
                              onChange={(e) => setSimHourlyWage(Number(e.target.value))}
                              className="w-full accent-amber-600 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Pricing Comparison Card */}
                      <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-white p-4 rounded-2xl shadow-md border border-stone-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-stone-400">Fair Direct Price</span>
                          <span className="text-base font-extrabold text-amber-400">₹{calculatedRecommended}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-800">
                          <span className="text-red-400">Middleman Exploitation Offer</span>
                          <span className="text-stone-300 line-through">₹{calculatedRecommended - middlemanCutLoss}</span>
                        </div>
                        <p className="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-800/40 text-center">
                          Artisan retains 100% of ₹{calculatedRecommended} direct value!
                        </p>
                      </div>

                      <button
                        onClick={() => setCurrentScreen('provenance')}
                        className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-xl text-xs shadow flex items-center justify-center gap-1.5"
                      >
                        <span>Generate Provenance Tag</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* SCREEN 4: DIGITAL HERITAGE PROVENANCE QR */}
                  {currentScreen === 'provenance' && (
                    <div className="space-y-3.5 animate-fadeIn">
                      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-md text-center space-y-3">
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-[10px] font-bold">
                          <ShieldCheck className="w-3 h-3 text-amber-700" />
                          <span>Official GI Registry Verified</span>
                        </div>

                        {/* Simulated QR Code */}
                        <div className="w-36 h-36 mx-auto bg-stone-900 p-2.5 rounded-2xl shadow-inner flex flex-col items-center justify-center border-2 border-amber-500/40">
                          <div className="w-full h-full bg-white rounded-xl p-2 flex flex-col items-center justify-center">
                            <QrCode className="w-24 h-24 text-stone-950" />
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-stone-900">Certificate #KT-TEL-8924</h4>
                          <p className="text-[10px] text-stone-500">Master Weaver: Rameshwar Rao</p>
                          <p className="text-[10px] text-amber-700 font-medium">Yadadri Bhoodan Pochampally, Telangana</p>
                        </div>

                        <div className="p-2 bg-stone-50 rounded-xl text-[10px] text-stone-600 font-mono text-left">
                          Hash: <span className="text-stone-900 font-bold">0x89f2..4c12</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setCurrentScreen('buyer')}
                        className="w-full py-2.5 bg-stone-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
                      >
                        <span>Preview Buyer Marketplace View</span>
                        <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                    </div>
                  )}

                  {/* SCREEN 5: BUYER DIRECT WHATSAPP */}
                  {currentScreen === 'buyer' && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
                        <img
                          src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80"
                          alt="Pochampally Saree"
                          className="w-full h-36 object-cover"
                        />
                        <div className="p-3 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-stone-900">Pochampally Double-Ikat Saree</h4>
                              <p className="text-[10px] text-stone-500">Direct from Rameshwar Rao • GI Certified</p>
                            </div>
                            <span className="text-xs font-extrabold text-amber-700">₹8,400</span>
                          </div>

                          <p className="text-[10px] text-stone-600 line-clamp-2">
                            Hand-loomed with natural organic dyes over 18 labor hours in Pochampally, Telangana.
                          </p>

                          {/* Direct Actions */}
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={() => window.open('https://api.whatsapp.com', '_blank')}
                              className="py-2 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 shadow-sm"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </button>

                            <button
                              onClick={() => alert("Simulated direct UPI payment initiated to artisan's bank account!")}
                              className="py-2 px-2.5 bg-stone-900 hover:bg-stone-850 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 shadow-sm"
                            >
                              <ShoppingBag className="w-3 h-3 text-amber-400" />
                              <span>Direct UPI</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[10px] text-amber-900 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>0% commission fee. 100% of funds go directly to artisan's bank account.</span>
                      </div>
                    </div>
                  )}

                </div>

                {/* Simulated Native Bottom Navigation Bar */}
                <div className="bg-stone-900/95 backdrop-blur border-t border-stone-800 py-2 px-4 flex items-center justify-around text-stone-400 shrink-0">
                  <button
                    onClick={() => setCurrentScreen('studio')}
                    className={`flex flex-col items-center gap-0.5 text-[9px] font-bold transition-colors ${
                      currentScreen === 'studio' ? 'text-amber-400' : 'hover:text-stone-200'
                    }`}
                  >
                    <HammerIcon className="w-4 h-4" />
                    <span>Studio</span>
                  </button>

                  <button
                    onClick={() => setCurrentScreen('camera')}
                    className="flex flex-col items-center gap-0.5 -mt-4 bg-gradient-to-tr from-amber-500 to-orange-600 text-stone-950 p-2.5 rounded-full shadow-lg border-2 border-stone-900 active:scale-90 transition-transform"
                    title="AI Camera"
                  >
                    <Camera className="w-4 h-4 text-stone-950 stroke-[2.5]" />
                  </button>

                  <button
                    onClick={() => setCurrentScreen('pricing')}
                    className={`flex flex-col items-center gap-0.5 text-[9px] font-bold transition-colors ${
                      currentScreen === 'pricing' ? 'text-amber-400' : 'hover:text-stone-200'
                    }`}
                  >
                    <Sliders className="w-4 h-4" />
                    <span>Pricing</span>
                  </button>

                  <button
                    onClick={() => setCurrentScreen('provenance')}
                    className={`flex flex-col items-center gap-0.5 text-[9px] font-bold transition-colors ${
                      currentScreen === 'provenance' ? 'text-amber-400' : 'hover:text-stone-200'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>GI Tag</span>
                  </button>

                  <button
                    onClick={() => setCurrentScreen('buyer')}
                    className={`flex flex-col items-center gap-0.5 text-[9px] font-bold transition-colors ${
                      currentScreen === 'buyer' ? 'text-emerald-400' : 'hover:text-stone-200'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Market</span>
                  </button>
                </div>

                {/* Home Indicator Pill */}
                <div className="w-28 h-1 bg-stone-500/50 rounded-full mx-auto mt-2 shrink-0" />
              </div>
            </div>

            {/* Quick Helper Subtext */}
            <p className="text-xs text-stone-400 mt-4 text-center">
              Click any icon on the bottom phone bar or the screen buttons to test the live mobile interaction.
            </p>
          </div>

        </div>
      )}

      {/* TAB 2: DESIGN SYSTEM & TOKENS */}
      {activeTab === 'specs' && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Section 1: Color Palette */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold mb-2">
                <Palette className="w-3.5 h-3.5 text-amber-700" />
                <span>Mobile Color Tokens</span>
              </div>
              <h2 className="text-xl font-black font-['Rozha_One',serif] text-stone-900">
                Heritage Artisan Color Palette & Accessibility Matrix
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Curated specifically for high sunlight legibility outdoors in rural Indian workshops and open bazaars.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { name: 'Artisan Ochre', hex: '#D97706', role: 'Primary CTA, Voice Highlights', bg: 'bg-amber-600', text: 'text-white', wcag: 'AAA (Contrast 7.1:1)' },
                { name: 'Terracotta Rust', hex: '#C2410C', role: 'Camera Shutter, Action Buttons', bg: 'bg-orange-700', text: 'text-white', wcag: 'AAA (Contrast 8.2:1)' },
                { name: 'Heritage Charcoal', hex: '#1C1917', role: 'Chassis, High-contrast dark cards', bg: 'bg-stone-900', text: 'text-white', wcag: 'AAA (Contrast 15.4:1)' },
                { name: 'Indigo Dye', hex: '#3730A3', role: 'GI Verification, Audit Badges', bg: 'bg-indigo-700', text: 'text-white', wcag: 'AAA (Contrast 9.1:1)' },
                { name: 'Living Emerald', hex: '#047857', role: 'Direct WhatsApp & Revenue', bg: 'bg-emerald-700', text: 'text-white', wcag: 'AAA (Contrast 6.8:1)' },
                { name: 'Raw Silk Cream', hex: '#FAFAF9', role: 'Canvas & Background', bg: 'bg-stone-100', text: 'text-stone-900', wcag: 'Sunlight Anti-Glare' },
              ].map((c) => (
                <div key={c.name} className="border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className={`h-24 ${c.bg} p-3 flex flex-col justify-end`}>
                    <span className={`text-xs font-black ${c.text}`}>{c.hex}</span>
                  </div>
                  <div className="p-3 bg-white space-y-1">
                    <p className="text-xs font-bold text-stone-900 leading-tight">{c.name}</p>
                    <p className="text-[10px] text-stone-500 leading-snug">{c.role}</p>
                    <span className="inline-block text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-1">
                      {c.wcag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Low-Literacy Ergonomics & Design Rules */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-black">
                48dp+
              </div>
              <h3 className="text-sm font-bold text-stone-900">Minimum 48x48dp Touch Targets</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Rural weavers, potters, and sculptors frequently have calloused or clay-dusted fingers. All interactive buttons, camera shutters, and audio triggers adhere to strict 48dp+ hit slates.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-700 flex items-center justify-center font-black">
                <Volume2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-stone-900">Audio-First Vernacular Feedback</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Zero reliance on reading lengthy technical texts. Every price breakdown and status prompt has a high-visibility speaker icon speaking natural colloquial Telugu, Hindi, and English.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-black">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-stone-900">Offline-First SQLite Architecture</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Craft workshops in remote villages often experience intermittent 2G/3G connectivity. Photos, voice recordings, and price drafts are queued in local phone storage and sync seamlessly upon reconnection.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: SCREEN FLOWS & ARCHITECTURE */}
      {activeTab === 'flows' && (
        <div className="space-y-8 animate-fadeIn">
          
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-900 border border-indigo-300 rounded-full text-xs font-bold mb-2">
                <Layers className="w-3.5 h-3.5 text-indigo-700" />
                <span>End-to-End User Journey</span>
              </div>
              <h2 className="text-xl font-black font-['Rozha_One',serif] text-stone-900">
                Complete Mobile App Information Architecture
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                How a marginalized artisan goes from a raw craft piece in their village to a confirmed direct buyer order in under 2 minutes.
              </p>
            </div>

            {/* Step-by-Step Flow Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { step: '01', title: 'Voice Onboarding', desc: 'Select Hindi/Telugu. Tap microphone to state name, craft guild, and village. Zero manual typing required.', time: '15 sec' },
                { step: '02', title: 'Multimodal AI Snap', desc: 'Hold craft to camera. AI auto-detects lighting, removes workshop background, and categorizes weave density.', time: '20 sec' },
                { step: '03', title: 'Fair Wage Engine', desc: 'Artisan adjusts simple material and labor sliders. System enforces cost-plus living wage and exposes middleman cut.', time: '25 sec' },
                { step: '04', title: 'QR Provenance Seal', desc: 'Generates verifiable Geographical Indication (GI) digital passport with tamper-proof blockchain hash.', time: '10 sec' },
                { step: '05', title: 'Direct Buyer Connect', desc: 'Auto-publishes to ONDC, sends WhatsApp share links, and routes buyer inquiries directly to artisan.', time: 'Instant' },
              ].map((f) => (
                <div key={f.step} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 relative flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black font-mono text-amber-600">{f.step}</span>
                      <span className="text-[10px] font-bold text-stone-500 bg-white px-2 py-0.5 rounded-full border border-stone-200">{f.time}</span>
                    </div>
                    <h4 className="text-xs font-bold text-stone-900 leading-tight">{f.title}</h4>
                    <p className="text-[11px] text-stone-600 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Technical Mobile Stack Specifications */}
            <div className="mt-8 p-5 bg-stone-900 text-stone-100 rounded-2xl border border-stone-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Production Mobile Tech Stack Architecture</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-stone-850 rounded-xl border border-stone-750 space-y-1">
                  <span className="text-amber-400 font-bold">Cross-Platform UI</span>
                  <p className="text-stone-300 font-semibold">React Native / Expo SDK 52</p>
                  <p className="text-[11px] text-stone-400">Native 60 FPS gestures on both low-end Android and iOS devices.</p>
                </div>

                <div className="p-3 bg-stone-850 rounded-xl border border-stone-750 space-y-1">
                  <span className="text-amber-400 font-bold">On-Device AI Camera</span>
                  <p className="text-stone-300 font-semibold">Gemini 2.5 Flash + MediaPipe</p>
                  <p className="text-[11px] text-stone-400">Offline background segmentation and edge textile pattern recognition.</p>
                </div>

                <div className="p-3 bg-stone-850 rounded-xl border border-stone-750 space-y-1">
                  <span className="text-amber-400 font-bold">Local Offline Database</span>
                  <p className="text-stone-300 font-semibold">SQLite / WatermelonDB</p>
                  <p className="text-[11px] text-stone-400">Zero data loss in remote workshops with auto-sync queue.</p>
                </div>

                <div className="p-3 bg-stone-850 rounded-xl border border-stone-750 space-y-1">
                  <span className="text-amber-400 font-bold">Direct Market Channels</span>
                  <p className="text-stone-300 font-semibold">WhatsApp Cloud API & ONDC</p>
                  <p className="text-[11px] text-stone-400">Direct conversational commerce with zero intermediary platform cuts.</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

function HammerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9" />
      <path d="M17.64 15 22 10.64" />
      <path d="m20.91 3.26-2.17-2.17a2.1 2.1 0 0 0-2.97 0L9.4 7.46l4.24 4.24 6.37-6.37a2.1 2.1 0 0 0 0-2.97z" />
    </svg>
  );
}
