# KALAtech Multimodal AI Pipeline & Anti-Hallucination Guardrails

---

## 1. Overview of Multimodal Architecture

KALAtech employs **Gemini 3.8 Flash** multimodal inputs (Vision + Audio + Text) combined with deterministic Node.js processing engines (`Sharp`) to automate cataloging, price defense, and multilingual market linkage.

```
       ┌─────────────────────┐       ┌──────────────────────┐
       │   Raw Craft Photo   │       │ Regional Voice Note  │
       └──────────┬──────────┘       └──────────┬───────────┘
                  │                             │
                  ▼                             ▼
       ┌─────────────────────┐       ┌──────────────────────┐
       │ Sharp 0.35 Engine   │       │ MediaRecorder Audio  │
       │ (Auto WB, 1080p,    │       │ (WebM/Opus / Base64) │
       │  Matting, Variants) │       └──────────┬───────────┘
       └──────────┬──────────┘                  │
                  │                             │
                  ▼                             ▼
       ┌────────────────────────────────────────────────────┐
       │           Gemini 3.8 Flash Multimodal API          │
       │  • Vision Motif & Technique Extraction             │
       │  • Audio Vernacular Speech-to-Text                 │
       │  • Craft Complexity Scoring (1-10)                 │
       │  • Trilingual & Regional Dialect Translation       │
       └────────────────────────┬───────────────────────────┘
                                │
                                ▼
       ┌────────────────────────────────────────────────────┐
       │             Anti-Hallucination Guardrails          │
       │  • Strict GI Tag Verification Enforcement          │
       │  • Non-Negotiable Living-Wage Floor Guardrail      │
       │  • Explicit "Needs Artisan Confirmation" Flags     │
       └────────────────────────────────────────────────────┘
```

---

## 2. Anti-Hallucination Protocols

To protect master craft traditions and ensure that e-commerce descriptions remain truthful and compliant with Indian Geographical Indication laws, the following constraints are programmatically enforced:

### 2.1 GI Tag Certification Safeguard
- The AI is strictly prohibited from claiming a product is "GI Certified" unless confirmed by the artisan's registration certificate.
- Unverified items are classified as `Needs artisan confirmation` or `Potential GI Cluster`.

### 2.2 Material & Authenticity Boundaries
- When inspecting images, if weave density or fabric purity cannot be confirmed with $>90\%$ confidence, the system flags the attribute for artisan review.

### 2.3 Non-Negotiable Living-Wage Floor
- AI recommendations can never underprice an artisan's labor. The minimum price floor is calculated deterministically via:
  $$\text{Floor} = (\text{Direct Materials} + \text{Packaging} + [\text{Labor Hours} \times \text{Fair Living Hourly Rate}]) \times 1.25$$

---

## 3. Supported Vernacular Languages

The speech-to-text and translation pipeline supports **12 Indian regional scripts**:
1. Hindi (`hi`)
2. Telugu (`te`)
3. Tamil (`ta`)
4. Kannada (`kn`)
5. Marathi (`mr`)
6. Bengali (`bn`)
7. Gujarati (`gu`)
8. Punjabi (`pa`)
9. Odia (`or`)
10. Malayalam (`ml`)
11. Assamese (`as`)
12. Indian English (`en`)
