import React, { useState, useEffect } from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';
import { initNetworkListener } from '../../lib/nativeBridge';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showReconnected, setShowReconnected] = useState<boolean>(false);

  useEffect(() => {
    const cleanup = initNetworkListener((connected) => {
      if (!connected) {
        setIsOnline(false);
        setShowReconnected(false);
      } else {
        setIsOnline(true);
        setShowReconnected(true);
        const timer = setTimeout(() => setShowReconnected(false), 3500);
        return () => clearTimeout(timer);
      }
    });

    return () => cleanup();
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl shadow-lg transition-all animate-in fade-in slide-in-from-top duration-300 max-w-sm w-[92%]">
      {!isOnline ? (
        <div className="flex items-center gap-2.5 bg-amber-950/95 border border-amber-500/40 text-amber-200 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md">
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
          <span>Offline Mode: Craft listings and bills are saved locally.</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-emerald-950/95 border border-emerald-500/40 text-emerald-200 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Back Online: Synchronizing live market pricing and orders...</span>
        </div>
      )}
    </div>
  );
};
