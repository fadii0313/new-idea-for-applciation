'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { FootwearScene } from './FootwearScene';
import { FootLandmarksBundle } from '@/lib/mediapipe-runner';

interface CanvasContainerProps {
  landmarks: FootLandmarksBundle;
  modelPath: string;
}

export function CanvasContainer({ landmarks, modelPath }: CanvasContainerProps) {
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <Canvas
        shadows
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: true,
        }}
        camera={{
          position: [0, 0, 1.2],
          fov: 50,
          near: 0.01,
          far: 20,
        }}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          <FootwearScene landmarks={landmarks} modelPath={modelPath} />
        </Suspense>
      </Canvas>
    </div>
  );
}

