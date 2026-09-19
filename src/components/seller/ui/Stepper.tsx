import React from 'react';
import { Check } from 'lucide-react';

export interface StepItem {
  id: number;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: StepItem[];
  currentStep: number;
  onSelectStep?: (stepId: number) => void;
}

export function Stepper({ steps, currentStep, onSelectStep }: StepperProps) {
  return (
    <div className="w-full bg-[#FFFDF8] border border-[#D9CEB8] rounded-2xl p-3 sm:p-4 shadow-2xs">
      <div className="flex items-center justify-between relative">
        {/* Connecting progress line */}
        <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 bg-[#E8DFC9] z-0 hidden sm:block" />

        {steps.map((s, idx) => {
          const isCompleted = s.id < currentStep;
          const isCurrent = s.id === currentStep;
          const isUpcoming = s.id > currentStep;

          return (
            <div
              key={s.id}
              onClick={() => (isCompleted && onSelectStep ? onSelectStep(s.id) : undefined)}
              className={`relative z-10 flex flex-col sm:flex-row items-center gap-2 sm:gap-3 flex-1 sm:flex-initial transition-all ${
                isCompleted && onSelectStep ? 'cursor-pointer group' : ''
              }`}
            >
              {/* Step indicator circle */}
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                  isCompleted
                    ? 'bg-[#4A7A52] text-[#FFFDF8] border-2 border-[#4A7A52]'
                    : isCurrent
                    ? 'bg-[#A8462D] text-[#FFFDF8] border-2 border-[#A8462D] ring-4 ring-[#A8462D]/15 scale-105'
                    : 'bg-[#F7F2E8] text-[#7A6E65] border-2 border-[#D9CEB8]'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : <span>{s.id}</span>}
              </div>

              {/* Label */}
              <div className="text-center sm:text-left">
                <p
                  className={`text-xs font-bold leading-tight transition-colors ${
                    isCurrent
                      ? 'text-[#A8462D]'
                      : isCompleted
                      ? 'text-[#29221D] group-hover:text-[#A8462D]'
                      : 'text-[#7A6E65]'
                  }`}
                >
                  {s.label}
                </p>
                {s.description && (
                  <p className="hidden md:block text-[10px] text-[#7A6E65] mt-0.5">
                    {s.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
