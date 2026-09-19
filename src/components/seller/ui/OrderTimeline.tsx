import React from 'react';
import { Check } from 'lucide-react';

export const ORDER_TIMELINE_STEPS = [
  { key: 'created', label: 'New Order' },
  { key: 'paid', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready_to_ship', label: 'Ready to Ship' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

interface OrderTimelineProps {
  currentStatus: string;
  onSelectStatus?: (statusKey: string) => void;
  interactive?: boolean;
}

export function OrderTimeline({
  currentStatus,
  onSelectStatus,
  interactive = false,
}: OrderTimelineProps) {
  const getIndex = (status: string) => {
    switch (status) {
      case 'created':
        return 0;
      case 'paid':
        return 1;
      case 'preparing':
        return 2;
      case 'ready_to_ship':
        return 3;
      case 'shipped':
        return 4;
      case 'delivered':
        return 5;
      default:
        return 0;
    }
  };

  const currentIndex = getIndex(currentStatus);

  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between relative">
        {/* Connecting track */}
        <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-[#E8DFC9] z-0" />
        <div
          className="absolute top-3.5 left-4 h-0.5 bg-[#A8462D] transition-all duration-300 z-0"
          style={{
            width: `${(currentIndex / (ORDER_TIMELINE_STEPS.length - 1)) * 100}%`,
          }}
        />

        {ORDER_TIMELINE_STEPS.map((step, idx) => {
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isUpcoming = idx > currentIndex;

          return (
            <div
              key={step.key}
              onClick={() => (interactive && onSelectStatus ? onSelectStatus(step.key) : undefined)}
              className={`relative z-10 flex flex-col items-center group ${
                interactive && isUpcoming && onSelectStatus ? 'cursor-pointer' : ''
              }`}
            >
              {/* Dot */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  isPassed
                    ? 'bg-[#4A7A52] text-[#FFFDF8] shadow-xs'
                    : isCurrent
                    ? 'bg-[#A8462D] text-[#FFFDF8] ring-4 ring-[#A8462D]/20 shadow-xs scale-110'
                    : 'bg-[#FFFDF8] text-[#7A6E65] border-2 border-[#D9CEB8]'
                }`}
              >
                {isPassed ? <Check className="w-3.5 h-3.5" /> : idx + 1}
              </div>

              {/* Step Label */}
              <span
                className={`mt-1.5 text-[10px] font-semibold text-center whitespace-nowrap px-1 leading-tight ${
                  isCurrent
                    ? 'text-[#A8462D] font-bold'
                    : isPassed
                    ? 'text-[#29221D]'
                    : 'text-[#7A6E65]'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
