import {
  inspectCraftImage,
  extractVoiceCorrection,
  extractProductDetailsFromVoice,
  preprocessCraftImage,
  validateCraftAttributes,
  CraftAttributes,
  CRAFT_KNOWLEDGE_BASE,
  LANGUAGE_LOCALES,
  LANGUAGE_NAMES,
} from '../server/services/craftInspection.service.js';
import { getCraftAttributeLabels } from '../src/lib/craftAttributeLabels.js';
import { LanguageCode } from '../src/types.js';
import sharp from 'sharp';

console.log('========================================================================');
console.log('AI DETECTED CRAFT ATTRIBUTES & MULTILINGUAL VOICE VERIFICATION SUITE');
console.log('========================================================================\n');

const ALL_LANGUAGES: LanguageCode[] = [
  'en', 'hi', 'te', 'ta', 'kn', 'ml', 'mr', 'gu', 'bn', 'or', 'pa', 'as'
];

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

async function createSampleCraftImageBase64(width = 400, height = 400, r = 180, g = 60, b = 40): Promise<string> {
  const buf = await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r, g, b }
    }
  }).jpeg().toBuffer();

  return `data:image/jpeg;base64,${buf.toString('base64')}`;
}

async function runTestSuite() {
  const sampleImage = await createSampleCraftImageBase64(600, 600, 156, 65, 36);

  // -------------------------------------------------------------------------
  // TEST SUITE 1: Image Preprocessing via Sharp
  // -------------------------------------------------------------------------
  console.log('TEST SUITE 1: Image Preprocessing & Format Standardization');
  const preprocessed = await preprocessCraftImage(sampleImage);
  assert(!!preprocessed.buffer, 'Image buffer generated successfully');
  assert(preprocessed.mimeType === 'image/jpeg', 'MIME type normalized to image/jpeg');
  assert(preprocessed.width <= 1400 && preprocessed.height <= 1400, `Dimensions bounded: ${preprocessed.width}x${preprocessed.height}`);
  assert(preprocessed.sizeBytes > 0, `Image buffer size valid: ${preprocessed.sizeBytes} bytes`);

  // -------------------------------------------------------------------------
  // TEST SUITE 2: Schema Validation & Anti-Hallucination Guardrails
  // -------------------------------------------------------------------------
  console.log('\nTEST SUITE 2: Schema Validation & Anti-Hallucination Guardrails');
  const mockRaw = {
    craftName: 'Pochampally Ikat',
    craftCategory: 'Weaving',
    material: 'Pure Mulberry Silk',
    technique: 'Double Ikat Weaving',
    motif: 'Geometric Diamond',
    colors: ['Crimson', 'Mustard'],
    region: 'Likely Telangana',
    description: 'Traditional resist-dyed handloom silk saree.',
    culturalContext: 'Centuries-old heritage weaving.',
    visualFeatures: ['Feathered ikat edges', 'Symmetric rhombus'],
    confidence: 0.88,
    uncertainAttributes: ['exact village']
  };

  const validated = validateCraftAttributes(mockRaw);
  assert(validated.craftName === 'Pochampally Ikat', 'Valid craft name preserved');
  assert(validated.confidence >= 0 && validated.confidence <= 1, `Confidence score within [0, 1]: ${validated.confidence}`);
  assert(validated.confidence <= 0.98, 'Confidence capped below 100% (anti-hallucination rule)');
  assert(Array.isArray(validated.uncertainAttributes), 'Uncertain attributes is an array');

  // -------------------------------------------------------------------------
  // TEST SUITE 3: Multi-Craft Category Vision Inspection (All 10 Heritage Crafts)
  // -------------------------------------------------------------------------
  console.log('\nTEST SUITE 3: Multi-Craft Category Vision Inspection (All 10 Heritage Crafts)');
  const testCrafts = [
    { name: 'Pochampally Ikat Handloom Saree', cat: 'Weaving', region: 'Telangana', kw: 'pochampally' },
    { name: 'Machilipatnam Kalamkari Textile', cat: 'Textile Art', region: 'Andhra Pradesh', kw: 'kalamkari' },
    { name: 'Channapatna Wooden Toys & Dolls', cat: 'Woodcraft', region: 'Karnataka', kw: 'channapatna' },
    { name: 'Bastar Dhokra Bell Metal', cat: 'Metalcraft', region: 'Chhattisgarh', kw: 'dhokra' },
    { name: 'Jaipur Blue Pottery / Terracotta', cat: 'Pottery', region: 'Rajasthan', kw: 'blue pottery' },
    { name: 'Lucknowi Chikankari Embroidery', cat: 'Embroidery', region: 'Uttar Pradesh', kw: 'chikankari' },
    { name: 'Assam Handwoven Bamboo Basket', cat: 'Cane & Bamboo', region: 'Assam', kw: 'bamboo' },
    { name: 'Mithila Madhubani Folk Art', cat: 'Folk Painting', region: 'Bihar', kw: 'madhubani' },
    { name: 'Kathputli Traditional Doll', cat: 'Traditional Dolls', region: 'Rajasthan', kw: 'kathputli' },
    { name: 'Cuttack Tarakasi Silver Jewelry', cat: 'Handmade Jewelry', region: 'Odisha', kw: 'filigree' },
  ];

  for (const craft of testCrafts) {
    const result = await inspectCraftImage(sampleImage, 'en', craft.kw, craft.region);
    assert(result.success === true, `Inspection returned success for ${craft.name}`);
    assert(!!result.canonicalAttributes.craftName, `Canonical craftName populated for ${craft.name}: "${result.canonicalAttributes.craftName}"`);
    assert(!!result.canonicalAttributes.material, `Material identified for ${craft.name}: "${result.canonicalAttributes.material}"`);
    assert(!!result.canonicalAttributes.technique, `Technique identified for ${craft.name}: "${result.canonicalAttributes.technique}"`);
    assert(result.canonicalAttributes.colors.length > 0, `Colors identified for ${craft.name}`);
    assert(result.confidence > 0.7, `Confidence score reasonable for ${craft.name}: ${result.confidence}`);
  }

  // -------------------------------------------------------------------------
  // TEST SUITE 4: Multilingual Support Across All 12 Indian Languages
  // -------------------------------------------------------------------------
  console.log('\nTEST SUITE 4: Multilingual Verification Across All 12 Indian Languages');
  for (const lang of ALL_LANGUAGES) {
    const res = await inspectCraftImage(sampleImage, lang, 'Pochampally Ikat', 'Telangana');
    assert(res.language === lang, `Language matches requested code '${lang}'`);
    assert(res.locale === LANGUAGE_LOCALES[lang], `Locale matches standard BCP-47 tag '${LANGUAGE_LOCALES[lang]}'`);
    assert(!!res.canonicalAttributes.craftName, `Canonical attribute preserved in English for '${lang}'`);
    assert(!!res.localizedAttributes.craftName, `Localized craft name returned for '${lang}': "${res.localizedAttributes.craftName}"`);

    // Verify UI Labels for this language
    const labels = getCraftAttributeLabels(lang);
    assert(!!labels.craftDetailsHeading && labels.craftDetailsHeading.length > 0, `Header label exists for '${lang}'`);
    assert(!!labels.askConfirmationSpeech && labels.askConfirmationSpeech.length > 0, `Voice prompt exists for '${lang}'`);
    assert(!!labels.confirmDetailsBtn && labels.confirmDetailsBtn.length > 0, `Confirm button text exists for '${lang}'`);
    assert(!!labels.material && labels.material.length > 0, `Material label exists for '${lang}'`);
  }

  // -------------------------------------------------------------------------
  // TEST SUITE 5: Natural Spoken Voice Corrections & State Transitions
  // -------------------------------------------------------------------------
  console.log('\nTEST SUITE 5: Natural Spoken Voice Corrections & State Transitions');
  const currentAttributes = testCrafts[0] as any;

  // 5a. Affirmative confirmation ("Yes")
  const yesCorrection = await extractVoiceCorrection('Yes, these details are correct', 'en', currentAttributes);
  assert(yesCorrection.success === true && yesCorrection.canonicalValue === 'CONFIRMED', 'English "Yes" triggers CONFIRMED state');

  const teluguYes = await extractVoiceCorrection('అవును వివరాలు సరిగ్గా ఉన్నాయి', 'te', currentAttributes);
  assert(teluguYes.success === true && teluguYes.canonicalValue === 'CONFIRMED', 'Telugu "అవును" triggers CONFIRMED state');

  const hindiYes = await extractVoiceCorrection('हाँ विवरण सही हैं', 'hi', currentAttributes);
  assert(hindiYes.success === true && hindiYes.canonicalValue === 'CONFIRMED', 'Hindi "हाँ" triggers CONFIRMED state');

  // 5b. Negative objection ("No" -> AWAITING_FIELD)
  const noCorrection = await extractVoiceCorrection('No, this is wrong', 'en', currentAttributes);
  assert(noCorrection.canonicalValue === 'AWAITING_FIELD', 'English "No" triggers AWAITING_FIELD state');

  const teluguNo = await extractVoiceCorrection('కాదు ఇది తప్పు', 'te', currentAttributes);
  assert(teluguNo.canonicalValue === 'AWAITING_FIELD', 'Telugu "కాదు" triggers AWAITING_FIELD state');

  const hindiNo = await extractVoiceCorrection('नहीं यह गलत है', 'hi', currentAttributes);
  assert(hindiNo.canonicalValue === 'AWAITING_FIELD', 'Hindi "नहीं" triggers AWAITING_FIELD state');

  // 5c. Target field trigger ("The material" -> AWAITING_VALUE)
  const fieldTriggerEn = await extractVoiceCorrection('The material', 'en', currentAttributes);
  assert(fieldTriggerEn.canonicalValue === 'AWAITING_VALUE' && fieldTriggerEn.field === 'material', 'English "The material" triggers AWAITING_VALUE for material');

  const fieldTriggerTe = await extractVoiceCorrection('మెటీరియల్', 'te', currentAttributes);
  assert(fieldTriggerTe.canonicalValue === 'AWAITING_VALUE' && fieldTriggerTe.field === 'material', 'Telugu "మెటీరియల్" triggers AWAITING_VALUE for material');

  // 5d. Spoken field value corrections
  const silkCorrection = await extractVoiceCorrection('The material is silk', 'en', currentAttributes);
  assert(silkCorrection.success === true && silkCorrection.field === 'material', 'Extracted field "material" from "The material is silk"');
  assert(String(silkCorrection.canonicalValue).includes('Silk'), `Canonical value contains Silk: "${silkCorrection.canonicalValue}"`);

  const teluguMaterial = await extractVoiceCorrection('ఇది పట్టుతో చేసినది', 'te', currentAttributes);
  assert(teluguMaterial.success === true && teluguMaterial.field === 'material', 'Extracted field "material" from Telugu "పట్టు"');

  const hindiMaterial = await extractVoiceCorrection('यह शुद्ध रेशम की है', 'hi', currentAttributes);
  assert(hindiMaterial.success === true && hindiMaterial.field === 'material', 'Extracted field "material" from Hindi "रेशम"');

  const craftNameCorrection = await extractVoiceCorrection('The craft is not Kalamkari it is Pochampally Ikat', 'en', currentAttributes);
  assert(craftNameCorrection.success === true && craftNameCorrection.field === 'craftName', 'Extracted field "craftName" from natural speech');

  // -------------------------------------------------------------------------
  // TEST SUITE 6: Voice Assistant Auto-Entering Craft Product Details
  // -------------------------------------------------------------------------
  console.log('\nTEST SUITE 6: Voice Assistant Auto-Entering Craft Product Details');

  // 6a. Telugu multi-attribute voice extraction
  const teluguExtraction = await extractProductDetailsFromVoice(
    'ధర 2500 రూపాయలు, ఖర్చు 1100, స్వచ్ఛమైన పట్టు, కొలతలు 5.5 మీటర్లు',
    'te'
  );
  assert(teluguExtraction.success === true, 'Telugu voice auto-fill returned success');
  assert(teluguExtraction.attributes.suggestedPrice === 2500, `Extracted Telugu price ₹2500 (got ${teluguExtraction.attributes.suggestedPrice})`);
  assert(teluguExtraction.attributes.materialCost === 1100, `Extracted Telugu cost ₹1100 (got ${teluguExtraction.attributes.materialCost})`);
  assert(String(teluguExtraction.attributes.material).includes('పట్టు'), `Extracted Telugu material: ${teluguExtraction.attributes.material}`);
  assert(String(teluguExtraction.attributes.dimensions).includes('5.5'), `Extracted Telugu dimensions: ${teluguExtraction.attributes.dimensions}`);
  assert(teluguExtraction.fieldsUpdated.length >= 3, `Updated ${teluguExtraction.fieldsUpdated.length} fields from Telugu speech`);

  // 6b. Hindi multi-attribute voice extraction
  const hindiExtraction = await extractProductDetailsFromVoice(
    'कीमत 2400 रुपये, लागत 1000, शुद्ध रेशम, माप 5.5 मीटर',
    'hi'
  );
  assert(hindiExtraction.success === true, 'Hindi voice auto-fill returned success');
  assert(hindiExtraction.attributes.suggestedPrice === 2400, `Extracted Hindi price ₹2400 (got ${hindiExtraction.attributes.suggestedPrice})`);
  assert(hindiExtraction.attributes.materialCost === 1000, `Extracted Hindi cost ₹1000 (got ${hindiExtraction.attributes.materialCost})`);
  assert(String(hindiExtraction.attributes.material).includes('रेशम'), `Extracted Hindi material: ${hindiExtraction.attributes.material}`);
  assert(String(hindiExtraction.attributes.dimensions).includes('5.5'), `Extracted Hindi dimensions: ${hindiExtraction.attributes.dimensions}`);

  // 6c. English multi-attribute voice extraction
  const englishExtraction = await extractProductDetailsFromVoice(
    'Price 2800, cost 1200, pure mulberry silk, dimensions 5.5 meters, title Pochampally Saree',
    'en'
  );
  assert(englishExtraction.success === true, 'English voice auto-fill returned success');
  assert(englishExtraction.attributes.suggestedPrice === 2800, `Extracted English price ₹2800 (got ${englishExtraction.attributes.suggestedPrice})`);
  assert(englishExtraction.attributes.materialCost === 1200, `Extracted English cost ₹1200 (got ${englishExtraction.attributes.materialCost})`);
  assert(String(englishExtraction.attributes.material).includes('Silk'), `Extracted English material: ${englishExtraction.attributes.material}`);
  assert(String(englishExtraction.attributes.dimensions).includes('5.5'), `Extracted English dimensions: ${englishExtraction.attributes.dimensions}`);
  assert(String(englishExtraction.attributes.title).includes('Saree'), `Extracted English title: ${englishExtraction.attributes.title}`);

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log(`ALL VERIFICATION SUITES FINISHED: ${passedTests}/${totalTests} PASSED`);
  console.log('========================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test suite uncaught error:', err);
  process.exit(1);
});
