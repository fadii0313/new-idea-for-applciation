'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RefreshCw, Upload, SwitchCamera, AlertCircle } from 'lucide-react';
import { TorsoGuideOverlay } from './TorsoGuideOverlay';

interface CameraCaptureProps {
  onCapture: (blob: Blob, previewUrl: string) => void;
  isProcessing: boolean;
}

export function CameraCapture({ onCapture, isProcessing }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1080 },
          height: { ideal: 1440 },
          facingMode: { ideal: facingMode },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStreamActive(true);
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. You can still upload a photo below!'
          : 'Camera hardware unavailable. Please upload a photo to continue.'
      );
    }
  }, [facingMode]);

  const toggleFacing = useCallback(() => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  }, []);

  useEffect(() => {
    if (streamActive) {
      startCamera();
    }
  }, [facingMode]); // re-init if stream is active and user switches camera

  const triggerSnapshot = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1080;
    canvas.height = videoRef.current.videoHeight || 1440;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontal if user facing camera for natural mirror feel
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const previewUrl = URL.createObjectURL(blob);
          onCapture(blob, previewUrl);
        }
      },
      'image/jpeg',
      0.95
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onCapture(file, previewUrl);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[3/4] bg-neutral-950 rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 flex flex-col justify-between">
      {/* Live Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`}
      />

      {/* SVG Torso Calibration Overlay */}
      <TorsoGuideOverlay />

      {/* Camera Error Message */}
      {cameraError && !streamActive && (
        <div className="absolute inset-x-4 top-16 p-3 bg-red-950/80 border border-red-500/40 rounded-xl backdrop-blur-md text-red-200 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Bottom Action Controls */}
      <div className="absolute bottom-6 inset-x-0 flex flex-col items-center gap-3 px-6 z-20">
        {!streamActive ? (
          <div className="flex items-center gap-3 w-full justify-center">
            <button
              onClick={startCamera}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-full font-semibold transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center gap-2 text-sm"
            >
              <Camera className="w-4 h-4" />
              Launch Live Camera
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-full font-medium transition flex items-center gap-2 text-sm"
            >
              <Upload className="w-4 h-4" />
              Upload Photo
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-6 w-full">
            <button
              onClick={toggleFacing}
              className="p-3 bg-neutral-900/80 hover:bg-neutral-800 text-white rounded-full backdrop-blur-md border border-white/10 transition"
              title="Flip camera"
            >
              <SwitchCamera className="w-5 h-5" />
            </button>

            <button
              onClick={triggerSnapshot}
              disabled={isProcessing}
              className="p-5 bg-white hover:bg-neutral-200 text-neutral-950 rounded-full transition-all shadow-[0_0_25px_rgba(255,255,255,0.4)] disabled:opacity-50 active:scale-95"
              title="Capture snapshot"
            >
              {isProcessing ? (
                <RefreshCw className="w-7 h-7 animate-spin text-neutral-950" />
              ) : (
                <Camera className="w-7 h-7" />
              )}
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-neutral-900/80 hover:bg-neutral-800 text-white rounded-full backdrop-blur-md border border-white/10 transition"
              title="Upload file instead"
            >
              <Upload className="w-5 h-5" />
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
}

