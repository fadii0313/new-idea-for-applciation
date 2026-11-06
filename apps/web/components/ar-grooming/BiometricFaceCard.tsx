'use client';

import React from 'react';
import { ScanFace, Sparkles, Compass, CheckCircle2 } from 'lucide-react';
import { BiometricFacialRatios } from '@/lib/face-math-engine';

interface BiometricFaceCardProps {
  biometrics: BiometricFacialRatios;
  isTracking: boolean;
}

export function BiometricFaceCard({ biometrics, isTracking }: BiometricFaceCardProps) {
  const getArchetypeColor = () => {
    switch (biometrics.archetype) {
      case 'Oval Face':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'Square Face':
        return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
      case 'Round Face':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'Oblong / Rectangular Face':
        return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
      case 'Heart & Diamond Face':
        return 'text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-500/10';
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-neutral-950/90 border border-neutral-800 shadow-xl flex flex-col gap-4">
      {/* Archetype Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScanFace className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 font-semibold">
            Biometric Classification
          </span>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border tracking-wide ${getArchetypeColor()}`}
        >
          {biometrics.archetype}
        </span>
      </div>

      {/* Metric Ratios Grid */}
      <div className="grid grid-cols-3 gap-2 py-2 border-y border-neutral-800/80">
        <div className="flex flex-col items-center text-center p-2 rounded-xl bg-neutral-900/60 border border-white/5">
          <span className="text-[10px] text-neutral-400 uppercase font-mono">Length / Width</span>
          <span className="text-sm font-extrabold text-white font-mono mt-0.5">
            {biometrics.lengthToWidthRatio.toFixed(2)}
          </span>
        </div>

        <div className="flex flex-col items-center text-center p-2 rounded-xl bg-neutral-900/60 border border-white/5">
          <span className="text-[10px] text-neutral-400 uppercase font-mono">Cheek / Jaw</span>
          <span className="text-sm font-extrabold text-cyan-400 font-mono mt-0.5">
            {biometrics.cheekToJawRatio.toFixed(2)}
          </span>
        </div>

        <div className="flex flex-col items-center text-center p-2 rounded-xl bg-neutral-900/60 border border-white/5">
          <span className="text-[10px] text-neutral-400 uppercase font-mono">Forehead / Jaw</span>
          <span className="text-sm font-extrabold text-purple-400 font-mono mt-0.5">
            {biometrics.foreheadToJawRatio.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Tailored Barber Advice */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>Section 8.1 Grooming Strategy</span>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed font-sans">
          {biometrics.recommendedGroomingStrategy}
        </p>
      </div>
    </div>
  );
}
