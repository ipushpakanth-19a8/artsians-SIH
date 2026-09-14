# KALAtech REST API Specification

All endpoints are hosted on the unified single-port Express server (`http://localhost:5000` or production deployment host).

---

## 1. Authentication & Users

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | Login with email/phone & password | `{ login, password }` | `{ success, user, token }` |
| `POST` | `/api/auth/signup` | Register new seller or buyer | `{ name, phone, password, role }` | `{ success, user }` |
| `GET` | `/api/auth/me` | Fetch active authenticated session | Header `Authorization: Bearer <token>` | User object |

---

## 2. Multimodal AI & Image Studio

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| `POST` | `/api/v1/products/:id/enhance` | Enhance craft photo with Sharp | `{ backgroundStyle, brightness, contrast, rotation }` | `{ enhanced_url, original_url, variants, model_used, metrics }` |
| `POST` | `/api/v1/image/enhance` | Standalone image processing pipeline | `{ image, backgroundStyle }` | Multi-variant processed images |
| `POST` | `/api/v1/audio/transcribe` | Regional voice note STT with Gemini | `{ audio_data, mime_type, language_hint }` | `{ transcript, detected_language, keywords, modelUsed }` |
| `POST` | `/api/v1/products/:id/generate-catalog` | Multimodal craft metadata extraction | `{ category_hint, region }` | Full catalog record with GI status & technique |
| `POST` | `/api/v1/products/:id/translate` | Vernacular cultural translation | `{ target_language }` | Vernacular title, narrative & cultural search tags |

---

## 3. Dynamic Fair-Wage Pricing & Voice Explanation

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| `POST` | `/api/v1/pricing/calculate` | Deterministic backend fair price calculation & multilingual voice explanation | `{ productName, craftType, material, materialCost, laborHours, fairHourlyWage, otherCost, quantity, language }` | `{ recommendedFairPrice, artisanApprovedPrice, breakdown: { materialCost, laborHours, fairHourlyWage, laborValue, baseCost, marginAmount, recommendedFairPrice, totalRecommendedFairPrice, quantity }, explanation: { en, hi, te }, pricingFormulaVersion, calculatedAt }` |
| `POST` | `/api/v1/ai/pricing-recommendation` | Alias for backend fair price calculation | Same as `/api/v1/pricing/calculate` | Same as `/api/v1/pricing/calculate` |
| `POST` | `/api/v1/ai/voice-extract-details` | Parse speech transcript to extract craft type, material, material cost, labor hours | `{ transcript, language }` | `{ productType, material, materialCost, laborHours, hourlyWage, confidenceScore }` |
| `POST` | `/api/v1/products/:id/price-recommendation` | Product-specific fair price calculation with living-wage floor | `{ material_cost, labor_hours, hourly_rate, other_cost }` | `{ product_id, fair_pricing, suggested_min, suggested_max, target_recommended, cost_breakdown, why_this_price, market_comparables }` |
| `POST` | `/api/v1/market-prices/compare` | Query multi-market comp dataset | `{ category, proposed_price }` | Comparable averages across Amazon, Etsy & GeM |
| `PATCH` | `/api/v1/products/:id/price` | Artisan reviews & approves selling price (preserves both recommended & approved price) | `{ final_price, materialCost, laborHours, fairHourlyWage, laborValue, baseCost, marginAmount, recommendedFairPrice, artisanApprovedPrice }` | Updated product record with preserved dual-price model |

---

## 4. B2B & Government Marketplace Gateways

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| `POST` | `/api/v1/products/:id/enquiries` | Submit B2B bulk purchase enquiry / RFQ | `{ buyer_name, buyer_contact, quantity, message }` | Enquiry record with ID |
| `POST` | `/api/v1/integrations/gem/push` | Dispatch listing to Government e-Marketplace | `{ product_id, udyam_number, hsn_code, min_order_qty }` | Compliant GeM Bid record |
| `POST` | `/api/v1/integrations/ondc/publish` | Broadcast to ONDC Beckn Network | `{ product_id, bpp_id }` | Beckn Retail 1.2.0 JSON payload |
| `GET` | `/api/v1/products/:id/export-listing` | Export structured schema (GeM & ONDC) | None | Standardized export formats |
| `GET` | `/api/v1/integrations/contracts` | Export OpenAPI & Beckn protocol schemas | None | Protocol schemas for evaluators |

---

## 5. Physical Exhibition Provenance & Orders

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| `POST` | `/api/v1/products/:id/seen-at-exhibition` | Tag craft with exhibition provenance | `{ event_name, stall_number, city, year }` | Attached exhibition metadata |
| `POST` | `/api/v1/products/:id/exhibition-scan` | Log QR scan from physical stall | None | Updated scan counter |
| `POST` | `/api/v1/orders/checkout` | Lock direct artisan order checkout | `{ product_id, quantity, buyer_name }` | Razorpay test order ID & amount |
| `POST` | `/api/v1/orders/verify` | Finalize payment & transfer 100% to artisan | `{ product_id, quantity, payment_method }` | Confirmed order invoice |
