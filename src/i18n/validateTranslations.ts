import { validateTranslations, translations } from './index';
import { LanguageCode } from '../types';

const langNames: Record<LanguageCode, string> = {
  en: 'English',
  hi: 'Hindi',
  te: 'Telugu',
  ta: 'Tamil',
  kn: 'Kannada',
  ml: 'Malayalam',
  mr: 'Marathi',
  gu: 'Gujarati',
  bn: 'Bengali',
  or: 'Odia',
  pa: 'Punjabi',
  as: 'Assamese',
};

console.log('============================================================');
console.log('VALIDATING CENTRALIZED MULTILINGUAL TRANSLATIONS (12 LANGUAGES)');
console.log('============================================================\n');

const res = validateTranslations();

for (const [code, ok] of Object.entries(res.report)) {
  const name = langNames[code as LanguageCode] || code;
  const keyCount = Object.keys(translations[code as LanguageCode] || {}).length;
  if (ok) {
    console.log(`✓ ${name.padEnd(12)} [${code}] : ALL ${keyCount} KEYS VALID`);
  } else {
    console.error(`✗ ${name.padEnd(12)} [${code}] : FAILED`);
  }
}

if (!res.valid) {
  console.error('\nERRORS FOUND:');
  res.errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log('\n============================================================');
  console.log('ALL 12 LANGUAGES IMPLEMENTED AND 100% VALIDATED SUCCESSFULLY!');
  console.log('============================================================');
}
