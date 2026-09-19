import React from 'react';

interface MetricCardProps {
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  label: string;
  value: string | number;
  badgeText?: string;
  badgeVariant?: 'success' | 'indigo' | 'gold' | 'terracotta' | 'muted';
  onClick?: () => void;
}

export function MetricCard({
  icon: Icon,
  iconColor = 'text-[#A8462D]',
  iconBg = 'bg-[#A8462D]/10 border-[#A8462D]/20',
  label,
  value,
  badgeText,
  badgeVariant = 'muted',
  onClick,
}: MetricCardProps) {
  const badgeStyles = {
    success: 'bg-emerald-50 text-[#4A7A52] border-emerald-200/70',
    indigo: 'bg-indigo-50 text-[#273B59] border-indigo-200/70',
    gold: 'bg-amber-50 text-[#C88732] border-amber-200/70',
    terracotta: 'bg-[#FFF2EE] text-[#A8462D] border-[#A8462D]/20',
    muted: 'bg-[#F7F2E8] text-[#7A6E65] border-[#D9CEB8]',
  }[badgeVariant];

  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl bg-[#FFFDF8] border border-[#D9CEB8] p-4 sm:p-5 flex flex-col justify-between shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[#A8462D]/50 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 border ${iconBg} ${iconColor} transition-transform group-hover:scale-105`}
        >
          <Icon className="w-4.5 h-4.5" />
        </div>
        <p className="text-xs text-[#7A6E65] font-semibold tracking-wide">{label}</p>
        <p className="text-xl sm:text-2xl font-bold font-serif text-[#29221D] mt-0.5 tracking-tight">
          {value}
        </p>
      </div>

      {badgeText && (
        <div className="mt-3">
          <span
            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeStyles}`}
          >
            {badgeText}
          </span>
        </div>
      )}
    </div>
  );
}
