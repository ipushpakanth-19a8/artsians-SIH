import React from 'react';

export type StatusVariant =
  | 'published'
  | 'draft'
  | 'out_of_stock'
  | 'created'
  | 'paid'
  | 'preparing'
  | 'ready_to_ship'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

interface StatusBadgeProps {
  status: StatusVariant | string;
  label?: string;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; defaultLabel: string; dotColor: string }> = {
  published: {
    bg: 'bg-emerald-50',
    text: 'text-[#4A7A52]',
    border: 'border-emerald-200/70',
    defaultLabel: 'Published',
    dotColor: 'bg-[#4A7A52]',
  },
  draft: {
    bg: 'bg-[#F7F2E8]',
    text: 'text-[#7A6E65]',
    border: 'border-[#D9CEB8]',
    defaultLabel: 'Draft',
    dotColor: 'bg-[#7A6E65]',
  },
  out_of_stock: {
    bg: 'bg-rose-50',
    text: 'text-[#A8462D]',
    border: 'border-rose-200',
    defaultLabel: 'Out of Stock',
    dotColor: 'bg-[#A8462D]',
  },
  created: {
    bg: 'bg-amber-50',
    text: 'text-[#C88732]',
    border: 'border-amber-200/70',
    defaultLabel: 'New Order',
    dotColor: 'bg-[#C88732]',
  },
  paid: {
    bg: 'bg-emerald-50',
    text: 'text-[#4A7A52]',
    border: 'border-emerald-200/70',
    defaultLabel: 'Confirmed',
    dotColor: 'bg-[#4A7A52]',
  },
  preparing: {
    bg: 'bg-indigo-50',
    text: 'text-[#273B59]',
    border: 'border-indigo-200/70',
    defaultLabel: 'Preparing',
    dotColor: 'bg-[#273B59]',
  },
  ready_to_ship: {
    bg: 'bg-amber-50',
    text: 'text-[#B45309]',
    border: 'border-amber-200/80',
    defaultLabel: 'Ready to Ship',
    dotColor: 'bg-[#B45309]',
  },
  shipped: {
    bg: 'bg-sky-50',
    text: 'text-[#0369A1]',
    border: 'border-sky-200',
    defaultLabel: 'Shipped',
    dotColor: 'bg-[#0369A1]',
  },
  delivered: {
    bg: 'bg-emerald-50',
    text: 'text-[#15803D]',
    border: 'border-emerald-200',
    defaultLabel: 'Delivered',
    dotColor: 'bg-[#15803D]',
  },
  cancelled: {
    bg: 'bg-stone-100',
    text: 'text-stone-600',
    border: 'border-stone-300',
    defaultLabel: 'Cancelled',
    dotColor: 'bg-stone-500',
  },
};

export function StatusBadge({ status, label, size = 'sm' }: StatusBadgeProps) {
  const normKey = status.toLowerCase().replace(/[\s-]/g, '_');
  const config = STATUS_CONFIG[normKey] || {
    bg: 'bg-[#F7F2E8]',
    text: 'text-[#7A6E65]',
    border: 'border-[#D9CEB8]',
    defaultLabel: status,
    dotColor: 'bg-[#7A6E65]',
  };

  const displayText = label || config.defaultLabel;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-md border ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } ${config.bg} ${config.text} ${config.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} shrink-0`} />
      <span>{displayText}</span>
    </span>
  );
}
