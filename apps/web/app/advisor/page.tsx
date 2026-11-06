'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  Sparkles,
  Scissors,
  Layers,
  Footprints,
  Eye,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  StyleAdvisorEngine,
  LifestyleAesthetic,
  CoordinatedEnsemble,
} from '@/lib/style-advisor-engine';
import { FaceShapeArchetype } from '@/lib/face-math-engine';

const ALL_ARCHETYPES: { name: FaceShapeArchetype; desc: string }[] = [
  {
    name: 'Oval Face',
    desc: 'Harmonious balance; supports versatile grooming from Chevron mustaches to refined stubble.',
  },
  {
    name: 'Square Face',
    desc: 'Angular jawline; benefits from softened beard contours, heavy stubble, or round eyewear.',
  },
  {
    name: 'Round Face',
    desc: 'Soft curves; enhanced by vertical elongation using Van Dyke, sharp Goatee, or boxed sideburns.',
  },
  {
    name: 'Oblong / Rectangular Face',
    desc: 'Extended vertical length; broadened by fuller horizontal mustaches and classic sideburns.',
  },
  {
    name: 'Heart & Diamond Face',
    desc: 'Narrow chin with prominent cheekbones; stabilized by chin strap volume and medium beards.',
  },
];

const ALL_AESTHETICS: LifestyleAesthetic[] = [
  'Streetwear',
  'Smart Casual',
  'Casual Weekend',
  'Formal / Business',
];

