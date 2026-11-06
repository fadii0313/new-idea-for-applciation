'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Sparkles, Image as ImageIcon } from 'lucide-react';

interface ScrubComparisonSliderProps {
  originalImage: string;
  resultImage: string;
  garmentName?: string;
}

export function ScrubComparisonSlider({
  originalImage,
  resultImage,
  garmentName = 'Selected Garment',
}: ScrubComparisonSliderProps) {
  const [sliderPos, setSliderPos] = useState<number>(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPos = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (xPos / rect.width) * 100));
    setSliderPos(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging.current && e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      handleMove(e.clientX);
    }
  };

  // Global mouseup listener so dragging outside the element cancels cleanly
  useEffect(() => {
    const handleGlobalUp = () => {
      isDragging.current = false;
    };
    window.addEventListener('mouseup', handleGlobalUp);
    window.addEventListener('touchend', handleGlobalUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('touchend', handleGlobalUp);
    };
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto gap-3">
      <div
        ref={containerRef}
        onMouseDown={(e) => {
          isDragging.current = true;
          handleMove(e.clientX);
        }}
        onMouseMove={handleMouseMove}
        onTouchStart={(e) => {
          isDragging.current = true;
          if (e.touches.length > 0) handleMove(e.touches[0].clientX);
        }}
        onTouchMove={handleTouchMove}
        className="relative w-full aspect-[3/4] select-none overflow-hidden rounded-2xl border border-neutral-800 shadow-2xl cursor-ew-resize bg-neutral-950"
      >
        {/* Layer 1: Transformed AI Try-On Result (Full Background) */}
        <img
          src={resultImage}
          alt={`AURA Try-On Synthesis - ${garmentName}`}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* AI Result Label Tag */}
        <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-neutral-900/80 backdrop-blur-md border border-cyan-500/30 rounded-full flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>AI FIT ({garmentName})</span>
        </div>

        {/* Layer 2: Original User Photo (Clipped Overlay) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none border-r border-white/60"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={originalImage}
            alt="Original Snapshot"
            className="absolute inset-0 h-full object-cover max-w-none pointer-events-none"
            style={{ width: containerRef.current?.clientWidth || '100%' }}
          />

          {/* Original Label Tag */}
          <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-neutral-900/80 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-1.5 text-xs font-medium text-neutral-300">
            <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />
            <span>ORIGINAL</span>
          </div>
        </div>

        {/* Vertical Divider Line & Draggable Scrub Knob */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none shadow-[0_0_12px_rgba(255,255,255,0.7)]"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white shadow-xl flex items-center justify-center text-xs font-bold text-neutral-900 border-2 border-neutral-950 transition-transform active:scale-110">
            ↔
          </div>
        </div>
      </div>

      <p className="text-xs text-neutral-400 tracking-wide">
        Drag or swipe slider across image to compare original vs. virtual try-on
      </p>
    </div>
  );
}
