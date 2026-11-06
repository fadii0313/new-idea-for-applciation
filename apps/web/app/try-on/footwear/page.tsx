'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Footprints, Info, Sliders, CheckCircle2 } from 'lucide-react';
import { useCameraStream } from '@/hooks/useCameraStream';
import { useFootTracker } from '@/hooks/useFootTracker';
import { CameraManager } from '@/components/camera/CameraManager';
import { ViewportControls } from '@/components/camera/ViewportControls';
import { CanvasContainer } from '@/components/ar-footwear/CanvasContainer';
import { VariantSelector } from '@/components/catalog/VariantSelector';
import { ProductItem } from '@/components/catalog/ProductCard';

const FOOTWEAR_MODELS: ProductItem[] = [
  {
    sku: 'SHOE-001',
    name: 'AURA HyperStrobe Runner V1',
    category: 'Footwear',
    assetUrl: '/models/shoes/runner_v1.glb',
    price: 189.99,
  },
  {
    sku: 'SHOE-002',
    name: 'AURA Street Sneaker Low',
    category: 'Footwear',
    assetUrl: '/models/shoes/street_sneaker.glb',
    price: 149.5,
  },
  {
    sku: 'SHOE-003',
    name: 'AURA Apex Horizon Trail',
    category: 'Footwear',
    assetUrl: '/models/shoes/runner_v1.glb',
    price: 210.0,
  },
];

export default function FootwearTryOnPage() {
  const camera = useCameraStream('environment');
  const [selectedSku, setSelectedSku] = useState<string>('SHOE-001');
  const [showCalibration, setShowCalibration] = useState<boolean>(true);
  const [isDemoPoseActive, setIsDemoPoseActive] = useState<boolean>(false);

  // Foot tracking pipeline
  const { landmarks, fps, isTracking } = useFootTracker({
    videoRef: camera.videoRef,
    isActive: camera.isActive,
  });

  // Active Model path
  const activeProduct = FOOTWEAR_MODELS.find((m) => m.sku === selectedSku) || FOOTWEAR_MODELS[0];

  // Synthesize demo pose landmarks when user toggles demo pose for desk evaluation
  const effectiveLandmarks = isDemoPoseActive
    ? {
        leftAnkle: { x: 0.42, y: 0.62, z: 0.05, visibility: 0.95 },
        leftHeel: { x: 0.41, y: 0.72, z: 0.08, visibility: 0.95 },
        leftToe: { x: 0.43, y: 0.79, z: -0.05, visibility: 0.95 },
        rightAnkle: { x: 0.58, y: 0.62, z: 0.05, visibility: 0.95 },
        rightHeel: { x: 0.59, y: 0.72, z: 0.08, visibility: 0.95 },
        rightToe: { x: 0.57, y: 0.79, z: -0.05, visibility: 0.95 },
        isDetected: true,
        timestamp: Date.now(),
      }
    : landmarks;

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

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDemoPoseActive((prev) => !prev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition ${
              isDemoPoseActive
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
            }`}
          >
            {isDemoPoseActive ? '● SIMULATED FOOT POSE (ON)' : '○ SIMULATED POSE (OFF)'}
          </button>
        </div>
      </div>

      {/* Main AR Studio Viewport Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative aspect-[3/4] sm:aspect-video rounded-3xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-2xl">
          <CameraManager camera={camera}>
            {/* Viewport HUD */}
            <ViewportControls
              fps={fps}
              isTracking={effectiveLandmarks.isDetected}
              facingMode={camera.facingMode}
              onToggleFacing={camera.toggleFacingMode}
              showCalibration={showCalibration}
              onToggleCalibration={() => setShowCalibration((prev) => !prev)}
            />

            {/* Calibration Target Overlay */}
            {showCalibration && (
              <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-end p-8">
                <div className="w-full max-w-xs mx-auto border-2 border-dashed border-cyan-400/30 rounded-2xl p-4 flex flex-col items-center text-center">
                  <Footprints className="w-8 h-8 text-cyan-400/40 mb-1" />
                  <span className="text-[11px] font-mono text-cyan-300">
                    ALIGN FEET WITHIN LOWER THIRD VIEWPORT
                  </span>
                </div>
              </div>
            )}

            {/* Three.js AR Scene Overlay */}
            <CanvasContainer
              landmarks={effectiveLandmarks}
              modelPath={activeProduct.assetUrl}
            />
          </CameraManager>
        </div>

        {/* Model Selector & Telemetry Sidebar */}
        <div className="flex flex-col gap-6 p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-md">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">
              Active Session
            </span>
            <h2 className="text-xl font-black text-white mt-0.5">Footwear AR Studio</h2>
            <p className="text-xs text-neutral-400 mt-1">
              Real-time 60 FPS sub-millimeter sneaker alignment with depth occlusion and SLERP stabilization.
            </p>
          </div>

          {/* Model Switcher */}
          <VariantSelector
            items={FOOTWEAR_MODELS}
            selectedSku={selectedSku}
            onSelectSku={setSelectedSku}
            title="Available Sneaker Models"
          />

          {/* Selected Model Details */}
          <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-bold text-white">{activeProduct.name}</h4>
                <span className="text-xs font-mono text-neutral-400">{activeProduct.sku}</span>
              </div>
              <span className="text-base font-mono font-black text-cyan-400">
                ${activeProduct.price.toFixed(2)}
              </span>
            </div>

            <div className="text-[11px] text-neutral-300 font-mono space-y-1.5 pt-2 border-t border-neutral-800">
              <div className="flex justify-between">
                <span className="text-neutral-500">Occlusion Mode:</span>
                <span className="text-emerald-400">Dynamic Depth Cylinder</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Smoothing Factor:</span>
                <span className="text-neutral-300">SLERP α = 0.35</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Keypoints Tracked:</span>
                <span className="text-cyan-400">27-32 (Ankles, Heels, Toes)</span>
              </div>
            </div>
          </div>

          {/* Guidance Info Box */}
          <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-neutral-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              Point your camera at your feet. Move naturally — the orthonormal rotation basis aligns the sole instantly with zero lag.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
