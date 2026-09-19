import React, { useState } from 'react';
import { Terminal, ChevronDown, ChevronUp, Bug, CheckCircle, AlertTriangle, XCircle, Activity } from 'lucide-react';
import { LanguageCode } from '../../types';

export interface DevDebugTelemetry {
  imageCaptured: boolean;
  imageSizeBytes?: number;
  imageMime?: string;
  imageDimensions?: { width?: number; height?: number };
  aiRequestSent: boolean;
  aiResponseStatus: 'not sent' | 'analyzing' | 'success' | 'failure';
  detectedFields: string[];
  missingFields: string[];
  selectedLanguage: LanguageCode;
  speechLocale: string;
  speechRecognitionSupported: boolean;
  ttsSupported: boolean;
  currentVoiceState: string;
  lastTranscript: string;
  lastExtractedField: string;
  lastError: string | null;
  aiProvider?: string;
  latencyMs?: number;
  pricingTelemetry?: {
    materialCost: number;
    laborHours: number;
    fairHourlyWage: number;
    laborCost: number;
    productionCost: number;
    targetMargin: number;
    recommendedFairPrice: number;
    marketMedian?: number;
    marketMin?: number;
    marketMax?: number;
    marketAvailable?: boolean;
    artisanApprovedPrice: number;
  } | null;
}

interface DevAiDebugPanelProps {
  telemetry: DevDebugTelemetry;
}

