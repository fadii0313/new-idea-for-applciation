'use client';

import React from 'react';
import { ProductItem } from './ProductCard';

interface VariantSelectorProps {
  items: ProductItem[];
  selectedSku: string;
  onSelectSku: (sku: string) => void;
  title?: string;
}

export function VariantSelector({
  items,
  selectedSku,
  onSelectSku,
  title = 'Select Model',
}: VariantSelectorProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase font-mono tracking-wider text-neutral-400 font-semibold">
          {title}
        </span>
        <span className="text-[11px] text-cyan-400 font-mono">
          {items.find((i) => i.sku === selectedSku)?.name || selectedSku}
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {items.map((item) => {
          const isSelected = item.sku === selectedSku;
          return (
            <button
              key={item.sku}
              onClick={() => onSelectSku(item.sku)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium shrink-0 transition-all border ${
                isSelected
                  ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                  : 'bg-neutral-900/80 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isSelected ? 'bg-cyan-400' : 'bg-neutral-600'
                }`}
              />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
