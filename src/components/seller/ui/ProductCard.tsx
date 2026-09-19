import React from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { formatINR } from '../../../lib/billingService';
import { Product } from '../../../types';

interface ProductCardProps {
  key?: React.Key;
  product: Product;
  onEdit?: (product: Product) => void;
  onView?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

export function ProductCard({ product, onEdit, onView, onDelete }: ProductCardProps) {
  const imageUrl =
    product.enhanced_image_url ||
    product.original_image_url ||
    (product as any).enhanced_image ||
    (product as any).raw_image ||
    (product as any).images?.[0] ||
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';

  const price = product.final_price || (product as any).suggested_price || (product as any).price || 0;
  const stock = (product as any).stock ?? (product as any).quantity ?? 1;
  const craftType = product.category || product.material || 'Handicraft';
  const status = product.status || 'published';

  return (
    <div className="group rounded-2xl bg-[#FFFDF8] border border-[#D9CEB8] overflow-hidden shadow-2xs hover:shadow-md hover:border-[#A8462D]/50 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Consistent 4:3 Image Container */}
        <div className="relative aspect-[4/3] bg-[#F7F2E8] overflow-hidden">
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Status Badge overlay */}
          <div className="absolute top-2.5 right-2.5 z-10">
            <StatusBadge status={status} />
          </div>

          {/* GI / Heritage pill if present */}
          {product.gi_status === 'certified' && (
            <div className="absolute bottom-2.5 left-2.5 z-10 px-2 py-0.5 rounded-md bg-[#FFFDF8]/90 backdrop-blur-xs text-[10px] font-bold text-[#A8462D] border border-[#D9CEB8]">
              ✦ GI Certified
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-4 sm:p-5 space-y-2">
          {/* Craft Type */}
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#C88732] block">
            {craftType}
          </span>

          {/* Product Name */}
          <h3
            className="font-serif font-bold text-base text-[#29221D] line-clamp-1 group-hover:text-[#A8462D] transition-colors"
            title={product.title}
          >
            {product.title}
          </h3>

          {/* Price & Stock */}
          <div className="flex items-center justify-between pt-1 border-t border-[#D9CEB8]/40">
            <div>
              <span className="text-[10px] font-medium text-[#7A6E65] block">Price</span>
              <span className="text-base font-bold font-mono text-[#29221D]">
                {formatINR(price)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-medium text-[#7A6E65] block">Available</span>
              <span
                className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md border ${
                  stock > 0
                    ? 'bg-emerald-50 text-[#4A7A52] border-emerald-200'
                    : 'bg-rose-50 text-[#A8462D] border-rose-200'
                }`}
              >
                {stock} units
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons: [ Edit ] [ View ] */}
      <div className="p-3 pt-0 border-t border-[#D9CEB8]/30 mt-1 flex items-center gap-2">
        {onEdit && (
          <button
            onClick={() => onEdit(product)}
            className="flex-1 py-1.5 px-3 rounded-xl bg-[#F7F2E8] hover:bg-[#E8DFC9] text-[#29221D] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"
          >
            <Edit2 className="w-3.5 h-3.5 text-[#A8462D]" />
            <span>Edit</span>
          </button>
        )}

        {onView && (
          <button
            onClick={() => onView(product)}
            className="flex-1 py-1.5 px-3 rounded-xl bg-[#FFFDF8] hover:bg-[#F7F2E8] border border-[#D9CEB8] text-[#29221D] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"
          >
            <Eye className="w-3.5 h-3.5 text-[#7A6E65]" />
            <span>View</span>
          </button>
        )}

        {onDelete && (
          <button
            onClick={() => onDelete(product.id)}
            className="p-1.5 rounded-xl hover:bg-rose-50 text-[#7A6E65] hover:text-rose-700 transition-colors cursor-pointer"
            title="Delete craft"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