export const DevAiDebugPanel: React.FC<DevAiDebugPanelProps> = ({ telemetry }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Hidden: only shown if explicitly activated via ?debug=true in URL query params
  const showDebug = typeof window !== 'undefined' && window.location.search.includes('debug=true');
  if (!showDebug) return null;

  return (
    <div className="w-full mt-6 bg-stone-950 text-stone-200 rounded-2xl border border-stone-800 shadow-xl overflow-hidden font-mono text-xs">
      {/* Header bar */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-stone-900/90 hover:bg-stone-900 border-b border-stone-800 cursor-pointer transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-emerald-400" />
          <span className="font-bold tracking-wide text-emerald-400">DEV TELEMETRY: AI + Camera + Voice Diagnostics</span>
          <span className="text-[10px] bg-stone-800 text-stone-400 px-2 py-0.5 rounded-full">
            {telemetry.currentVoiceState}
          </span>
        </div>
        <div className="flex items-center gap-2 text-stone-400">
          <span className="text-[11px] hidden sm:inline">
            Lang: <strong className="text-amber-300">{telemetry.selectedLanguage}</strong> ({telemetry.speechLocale})
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Telemetry Grid */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* 1. Camera / Image Telemetry */}
            <div className="bg-stone-900/60 p-3 rounded-xl border border-stone-800 space-y-1.5">
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3 h-3 text-cyan-400" />
                <span>1. Camera & Image Capture</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Image captured:</span>
                <span className={telemetry.imageCaptured ? 'text-emerald-400 font-bold' : 'text-stone-500'}>
                  {telemetry.imageCaptured ? 'YES ✓' : 'NO'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Image size:</span>
                <span className="text-stone-200">
                  {telemetry.imageSizeBytes ? `${Math.round(telemetry.imageSizeBytes / 1024)} KB` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Image MIME:</span>
                <span className="text-stone-200">{telemetry.imageMime || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Dimensions:</span>
                <span className="text-stone-200">
                  {telemetry.imageDimensions?.width && telemetry.imageDimensions?.height
                    ? `${telemetry.imageDimensions.width} × ${telemetry.imageDimensions.height} px`
                    : 'N/A'}
                </span>
              </div>
            </div>

            {/* 2. AI Inspection Pipeline */}
            <div className="bg-stone-900/60 p-3 rounded-xl border border-stone-800 space-y-1.5">
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3 h-3 text-amber-400" />
                <span>2. AI Craft Inspection</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">AI request:</span>
                <span className={telemetry.aiRequestSent ? 'text-emerald-400 font-bold' : 'text-stone-500'}>
                  {telemetry.aiRequestSent ? 'SENT ✓' : 'NOT SENT'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">AI response:</span>
                <span className={`font-bold ${
                  telemetry.aiResponseStatus === 'success'
                    ? 'text-emerald-400'
                    : telemetry.aiResponseStatus === 'analyzing'
                    ? 'text-amber-400 animate-pulse'
                    : telemetry.aiResponseStatus === 'failure'
                    ? 'text-rose-400'
                    : 'text-stone-500'
                }`}>
                  {telemetry.aiResponseStatus.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">AI provider:</span>
                <span className="text-stone-200">{telemetry.aiProvider || 'Gemini 2.5 Flash'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Detected fields:</span>
                <span className="text-emerald-300 font-medium truncate max-w-[140px]" title={telemetry.detectedFields.join(', ')}>
                  {telemetry.detectedFields.length > 0 ? telemetry.detectedFields.join(', ') : 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Missing fields:</span>
                <span className="text-amber-300 font-medium truncate max-w-[140px]" title={telemetry.missingFields.join(', ')}>
                  {telemetry.missingFields.length > 0 ? telemetry.missingFields.join(', ') : 'None'}
                </span>
              </div>
            </div>

            {/* 3. Voice & Speech Recognition */}
            <div className="bg-stone-900/60 p-3 rounded-xl border border-stone-800 space-y-1.5">
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3 h-3 text-purple-400" />
                <span>3. Voice State Machine</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Selected lang:</span>
                <span className="text-amber-300 font-bold">{telemetry.selectedLanguage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Speech locale:</span>
                <span className="text-stone-200 font-mono">{telemetry.speechLocale}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">SpeechRecognition:</span>
                <span className={telemetry.speechRecognitionSupported ? 'text-emerald-400' : 'text-rose-400'}>
                  {telemetry.speechRecognitionSupported ? 'SUPPORTED ✓' : 'UNSUPPORTED ✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">TTS (speechSynthesis):</span>
                <span className={telemetry.ttsSupported ? 'text-emerald-400' : 'text-rose-400'}>
                  {telemetry.ttsSupported ? 'SUPPORTED ✓' : 'UNSUPPORTED ✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Voice state:</span>
                <span className="text-emerald-400 font-bold">{telemetry.currentVoiceState}</span>
              </div>
            </div>
          </div>

          {/* Transcript & Extraction Log */}
          <div className="bg-stone-900 p-3 rounded-xl border border-stone-800 space-y-2">
            <div className="flex flex-col sm:flex-row justify-between gap-1">
              <span className="text-stone-400">Last spoken transcript:</span>
              <span className="text-amber-300 font-semibold italic">
                {telemetry.lastTranscript ? `"${telemetry.lastTranscript}"` : '(Waiting for speech...)'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between gap-1">
              <span className="text-stone-400">Last extracted field:</span>
              <span className="text-emerald-300 font-bold">
                {telemetry.lastExtractedField || 'None'}
              </span>
            </div>
            {telemetry.lastError && (
              <div className="flex flex-col sm:flex-row justify-between gap-1 text-rose-400">
                <span className="text-stone-400">Last error:</span>
                <span className="font-medium">{telemetry.lastError}</span>
              </div>
            )}
          </div>

          {/* 4. Pricing Telemetry (Section 29) */}
          {telemetry.pricingTelemetry && (
            <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-800 space-y-2">
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3 h-3" />
                <span>4. Deterministic Pricing Diagnostics</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="text-stone-500 block">Material Cost:</span>
                  <span className="font-bold text-stone-200">₹{telemetry.pricingTelemetry.materialCost}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Labor Hours:</span>
                  <span className="font-bold text-stone-200">{telemetry.pricingTelemetry.laborHours}h @ ₹{telemetry.pricingTelemetry.fairHourlyWage}/h</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Labor Cost:</span>
                  <span className="font-bold text-stone-200">₹{telemetry.pricingTelemetry.laborCost}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Production Cost:</span>
                  <span className="font-bold text-stone-200">₹{telemetry.pricingTelemetry.productionCost}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Target Margin:</span>
                  <span className="font-bold text-stone-200">{Math.round(telemetry.pricingTelemetry.targetMargin * 100)}%</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Recommended Fair Price:</span>
                  <span className="font-bold text-emerald-400">₹{telemetry.pricingTelemetry.recommendedFairPrice}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Market Median:</span>
                  <span className="font-bold text-amber-300">
                    {telemetry.pricingTelemetry.marketAvailable && telemetry.pricingTelemetry.marketMedian
                      ? `₹${telemetry.pricingTelemetry.marketMedian}`
                      : 'Unavailable'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block">Artisan Approved:</span>
                  <span className="font-bold text-orange-400">₹{telemetry.pricingTelemetry.artisanApprovedPrice}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
