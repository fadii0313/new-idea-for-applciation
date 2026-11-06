'use client';

import React from 'react';

interface TorsoGuideOverlayProps {
  isAligned?: boolean;
}

export function TorsoGuideOverlay({ isAligned = false }: TorsoGuideOverlayProps) {
  const strokeColor = isAligned ? 'stroke-emerald-400' : 'stroke-cyan-400';
  const glowClass = isAligned ? 'drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]';

  return (
    <div className={`absolute inset-0 pointer-events-none transition-colors duration-500 ${glowClass}`}>
      <svg
        viewBox="0 0 400 533"
        preserveAspectRatio="xMidYMid meet"
        className={`w-full h-full opacity-60 ${strokeColor} stroke-[1.75] fill-none`}
      >
        {/* Head & Neck Ellipse */}
        <ellipse cx="200" cy="95" rx="38" ry="48" strokeDasharray="5 5" />

        {/* Neck collar base */}
        <path d="M 185 142 C 195 148, 205 148, 215 142" strokeDasharray="3 3" />

        {/* Shoulder and Torso Target Guide */}
        <path
          d="M 115 175 C 145 158, 255 158, 285 175 L 305 390 C 265 415, 135 415, 95 390 Z"
          strokeDasharray="6 6"
        />

        {/* Center Vertical Axis */}
        <line x1="200" y1="145" x2="200" y2="400" strokeDasharray="2 6" className="opacity-40" />

        {/* Centering Target Crosshair at Chest Instep */}
        <line x1="200" y1="230" x2="200" y2="270" />
        <line x1="180" y1="250" x2="220" y2="250" />
        <circle cx="200" cy="250" r="14" strokeDasharray="3 3" />

        {/* Alignment corner brackets */}
        <path d="M 25 35 L 25 25 L 35 25" className="stroke-white opacity-40 stroke-2" />
        <path d="M 375 35 L 375 25 L 365 25" className="stroke-white opacity-40 stroke-2" />
        <path d="M 25 500 L 25 510 L 35 510" className="stroke-white opacity-40 stroke-2" />
        <path d="M 375 500 L 375 510 L 365 510" className="stroke-white opacity-40 stroke-2" />
      </svg>

      {/* Instructional Badge */}
      <div className="absolute top-4 inset-x-0 flex justify-center">
        <span className="px-3.5 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-xs font-medium text-cyan-300 tracking-wide">
          ALIGN TORSO INSIDE CALIBRATION GUIDES
        </span>
      </div>
    </div>
  );
}
