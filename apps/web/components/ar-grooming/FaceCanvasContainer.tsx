'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { FaceGroomingScene } from './FaceGroomingScene';
import { FaceLandmarksBundle } from '@/lib/face-mesh-runner';

interface FaceCanvasContainerProps {
  landmarks: FaceLandmarksBundle;
  mustacheStyle?: string | null;
  beardStyle?: string | null;
  headwearType?: string | null;
  hairColor?: string;
}

export function FaceCanvasContainer({
  landmarks,
  mustacheStyle,
  beardStyle,
  headwearType,
  hairColor,
}: FaceCanvasContainerProps) {
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <Canvas
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: true,
        }}
        camera={{
          position: [0, 0, 1.2],
          fov: 45,
          near: 0.01,
          far: 20,
        }}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          <FaceGroomingScene
            landmarks={landmarks}
            mustacheStyle={mustacheStyle}
            beardStyle={beardStyle}
            headwearType={headwearType}
            hairColor={hairColor}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
