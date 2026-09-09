# KALAtech System Architecture & Technical Blueprint

> **Smart India Hackathon (SIH) Technical Specification**  
> **Application:** KALAtech (कलाTech) — Multimodal AI Virtual Business Manager for Indian Artisans  
> **Repository:** `artsians-SIH`

---

## 1. Architectural Overview

KALAtech employs a decoupled, mobile-first full-stack architecture tailored for rural and low-literacy artisans operating on low-bandwidth Android smartphones.

```
┌────────────────────────────────────────────────────────────────────────┐
│               CLIENT TIER: Mobile-First Progressive Web App            │
│  • React 19 + TypeScript 5.8 + Tailwind CSS v4                        │
│  • MediaDevices API: getUserMedia Viewfinder + MediaRecorder Audio      │
│  • Web Speech Synthesis API: Multilingual Regional Voice Playback     │
│  • Low-Literacy Icon-First UX: 7 Primary Action Tiles                  │
│  • PWA Manifest (manifest.json) & Offline Service Worker (sw.js)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST (JSON)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   BACKEND TIER: Express & AI Engines                   │
│  • Express 4.21 REST Server (server.ts)                                │
│  • Sharp 0.35 Native Image Processing Engine (1080p, Matting, Variants) │
│  • Gemini 3.8 Flash Multimodal AI (Audio STT, Vision, Regional Trans)  │
│  • Persistent File-Backed Data Layer (data_store.json)                │
└───────────────────┬───────────────────────────────┬────────────────────┘
                    │                               │
                    ▼                               ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│       AI & MULTIMODAL PIPELINE       │  │     B2B & INSTITUTIONAL      │
│ • Gemini 3.8 Flash Vision Complexity │  │ • GeM Catalog API v3.2 Stub  │
│ • Gemini Audio Multilingual STT      │  │ • ONDC Beckn Protocol 1.2.0  │
│ • 12 Regional Language Translation   │  │ • TRIFED Tribal Roster Sync  │
│ • Anti-Hallucination Guardrail Check │  │ • B2B RFQ Quotation Engine   │
└──────────────────────────────────────┘  └──────────────────────────────┘
```

---

## 2. Component Directory Structure

```
artsians-SIH/
├── server/
│   ├── db.ts               # Persistent database layer (users, products, orders, rfqs)
│   ├── gemini.ts           # Gemini 3.8 Flash multimodal integration (Vision, STT, Pricing)
│   ├── imageProcessor.ts   # Sharp 0.35 engine (1080p 1:1, 9:16 portrait, thumbnails)
│   └── marketData.ts       # Market comparator abstraction
├── src/
│   ├── components/
│   │   ├── common/         # CameraCaptureModal, AudioVoiceNoteRecorder, GovtMarketplaceModal
│   │   ├── portal/         # Low-literacy landing, role selector, voice floating bar
│   │   ├── seller/         # Artisan dashboard, handicraft cataloging, billing, orders
│   │   ├── buyer/          # Marketplace browse, wholesale RFQ, direct checkout
│   │   └── ProductCreationWizard.tsx # 5-step multimodal wizard (Capture -> Enhance -> Catalog -> Price -> Publish)
│   ├── lib/                # i18n dictionary (12 languages), voice assistants, auth
│   └── types.ts            # Normalized schema interfaces
├── public/
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Service Worker offline asset cache
└── data_store.json         # Persistent JSON database (auto-seeded & backed up)
```

---

## 3. End-to-End Data Flows

### 3.1 AI Image Studio Pipeline
1. Artisan activates hardware viewfinder (`CameraCaptureModal.tsx`) using `navigator.mediaDevices.getUserMedia`.
2. Image frame is captured to high-resolution PNG blob.
3. Backend receives image at `POST /api/v1/products/:id/enhance`.
4. `Sharp` performs auto-orientation, histogram stretching, lighting normalization, and framing onto 1080×1080 square canvas.
5. Variants generated: 1:1 E-Commerce standard, 9:16 portrait social story, and 300×300 thumbnail.

### 3.2 Regional Voice Note Cataloging
1. Artisan taps microphone; `MediaRecorder` captures audio buffer in WebM/Opus.
2. Raw base64 audio is sent to `POST /api/v1/audio/transcribe`.
3. `gemini-3.8-flash` identifies dialect, generates vernacular transcript, and extracts craft keywords.
4. Extracted keywords feed directly into `POST /api/v1/products/:id/generate-catalog`.
5. AI outputs are flagged with verification states: `AI Generated`, `Needs Review`, `Verified by Artisan`.

### 3.3 Hybrid Dynamic Pricing Engine
1. Costs aggregated: Raw materials + (Labor hours × Living wage rate) + Packaging + Transport.
2. Minimum Living Wage Floor is enforced:
   $$\text{Fair Wage Floor} = (\text{Material} + \text{Packaging} + \text{Labor Cost}) \times 1.25$$
3. Gemini Vision assesses visual craft complexity ($1 - 10$) and quality tier.
4. Active market benchmarks (Amazon Karigar, Etsy India, GeM) calibrate competitive targets.
5. System renders plain-language *"Why This Price?"* explanation to the artisan.
