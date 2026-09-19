import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Volume2, Sparkles, ChevronDown, CheckCircle2, ShieldCheck, Heart, ShoppingBag, Search } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';
import { useAuth } from '../lib/AuthContext';
import { LanguageCode } from '../types';
import { PORTAL_TRANSLATIONS } from '../lib/portalI18n';
import { useVoiceAssistant } from '../lib/useVoiceAssistant';

// Modular Portal Components
import { PortalHeader } from './portal/PortalHeader';
import { VoiceFloatingBar } from './portal/VoiceFloatingBar';
import { CraftJourneyDiagram } from './portal/CraftJourneyDiagram';
import { InstructionWizard } from './portal/InstructionWizard';
import { AIProcessingDemo } from './portal/AIProcessingDemo';
import { RoleSelector } from './portal/RoleSelector';
import { ArtisanOnboardingModal } from './portal/ArtisanOnboardingModal';
import { BuyerAuthModal } from './auth/BuyerAuthModal';
import { SellerAuthModal } from './auth/SellerAuthModal';
import { LanguageSelectionModal } from './common/LanguageSelectionModal';
import { LocationLanguageModal } from './common/LocationLanguageModal';

// ── Indian Heritage Cultural Data ─────────────────────────────────────────────

const CRAFTS = [
  { id: 1, name: 'Madhubani', region: 'Mithila, Bihar', artisan: 'Sita Devi', image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&h=450&fit=crop&auto=format', desc: 'Ancient folk paintings with natural mineral dyes depicting harmony with nature.', tag: 'Painting' },
  { id: 2, name: 'Kalamkari', region: 'Srikalahasti, Andhra Pradesh', artisan: 'Venkat Rao', image: 'https://images.unsplash.com/photo-1609388879688-3b2b84bfb8e2?w=600&h=450&fit=crop&auto=format', desc: 'Hand-painted cotton textile art crafted with bamboo pens and organic vegetable dyes.', tag: 'Textile' },
  { id: 3, name: 'Warli', region: 'Jawhar, Maharashtra', artisan: 'Jivya Soma', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=450&fit=crop&auto=format', desc: 'Indigenous tribal murals using rice paste pigment celebrating communal harmony.', tag: 'Tribal Art' },
  { id: 4, name: 'Phulkari', region: 'Patiala, Punjab', artisan: 'Surjit Kaur', image: 'https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=600&h=450&fit=crop&auto=format', desc: 'Vibrant silk floss embroidery stitched from the reverse side of coarse cotton fabric.', tag: 'Embroidery' },
  { id: 5, name: 'Pattachitra', region: 'Raghurajpur, Odisha', artisan: 'Apindra Swain', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=450&fit=crop&auto=format', desc: 'Intricate cloth scroll paintings capturing sacred mythology with fine tamarind paste outlines.', tag: 'Painting' },
  { id: 6, name: 'Gond Art', region: 'Dindori, Madhya Pradesh', artisan: 'Jangarh Singh', image: 'https://images.unsplash.com/photo-1582731478851-aa96f9f1c9eb?w=600&h=450&fit=crop&auto=format', desc: 'Sacred tribal dot-and-dash patterns venerating rivers, birds, and forest spirits.', tag: 'Tribal Art' },
];

const ARTISANS = [
  { id: 1, name: 'Sita Devi', craft: 'Madhubani Painting', region: 'Mithila, Bihar', years: 38, awards: 'Padma Shri 2011', avatar: 'SD', image: 'https://images.unsplash.com/photo-1619468129361-605ebea04b44?w=800&h=600&fit=crop&auto=format', quote: 'Every line I draw carries the prayers and resilience of my grandmothers.' },
  { id: 2, name: 'Apindra Swain', craft: 'Pattachitra Scrolls', region: 'Raghurajpur, Odisha', years: 24, awards: 'State Award 2019', avatar: 'AS', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop&auto=format', quote: 'The cloth is my canvas, natural stones are my colors, and the story is timeless.' },
  { id: 3, name: 'Surjit Kaur', craft: 'Phulkari Embroidery', region: 'Patiala, Punjab', years: 31, awards: 'National Award 2016', avatar: 'SK', image: 'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=800&h=600&fit=crop&auto=format', quote: 'Flowers bloom on our dupattas with the same patience that wheat grows in our fields.' },
];

const REGIONS = [
  { name: 'Rajasthan', crafts: ['Block Printing', 'Blue Pottery', 'Leheriya'], color: '#C88732', count: 847 },
  { name: 'West Bengal', crafts: ['Kantha Stitch', 'Terracotta Bankura', 'Baluchari Silk'], color: '#A8462D', count: 612 },
  { name: 'Uttar Pradesh', crafts: ['Chikankari', 'Zardozi', 'Moradabad Brass'], color: '#273B59', count: 934 },
  { name: 'Odisha', crafts: ['Pattachitra', 'Pipili Appliqué', 'Dhokra Casting'], color: '#4A7A52', count: 428 },
  { name: 'Tamil Nadu', crafts: ['Tanjore Gold Leaf', 'Swamimalai Bronze', 'Kanjeevaram'], color: '#7A3220', count: 563 },
  { name: 'Gujarat', crafts: ['Bandhani', 'Patan Patola', 'Kutch Rogan Art'], color: '#3D567A', count: 721 },
];

const STATS = [
  { val: '12,400+', label: 'Artisans', sub: 'across India' },
  { val: '48', label: 'Craft Forms', sub: 'digitally preserved' },
  { val: '22', label: 'States', sub: 'direct clusters' },
  { val: '₹2.4 Cr', label: 'Earnings', sub: '100% direct UPI' },
];

// ── Decorative Cultural Elements ──────────────────────────────────────────────

function WaveOrnament() {
  return (
    <div className="flex items-center justify-center my-3">
      <svg width="64" height="14" viewBox="0 0 64 14" fill="none" aria-hidden="true">
        <path d="M0 7 Q8 0 16 7 Q24 14 32 7 Q40 0 48 7 Q56 14 64 7" stroke="#C88732" strokeWidth="1.5" fill="none" opacity="0.65" />
      </svg>
    </div>
  );
}

function DiamondRow() {
  return (
    <div className="flex items-center gap-3 my-4" aria-hidden="true">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#D9CEB8]" />
      <svg width="7" height="7" viewBox="0 0 7 7">
        <rect x="3.5" y="0" width="4.95" height="4.95" transform="rotate(45 3.5 3.5)" fill="#C88732" opacity="0.7" />
      </svg>
      <div className="h-px flex-1 bg-gradient-to-r from-[#D9CEB8] to-transparent" />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-semibold px-3 py-1 rounded-full mb-3 text-[#C88732] bg-[#C88732]/10 border border-[#C88732]/25 font-sans">
      ✦ {children}
    </span>
  );
}

function ArtisanAvatar({ initials }: { initials: string }) {
  const palette: Record<string, string> = {
    SD: '#A8462D',
    AS: '#273B59',
    SK: '#4A7A52',
    VR: '#C88732',
    JS: '#7A3220',
  };
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-[#FFFDF8] shrink-0"
      style={{ backgroundColor: palette[initials] ?? '#7A6E65' }}
    >
      {initials}
    </div>
  );
}

// ── Main Landing Page Component ───────────────────────────────────────────────

export function LandingPage() {
  const {
    language,
    setLanguage,
    isLanguageModalOpen,
    openLanguageModal,
    closeLanguageModal,
    initialModalStep,
  } = useLanguage();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const t = PORTAL_TRANSLATIONS[language];

  // Voice Assistant Hook
  const voice = useVoiceAssistant(language);

  // Active step in the 3-step tutorial
  const [instructionStep, setInstructionStep] = useState(0);

  // Modal State
  const [artisanModalOpen, setArtisanModalOpen] = useState(false);
  const [buyerModalOpen, setBuyerModalOpen] = useState(false);
  const [sellerModalOpen, setSellerModalOpen] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCraftTag, setSelectedCraftTag] = useState<string | null>(null);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Hero interactive photo toggle (Raw vs AI 4K Studio)
  const [showRawPhoto, setShowRawPhoto] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);

  // Section references for smooth navigation
  const tutorialRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const craftsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setHeroLoaded(true), 60);
    return () => clearTimeout(timer);
  }, []);

  // Auto-transition to artisan login when state & language are selected
  const handleLanguageSetupComplete = (stateName: string, stateCode: string, langCode: LanguageCode) => {
    closeLanguageModal();
    setTimeout(() => {
      setArtisanModalOpen(true);
    }, 400);
  };

  const handleSelectLanguage = (lang: LanguageCode) => {
    setLanguage(lang);
    if (voice.isPlaying) {
      voice.stop();
    }
  };

  const handleStartTutorial = () => {
    tutorialRef.current?.scrollIntoView({ behavior: 'smooth' });
    setInstructionStep(0);
    voice.speak(t.step1Speech, language, () => {
      setInstructionStep(1);
      voice.speak(t.step2Speech, language, () => {
        setInstructionStep(2);
        voice.speak(t.step3Speech, language, () => {
          handleFinishInstructions();
        });
      });
    });
  };

  const handleListenWelcome = () => {
    voice.speak(t.welcomeAudioSpeech, language);
  };

  const handleSpeakInstruction = (text: string, onEnd?: () => void) => {
    voice.speak(text, language, onEnd);
  };

  const handleFinishInstructions = () => {
    roleRef.current?.scrollIntoView({ behavior: 'smooth' });
    voice.speak(t.roleArtisanTitle + '. ' + t.roleArtisanDesc, language);
  };

  const filteredCrafts = CRAFTS.filter((craft) => {
    const matchesSearch =
      searchQuery === '' ||
      craft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      craft.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      craft.tag.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedCraftTag || craft.tag === selectedCraftTag;
    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-[#F7F2E8] text-[#29221D] font-sans pb-24 sm:pb-12 relative overflow-x-hidden">
      {/* 1. Portal Header */}
      <PortalHeader
        language={language}
        onSelectLanguage={handleSelectLanguage}
        onTriggerVoice={handleListenWelcome}
        isSpeaking={voice.isPlaying}
        onOpenBuyerSignIn={() => setBuyerModalOpen(true)}
        onOpenSellerSignIn={() => setSellerModalOpen(true)}
      />

      {/* 2. Floating Voice Controller */}
      <VoiceFloatingBar
        language={language}
        isPlaying={voice.isPlaying}
        isPaused={voice.isPaused}
        onPlay={voice.resume}
        onPause={voice.pause}
        onReplay={voice.replay}
        onStop={voice.stop}
        currentLabel={voice.currentText ? voice.currentText.slice(0, 48) + '...' : undefined}
      />

      {/* ================================================== */}
      {/* 1. CINEMATIC INDIAN HERITAGE HERO                  */}
      {/* ================================================== */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#29221D]">
        {/* Full-bleed cinematic photography background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1619468129361-605ebea04b44?w=1600&h=900&fit=crop&auto=format"
            alt="Indian artisan crafting traditional pottery"
            className="w-full h-full object-cover transition-transform duration-[12s] ease-out"
            style={{
              transform: heroLoaded ? 'scale(1.04)' : 'scale(1.1)',
              filter: 'sepia(24%) contrast(1.05)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#29221D]/95 via-[#29221D]/85 to-[#29221D]/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#29221D] via-transparent to-transparent" />
        </div>

        {/* Decorative Top Textile Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 textile-bar z-20" aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-16 pb-20 w-full z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Narrative Headline & Actions */}
            <div className="lg:col-span-7 text-left space-y-6">
              <div
                className={`transition-all duration-700 ${
                  heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: '100ms' }}
              >
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFDF8]/10 backdrop-blur-md border border-[#C88732]/40 text-[#C88732] text-xs font-semibold tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-[#C88732] animate-pulse" />
                  <span>{t.heroBadge}</span>
                </span>
              </div>

              {/* Large Display Heading in Playfair Display */}
              <h1
                className={`transition-all duration-700 text-3xl sm:text-5xl lg:text-[4rem] font-bold text-[#FFFDF8] tracking-tight leading-[1.12] font-['Playfair_Display',serif] ${
                  heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
                style={{ transitionDelay: '200ms' }}
              >
                India's Craft,<br />
                <span className="text-[#C88732] italic">Told by Those</span><br />
                Who Live It
              </h1>

              <div
                className={`transition-all duration-700 ${
                  heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: '300ms' }}
              >
                <div className="w-16 h-1 bg-[#C88732]/70 rounded-full" />
              </div>

              {/* Narrative Subtitle */}
              <p
                className={`transition-all duration-700 text-base sm:text-lg text-[#D9CEB8] font-normal leading-relaxed max-w-xl font-sans ${
                  heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: '380ms' }}
              >
                {t.heroSub}
              </p>

              {/* Primary Action Buttons */}
              <div
                className={`transition-all duration-700 flex flex-wrap items-center gap-3.5 pt-2 ${
                  heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: '460ms' }}
              >
                <button
                  onClick={() => setArtisanModalOpen(true)}
                  className="h-13 px-8 rounded-full font-bold text-sm sm:text-base text-[#FFFDF8] bg-[#A8462D] hover:bg-[#C5614A] shadow-[0_6px_24px_rgba(168,70,45,0.4)] transition-all duration-200 inline-flex items-center justify-center gap-2.5 active:scale-98 cursor-pointer group"
                >
                  <span>{t.primaryCta}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#FFFDF8]" />
                </button>

                <button
                  onClick={handleStartTutorial}
                  className="h-13 px-6 rounded-full font-semibold text-sm sm:text-base text-[#FFFDF8] bg-[#FFFDF8]/10 hover:bg-[#FFFDF8]/20 border border-[#FFFDF8]/30 transition-all duration-200 inline-flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Volume2 className="w-4 h-4 text-[#C88732] animate-pulse" />
                  <span>{t.voiceTourButton}</span>
                </button>

                <button
                  onClick={() => navigate('/buyer')}
                  className="h-13 px-6 rounded-full font-semibold text-sm text-[#D9CEB8] hover:text-[#FFFDF8] border border-[#D9CEB8]/30 hover:border-[#C88732] transition-all duration-200 inline-flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <ShoppingBag className="w-4 h-4 text-[#C88732]" />
                  <span>Browse Marketplace ↗</span>
                </button>
              </div>

              {/* Journey Pills & Fast-Track Judge Demo */}
              {/* Stats Row */}
              <div
                className={`transition-all duration-700 pt-8 border-t border-[#D9CEB8]/20 grid grid-cols-2 sm:grid-cols-4 gap-6 ${
                  heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: '580ms' }}
              >
                {STATS.map((s) => (
                  <div key={s.label} className="flex flex-col">
                    <span className="font-['Playfair_Display',serif] text-2xl sm:text-3xl font-bold text-[#FFFDF8] leading-none">
                      {s.val}
                    </span>
                    <span className="font-sans text-[11px] text-[#C88732] font-semibold uppercase tracking-wider mt-1">
                      {s.label}
                    </span>
                    <span className="font-sans text-[11px] text-[#BFB09A]">{s.sub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Museum-Grade Lacquer Craft Spotlight Card */}
            <div
              className={`lg:col-span-5 transition-all duration-700 ${
                heroLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              style={{ transitionDelay: '300ms' }}
            >
              <div className="bg-[#FFFDF8] p-5 sm:p-6 rounded-2xl border border-[#D9CEB8] shadow-2xl text-[#29221D] relative overflow-hidden">
                {/* Visual Craft Card Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-10 h-10 rounded-lg bg-[#A8462D]/15 text-[#A8462D] flex items-center justify-center font-bold text-base shrink-0">
                      🏺
                    </span>
                    <div>
                      <span className="text-xs font-bold text-[#29221D] block leading-tight font-['Playfair_Display',serif]">
                        Gorakhpur Terracotta Pot
                      </span>
                      <span className="text-[10px] text-[#7A6E65] font-mono">Living Heritage Cluster</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#4A7A52]/15 text-[#4A7A52] border border-[#4A7A52]/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                    GI Certified
                  </span>
                </div>

                {/* Craft Image Simulation with Interactive Before/After Toggle */}
                <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-[#E8DFC9] mb-4 border border-[#D9CEB8] group">
                  <img
                    src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80"
                    alt="Artisan Terracotta Craft"
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      showRawPhoto
                        ? 'brightness-75 contrast-90 saturate-50'
                        : 'brightness-105 contrast-105 saturate-105 group-hover:scale-104'
                    }`}
                  />

                  {/* 0% Commission Badge */}
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-[#FFFDF8]/90 backdrop-blur-md text-[#A8462D] border border-[#D9CEB8] text-[10px] font-bold shadow-xs">
                    0% Commission
                  </div>

                  {/* Interactive Raw vs Enhanced Switcher */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <div className="px-2.5 py-1 rounded-md bg-[#29221D]/80 backdrop-blur-md text-[#FFFDF8] text-[10px] font-semibold flex items-center gap-1.5 shadow-md">
                      <Sparkles className="w-3 h-3 text-[#C88732]" />
                      <span>{showRawPhoto ? 'Raw Workshop View' : 'AI Studio Enhanced (4K)'}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowRawPhoto(!showRawPhoto)}
                      className="px-2.5 py-1 rounded-md bg-[#A8462D] text-[#FFFDF8] text-[10px] font-semibold hover:bg-[#C5614A] active:scale-95 transition-all shadow-xs cursor-pointer"
                      title="Toggle between raw photo and AI studio enhancement"
                    >
                      {showRawPhoto ? 'Show 4K Studio ⚡' : 'Show Raw Photo ↺'}
                    </button>
                  </div>
                </div>

                {/* Fair-Price Metric Pill */}
                <div className="p-3.5 rounded-xl bg-[#F7F2E8] border border-[#D9CEB8] flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[10px] text-[#7A6E65] font-mono font-bold uppercase block tracking-wider">
                      Verified Fair Living Wage
                    </span>
                    <span className="text-base font-bold text-[#29221D]">
                      ₹1,250{' '}
                      <span className="text-[10px] font-mono font-bold text-[#4A7A52] ml-1">
                        ✓ Cost-Plus Floor
                      </span>
                    </span>
                  </div>
                  <button
                    onClick={handleListenWelcome}
                    className="h-8 px-3 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 bg-[#FFFDF8] border border-[#D9CEB8] text-[#A8462D] hover:bg-[#F7F2E8] transition-colors cursor-pointer shadow-xs active:scale-95"
                    title="Listen to welcome audio"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#A8462D]" />
                    <span className="font-mono">Listen</span>
                  </button>
                </div>

                <p className="text-[11px] text-[#7A6E65] text-center font-medium">
                  Direct artisan payout via instant UPI on every order. Zero middleman cuts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 2. SIX LIVING CRAFT TRADITIONS                     */}
      {/* ================================================== */}
      <section ref={craftsRef} className="py-20 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-fade-in-up">
          <SectionLabel>Living Craft Traditions</SectionLabel>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#29221D] font-['Playfair_Display',serif]">
            Centuries of Knowledge, Alive Today
          </h2>
          <WaveOrnament />
          <p className="text-sm sm:text-base text-[#7A6E65] max-w-xl mx-auto leading-relaxed">
            Each craft form carries deep cultural wisdom, passed down from generation to generation across India's traditional heartlands.
          </p>

          {/* Craft Filter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setSelectedCraftTag(null)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                selectedCraftTag === null
                  ? 'bg-[#A8462D] text-[#FFFDF8] shadow-xs'
                  : 'bg-[#FFFDF8] text-[#7A6E65] border border-[#D9CEB8] hover:bg-[#F7F2E8]'
              }`}
            >
              All Crafts ({CRAFTS.length})
            </button>
            {['Painting', 'Textile', 'Tribal Art', 'Embroidery'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedCraftTag(tag)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  selectedCraftTag === tag
                    ? 'bg-[#A8462D] text-[#FFFDF8] shadow-xs'
                    : 'bg-[#FFFDF8] text-[#7A6E65] border border-[#D9CEB8] hover:bg-[#F7F2E8]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 6 Crafts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrafts.map((craft) => (
            <div
              key={craft.id}
              className="group overflow-hidden rounded-xl bg-[#FFFDF8] border border-[#D9CEB8] hover:border-[#A8462D]/50 hover:shadow-[0_16px_40px_rgba(41,34,29,0.08)] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="overflow-hidden aspect-4/3 bg-[#E8DFC9]">
                  <img
                    src={craft.image}
                    alt={`${craft.name} craft from ${craft.region}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{ filter: 'sepia(8%) contrast(1.04)' }}
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-[#273B59]/10 text-[#273B59] border border-[#273B59]/20">
                      {craft.tag}
                    </span>
                    <span className="text-xs text-[#7A6E65]">{craft.region}</span>
                  </div>
                  <h3 className="font-['Playfair_Display',serif] text-xl font-bold text-[#29221D] mt-2 mb-1.5">
                    {craft.name}
                  </h3>
                  <p className="text-xs text-[#7A6E65] line-clamp-2 leading-relaxed">
                    {craft.desc}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between border-t border-[#D9CEB8]/50 mt-4">
                <div className="flex items-center gap-2">
                  <ArtisanAvatar initials={craft.artisan.split(' ').map((n) => n[0]).join('')} />
                  <span className="text-xs font-semibold text-[#29221D]">{craft.artisan}</span>
                </div>
                <button
                  onClick={() => navigate('/buyer')}
                  className="text-xs font-bold text-[#A8462D] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================== */}
      {/* 3. TRANSPARENT 5-STEP CRAFT JOURNEY                */}
      {/* ================================================== */}
      <section
        ref={tutorialRef}
        id="tutorial-section"
        className="py-16 sm:py-20 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto"
      >
        <div className="text-center mb-10 animate-fade-in-up">
          <SectionLabel>Transparent Process</SectionLabel>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#29221D] mb-2 font-['Playfair_Display',serif]">
            {t.instructionSectionTitle}
          </h2>
          <WaveOrnament />
          <p className="text-sm sm:text-base text-[#7A6E65] font-normal max-w-xl mx-auto leading-relaxed">
            {t.instructionSectionSub}
          </p>
        </div>

        {/* 5-Step Interactive Diagram */}
        <CraftJourneyDiagram language={language} />
      </section>

      {/* ================================================== */}
      {/* 4. MASTER ARTISANS SPOTLIGHT                       */}
      {/* ================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-10 bg-[#FFFDF8] border-y border-[#D9CEB8]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <SectionLabel>The People Behind the Craft</SectionLabel>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#29221D] font-['Playfair_Display',serif]">
              Master Artisans of India
            </h2>
            <WaveOrnament />
            <p className="text-sm sm:text-base text-[#7A6E65] max-w-xl mx-auto leading-relaxed">
              Every artisan on Artisans is recognized for their craft lineage, regional awards, and ethical production methods.
            </p>
          </div>

          <div className="space-y-16 lg:space-y-20">
            {ARTISANS.map((artisan, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={artisan.id}
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center ${
                    isEven ? '' : 'lg:flex-row-reverse'
                  }`}
                >
                  {/* Image Column */}
                  <div className={`lg:col-span-6 ${isEven ? '' : 'lg:order-2'}`}>
                    <div className="relative rounded-2xl overflow-hidden border border-[#D9CEB8] shadow-md aspect-4/3 bg-[#E8DFC9]">
                      <img
                        src={artisan.image}
                        alt={`${artisan.name} — ${artisan.craft}`}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-104"
                        style={{ filter: 'sepia(12%) contrast(1.05)' }}
                      />
                      <div className="absolute bottom-4 left-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#A8462D] text-[#FFFDF8] shadow-sm">
                          {artisan.awards}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Text Column */}
                  <div className={`lg:col-span-6 ${isEven ? '' : 'lg:order-1'} space-y-4`}>
                    <span className="text-xs font-bold text-[#A8462D] uppercase tracking-wider">
                      {artisan.craft} • {artisan.region}
                    </span>
                    <h3 className="text-2xl sm:text-4xl font-bold text-[#29221D] font-['Playfair_Display',serif]">
                      {artisan.name}
                    </h3>
                    <blockquote className="font-['Playfair_Display',serif] text-lg sm:text-xl italic text-[#29221D] leading-relaxed border-l-3 border-[#C88732] pl-4 my-4">
                      "{artisan.quote}"
                    </blockquote>
                    <div className="flex flex-wrap gap-6 py-2">
                      <div>
                        <div className="font-['Playfair_Display',serif] text-2xl font-bold text-[#A8462D]">
                          {artisan.years} <span className="text-sm font-normal text-[#C88732]">yrs</span>
                        </div>
                        <div className="text-xs text-[#7A6E65] uppercase tracking-wider">Of Craft Practice</div>
                      </div>
                      <div>
                        <div className="font-['Playfair_Display',serif] text-2xl font-bold text-[#A8462D]">
                          200+ <span className="text-sm font-normal text-[#C88732]">pieces</span>
                        </div>
                        <div className="text-xs text-[#7A6E65] uppercase tracking-wider">Delivered Globally</div>
                      </div>
                      <div>
                        <div className="font-['Playfair_Display',serif] text-2xl font-bold text-[#A8462D]">
                          4.9 <span className="text-sm font-normal text-[#C88732]">★</span>
                        </div>
                        <div className="text-xs text-[#7A6E65] uppercase tracking-wider">Buyer Trust Rating</div>
                      </div>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={() => setArtisanModalOpen(true)}
                        className="h-11 px-6 rounded-full text-xs font-semibold bg-[#A8462D] hover:bg-[#C5614A] text-[#FFFDF8] inline-flex items-center gap-2 cursor-pointer shadow-xs"
                      >
                        <span>Connect with {artisan.name}</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 5. CRAFT REGIONS ACROSS INDIA                      */}
      {/* ================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-fade-in-up">
          <SectionLabel>Across the Subcontinent</SectionLabel>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#29221D] font-['Playfair_Display',serif]">
            Craft Regions of India
          </h2>
          <WaveOrnament />
          <p className="text-sm sm:text-base text-[#7A6E65] max-w-xl mx-auto leading-relaxed">
            Every corner of India holds a distinct artisanal language shaped by local clay, water, minerals, and ancient looms.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {REGIONS.map((region) => (
            <div
              key={region.name}
              className="p-5 rounded-xl bg-[#FFFDF8] border border-[#D9CEB8] transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer group"
              style={{ borderLeft: `4px solid ${region.color}` }}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-['Playfair_Display',serif] text-lg font-bold text-[#29221D]">
                  {region.name}
                </h3>
                <span
                  className="text-xs font-semibold px-2.5 py-0.5 rounded-full text-[#FFFDF8]"
                  style={{ backgroundColor: region.color }}
                >
                  {region.count} Artisans
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {region.crafts.map((craft) => (
                  <span
                    key={craft}
                    className="text-[11px] px-2.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${region.color}12`,
                      color: region.color,
                      border: `1px solid ${region.color}25`,
                    }}
                  >
                    {craft}
                  </span>
                ))}
              </div>
              <div
                className="mt-4 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                style={{ color: region.color }}
              >
                <span>View {region.name} Cluster</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================== */}
      {/* 6. CRAFT SEARCH & DISCOVERY BAR                    */}
      {/* ================================================== */}
      <section className="py-12 px-4 sm:px-6 max-w-3xl mx-auto text-center">
        <SectionLabel>Discover Craft Heritage</SectionLabel>
        <h2 className="text-xl sm:text-3xl font-bold text-[#29221D] font-['Playfair_Display',serif] mb-2">
          Find a Craft or Master Artisan
        </h2>
        <WaveOrnament />
        <div className="relative mt-6">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#7A6E65]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Madhubani, Terracotta, Bihar, Weaving..."
            className="w-full pl-12 pr-28 py-3.5 rounded-full text-sm outline-none transition-all bg-[#FFFDF8] border border-[#D9CEB8] text-[#29221D] focus:border-[#A8462D] focus:ring-2 focus:ring-[#A8462D]/20 shadow-xs"
          />
          <button
            onClick={() => craftsRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-full text-xs font-semibold bg-[#A8462D] text-[#FFFDF8] hover:bg-[#C5614A] transition-colors cursor-pointer"
          >
            Search
          </button>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {['Weaving', 'Pottery', 'Metalwork', 'Embroidery', 'Painting', 'Woodwork'].map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setSearchQuery(tag);
                craftsRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs px-3 py-1 rounded-full bg-[#FFFDF8] text-[#7A6E65] border border-[#D9CEB8] hover:border-[#A8462D] hover:text-[#A8462D] transition-colors cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* ================================================== */}
      {/* 7. DEDICATED ARTISAN ONBOARDING GATEWAY            */}
      {/* ================================================== */}
      <section
        ref={roleRef}
        id="role-section"
        className="py-16 sm:py-20 px-4 sm:px-6 bg-[#FFFDF8] border-t border-[#D9CEB8]"
      >
        <RoleSelector
          language={language}
          onSelectArtisan={() => setArtisanModalOpen(true)}
          onSpeak={handleSpeakInstruction}
          isSpeaking={voice.isPlaying}
        />
      </section>

      {/* ================================================== */}
      {/* 8. ETHICAL COMMITMENT & TRUST ASSURANCE            */}
      {/* ================================================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-[#FFFDF8] rounded-2xl p-6 sm:p-8 border border-[#D9CEB8] shadow-sm text-center animate-fade-in-up">
          <div className="flex items-center justify-center gap-2 mb-3">
            <ShieldCheck className="w-6 h-6 text-[#A8462D]" />
            <h3 className="text-lg sm:text-2xl font-bold text-[#29221D] font-['Playfair_Display',serif]">
              {t.ethicalCommitmentTitle}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#7A6E65] leading-relaxed max-w-2xl mx-auto mb-6 font-normal">
            {t.ethicalCommitmentDesc}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono font-semibold">
            <span className="h-8 inline-flex items-center px-3.5 bg-[#F7F2E8] border border-[#D9CEB8] text-[#A8462D] rounded-full shadow-xs">
              ✓ 0% Platform Commission on Craft Sales
            </span>
            <span className="h-8 inline-flex items-center px-3.5 bg-[#F7F2E8] border border-[#D9CEB8] text-[#4A7A52] rounded-full shadow-xs">
              ✓ 100% Direct Jan Dhan UPI Settlement
            </span>
            <span className="h-8 inline-flex items-center px-3.5 bg-[#F7F2E8] border border-[#D9CEB8] text-[#273B59] rounded-full shadow-xs">
              ✓ 12 Regional Indian Languages Supported
            </span>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 9. NEWSLETTER / STORIES FROM THE LOOM & THE CLAY   */}
      {/* ================================================== */}
      <section className="bg-[#29221D] text-[#FFFDF8] py-16 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 textile-bar" aria-hidden="true" />
        <div className="max-w-2xl mx-auto text-center relative z-10 space-y-4">
          <SectionLabel>Stay Connected</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-bold font-['Playfair_Display',serif]">
            Stories from the <span className="text-[#C88732] italic">Loom & the Clay</span>
          </h2>
          <WaveOrnament />
          <p className="text-xs sm:text-sm text-[#D9CEB8] max-w-md mx-auto leading-relaxed">
            Monthly dispatches from India's craft clusters — artisan portraits, living traditions, and new collections.
          </p>

          {!newsletterSubscribed ? (
            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 rounded-full text-xs outline-none bg-[#FFFDF8]/10 border border-[#FFFDF8]/25 text-[#FFFDF8] focus:border-[#C88732]"
              />
              <button
                onClick={() => {
                  if (newsletterEmail) setNewsletterSubscribed(true);
                }}
                className="px-6 py-3 rounded-full text-xs font-semibold bg-[#A8462D] text-[#FFFDF8] hover:bg-[#C5614A] transition-colors cursor-pointer"
              >
                Subscribe
              </button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4A7A52]/20 border border-[#4A7A52]/40 text-[#4A7A52] text-xs font-semibold">
              <span>✓</span>
              <span className="text-[#FFFDF8]">You're subscribed — thank you!</span>
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 textile-bar" aria-hidden="true" />
      </section>

      {/* ================================================== */}
      {/* 10. HERITAGE FOOTER                                */}
      {/* ================================================== */}
      <footer className="bg-[#1C1714] text-[#BFB09A] py-14 px-4 sm:px-6 lg:px-10 border-t border-[#3D3530]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                  <path d="M14 2L17 10.5H26L19 15.5L21.5 24L14 19L6.5 24L9 15.5L2 10.5H11L14 2Z" fill="#A8462D" />
                </svg>
                <span className="font-['Playfair_Display',serif] font-bold text-lg text-[#FFFDF8]">
                  ShilpSetu
                </span>
                <span className="text-[#C88732] text-xs font-semibold">शिल्पसेतु</span>
              </div>
              <p className="text-xs text-[#7A6E65] leading-relaxed mb-3">
                Preserving India's living craft heritage through dignified technology and storytelling.
              </p>
              <p className="font-['Playfair_Display',serif] text-xs italic text-[#C88732]">
                "Every craft tells a story."
              </p>
            </div>

            {/* Links 1 */}
            <div>
              <h4 className="text-xs font-bold text-[#FFFDF8] uppercase tracking-wider mb-3">
                Platform
              </h4>
              <ul className="space-y-2 text-xs text-[#7A6E65]">
                <li><button onClick={() => craftsRef.current?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[#FFFDF8] cursor-pointer">Discover Crafts</button></li>
                <li><button onClick={() => setArtisanModalOpen(true)} className="hover:text-[#FFFDF8] cursor-pointer">Meet Artisans</button></li>
                <li><button onClick={() => navigate('/buyer')} className="hover:text-[#FFFDF8] cursor-pointer">Buyer Market</button></li>
                <li><button onClick={handleStartTutorial} className="hover:text-[#FFFDF8] cursor-pointer">Voice Tutorial</button></li>
              </ul>
            </div>

            {/* Links 2 */}
            <div>
              <h4 className="text-xs font-bold text-[#FFFDF8] uppercase tracking-wider mb-3">
                Artisans
              </h4>
              <ul className="space-y-2 text-xs text-[#7A6E65]">
                <li><button onClick={() => setArtisanModalOpen(true)} className="hover:text-[#FFFDF8] cursor-pointer">Join as Artisan</button></li>
                <li><button onClick={() => setSellerModalOpen(true)} className="hover:text-[#FFFDF8] cursor-pointer">Seller Dashboard</button></li>
                <li><button onClick={() => openLanguageModal('language')} className="hover:text-[#FFFDF8] cursor-pointer">Regional Dialects</button></li>
              </ul>
            </div>

            {/* Attribution */}
            <div>
              <h4 className="text-xs font-bold text-[#FFFDF8] uppercase tracking-wider mb-3">
                Initiative
              </h4>
              <p className="text-xs text-[#7A6E65] leading-relaxed mb-2">
                Smart India Hackathon • Built with reverence for India's 7 million traditional craftspersons.
              </p>
              <span className="inline-block px-2.5 py-1 rounded-full bg-[#A8462D]/20 text-[#A8462D] text-[10px] font-bold">
                SIH 2026 Edition
              </span>
            </div>
          </div>

          <DiamondRow />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-[11px] text-[#7A6E65]">
            <p>© 2026 ShilpSetu (Artisans) • Smart India Hackathon • All Rights Reserved</p>
            <div className="flex items-center gap-4">
              <span className="hover:text-[#BFB09A] cursor-pointer">Privacy Policy</span>
              <span>•</span>
              <span className="hover:text-[#BFB09A] cursor-pointer">Terms of Service</span>
              <span>•</span>
              <span className="hover:text-[#BFB09A] cursor-pointer">Accessibility</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ================================================== */}
      {/* MOBILE STICKY BOTTOM ACTION BAR                    */}
      {/* ================================================== */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#FFFDF8]/95 backdrop-blur-xl border-t border-[#D9CEB8] px-4 py-2.5 sm:hidden flex items-center justify-between gap-2.5 shadow-2xl">
        <button
          onClick={handleListenWelcome}
          className="h-11 px-4 rounded-full bg-[#F7F2E8] border border-[#D9CEB8] text-[#A8462D] font-mono font-bold text-xs inline-flex items-center gap-2 shrink-0 active:scale-95"
        >
          <Volume2 className="w-4 h-4 text-[#A8462D]" />
          <span>{t.voiceListen}</span>
        </button>

        <button
          onClick={() => setArtisanModalOpen(true)}
          className="h-11 flex-1 px-4 rounded-full font-bold text-sm text-[#FFFDF8] bg-[#A8462D] hover:bg-[#C5614A] shadow-sm inline-flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
        >
          <span>{t.primaryCta} →</span>
        </button>
      </div>

      {/* ================================================== */}
      {/* MODALS PRESERVED WITH FULL FUNCTIONALITY           */}
      {/* ================================================== */}
      {isLanguageModalOpen && (
        <LocationLanguageModal
          isOpen={isLanguageModalOpen}
          initialMode={initialModalStep === 'language' ? 'language-only' : 'auto'}
          onClose={closeLanguageModal}
          onComplete={handleLanguageSetupComplete}
        />
      )}

      {artisanModalOpen && (
        <ArtisanOnboardingModal
          language={language}
          isOpen={artisanModalOpen}
          onClose={() => setArtisanModalOpen(false)}
          onSpeak={handleSpeakInstruction}
        />
      )}

      {buyerModalOpen && (
        <BuyerAuthModal
          isOpen={buyerModalOpen}
          onClose={() => setBuyerModalOpen(false)}
          defaultTab="signin"
        />
      )}

      {sellerModalOpen && (
        <SellerAuthModal
          isOpen={sellerModalOpen}
          onClose={() => setSellerModalOpen(false)}
          defaultTab="signin"
        />
      )}
    </div>
  );
}
