'use client';

import React from 'react';
import { Scissors, Sparkles, Palette } from 'lucide-react';

export const MUSTACHE_STYLES = [
  'Chevron',
  'Pencil',
  'Handlebar',
  'Horseshoe',
  'English',
  'None',
];

export const BEARD_STYLES = [
  'Short Boxed Beard',
  'Heavy Stubble',
  'Balbo',
  'Goatee',
  'Van Dyke',
  'None',
];

export const HAIR_COLORS = [
  { name: 'Dark Brown', hex: '#2B1A13' },
  { name: 'Jet Black', hex: '#111116' },
  { name: 'Honey Blonde', hex: '#A87948' },
  { name: 'Silver Gray', hex: '#888899' },
  { name: 'Auburn', hex: '#4A1D13' },
];

interface GroomingStyleSelectorProps {
  selectedMustache: string;
  onSelectMustache: (style: string) => void;
  selectedBeard: string;
  onSelectBeard: (style: string) => void;
  selectedColor: string;
  onSelectColor: (hex: string) => void;
}

export function GroomingStyleSelector({
  selectedMustache,
  onSelectMustache,
  selectedBeard,
  onSelectBeard,
  selectedColor,
  onSelectColor,
}: GroomingStyleSelectorProps) {
  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Mustache Style Row */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase font-mono tracking-wider text-neutral-400 font-semibold flex items-center gap-1.5">
            <Scissors className="w-3 h-3 text-cyan-400" />
            Mustache Style (Section 7.1)
          </span>
          <span className="text-xs font-mono text-cyan-400">{selectedMustache}</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {MUSTACHE_STYLES.map((style) => {
            const isSelected = selectedMustache === style;
            return (
              <button
                key={style}
                onClick={() => onSelectMustache(style)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all border ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                    : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                }`}
              >
                {style}
              </button>
            );
          })}
        </div>
      </div>

      {/* Beard Style Row */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase font-mono tracking-wider text-neutral-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-purple-400" />
            Volumetric Beard (Section 7.1)
          </span>
          <span className="text-xs font-mono text-purple-400">{selectedBeard}</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {BEARD_STYLES.map((style) => {
            const isSelected = selectedBeard === style;
            return (
              <button
                key={style}
                onClick={() => onSelectBeard(style)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all border ${
                  isSelected
                    ? 'bg-purple-500/20 border-purple-400 text-white shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                    : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                }`}
              >
                {style}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hair Pigment Row */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase font-mono tracking-wider text-neutral-400 font-semibold flex items-center gap-1.5">
            <Palette className="w-3 h-3 text-fuchsia-400" />
            Follicle Pigment
          </span>
        </div>

        <div className="flex items-center gap-3">
          {HAIR_COLORS.map((c) => {
            const isSelected = selectedColor === c.hex;
            return (
              <button
                key={c.hex}
                onClick={() => onSelectColor(c.hex)}
                className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                  isSelected
                    ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                    : 'border-neutral-700 hover:border-neutral-500'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