export default function StyleAdvisorPage() {
  const [selectedShape, setSelectedShape] = useState<FaceShapeArchetype>('Oval Face');
  const [selectedAesthetic, setSelectedAesthetic] = useState<LifestyleAesthetic>('Streetwear');

  const ensembles = StyleAdvisorEngine.getCuratedEnsembles(selectedShape, selectedAesthetic);

  return (
    <div className="flex flex-col gap-10 max-w-6xl mx-auto py-2">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-gradient-to-r from-neutral-900/90 via-neutral-950 to-neutral-950 p-8 sm:p-10 shadow-2xl">
        <div className="max-w-3xl flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-300 w-fit">
            <Compass className="w-3.5 h-3.5" />
            <span>SECTION 8: AI FASHION & STYLE ADVISORY ENGINE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Cross-Category <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-400">
              Fashion & Grooming Coordination
            </span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
            Synthesizing biometric facial proportions, personal coloration, and target lifestyle contexts to generate complete, high-harmony wardrobe ensembles.
          </p>
        </div>
      </section>

      {/* Step 1: Face Shape Archetype Selection */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>1. Geometric Face Shape Archetype</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Select or analyze your biometric contour to calibrate optimal beard lines and necklines.
            </p>
          </div>
          <Link
            href="/try-on/grooming"
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono font-semibold"
          >
            Detect via Live Camera →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {ALL_ARCHETYPES.map((shape) => {
            const isSelected = selectedShape === shape.name;
            return (
              <button
                key={shape.name}
                onClick={() => setSelectedShape(shape.name)}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                    : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-white mb-1">{shape.name}</h4>
                  <p className="text-[11px] text-neutral-400 line-clamp-3 leading-snug">{shape.desc}</p>
                </div>
                {isSelected && (
                  <span className="mt-3 text-[10px] font-mono text-cyan-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> ACTIVE
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Step 2: Lifestyle Aesthetic Context */}
      <section className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">2. Target Lifestyle Aesthetic</h3>
          <p className="text-xs text-neutral-400">
            Harmonizes grooming textures with outerwear, headwear, and sneaker silhouettes.
          </p>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {ALL_AESTHETICS.map((aes) => {
            const isSelected = selectedAesthetic === aes;
            return (
              <button
                key={aes}
                onClick={() => setSelectedAesthetic(aes)}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold shrink-0 transition-all border ${
                  isSelected
                    ? 'bg-fuchsia-500/20 border-fuchsia-400 text-white shadow-[0_0_15px_rgba(255,0,122,0.25)]'
                    : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {aes}
              </button>
            );
          })}
        </div>
      </section>

      {/* Step 3: Curated Coordinated Ensembles Grid */}
      <section className="flex flex-col gap-6">
        <div>
          <h3 className="text-lg font-bold text-white">3. Curated Multi-Category Ensembles</h3>
          <p className="text-xs text-neutral-400">
            Click any item to immediately launch its interactive 3D AR or Generative AI Try-On module.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {ensembles.map((ens) => (
            <div
              key={ens.id}
              className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-md flex flex-col gap-6 shadow-xl"
            >
              {/* Ensemble Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {ens.aesthetic}
                    </span>
                    <h3 className="text-xl font-black text-white">{ens.title}</h3>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 max-w-xl">{ens.description}</p>
                </div>

                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-950/80 border border-neutral-800">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase">Harmony Score</span>
                    <span className="text-sm font-black font-mono text-emerald-400">
                      {ens.harmonyScore}% Match
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Multi-Category Components Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Facial Grooming */}
                <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800/90 flex flex-col justify-between">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold flex items-center gap-1">
                        <Scissors className="w-3 h-3" /> Grooming
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">{ens.grooming.type}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{ens.grooming.style}</h4>
                    <p className="text-xs text-neutral-400 leading-relaxed">{ens.grooming.description}</p>
                  </div>

                  <Link
                    href={ens.grooming.tryOnUrl}
                    className="mt-4 inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 hover:text-black border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition"
                  >
                    <span>Try On Grooming</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* 2. Apparel Piece */}
                <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800/90 flex flex-col justify-between">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-fuchsia-400 uppercase font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Apparel
                      </span>
                      <span className="text-xs font-mono font-bold text-white">
                        ${ens.apparel.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full h-24 rounded-xl overflow-hidden bg-neutral-900 border border-white/5 my-1">
                      <img
                        src={ens.apparel.imageUrl}
                        alt={ens.apparel.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{ens.apparel.name}</h4>
                  </div>

                  <Link
                    href={ens.apparel.tryOnUrl}
                    className="mt-4 inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-fuchsia-500/10 hover:bg-fuchsia-500 hover:text-black border border-fuchsia-500/30 text-fuchsia-300 text-xs font-semibold transition"
                  >
                    <span>Try On Garment</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* 3. Eyewear & Headwear */}
                <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800/90 flex flex-col justify-between">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-amber-400 uppercase font-bold flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Accessory
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {ens.headwearEyewear.type}
                      </span>
                    </div>
                    <div className="w-full h-24 rounded-xl overflow-hidden bg-neutral-900 border border-white/5 my-1">
                      <img
                        src={ens.headwearEyewear.imageUrl}
                        alt={ens.headwearEyewear.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">
                      {ens.headwearEyewear.name}
                    </h4>
                    <p className="text-[11px] text-neutral-400 line-clamp-2">
                      {ens.headwearEyewear.description}
                    </p>
                  </div>

                  <Link
                    href={`/try-on/grooming?accessory=${encodeURIComponent(ens.headwearEyewear.name)}`}
                    className="mt-4 inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500 hover:text-black border border-amber-500/30 text-amber-300 text-xs font-semibold transition"
                  >
                    <span>View Accessory</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* 4. Footwear Pairing */}
                <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800/90 flex flex-col justify-between">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold flex items-center gap-1">
                        <Footprints className="w-3 h-3" /> Footwear
                      </span>
                      <span className="text-xs font-mono font-bold text-white">
                        ${ens.footwear.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full h-24 rounded-xl overflow-hidden bg-neutral-900 border border-white/5 my-1 flex items-center justify-center">
                      <Footprints className="w-10 h-10 text-cyan-400/60" />
                    </div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{ens.footwear.name}</h4>
                  </div>

                  <Link
                    href={ens.footwear.tryOnUrl}
                    className="mt-4 inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 hover:text-black border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition"
                  >
                    <span>AR Footwear Try-On</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

