import React from 'react';
import { Bill } from '../../types';
import { formatINR } from '../../lib/billingService';
import { useLanguage } from '../../lib/LanguageContext';
import { translations } from '../../lib/i18n';
import { ShieldCheck, Award, Printer } from 'lucide-react';

interface BillPreviewProps {
  bill: Bill;
}

export function BillPreview({ bill }: BillPreviewProps) {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-lg p-6 sm:p-10 max-w-4xl mx-auto font-sans print:p-0 print:border-0 print:shadow-none" id="printable-bill">
      {/* Invoice Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-stone-800 pb-6 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-amber-100 font-black text-sm">
              SS
            </div>
            <span className="text-2xl font-black text-stone-900 font-['Rozha_One',serif]">ShilpSetu</span>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded border border-amber-300 uppercase">KALAtech</span>
          </div>
          <p className="text-xs text-stone-500 font-medium tracking-wide">
            Official Indian Handicraft Artisan Valuation & Invoice
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" /> Direct Artisan Fair-Trade Certified
          </div>
        </div>

        <div className="sm:text-right">
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 rounded-md text-xs font-black uppercase tracking-wider mb-2">
            Handicraft Bill
          </span>
          <p className="text-sm font-extrabold text-stone-900">
            {t.invoiceNumber}: <span className="font-mono text-amber-800">{bill.billNumber}</span>
          </p>
          <p className="text-xs text-stone-500 mt-0.5">
            {t.billDate}: {new Date(bill.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Seller & Transaction Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-stone-50 rounded-xl border border-stone-200 mb-6">
        <div>
          <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500 mb-2">
            {t.sellerInfo}
          </h3>
          <p className="text-base font-bold text-stone-900">{bill.sellerName}</p>
          <p className="text-xs text-stone-600">Location: {bill.sellerLocation}</p>
          <p className="text-xs text-stone-600">Contact: {bill.sellerPhone}</p>
          <p className="text-xs text-stone-600">ID: {bill.sellerId}</p>
        </div>

        <div className="sm:text-right">
          <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500 mb-2">
            {t.productDetails}
          </h3>
          <p className="text-base font-bold text-stone-900">{bill.productName}</p>
          <p className="text-xs text-stone-600">{t.category}: <span className="font-semibold">{bill.productCategory}</span></p>
          <p className="text-xs text-stone-600">{t.quantity}: <span className="font-bold text-stone-900">{bill.quantity} units</span></p>
        </div>
      </div>

      {/* Itemized Cost Breakdown Table */}
      <div className="mb-6">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-500 mb-3">
          {t.costBreakdown}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-stone-300 text-stone-500 text-xs font-bold uppercase">
                <th className="py-2.5">Component</th>
                <th className="py-2.5 text-right">Cost Per Unit</th>
                <th className="py-2.5 text-right">Qty</th>
                <th className="py-2.5 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              <tr>
                <td className="py-2.5 font-medium">{t.materialCost}</td>
                <td className="py-2.5 text-right">{formatINR(bill.materialCost)}</td>
                <td className="py-2.5 text-right">{bill.quantity}</td>
                <td className="py-2.5 text-right font-medium">{formatINR(bill.materialCost * bill.quantity)}</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">{t.labourCost}</td>
                <td className="py-2.5 text-right">{formatINR(bill.labourCost)}</td>
                <td className="py-2.5 text-right">{bill.quantity}</td>
                <td className="py-2.5 text-right font-medium">{formatINR(bill.labourCost * bill.quantity)}</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">{t.transportationCost}</td>
                <td className="py-2.5 text-right">{formatINR(bill.transportationCost)}</td>
                <td className="py-2.5 text-right">{bill.quantity}</td>
                <td className="py-2.5 text-right font-medium">{formatINR(bill.transportationCost * bill.quantity)}</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">{t.otherExpenses}</td>
                <td className="py-2.5 text-right">{formatINR(bill.otherCost)}</td>
                <td className="py-2.5 text-right">{bill.quantity}</td>
                <td className="py-2.5 text-right font-medium">{formatINR(bill.otherCost * bill.quantity)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-stone-300 font-bold text-stone-900 bg-stone-50">
                <td className="py-3 px-2" colSpan={3}>{t.totalCost}</td>
                <td className="py-3 px-2 text-right">{formatINR(bill.totalCost)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Market Benchmark vs Final Valuation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 mb-2">
            {t.marketPriceSection}
          </h4>
          <div className="space-y-1.5 text-xs text-stone-700">
            <div className="flex justify-between">
              <span>{t.marketMinPrice}:</span>
              <span className="font-semibold">{formatINR(bill.marketMinPrice)}</span>
            </div>
            <div className="flex justify-between font-bold text-amber-900">
              <span>{t.marketAvgPrice}:</span>
              <span>{formatINR(bill.marketAveragePrice)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t.marketMaxPrice}:</span>
              <span className="font-semibold">{formatINR(bill.marketMaxPrice)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-amber-200 text-amber-800 font-bold">
              <span>{t.aiRecommendedPrice}:</span>
              <span>{formatINR(bill.recommendedPrice)}</span>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex flex-col justify-between">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 mb-2">
            {t.financialSummary}
          </h4>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-stone-700">
              <span>Unit Selling Price:</span>
              <span className="font-bold">{formatINR(bill.finalPrice)}</span>
            </div>
            <div className="flex justify-between text-stone-700">
              <span>Total Bill Amount ({bill.quantity} pcs):</span>
              <span className="text-base font-black text-stone-900">{formatINR(bill.finalPrice * bill.quantity)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-emerald-200 font-extrabold text-emerald-800">
              <span>{t.profitLabel}:</span>
              <span className="text-sm">+{formatINR(bill.profit)} ({bill.profitPercentage}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Authenticity Stamp and Sign-off */}
      <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row justify-between items-center text-xs text-stone-500 gap-4">
        <div className="flex items-center gap-3">
          <Award className="w-8 h-8 text-amber-600" />
          <div>
            <p className="font-bold text-stone-800">Verified Handicraft Origin</p>
            <p>Protected by ShilpSetu (KALAtech) Fair Pricing & Provenance protocol.</p>
          </div>
        </div>

        <div className="text-center sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0">
          <div className="w-32 h-10 border-b border-dashed border-stone-400 mx-auto sm:ml-auto mb-1 flex items-end justify-center font-['Rozha_One',serif] text-stone-700 italic">
            {bill.sellerName}
          </div>
          <p className="text-[10px] text-stone-400">Authorized Artisan Signature</p>
        </div>
      </div>
    </div>
  );
}
