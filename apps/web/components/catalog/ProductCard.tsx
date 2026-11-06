'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Footprints, ArrowRight } from 'lucide-react';

export interface ProductItem {
  sku: string;
  name: string;
  category: 'Footwear' | 'Apparel';
  assetUrl: string;
  price: number;
  description?: string;
  thumbnailUrl?: string;
}

interface ProductCardProps {
  product: ProductItem;
  onSelect?: (product: ProductItem) => void;
  isSelected?: boolean;
}

export function ProductCard({ product, onSelect, isSelected = false }: ProductCardProps) {
  const isFootwear = product.category === 'Footwear';
  const tryOnHref = isFootwear
    ? `/try-on/footwear?sku=${product.sku}`
    : `/try-on/apparel?sku=${product.sku}`;

  return (
    <div
      onClick={() => onSelect && onSelect(product)}
      className={`group relative flex flex-col justify-between rounded-2xl bg-neutral-900/60 border p-4 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
        isSelected
          ? 'border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.25)] bg-neutral-900/90'
          : 'border-neutral-800 hover:border-neutral-700'
      }`}
    >
      {/* Category Badge */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase ${
            isFootwear
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
              : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
          }`}
        >
          {isFootwear ? <Footprints className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
          {product.category}
        </span>
        <span className="text-xs font-mono text-neutral-400">{product.sku}</span>
      </div>

      {/* Image Preview / Placeholder */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-neutral-950 mb-4 flex items-center justify-center border border-white/5">
        {product.thumbnailUrl && product.thumbnailUrl.startsWith('http') ? (
          <img
            src={product.thumbnailUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-neutral-600 gap-1">
            {isFootwear ? (
              <Footprints className="w-8 h-8 text-cyan-400/60" />
            ) : (
              <Sparkles className="w-8 h-8 text-purple-400/60" />
            )}
            <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
              3D GLTF Model
            </span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="flex flex-col gap-1 mb-4">
        <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-xs text-neutral-400 line-clamp-2">{product.description}</p>
        )}
      </div>

      {/* Price & Action Link */}
      <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
        <span className="text-base font-extrabold text-white font-mono">
          ${product.price.toFixed(2)}
        </span>

        <Link
          href={tryOnHref}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-neutral-800 hover:bg-cyan-500 hover:text-neutral-950 transition-colors"
        >
          <span>Try On</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
