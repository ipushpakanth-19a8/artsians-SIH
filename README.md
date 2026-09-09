# KALAtech — Artisan Market Linkage & Smart Cataloging

[![SIH Hackathon](https://img.shields.io/badge/SIH-Smart_India_Hackathon_2024-orange.svg)](https://sih.gov.in)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8.svg)](https://tailwindcss.com)

**KALAtech** is a mobile-first, multimodal AI-powered platform designed for marginalized Indian craftspeople, handloom weavers, and micro-entrepreneurs. It replaces predatory middlemen by giving artisans a personal **Virtual Business Manager** on their smartphone.

---

## 📑 Table of Contents (Sequential Order)
1. [The Problem We Solve](#1-the-problem-we-solve)
2. [Sequential 5-Step System Architecture](#2-sequential-5-step-system-architecture)
3. [Sequential Codebase Directory Map](#3-sequential-codebase-directory-map)
4. [Dual-Portal Architecture & Ports](#4-dual-portal-architecture--ports)
5. [Quick Start & Setup Instructions](#5-quick-start--setup-instructions)
6. [Step-by-Step Demonstration Guide](#6-step-by-step-demonstration-guide)
7. [Genuine AI vs. Rule-Based Fallback Matrix](#7-genuine-ai-vs-rule-based-fallback-matrix)
8. [Documentation Library](#8-documentation-library)

---

## 1. The Problem We Solve

| Traditional Problem Faced by Artisans | KALAtech Technological Solution |
|---|---|
| **Low Digital Literacy & Typing Friction** | Hardware camera capture (`getUserMedia`) and regional voice recording (`MediaRecorder` in Telugu, Hindi, English). |
| **Poor Smartphone Product Photography** | Node `Sharp` server engine auto-crops to e-commerce 1:1 (1080×1080 px), balances white levels, and creates studio lighting. |
| **Weak Cataloging & Language Barriers** | Multimodal Gemini AI transforms photos and voice notes into professional multi-language e-commerce descriptions with GI tags. |
| **Middlemen Exploitation & Unfair Pricing** | Transparent cost-plus formula calculates material + labor hours to guarantee living-wage profits. |
| **Limited Continuous Market Access** | Direct B2C marketplace, WhatsApp/phone buyer direct-connect, plus 1-click export to GeM and ONDC. |

---

## 2. Sequential 5-Step System Architecture

The entire KALAtech workflow proceeds through 5 sequential steps:

```
[ 1. Capture ] ──> [ 2. Enhance ] ──> [ 3. Catalog ] ──> [ 4. Price ] ──> [ 5. Distribute ]
Hardware Camera     Sharp 1080p Engine   Gemini Vision       Cost-Plus Formula   Buyer Marketplace
Regional Voice      Studio Lighting      Multilingual Story  Living-Wage Margin  GeM / ONDC / WhatsApp
```

### Step 1: Low-Literacy Multimodal Capture
- **Hardware Camera**: Live camera viewfinder (`src/components/common/CameraCaptureModal.tsx`) captures raw craft photos directly on mobile devices.
- **Regional Voice Notes**: Integrated voice recorder (`src/components/common/AudioVoiceNoteRecorder.tsx`) records craft stories in Telugu, Hindi, or English.

### Step 2: Studio Quality Image Enhancement
- **Sharp Processing Pipeline** (`server/imageProcessor.ts`):
  - Normalizes colors and white balance.
  - Crops and squares to standard 1:1 (1080×1080 px).
  - Enhances contrast and detail sharpness.
  - Generates 4 production variants: Square 1:1, Story 9:16, Thumbnail 300×300, and Studio Background.

### Step 3: AI Catalog & Cultural Provenance Generation
- **Multimodal AI Engine** (`server/gemini.ts`):
  - Ingests the craft photograph and audio transcript.
  - Extracts craft technique, traditional motifs, care instructions, and dimensions.
  - Generates buyer-friendly product descriptions and cultural storytelling.
  - Identifies Geographical Indication (GI) heritage claims.

### Step 4: Cost-Plus Fair Pricing & Living Wage Reasoning
- **Fair Pricing Model** (`server/gemini.ts` + `src/lib/marketPriceService.ts`):
  - Formula: `(Material Cost + (Labor Hours × Skill Hourly Rate) + Packaging/Transport) ÷ (1 - Target Margin)`
  - Recommends fair retail and B2B wholesale prices.
  - Compares against typical middleman payouts to show the artisan their exact profit increase.

### Step 5: Multi-Channel Distribution & Order Fulfillment
- **B2C Buyer Marketplace** (`src/components/buyer/`): Direct buyer browsing, cart checkout, and direct phone/WhatsApp contact.
- **B2B & Government Linkage** (`src/components/common/GovernmentMarketplaceModal.tsx`): 1-click JSON catalog export formatted for Government e-Marketplace (GeM) and ONDC.
- **Offline Billing** (`src/components/seller/CreateBill.tsx`): Generates printable, auditable bills for exhibitions and rural fairs.

---

## 3. Sequential Codebase Directory Map

```
artsians-SIH/
├── server.ts                       # Unified Express server & Vite integration
├── data_store.json                 # Persistent disk-backed JSON database
│
├── server/                         # Backend Services & AI Engines
│   ├── db.ts                       # Database models, audit trails, and seed data
│   ├── gemini.ts                   # Gemini 2.5 multimodal catalog & pricing engine
│   └── imageProcessor.ts           # Node Sharp image optimization & studio engine
│
├── src/                            # Frontend Application (React 19 + TypeScript)
│   ├── main.tsx                    # React client entry with RootErrorBoundary
│   ├── App.tsx                     # Main router (Landing, Seller, Buyer portals)
│   ├── types.ts                    # TypeScript schemas (Product, Order, Pricing)
│   │
│   ├── admin/                      # Dedicated Admin Governance Website (Port 5174)
│   │   ├── adminMain.tsx           # Admin mounting entry
│   │   ├── AdminApp.tsx            # Admin governance layout & views
│   │   └── AdminAuthContext.tsx    # Admin authentication & role management
│   │
│   ├── components/
│   │   ├── LandingPage.tsx         # Multilingual onboarding and feature portal
│   │   │
│   │   ├── common/                 # Reusable Multimodal & Resilience Components
│   │   │   ├── CameraCaptureModal.tsx        # getUserMedia hardware camera
│   │   │   ├── AudioVoiceNoteRecorder.tsx    # MediaRecorder regional voice notes
│   │   │   ├── GovernmentMarketplaceModal.tsx# GeM & ONDC export integration
│   │   │   └── RootErrorBoundary.tsx         # Client error recovery screen
│   │   │
│   │   ├── portal/                 # Landing Page Modular Sections
│   │   │   ├── PortalHeader.tsx              # Multilingual switcher & branding
│   │   │   ├── VoiceFloatingBar.tsx          # Floating audio player bar
│   │   │   ├── CraftJourneyDiagram.tsx       # Visual 4-step craft journey
│   │   │   ├── InstructionWizard.tsx         # 3-step voice-guided tutorial
│   │   │   ├── AIProcessingDemo.tsx          # Interactive live AI simulation
│   │   │   └── RoleSelector.tsx              # Artisan vs. Buyer selector
│   │   │
│   │   ├── seller/                 # Artisan Virtual Business Studio
│   │   │   ├── SellerDashboard.tsx           # Voice-prompted 7 primary action cards
│   │   │   ├── AddHandicraft.tsx             # Studio wizard with camera/audio
│   │   │   ├── HandicraftManagement.tsx      # Inventory, variants & GeM export
│   │   │   ├── MarketPriceAnalysis.tsx       # Live price positioning vs comps
│   │   │   ├── CreateBill.tsx                # Fair bill generator & printer
│   │   │   ├── SellerOrders.tsx              # Order management & tracking
│   │   │   └── CustomerCarePage.tsx          # Multilingual AI support assistant
│   │   │
│   │   └── buyer/                  # Ethical Handicraft Marketplace
│   │       ├── BuyerLayout.tsx               # Marketplace navigation & cart
│   │       ├── BuyerHome.tsx                 # Verified artisan showcases
│   │       ├── ProductBrowse.tsx             # Filtering by craft, state, GI tag
│   │       ├── ProductPage.tsx               # Storytelling, artisan card, B2B RFQ
│   │       ├── Cart.tsx                      # Transparent breakdown & checkout
│   │       └── BuyerOrders.tsx               # Shipment tracking & provenance cert
│   │
│   └── lib/                        # State, I18n & Voice Hooks
│       ├── AuthContext.tsx         # Seller/Buyer session state
│       ├── LanguageContext.tsx     # English / Hindi / Telugu language state
│       ├── portalI18n.ts           # Trilingual strings & voice scripts
│       └── useVoiceAssistant.ts    # Web Speech API voice synthesis hook
│
└── public/                         # Public Static Assets & PWA
    ├── manifest.json               # PWA mobile web app manifest
    └── sw.js                       # Offline-first Service Worker
```

---

## 4. Dual-Portal Architecture & Ports

KALAtech runs **two completely decoupled applications** connected to the same unified backend and persistent database:

| Application | Port | Target Audience | Purpose |
|---|---|---|---|
| **KALAtech Main Portal** | `http://localhost:3000` | Artisans & Buyers | Mobile-first craft studio, catalog generator, voice assistant, and buyer marketplace. |
| **KALAtech Admin Governance** | `http://localhost:5174` | Government / Evaluators | Oversight portal for product moderation, seller verification, live pricing benchmarks, and AI audit governance. |

---

## 5. Quick Start & Setup Instructions

### Prerequisites
- **Node.js**: v18.0.0 or later installed
- **Terminal**: PowerShell (Windows) or Bash (macOS/Linux)

### Step 1: Clone or Navigate to the Workspace
```powershell
cd c:\Users\pushp\OneDrive\Desktop\artsians-SIH
```

### Step 2: Install Dependencies
```powershell
npm install
```

### Step 3: Run the Development Server
```powershell
npm run dev
```

### Step 4: Open in Browser
- Open **[http://localhost:3000](http://localhost:3000)** for the Artisan & Buyer Portal.
- Open **[http://localhost:5174](http://localhost:5174)** for the Admin Governance Portal.

---

## 6. Step-by-Step Demonstration Guide

For an evaluator, judge, or demo audience, walk through the system in this sequential order:

1. **Landing & Voice Onboarding** (`http://localhost:3000`):
   - Switch language between **English**, **हिंदी**, and **తెలుగు**.
   - Click the **Listen** audio button to hear the regional voice guidance.
2. **Launch Artisan Studio** (`http://localhost:3000/seller`):
   - Review the low-literacy icon-first action cards with audio assistance.
3. **Capture & Enhance Craft Product** (`http://localhost:3000/seller/add`):
   - Open camera capture or upload a craft photo.
   - Run AI image enhancement to observe Sharp auto white-balance, 1080p square crop, and studio lighting.
4. **Generate AI Catalog & Fair Pricing**:
   - Record a voice note or provide basic details.
   - View the generated storytelling description, GI verification, and cost-plus price recommendation.
5. **Publish & Export to GeM / ONDC**:
   - Save the product to the live inventory.
   - Click **Export for GeM/ONDC** to inspect the government-compliant JSON metadata payload.
6. **Buyer Experience & Authenticity Tracing** (`http://localhost:3000/buyer`):
   - Browse products with direct artisan pricing (no middleman retail markups).
   - View an item to inspect the cultural provenance and direct artisan contact buttons.
7. **Admin Platform Oversight** (`http://localhost:5174`):
   - Inspect pending product approvals, manage market price benchmarks, and view live order fulfillment logs.

---

## 7. Genuine AI vs. Rule-Based Fallback Matrix

KALAtech guarantees that every feature functions cleanly both **online with live AI** and **offline/fallback mode**:

| Feature Area | Live AI Engine (Primary) | Deterministic Fallback (Offline / Low Bandwidth) |
|---|---|---|
| **Image Enhancement** | Node `Sharp` with studio lighting synthesis, contrast curves, and 1080p 1:1 cropping | Chroma/white-point thresholding and standardized SVG canvas compositing |
| **Catalog Storytelling** | Google Gemini 2.5 Flash Multimodal Vision | Categorical Indian craft ontology heuristics (Weaving, Pottery, Woodwork, Metalcraft) |
| **Pricing Reasoning** | Gemini AI cost reasoning + market benchmark comparisons | Direct formula: `(Materials + Labor + Overhead) ÷ (1 - Margin)` |
| **Voice Interaction** | Regional Web Speech API synthesis & SpeechRecognition | Native HTML5 audio triggers and pre-rendered bilingual scripts |

---

## 8. Documentation Library

For deeper technical deep dives, consult the dedicated guides:
- 🏗️ **[ARCHITECTURE.md](ARCHITECTURE.md)** — Architectural design, ER diagrams, and security model.
- 🤖 **[AI_PIPELINE.md](AI_PIPELINE.md)** — Full technical breakdown of Gemini, Sharp, and pricing algorithms.
- 🔌 **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** — Comprehensive REST API endpoint reference.
- 🎯 **[DEMO_GUIDE.md](DEMO_GUIDE.md)** — 8-minute scripted evaluation walkthrough.
- 📖 **[HOW_IT_WORKS.md](HOW_IT_WORKS.md)** — Plain-language user manuals for artisans and buyers.
