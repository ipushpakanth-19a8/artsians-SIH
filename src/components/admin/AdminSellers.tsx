import React, { useState } from 'react';
import { Users, Search, ShieldCheck, CheckCircle2, Phone, MapPin, Award } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { translations } from '../../lib/i18n';

interface RegisteredSeller {
  id: string;
  name: string;
  category: string;
  state: string;
  district: string;
  experienceYears: number;
  phone: string;
  status: 'verified' | 'pending';
  productsCount: number;
}

export function AdminSellers() {
  const { language } = useLanguage();
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [sellers, setSellers] = useState<RegisteredSeller[]>([
    {
      id: 'art-01',
      name: 'Rameshwar Rao',
      category: 'Weaving',
      state: 'Telangana',
      district: 'Yadadri Bhoodan Pochampally',
      experienceYears: 25,
      phone: '+91 98480 12345',
      status: 'verified',
      productsCount: 4,
    },
    {
      id: 'art-02',
      name: 'Kumudini Devi',
      category: 'Madhubani Painting',
      state: 'Bihar',
      district: 'Madhubani',
      experienceYears: 18,
      phone: '+91 98350 54321',
      status: 'verified',
      productsCount: 6,
    },
    {
      id: 'art-03',
      name: 'Govind Ram Prajapati',
      category: 'Terracotta Pottery',
      state: 'Rajasthan',
      district: 'Alwar',
      experienceYears: 30,
      phone: '+91 94140 87654',
      status: 'verified',
      productsCount: 3,
    },
    {
      id: 'art-04',
      name: 'Suresh Chandra Pal',
      category: 'Dokra Metalcraft',
      state: 'West Bengal',
      district: 'Bankura',
      experienceYears: 22,
      phone: '+91 94340 11223',
      status: 'verified',
      productsCount: 5,
    },
    {
      id: 'art-05',
      name: 'Lalitha Reddy',
      category: 'Bidriware',
      state: 'Karnataka',
      district: 'Bidar',
      experienceYears: 14,
      phone: '+91 98860 33445',
      status: 'verified',
      productsCount: 2,
    },
  ]);

  const filtered = sellers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-['Rozha_One',serif] flex items-center gap-2">
            <Users className="w-7 h-7 text-red-600" />
            {t.sellers} ({sellers.length})
          </h1>
          <p className="text-sm text-stone-600">Registered master artisans, cluster affiliations, and verification records</p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by artisan, craft, state..."
            className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
          />
        </div>
      </div>

      {/* Sellers Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200">
                <th className="p-4">Artisan Name</th>
                <th className="p-4">Craft Tradition</th>
                <th className="p-4">Location / Cluster</th>
                <th className="p-4">Experience</th>
                <th className="p-4">Catalog</th>
                <th className="p-4">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-stone-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-sm">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-stone-900 text-sm">{s.name}</p>
                        <p className="text-[11px] text-stone-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {s.phone}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-stone-800">{s.category}</td>
                  <td className="p-4">
                    <span className="flex items-center gap-1 text-stone-600">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      {s.district}, {s.state}
                    </span>
                  </td>
                  <td className="p-4 font-medium">{s.experienceYears} Years</td>
                  <td className="p-4 font-bold text-stone-900">{s.productsCount} crafts</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Artisan
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
