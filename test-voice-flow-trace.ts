import {
  parseConfirmationResponse,
  parseQuantityTranscript,
  parseColorsTranscript,
  cleanVoiceAnswer,
  generateAutoDescription,
} from './src/lib/voiceParsingService';
import { getSpeechLocale, getRecognitionLocale } from './src/config/languages';
import { LanguageCode } from './src/types';

interface TestResult {
  suite: string;
  test: string;
  status: 'PASS' | 'FAIL';
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, suite: string, test: string, details?: string) {
  if (condition) {
    results.push({ suite, test, status: 'PASS', details });
  } else {
    results.push({ suite, test, status: 'FAIL', details });
    console.error(`❌ FAIL: [${suite}] ${test} - ${details || ''}`);
  }
}

console.log('=== STARTING COMPLETE VOICE SYSTEM VERIFICATION TRACE ===\n');

// ----------------------------------------------------------------------------
// 1. VOICE SUPPORT & LOCALES (Section 2, 13)
// ----------------------------------------------------------------------------
const testLangs: LanguageCode[] = ['en', 'hi', 'te'];
for (const lang of testLangs) {
  const speechLoc = getSpeechLocale(lang);
  const recLoc = getRecognitionLocale(lang);
  assert(Boolean(speechLoc), 'LOCALES', `${lang} speech locale defined`, speechLoc);
  assert(Boolean(recLoc), 'LOCALES', `${lang} recognition locale defined`, recLoc);
  assert(speechLoc.includes('-IN'), 'LOCALES', `${lang} speech locale is Indian regional (-IN)`, speechLoc);
}

// ----------------------------------------------------------------------------
// 2. HANDICRAFT NAME (Section 4)
// ----------------------------------------------------------------------------
const nameEn = cleanVoiceAnswer('Handwoven saree', 'handicraftName');
assert(nameEn === 'Handwoven saree', 'HANDICRAFT NAME', 'English name extraction', nameEn);

const nameTe = cleanVoiceAnswer('పట్టు చీర', 'handicraftName');
assert(nameTe === 'పట్టు చీర', 'HANDICRAFT NAME', 'Telugu name extraction', nameTe);

const nameHi = cleanVoiceAnswer('हाथ से बनी साड़ी', 'handicraftName');
assert(nameHi === 'हाथ से बनी साड़ी', 'HANDICRAFT NAME', 'Hindi name extraction', nameHi);

// Name with conversational prefix
const namePrefixEn = cleanVoiceAnswer('The name is Pochampally Ikat Silk Saree', 'handicraftName');
assert(namePrefixEn === 'Pochampally Ikat Silk Saree', 'HANDICRAFT NAME', 'Clean conversational prefix', namePrefixEn);

// ----------------------------------------------------------------------------
// 3. HANDICRAFT TYPE (Section 5)
// ----------------------------------------------------------------------------
const typeEn = cleanVoiceAnswer('Handloom textile', 'handicraftType');
assert(typeEn === 'Handloom textile', 'HANDICRAFT TYPE', 'English type extraction', typeEn);

const typeTe = cleanVoiceAnswer('చేనేత వస్త్రం', 'handicraftType');
assert(typeTe === 'చేనేత వస్త్రం', 'HANDICRAFT TYPE', 'Telugu type extraction', typeTe);

const typeHi = cleanVoiceAnswer('हथकरघा वस्त्र', 'handicraftType');
assert(typeHi === 'हथकरघा वस्त्र', 'HANDICRAFT TYPE', 'Hindi type extraction', typeHi);

// ----------------------------------------------------------------------------
// 4. COLOR (Section 6)
// ----------------------------------------------------------------------------
const colorEn = parseColorsTranscript('Red and golden');
assert(colorEn.includes('Red') && colorEn.includes('Golden'), 'COLOR', 'Red and golden parsed to array', JSON.stringify(colorEn));

const colorTe = parseColorsTranscript('ఎరుపు మరియు బంగారు');
assert(colorTe.length >= 1, 'COLOR', 'Telugu colors parsed', JSON.stringify(colorTe));

const colorHi = parseColorsTranscript('लाल और सुनहरा');
assert(colorHi.length >= 1, 'COLOR', 'Hindi colors parsed', JSON.stringify(colorHi));

// ----------------------------------------------------------------------------
// 5. ADDRESS (Section 7)
// ----------------------------------------------------------------------------
const addressVoice = cleanVoiceAnswer('Pochampally, Yadadri Bhuvanagiri, Telangana, India', 'location');
assert(addressVoice.includes('Telangana'), 'ADDRESS', 'Voice address clean extraction', addressVoice);

// ----------------------------------------------------------------------------
// 6. QUANTITY (Section 8)
// ----------------------------------------------------------------------------
assert(parseQuantityTranscript('5') === 5, 'QUANTITY', 'Direct digit 5', '5 -> 5');
assert(parseQuantityTranscript('ten') === 10, 'QUANTITY', 'Word: ten', 'ten -> 10');
assert(parseQuantityTranscript('twenty') === 20, 'QUANTITY', 'Word: twenty', 'twenty -> 20');
assert(parseQuantityTranscript('twenty five') === 25, 'QUANTITY', 'Compound word: twenty five', 'twenty five -> 25');
assert(parseQuantityTranscript('twenty-five') === 25, 'QUANTITY', 'Hyphenated: twenty-five', 'twenty-five -> 25');
assert(parseQuantityTranscript('one hundred') === 100, 'QUANTITY', 'Phrase: one hundred', 'one hundred -> 100');
assert(parseQuantityTranscript('I have 25 pieces') === 25, 'QUANTITY', 'Conversational: I have 25 pieces', '25');

