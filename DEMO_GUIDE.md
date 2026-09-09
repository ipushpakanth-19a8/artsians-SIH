# Smart India Hackathon (SIH) Evaluator Demo Guide

This guide allows an evaluator or judge to test the entire KALAtech system end-to-end in **under 5 minutes**.

---

## Pre-Requisites
1. Open the application at `http://localhost:5000` (or the deployed instance).
2. The evaluator will land on the **KALAtech Welcome Portal** with trilingual voice navigation.

---

## 5-Minute Evaluator Demonstration Script

```
[Landing Page] ──> [AI Studio Mode] ──> [Hardware Camera / Preset] ──> [Sharp 1080p Studio]
      │
      ▼
[Regional Voice Note STT] ──> [Gemini Multimodal Catalog] ──> [Hybrid Dynamic Pricing]
      │
      ▼
[B2B RFQ / GeM Export] ──> [Provenance Hangtag Print] ──> [Buyer Marketplace Order]
```

### Step 1: Low-Literacy Landing & Audio Welcome (30 Seconds)
1. Listen to the welcome prompt by tapping the **Audio Waveform** or **"Listen"** button in Hindi, Telugu, or English.
2. Observe the trilingual speech synthesis and icon-first UX designed for low-literacy rural artisans.
3. Tap **"Artisan / Seller Portal"** or tap the floating **"SIH Tour"** button for a guided walkthrough.

### Step 2: Photograph & Real AI Image Studio (60 Seconds)
1. On the Artisan Studio screen, click **"Add Product"**.
2. Click **"Instant Test (Bastar Dhokra)"** or use **"Point & Capture"** (`getUserMedia` live camera).
3. In **Step 2 (Image Studio)**:
   - Toggle between **"Raw"** and **"Enhanced"** to inspect the real difference.
   - Observe **Sharp** color correction, contrast levels boost, and standard **1:1 1080×1080px framing**.
   - Test the **Artisan Studio Controls**: switch backdrop to *Warm Terracotta* or *Clean Slate*, adjust Brightness slider, and inspect the *9:16 Social Story* & *Thumbnail* output variants.
4. Click **"Extract Smart Catalog →"**.

### Step 3: Multilingual Voice Notes & Auto-Cataloging (60 Seconds)
1. In **Step 3 (Smart Catalog)**, click the **Microphone** icon.
2. Speak a sentence in Hindi, Telugu, or English (or test sample regional audio).
3. Observe **Gemini 3.8 Flash** extracting:
   - Product title and authentic folklore narrative.
   - Craft technique (*Lost-wax hollow bell metal casting*).
   - GI Verification status (*Needs artisan confirmation* anti-hallucination tag).
   - B2B MOQ and monthly production capacity.
4. Tap **"Verify as Artisan ✓"** to confirm validation.
5. Click **"Smart Pricing →"**.

### Step 4: Hybrid Dynamic Pricing & Multi-Market Comps (60 Seconds)
1. In **Step 4 (Smart Pricing)**:
   - View the calculated **Fair Cost** vs **Minimum Living Wage Floor**.
   - Inspect the **Assessed Quality Tier** and **Craft Complexity Score (1-10)** derived from Gemini Vision.
   - Compare with active listings from **Amazon Karigar, Etsy India, and GeM**.
   - Read the plain-language **"Why This Price?"** explanation showing exact labor share vs material costs.
   - Observe the **Suggested Retail** vs **Suggested B2B / Wholesale** rate split.
2. Click **"Accept Suggested Price"** and click **"Proceed to Buyer Matching →"**.

### Step 5: B2B Marketplace, GeM Gateway & Provenance Hangtag (60 Seconds)
1. Review matched B2B buyer channels (e.g., *Tribal Cooperative Marketing Development Federation - TRIFED*).
2. Click **"Publish Product"**.
3. On the completion screen:
   - Click **"Print Stall Provenance Tag"**: inspect the print-ready hangtag with dynamic QR code and "Seen at Exhibition" provenance.
   - Click **"Government & Institutional Marketplace"**: inspect real integration payloads for **GeM Catalog v3.2** (HSN, Udyam compliance) and **ONDC Beckn Protocol 1.2.0**.
4. In the buyer marketplace, open the newly published product and test the **"Submit B2B Bulk RFQ Quotation Request"** button.

---

## Feature Reality Matrix (Evaluator Transparency Guarantee)

| Capability | Implementation Engine | Reality Status | UI Proof |
|---|---|---|---|
| **Image Enhancement** | Node `Sharp 0.35` (1080p, levels, matting, multi-variants) | **REAL** | Toggle Raw vs Enhanced & check processed pixel dimensions |
| **Camera Viewfinder** | HTML5 `getUserMedia` hardware stream | **REAL** | Live camera viewfinder modal with lens switcher |
| **Voice Note STT** | HTML5 `MediaRecorder` + `gemini-3.8-flash` multimodal audio | **REAL** | Transcribes regional dialects & extracts craft keywords |
| **Catalog Storytelling** | `gemini-3.8-flash` vision & cultural text generation | **REAL** | Inspect motifs, technique & 12-language translations |
| **Dynamic Pricing** | Hybrid cost model + Vision complexity + active comps | **REAL** | "Why this price?" breakdown & live marketplace list |
| **Data Persistence** | File-backed JSON database (`data_store.json`) | **REAL** | All products & orders persist across server reboots |
| **GeM / ONDC B2B** | Documented schema integration stub & Beckn payloads | **SANDBOX** | Live payload inspection modal with compliance IDs |
