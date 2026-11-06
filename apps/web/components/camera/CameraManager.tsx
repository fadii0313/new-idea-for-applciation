'use client';

import React from 'react';
import { Camera, AlertCircle, RefreshCw } from 'lucide-react';
import { UseCameraStreamReturn } from '@/hooks/useCameraStream';

interface CameraManagerProps {
  camera: UseCameraStreamReturn;
  children?: React.ReactNode;
}

export function CameraManager({ camera, children }: CameraManagerProps) {
  const { videoRef, isActive, error, startCamera, facingMode } = camera;

  return (
    <div className="relative w-full h-full min-h-[500px] bg-neutral-950 rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl flex items-center justify-center">
      {/* Background Live Camera Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover ${
          facingMode === 'user' ? '-scale-x-100' : ''
        }`}
      />

      {/* Camera Inactive State */}
      {!isActive && !error && (
        <div className="relative z-10 flex flex-col items-center gap-4 text-center p-6 max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.2)]">
            <Camera className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AR Footwear Tracking</h3>
            <p className="text-xs text-neutral-400 mt-1">
              Grant camera access to align 3D sneakers to your feet in real-time with sub-millimeter precision.
            </p>
          </div>
          <button
            onClick={startCamera}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-full font-semibold transition shadow-[0_0_20px_rgba(0,240,255,0.3)] text-sm"
          >
            Start AR Camera
          </button>
        </div>
      )}

      {/* Camera Error State */}
      {error && !isActive && (
        <div className="relative z-10 flex flex-col items-center gap-3 text-center p-6 max-w-md bg-neutral-900/90 border border-red-500/30 rounded-2xl backdrop-blur-md">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <h4 className="text-sm font-bold text-white">Camera Permission Needed</h4>
          <p className="text-xs text-neutral-400">{error}</p>
          <button
            onClick={startCamera}
            className="mt-2 px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg border border-neutral-700 transition"
          >
            Retry Permission
          </button>
        </div>
      )}

      {/* Children Overlays (Canvas, HUD, Guides) */}
      {isActive && children}
    </div>
  );
}