// Invalid speech check
assert(parseQuantityTranscript("I don't know") === null, 'QUANTITY', 'Invalid speech returns null for retry prompt');
assert(parseQuantityTranscript("maybe later") === null, 'QUANTITY', 'Vague response returns null for retry prompt');

// ----------------------------------------------------------------------------
// 7. CONFIRMATION RESPONSES (YES/NO) (Section 9, 13)
// ----------------------------------------------------------------------------
assert(parseConfirmationResponse('yes', 'en') === 'yes', 'CONFIRMATION', 'English yes');
assert(parseConfirmationResponse('no', 'en') === 'no', 'CONFIRMATION', 'English no');
assert(parseConfirmationResponse('correct', 'en') === 'yes', 'CONFIRMATION', 'English correct');
assert(parseConfirmationResponse('हाँ', 'hi') === 'yes', 'CONFIRMATION', 'Hindi haan');
assert(parseConfirmationResponse('नहीं', 'hi') === 'no', 'CONFIRMATION', 'Hindi nahi');
assert(parseConfirmationResponse('సరే', 'te') === 'yes', 'CONFIRMATION', 'Telugu sare');
assert(parseConfirmationResponse('కాదు', 'te') === 'no', 'CONFIRMATION', 'Telugu kaadu');
assert(parseConfirmationResponse('అవును', 'te') === 'yes', 'CONFIRMATION', 'Telugu avunu');

// ----------------------------------------------------------------------------
// 8. CORRECTION FLOW (Section 9)
// ----------------------------------------------------------------------------
let currentProduct = {
  name: 'Handwoven saree',
  type: 'Handloom textile',
  color: 'Red and golden',
  address: 'Pochampally, Telangana, India',
  quantity: 25,
  description: '',
};

// User says "No" to name
const confirmName = parseConfirmationResponse('No', 'en');
assert(confirmName === 'no', 'CORRECTION FLOW', 'User says No to name');

// System asks for correction, user says "Silk saree"
const newName = cleanVoiceAnswer('Silk saree', 'handicraftName');
assert(newName === 'Silk saree', 'CORRECTION FLOW', 'User speaks corrected name');

// System updates ONLY name, all other fields unchanged
const updatedProduct = {
  ...currentProduct,
  name: newName,
};

assert(updatedProduct.name === 'Silk saree', 'CORRECTION FLOW', 'Name updated to Silk saree');
assert(updatedProduct.type === 'Handloom textile', 'CORRECTION FLOW', 'Type strictly unchanged');
assert(updatedProduct.color === 'Red and golden', 'CORRECTION FLOW', 'Color strictly unchanged');
assert(updatedProduct.address === 'Pochampally, Telangana, India', 'CORRECTION FLOW', 'Address strictly unchanged');
assert(updatedProduct.quantity === 25, 'CORRECTION FLOW', 'Quantity strictly unchanged');

// ----------------------------------------------------------------------------
// 9. AUTO DESCRIPTION (Section 14)
// ----------------------------------------------------------------------------
const autoDesc = generateAutoDescription(
  {
    handicraftName: updatedProduct.name,
    handicraftType: updatedProduct.type,
    colors: ['Red', 'Golden'],
    location: updatedProduct.address,
    quantity: updatedProduct.quantity,
  },
  'en'
);

assert(autoDesc.includes(updatedProduct.name), 'AUTO DESCRIPTION', 'Description contains confirmed name');
assert(autoDesc.includes('Red'), 'AUTO DESCRIPTION', 'Description contains confirmed color');
assert(autoDesc.includes('Pochampally'), 'AUTO DESCRIPTION', 'Description contains confirmed location');
assert(autoDesc.length > 30, 'AUTO DESCRIPTION', 'Description is rich and complete');

// ----------------------------------------------------------------------------
// 10. FINAL DATA OBJECT (Section 15)
// ----------------------------------------------------------------------------
const finalData = {
  name: updatedProduct.name,
  type: updatedProduct.type,
  color: updatedProduct.color,
  address: updatedProduct.address,
  quantity: updatedProduct.quantity,
  description: autoDesc,
};

assert(typeof finalData.name === 'string' && finalData.name.length > 0, 'FINAL DATA', 'Name valid string');
assert(typeof finalData.type === 'string' && finalData.type.length > 0, 'FINAL DATA', 'Type valid string');
assert(typeof finalData.color === 'string' && finalData.color.length > 0, 'FINAL DATA', 'Color valid string');
assert(typeof finalData.address === 'string' && finalData.address.length > 0, 'FINAL DATA', 'Address valid string');
assert(typeof finalData.quantity === 'number' && finalData.quantity === 25, 'FINAL DATA', 'Quantity is number 25');
assert(typeof finalData.description === 'string' && finalData.description.length > 0, 'FINAL DATA', 'Description valid string');

// SUMMARY
console.log('\n=== TEST TRACE SUMMARY ===');
const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;
console.log(`Total assertions: ${results.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed === 0) {
  console.log('\n✅ ALL VERIFICATION TRACES PASSED SUCCESSFULLY!');
  process.exit(0);
} else {
  console.error(`\n❌ ${failed} ASSERTIONS FAILED.`);
  process.exit(1);
}
