import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ImagePlus, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { translations } from '../../lib/i18n';

const CATEGORIES = ['Handloom', 'Pottery', 'Woodcraft', 'Metalcraft', 'Jewellery', 'Paintings', 'Bamboo/Cane', 'Textiles', 'Traditional Decor', 'Weaving', 'Embroidery', 'Other'];

export function AddHandicraft() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = translations[language];
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    title: '', category: 'Handloom', artisan_name: '', craft_type: '', material: '', description: '',
    quantity: 1, material_cost: 0, labour_cost: 0, other_cost: 0, suggested_price: 0,
    image: '', location: '', craft_origin: '', stock: 10,
  });

  const updateField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = t.required;
    if (form.quantity <= 0) e.quantity = t.mustBePositive;
    if (form.material_cost < 0) e.material_cost = t.invalidValue;
    if (form.labour_cost < 0) e.labour_cost = t.invalidValue;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/v1/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artisan_id: 'art-01', artisan_name: form.artisan_name || 'Artisan',
          artisan_category: form.category, artisan_district: form.location || 'India',
          artisan_state: form.craft_origin || 'India', category_hint: form.category,
          image: form.image || undefined,
          cost: { material_cost: form.material_cost, labor_hours: Math.round(form.labour_cost / 85), hourly_rate: 85, other_cost: form.other_cost },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.product?.id && form.title) {
          await fetch(`/api/v1/products/${data.product.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: form.title, description: form.description, material: form.material, category: form.category, final_price: form.suggested_price || form.material_cost + form.labour_cost + form.other_cost + 200, quantity: form.quantity }),
          });
        }
        navigate('/seller/handicrafts');
      }
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { updateField('image', ev.target?.result as string); };
    reader.readAsDataURL(file);
  };

  const inputClass = (field: string) => `w-full px-3 py-2.5 rounded-xl border ${errors[field] ? 'border-red-400 ring-2 ring-red-100' : 'border-stone-300'} bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500`;

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate('/seller/handicrafts')} className="flex items-center gap-1.5 text-stone-500 hover:text-stone-700 text-sm mb-4">
        <ArrowLeft className="w-4 h-4" />{t.back}
      </button>
      <h1 className="text-2xl font-extrabold text-stone-900 mb-6">{t.addHandicraft}</h1>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-5">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-1.5">{t.productImage}</label>
          <div className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center hover:border-amber-400 transition-colors cursor-pointer relative">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            {form.image ? (
              <img src={form.image} alt="Preview" className="w-full max-h-48 object-contain rounded-lg" />
            ) : (
              <div><ImagePlus className="w-8 h-8 text-stone-300 mx-auto mb-2" /><p className="text-stone-400 text-sm">{t.captureOrUpload}</p></div>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">{t.productName} *</label>
            <input type="text" value={form.title} onChange={e => updateField('title', e.target.value)} className={inputClass('title')} placeholder={t.productName} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">{t.productCategory}</label>
            <select value={form.category} onChange={e => updateField('category', e.target.value)} className={inputClass('category')}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">{t.artisanName}</label>
            <input type="text" value={form.artisan_name} onChange={e => updateField('artisan_name', e.target.value)} className={inputClass('artisan_name')} />
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">{t.material}</label>
            <input type="text" value={form.material} onChange={e => updateField('material', e.target.value)} className={inputClass('material')} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-stone-700 mb-1">{t.description}</label>
          <textarea value={form.description} onChange={e => updateField('description', e.target.value)} rows={3} className={inputClass('description')} />
        </div>

        {/* Costs */}
        <div className="border-t border-stone-100 pt-5">
          <h3 className="font-bold text-stone-900 mb-3">{t.costBreakdown}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">{t.materialCost} (₹)</label>
              <input type="number" min="0" value={form.material_cost} onChange={e => updateField('material_cost', Number(e.target.value))} className={inputClass('material_cost')} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">{t.labourCost} (₹)</label>
              <input type="number" min="0" value={form.labour_cost} onChange={e => updateField('labour_cost', Number(e.target.value))} className={inputClass('labour_cost')} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">{t.additionalExpenses} (₹)</label>
              <input type="number" min="0" value={form.other_cost} onChange={e => updateField('other_cost', Number(e.target.value))} className={inputClass('other_cost')} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">{t.suggestedSellingPrice} (₹)</label>
              <input type="number" min="0" value={form.suggested_price} onChange={e => updateField('suggested_price', Number(e.target.value))} className={inputClass('suggested_price')} />
            </div>
          </div>
        </div>

        {/* Location & Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-stone-100 pt-5">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">{t.location}</label>
            <input type="text" value={form.location} onChange={e => updateField('location', e.target.value)} className={inputClass('location')} />
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">{t.craftOrigin}</label>
            <input type="text" value={form.craft_origin} onChange={e => updateField('craft_origin', e.target.value)} className={inputClass('craft_origin')} />
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">{t.quantity}</label>
            <input type="number" min="1" value={form.quantity} onChange={e => updateField('quantity', Number(e.target.value))} className={inputClass('quantity')} />
            {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
          <button onClick={() => navigate('/seller/handicrafts')} className="px-6 py-2.5 rounded-xl border border-stone-300 text-stone-600 font-bold text-sm hover:bg-stone-50">{t.cancel}</button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-sm shadow-md hover:opacity-90 disabled:opacity-50 active:scale-[0.98] transition-all">
            <Save className="w-4 h-4" />
            {saving ? t.loading : t.save}
          </button>
        </div>
      </div>
    </div>
  );
}
