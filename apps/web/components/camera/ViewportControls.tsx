'use client';

import React from 'react';
import { SwitchCamera, Activity, Sliders, CheckCircle2, AlertCircle } from 'lucide-react';
import { CameraFacingMode } from '@/hooks/useCameraStream';

interface ViewportControlsProps {
  fps: number;
  isTracking: boolean;
  facingMode: CameraFacingMode;
  onToggleFacing: () => void;
  showCalibration?: boolean;
  onToggleCalibration?: () => void;
  title?: string;
}

export function ViewportControls({
  fps,
  isTracking,
  facingMode,
  onToggleFacing,
  showCalibration,
  onToggleCalibration,
  title = 'AURA Studio',
}: ViewportControlsProps) {
  return (
    <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between pointer-events-none">
      {/* Tracking Status Pill */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-full shadow-lg pointer-events-auto">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isTracking ? 'bg-cyan-400 animate-pulse' : 'bg-neutral-600'
          }`}
        />
        <span className="text-xs font-medium text-neutral-200">
          {isTracking ? 'FOOT TRACKED (SUB-MM)' : 'SEARCHING FOR FEET...'}
        </span>
        <span className="text-[10px] font-mono text-cyan-400 border-l border-neutral-700 pl-2">
          {fps} FPS
        </span>
      </div>

      {/* Camera Action Buttons */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {onToggleCalibration && (
          <button
            onClick={onToggleCalibration}
            className={`p-2 rounded-full border transition backdrop-blur-md ${
              showCalibration
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                : 'bg-neutral-900/80 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
            }`}
            title="Toggle Calibration Grid"
          >
            <Sliders className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onToggleFacing}
          className="p-2 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 rounded-full transition backdrop-blur-md"
          title={`Switch Camera (Currently ${facingMode})`}
        >
          <SwitchCamera className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
