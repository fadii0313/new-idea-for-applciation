'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Scissors, Sparkles, RefreshCw, Camera, Upload, Layers } from 'lucide-react';
import { useCameraStream } from '@/hooks/useCameraStream';
import { useFaceTracker } from '@/hooks/useFaceTracker';
import { useGroomingInpaint } from '@/hooks/useGroomingInpaint';
import { CameraManager } from '@/components/camera/CameraManager';
import { ViewportControls } from '@/components/camera/ViewportControls';
import { FaceCanvasContainer } from '@/components/ar-grooming/FaceCanvasContainer';
import { BiometricFaceCard } from '@/components/ar-grooming/BiometricFaceCard';
import { GroomingStyleSelector } from '@/components/ar-grooming/GroomingStyleSelector';
import { ScrubComparisonSlider } from '@/components/ai-garment/ScrubComparisonSlider';
import { InferenceProgress } from '@/components/ai-garment/InferenceProgress';

export default function GroomingTryOnPage() {
  const camera = useCameraStream('user');
  const [mustacheStyle, setMustacheStyle] = useState<string>('Chevron');
  const [beardStyle, setBeardStyle] = useState<string>('Short Boxed Beard');
  const [hairColor, setHairColor] = useState<string>('#2B1A13');
  const [isDemoFaceActive, setIsDemoFaceActive] = useState<boolean>(false);

  // Live Face Tracking Pipeline
  const { landmarks, biometrics, fps, isTracking } = useFaceTracker({
    videoRef: camera.videoRef,
    isActive: camera.isActive,
  });

  // Photorealistic diffusion inpainting pipeline (Section 7.2)
  const {
    status: inpaintStatus,
    outputUrl: inpaintOutputUrl,
    error: inpaintError,
    progressPercent: inpaintProgress,
    submitGroomingInpaint,
    reset: resetInpaint,
  } = useGroomingInpaint();

  const [inpaintOriginalUrl, setInpaintOriginalUrl] = useState<string | null>(null);

  // Desk testing simulated face landmarks
  const effectiveLandmarks = isDemoFaceActive
    ? {
        landmarks: new Array(468).fill({ x: 0.5, y: 0.5, z: 0 }),
        upperLipTop: { x: 0.5, y: 0.56, z: -0.02 },
        philtrumBottom: { x: 0.5, y: 0.535, z: -0.015 },
        lipLeft: { x: 0.44, y: 0.565, z: -0.01 },
        lipRight: { x: 0.56, y: 0.565, z: -0.01 },
        subnasale: { x: 0.5, y: 0.51, z: 0.02 },
        chinTip: { x: 0.5, y: 0.69, z: -0.01 },
        jawLeft: { x: 0.38, y: 0.62, z: 0.04 },
        jawRight: { x: 0.62, y: 0.62, z: 0.04 },
        foreheadTop: { x: 0.5, y: 0.28, z: 0.02 },
        cheekLeft: { x: 0.36, y: 0.48, z: 0.03 },
        cheekRight: { x: 0.64, y: 0.48, z: 0.03 },
        isDetected: true,
        timestamp: Date.now(),
      }
    : landmarks;

  const triggerPhotorealisticInpaint = async (presetName: string) => {
    // Generate snapshot from video or synthetic canvas
    let blob: Blob;
    if (camera.videoRef.current && camera.isActive) {
      const canvas = document.createElement('canvas');
      canvas.width = camera.videoRef.current.videoWidth || 1080;
      canvas.height = camera.videoRef.current.videoHeight || 1440;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(camera.videoRef.current, 0, 0, canvas.width, canvas.height);
      }
      blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.95));
    } else {
      // Demo placeholder blob
      const res = await fetch('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80');
      blob = await res.blob();
    }

    const preview = URL.createObjectURL(blob);
    setInpaintOriginalUrl(preview);
    await submitGroomingInpaint(blob, 'facial_hair', presetName);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
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
            onClick={() => setIsDemoFaceActive((prev) => !prev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition ${
              isDemoFaceActive
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
            }`}
          >
            {isDemoFaceActive ? '● SIMULATED FACE (ON)' : '○ SIMULATED FACE (OFF)'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main AR Stage Viewport */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="relative aspect-[3/4] sm:aspect-video rounded-3xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-2xl">
            <CameraManager camera={camera}>
              <ViewportControls
                fps={fps}
                isTracking={effectiveLandmarks.isDetected}
                facingMode={camera.facingMode}
                onToggleFacing={camera.toggleFacingMode}
                title="AURA Grooming AR"
              />

              {/* Real-time Three.js Hair & Grooming Scene */}
              <FaceCanvasContainer
                landmarks={effectiveLandmarks}
                mustacheStyle={mustacheStyle === 'None' ? null : mustacheStyle}
                beardStyle={beardStyle === 'None' ? null : beardStyle}
                hairColor={hairColor}
              />
            </CameraManager>
          </div>

          {/* Section 7.2: Photorealistic Diffusion Inpainting Panel */}
          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-md flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-fuchsia-400" />
                <h4 className="text-sm font-bold text-white">
                  Section 7.2: Photorealistic Latent Inpainting
                </h4>
              </div>
              {inpaintOriginalUrl && (
                <button
                  onClick={() => {
                    resetInpaint();
                    setInpaintOriginalUrl(null);
                  }}
                  className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset Inpaint
                </button>
              )}
            </div>
            <p className="text-xs text-neutral-400">
              Synthesize dermal skin pores and individual follicle growth angles with FLUX.1-Fill inpainting.
            </p>

            {/* Inpainting Preset Quick Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {[
                { label: 'Clean Shave (Dermal Smoothing)', preset: 'clean_shave' },
                { label: '1-Day Shadow Stubble', preset: '1_day_stubble' },
                { label: '3-Day Heavy Stubble', preset: '3_day_stubble' },
                { label: 'Razor Edge Fade Taper', preset: 'razor_fade' },
              ].map((btn) => (
                <button
                  key={btn.preset}
                  onClick={() => triggerPhotorealisticInpaint(btn.preset)}
                  disabled={inpaintStatus === 'processing' || inpaintStatus === 'starting'}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition disabled:opacity-50"
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Inpainting Result Scrub Slider or Progress Tracker */}
            {inpaintStatus === 'succeeded' && inpaintOutputUrl && inpaintOriginalUrl && (
              <div className="pt-3">
                <ScrubComparisonSlider
                  originalImage={inpaintOriginalUrl}
                  resultImage={inpaintOutputUrl}
                  garmentName="Grooming Inpaint"
                />
              </div>
            )}

            {inpaintStatus !== 'idle' && inpaintStatus !== 'succeeded' && (
              <div className="pt-3">
                <InferenceProgress
                  status={inpaintStatus}
                  progressPercent={inpaintProgress}
                  error={inpaintError}
                  onRetry={() => inpaintOriginalUrl && triggerPhotorealisticInpaint('3_day_stubble')}
                />
              </div>
            )}
          </div>
        </div>

        {/* Biometrics & Grooming Customizer Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Section 8.1 Biometric Face Card */}
          <BiometricFaceCard
            biometrics={biometrics}
            isTracking={effectiveLandmarks.isDetected}
          />

          {/* Section 7.1 Grooming Style Selector */}
          <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-md flex flex-col gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">
                Studio Customizer
              </span>
              <h3 className="text-lg font-black text-white mt-0.5">3D Hair & Beard Mesh</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Marschner strand shading with anisotropic specular highlights.
              </p>
            </div>

            <GroomingStyleSelector
              selectedMustache={mustacheStyle}
              onSelectMustache={setMustacheStyle}
              selectedBeard={beardStyle}
              onSelectBeard={setBeardStyle}
              selectedColor={hairColor}
              onSelectColor={setHairColor}
            />

            {/* Quick Link to Advisor */}
            <div className="pt-4 border-t border-neutral-800 flex justify-between items-center">
              <span className="text-xs text-neutral-400">Want complete styling?</span>
              <Link
                href={`/advisor?shape=${encodeURIComponent(biometrics.archetype)}`}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition"
              >
                Open Style Advisor →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
