import React from 'react';
import { Mic, Check, Loader2, Volume2 } from 'lucide-react';

export type VoiceState = 'idle' | 'speaking' | 'listening' | 'processing' | 'added';

interface VoiceTypeButtonProps {
  state?: VoiceState;
  isListening?: boolean;
  isSpeaking?: boolean;
  isProcessing?: boolean;
  isSuccess?: boolean;
  onClick: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function VoiceTypeButton({
  state,
  isListening = false,
  isSpeaking = false,
  isProcessing = false,
  isSuccess = false,
  onClick,
  disabled = false,
  size = 'sm',
  className = '',
}: VoiceTypeButtonProps) {
  // Determine effective state
  const effectiveState: VoiceState =
    state ||
    (isSuccess
      ? 'added'
      : isProcessing
      ? 'processing'
      : isListening
      ? 'listening'
      : isSpeaking
      ? 'speaking'
      : 'idle');

  const configs = {
    idle: {
      label: 'Voice Type',
      icon: Mic,
      btnClass:
        'bg-[#FFFDF8] hover:bg-[#F7F2E8] text-[#A8462D] border-[#D9CEB8] hover:border-[#A8462D]',
      iconClass: 'text-[#A8462D]',
    },
    speaking: {
      label: 'Speaking...',
      icon: Volume2,
      btnClass: 'bg-[#FDF6F0] text-[#A8462D] border-[#A8462D]/40 animate-pulse',
      iconClass: 'text-[#A8462D]',
    },
    listening: {
      label: 'Listening...',
      icon: Mic,
      btnClass: 'bg-[#A8462D] text-[#FFFDF8] border-[#A8462D] shadow-sm',
      iconClass: 'text-[#FFFDF8] animate-pulse',
    },
    processing: {
      label: 'Processing...',
      icon: Loader2,
      btnClass: 'bg-amber-50 text-[#C88732] border-amber-300',
      iconClass: 'text-[#C88732] animate-spin',
    },
    added: {
      label: 'Voice Added',
      icon: Check,
      btnClass: 'bg-emerald-50 text-[#4A7A52] border-emerald-300',
      iconClass: 'text-[#4A7A52]',
    },
  }[effectiveState];

  const Icon = configs.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || effectiveState === 'processing'}
      className={`inline-flex items-center gap-1.5 font-bold transition-all rounded-lg border shadow-2xs cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs sm:text-sm'
      } ${configs.btnClass} ${className}`}
      title="Click to dictate using your voice"
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{configs.label}</span>
    </button>
  );
}
