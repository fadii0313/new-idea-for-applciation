'use client';

import React from 'react';

interface OcclusionFootProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

/**
 * Invisible Depth Occlusion Volume
 * Writes exclusively to the depth buffer (depthWrite: true, colorWrite: false)
 * to naturally clip trousers and ankles behind the footwear model in AR.
 */
export function OcclusionFoot({
  position = [0, 0.08, -0.04],
  rotation = [0.2, 0, 0],
}: OcclusionFootProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Lower Leg / Ankle Cylinder Occluder */}
      <mesh renderOrder={0}>
        <cylinderGeometry args={[0.055, 0.065, 0.28, 32]} />
        <meshBasicMaterial colorWrite={false} depthWrite={true} />
      </mesh>
    </group>
  );
}

