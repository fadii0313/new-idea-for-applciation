'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Footprints, Sparkles, ArrowRight, ShieldCheck, Cpu, Eye, Zap, Layers } from 'lucide-react';
import { ProductCard, ProductItem } from '@/components/catalog/ProductCard';

const FALLBACK_PRODUCTS: ProductItem[] = [
  {
    sku: 'SHOE-001',
    name: 'AURA HyperStrobe Runner V1',
    category: 'Footwear',
    assetUrl: '/models/shoes/runner_v1.glb',
    price: 189.99,
    description: 'Ultra-responsive aerogel sole with adaptive carbon plate and luminescent mesh upper.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
  },
  {
    sku: 'SHOE-002',
    name: 'AURA Street Sneaker Low',
    category: 'Footwear',
    assetUrl: '/models/shoes/street_sneaker.glb',
    price: 149.5,
    description: 'Minimalist full-grain nappa leather silhouette with sculpted rubber cupsole.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
  },
  {
    sku: 'HOOD-001',
    name: 'Heavyweight Boxy Hoodie - Slate',
    category: 'Apparel',
    assetUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    price: 95.0,
    description: '450 GSM organic French Terry cotton with double-layer hood and drop shoulders.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
  },
  {
    sku: 'TEE-001',
    name: 'Cybernetic Graphic Tee - Obsidian',
    category: 'Apparel',
    assetUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    price: 48.0,
    description: '240 GSM combed jersey with screen-printed reflective studio graphics.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
  },
  {
    sku: 'JACKET-001',
    name: 'AURA Modular Tech Bomber - Olive',
    category: 'Apparel',
    assetUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    price: 240.0,
    description: 'Weather-resistant nylon shell with magnetic closure pockets and storm ribbing.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80',
  },
];

export default function HomePage() {
  const [products, setProducts] = useState<ProductItem[]>(FALLBACK_PRODUCTS);
  const [filter, setFilter] = useState<'All' | 'Footwear' | 'Apparel'>('All');

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:5000';
    fetch(`${apiBase}/api/catalog/items`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      })
      .catch((err) => {
        console.warn('Backend catalog offline, using built-in catalog data:', err);
      });
  }, []);

  const filteredProducts = products.filter(
    (p) => filter === 'All' || p.category.toLowerCase() === filter.toLowerCase()
  );

  return (
    <div className="flex flex-col gap-12 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-gradient-to-b from-neutral-900/80 via-neutral-950/90 to-neutral-950 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-fuchsia-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-700 w-fit text-xs font-mono text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>AURA STUDIO ARCHITECTURE 2026</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Next-Gen Dual-Mode <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-fuchsia-400">
              Virtual Try-On Studio
            </span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl">
            Experience sub-millimeter client-side <strong>Footwear AR</strong> powered by Three.js & MediaPipe Pose,
            combined with photo-realistic server-side <strong>Apparel AI</strong> powered by IDM-VTON latent diffusion.
          </p>

          {/* Quick Mode Entry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <Link
              href="/try-on/footwear"
              className="group p-5 rounded-2xl bg-neutral-900/60 border border-cyan-500/30 hover:border-cyan-400 transition-all shadow-[0_0_20px_rgba(0,240,255,0.1)] hover:shadow-[0_0_30px_rgba(0,240,255,0.25)] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Footprints className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 text-neutral-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Mode A: Footwear AR Studio
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Real-time foot tracking (60 FPS), orthonormal basis rotation, SLERP dampening, and invisible depth occlusion.
                </p>
              </div>
            </Link>

            <Link
              href="/try-on/apparel"
              className="group p-5 rounded-2xl bg-neutral-900/60 border border-fuchsia-500/30 hover:border-fuchsia-400 transition-all shadow-[0_0_20px_rgba(255,0,122,0.1)] hover:shadow-[0_0_30px_rgba(255,0,122,0.25)] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
                  <Sparkles className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 text-neutral-500 group-hover:text-fuchsia-400 group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-fuchsia-300 transition-colors">
                  Mode B: Apparel AI Studio
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Torso alignment guide, instant snapshot capture, asynchronous IDM-VTON diffusion, and interactive scrub slider.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Product Catalog Grid */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Studio Catalog</h2>
            <p className="text-xs text-neutral-400 mt-0.5 font-mono">
              SELECT ANY ITEM TO ENTER VIRTUAL TRY-ON MODE
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 p-1 bg-neutral-900/90 border border-neutral-800 rounded-xl w-fit">
            {(['All', 'Footwear', 'Apparel'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filter === cat
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filteredProducts.map((prod) => (
            <ProductCard key={prod.sku} product={prod} />
          ))}
        </div>
      </section>

      {/* Engineering Specs & Mathematics Breakdown */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-md flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-white">Spatial Orthonormal Basis</h4>
          <p className="text-xs text-neutral-400 leading-relaxed font-mono">
            V_fwd = Norm(P_toe - P_heel)<br />
            V_up = Norm((P_ankle - P_heel) × V_fwd)<br />
            V_lat = V_fwd × V_up<br />
            Quaternions smoothed via SLERP (α = 0.35)
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-md flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-white">Depth Occlusion & Shadow</h4>
          <p className="text-xs text-neutral-400 leading-relaxed font-mono">
            Invisible depth-only cylinder mesh (colorWrite: false, depthWrite: true) clips trousers naturally.
            ShadowMaterial plane catches ground contact.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-md flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-white">IDM-VTON Generative Diffusion</h4>
          <p className="text-xs text-neutral-400 leading-relaxed font-mono">
            30-step latent diffusion try-on conditioned on human snapshot and garment image. Async job queue with Redis cache & token rate limiting.
          </p>
        </div>
      </section>
    </div>
  );
}
