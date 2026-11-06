'use client';

import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { createProceduralShoeGeometry } from '@/lib/three-engine';

interface ShoeModelProps {
  modelPath: string;
  isRightFoot?: boolean;
}

export function ShoeModel({ modelPath, isRightFoot = false }: ShoeModelProps) {
  // Try loading GLTF model with procedural fallback
  let content: React.ReactNode = null;

  try {
    const { scene } = useGLTF(modelPath);
    const cloned = useMemo(() => {
      const c = scene.clone();
      if (isRightFoot) {
        c.scale.set(-1, 1, 1); // Mirror for right foot
      }
      c.traverse((child: any) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      return c;
    }, [scene, isRightFoot]);

    content = <primitive object={cloned} />;
  } catch (err) {
    // Procedural 3D sneaker mesh fallback
    const fallbackMesh = useMemo(() => {
      const g = createProceduralShoeGeometry();
      if (isRightFoot) {
        g.scale.set(-1, 1, 1);
      }
      return g;
    }, [isRightFoot]);

    content = <primitive object={fallbackMesh} />;
  }

  return <group dispose={null}>{content}</group>;
}
