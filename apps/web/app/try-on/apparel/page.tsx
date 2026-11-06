'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, RefreshCw, CheckCircle2, ShieldCheck, Info } from 'lucide-react';
import { CameraCapture } from '@/components/ai-garment/CameraCapture';
import { ScrubComparisonSlider } from '@/components/ai-garment/ScrubComparisonSlider';
import { InferenceProgress } from '@/components/ai-garment/InferenceProgress';
import { VariantSelector } from '@/components/catalog/VariantSelector';
import { ProductItem } from '@/components/catalog/ProductCard';
import { useVtonJob } from '@/hooks/useVtonJob';

const APPAREL_GARMENTS: ProductItem[] = [
  {
    sku: 'HOOD-001',
    name: 'Heavyweight Boxy Hoodie - Slate',
    category: 'Apparel',
    assetUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    price: 95.0,
    description: '450 GSM organic French Terry cotton with double-layer hood and drop shoulders.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80',
  },
  {
    sku: 'TEE-001',
    name: 'Cybernetic Graphic Tee - Obsidian',
    category: 'Apparel',
    assetUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    price: 48.0,
    description: '240 GSM combed jersey with screen-printed reflective studio graphics.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80',
  },
  {
    sku: 'JACKET-001',
    name: 'AURA Modular Tech Bomber - Olive',
    category: 'Apparel',
    assetUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    price: 240.0,
    description: 'Weather-resistant nylon shell with magnetic closure pockets and storm ribbing.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=400&q=80',
  },
];

export default function ApparelTryOnPage() {
  const [selectedSku, setSelectedSku] = useState<string>('HOOD-001');
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedPreviewUrl, setCapturedPreviewUrl] = useState<string | null>(null);

  const { status, outputUrl, error, progressPercent, submitTryOn, reset } = useVtonJob();

  const activeGarment =
    APPAREL_GARMENTS.find((g) => g.sku === selectedSku) || APPAREL_GARMENTS[0];

  const handleCapture = async (blob: Blob, previewUrl: string) => {
    setCapturedBlob(blob);
    setCapturedPreviewUrl(previewUrl);
    // Trigger virtual try-on inference via ASP.NET Core 9 Gateway
    await submitTryOn(blob, selectedSku);
  };

  const handleRetake = () => {
    reset();
    setCapturedBlob(null);
    setCapturedPreviewUrl(null);
  };

  const isProcessing = status === 'uploading' || status === 'starting' || status === 'processing';

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Studio Header Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Studio Catalog</span>
        </Link>

        {capturedPreviewUrl && (
          <button
            onClick={handleRetake}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-300 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retake Snapshot</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Stage Viewport */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {!capturedPreviewUrl ? (
            <CameraCapture onCapture={handleCapture} isProcessing={isProcessing} />
          ) : status === 'succeeded' && outputUrl ? (
            <ScrubComparisonSlider
              originalImage={capturedPreviewUrl}
              resultImage={outputUrl}
              garmentName={activeGarment.name}
            />
          ) : (
            <div className="relative w-full aspect-[3/4] max-w-md mx-auto bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl flex items-center justify-center">
              <img
                src={capturedPreviewUrl}
                alt="Captured Snapshot"
                className="w-full h-full object-cover filter brightness-90"
              />
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
                <InferenceProgress
                  status={status}
                  progressPercent={progressPercent}
                  error={error}
                  onRetry={() => capturedBlob && submitTryOn(capturedBlob, selectedSku)}
                />
              </div>
            </div>
          )}

          {/* Progress Card when running below slider */}
          {status !== 'idle' && status !== 'succeeded' && capturedPreviewUrl && (
            <div className="w-full max-w-md mx-auto">
              <InferenceProgress
                status={status}
                progressPercent={progressPercent}
                error={error}
                onRetry={() => capturedBlob && submitTryOn(capturedBlob, selectedSku)}
              />
            </div>
          )}
        </div>

        {/* Sidebar Controls & Garment Selector */}
        <div className="flex flex-col gap-6 p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-md">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-fuchsia-400">
              Generative Mode
            </span>
            <h2 className="text-xl font-black text-white mt-0.5">Apparel AI Studio</h2>
            <p className="text-xs text-neutral-400 mt-1">
              Asynchronous IDM-VTON diffusion pipeline warping textures to your torso with natural drape folds.
            </p>
          </div>

          {/* Garment Switcher */}
          <VariantSelector
            items={APPAREL_GARMENTS}
            selectedSku={selectedSku}
            onSelectSku={async (sku) => {
              setSelectedSku(sku);
              if (capturedBlob && status === 'succeeded') {
                // Re-run inference with new garment
                await submitTryOn(capturedBlob, sku);
              }
            }}
            title="Select Target Garment"
          />

          {/* Selected Garment Details */}
          <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-bold text-white">{activeGarment.name}</h4>
                <span className="text-xs font-mono text-neutral-400">{activeGarment.sku}</span>
              </div>
              <span className="text-base font-mono font-black text-fuchsia-400">
                ${activeGarment.price.toFixed(2)}
              </span>
            </div>

            {activeGarment.thumbnailUrl && (
              <div className="w-full h-32 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
                <img
                  src={activeGarment.thumbnailUrl}
                  alt={activeGarment.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="text-[11px] text-neutral-300 font-mono space-y-1.5 pt-2 border-t border-neutral-800">
              <div className="flex justify-between">
                <span className="text-neutral-500">Model Engine:</span>
                <span className="text-neutral-300">IDM-VTON (30 Steps)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Pipeline Gateway:</span>
                <span className="text-fuchsia-400">ASP.NET Core 9 Minimal API</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Rate Limiter:</span>
                <span className="text-emerald-400">Token Bucket Policy</span>
              </div>
            </div>
          </div>

          {/* Instructions Box */}
          <div className="p-4 rounded-xl bg-fuchsia-500/5 border border-fuchsia-500/20 text-xs text-neutral-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
            <span>
              Stand approximately 1.5 to 2 meters away from the camera. Align your head and shoulders inside the calibration guides before clicking capture.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
