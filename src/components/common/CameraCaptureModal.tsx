import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, X, Check, AlertCircle, Sparkles, SwitchCamera, Image as ImageIcon } from 'lucide-react';
import { isNativePlatform, takeNativePhoto, pickNativeGalleryPhoto, triggerHaptic } from '../../lib/nativeBridge';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
  title?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Capture Craft Photo'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Stop camera tracks cleanly
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Start video stream
  const startCamera = useCallback(async (facing: 'environment' | 'user') => {
    setIsInitializing(true);
    setError(null);
    stopStream();

    try {
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch (err) {
        // Fallback for laptops/desktops with only standard webcam
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setError(
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please enable camera access in your browser settings or use file upload.'
          : 'Unable to connect to camera device. Please verify your hardware or select an image file.'
      );
    } finally {
      setIsInitializing(false);
    }
  }, [stopStream]);

  // Initialize camera when modal opens
  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera(cameraFacing);
    }
    return () => {
      stopStream();
    };
  }, [isOpen, cameraFacing]);

  // Switch between front and back camera
  const toggleFacingMode = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
  };

  // Capture frame to blob & Data URL
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
    stopStream();
    triggerHaptic('medium');
  };

  // Native hardware camera
  const handleNativeCamera = async () => {
    triggerHaptic('light');
    const dataUrl = await takeNativePhoto();
    if (dataUrl) {
      setCapturedImage(dataUrl);
      stopStream();
      triggerHaptic('success');
    }
  };

  // Native device gallery picker
  const handleNativeGallery = async () => {
    triggerHaptic('light');
    const dataUrl = await pickNativeGalleryPhoto();
    if (dataUrl) {
      setCapturedImage(dataUrl);
      stopStream();
      triggerHaptic('success');
    }
  };

  // Retake photo
  const handleRetake = () => {
    triggerHaptic('light');
    setCapturedImage(null);
    startCamera(cameraFacing);
  };

  // Confirm and return photo
  const handleConfirm = () => {
    if (capturedImage) {
      triggerHaptic('success');
      onCapture(capturedImage);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-none">{title}</h3>
              <span className="text-[11px] text-stone-400">Live Hardware Viewfinder</span>
            </div>
          </div>
          <button
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Capture Area */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[340px] sm:min-h-[420px]">
          {error ? (
            <div className="p-6 text-center max-w-md">
              <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
              <p className="text-white text-sm font-semibold mb-2">Camera Unavailable</p>
              <p className="text-stone-400 text-xs leading-relaxed mb-4">{error}</p>
              <button
                onClick={() => startCamera(cameraFacing)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                Retry Camera Access
              </button>
            </div>
          ) : capturedImage ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={capturedImage}
                alt="Captured craft"
                className="max-h-[60vh] w-auto object-contain rounded-xl"
              />
              <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur text-amber-400 border border-amber-400/30 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Frame Captured</span>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              {isInitializing && (
                <div className="absolute inset-0 flex items-center justify-center bg-stone-950/60 z-10">
                  <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                </div>
              )}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover max-h-[60vh]"
              />

              {/* Composition Grid Lines for Artisan Quality Standard */}
              <div className="absolute inset-0 pointer-events-none border border-white/10 grid grid-cols-3 grid-rows-3">
                <div className="border-r border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-b border-white/15" />
                <div className="border-r border-white/15" />
                <div className="border-r border-white/15" />
                <div className="" />
              </div>

              {/* Focus center bracket */}
              <div className="absolute inset-0 m-auto w-48 h-48 sm:w-64 sm:h-64 border-2 border-amber-400/60 rounded-2xl pointer-events-none flex items-center justify-center">
                <span className="text-[10px] uppercase font-bold text-amber-300/80 tracking-widest bg-black/40 px-2 py-0.5 rounded">
                  Center Craft
                </span>
              </div>

              {/* Lighting Assistant Badge */}
              <div className="absolute top-3 left-3 bg-stone-900/85 backdrop-blur text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Natural Lighting Sensor Active</span>
              </div>

              {/* Camera Switcher Button */}
              <button
                type="button"
                onClick={toggleFacingMode}
                className="absolute top-3 right-3 bg-stone-900/80 hover:bg-stone-800 text-white p-2.5 rounded-full border border-white/10 transition-colors"
                title="Switch Camera (Front/Back)"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="p-4 sm:p-5 bg-stone-950 border-t border-stone-800 flex items-center justify-between gap-3">
          {capturedImage ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-3 px-4 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-2xl text-xs transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retake Photo</span>
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:opacity-95 text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-amber-900/30 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Enhance</span>
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-between gap-3">
              {/* Native Gallery Button */}
              <button
                type="button"
                onClick={handleNativeGallery}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all shadow-sm"
                title="Select from Photo Library"
              >
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span className="hidden xs:inline">Gallery</span>
              </button>

              {/* Shutter Button */}
              <button
                type="button"
                onClick={takeSnapshot}
                disabled={isInitializing || !!error}
                className="w-16 h-16 rounded-full bg-white hover:scale-105 active:scale-95 transition-transform flex items-center justify-center shadow-lg border-4 border-amber-500 disabled:opacity-40 shrink-0"
                title="Capture Craft Photo"
              >
                <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-stone-950" />
                </div>
              </button>

              {/* Native Camera App Launch */}
              <button
                type="button"
                onClick={handleNativeCamera}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all shadow-sm"
                title="Use Native Device Camera App"
              >
                <Camera className="w-4 h-4 text-amber-400" />
                <span className="hidden xs:inline">Native HD</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
