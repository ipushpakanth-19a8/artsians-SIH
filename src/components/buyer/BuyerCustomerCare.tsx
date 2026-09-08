import React from 'react';
import { CustomerCare } from '../common/CustomerCare';
import { useLanguage } from '../../lib/LanguageContext';
import { translations } from '../../lib/i18n';
import { Headphones } from 'lucide-react';

export function BuyerCustomerCare() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-['Rozha_One',serif] flex items-center gap-2">
          <Headphones className="w-7 h-7 text-amber-600" />
          {t.customerCare}
        </h1>
        <p className="text-sm text-stone-600">Get instant AI guidance on handicraft authenticity, order status, returns, and artisan messaging</p>
      </div>

      <CustomerCare defaultRole="buyer" />
    </div>
  );
}
