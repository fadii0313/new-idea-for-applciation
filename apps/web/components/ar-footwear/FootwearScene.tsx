'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FootMathEngine, Landmark3D } from '@/lib/math-utils';
import { OcclusionFoot } from './OcclusionFoot';
import { ShoeModel } from './ShoeModel';

interface FootwearSceneProps {
  landmarks: {
    leftAnkle?: Landmark3D;
    leftHeel?: Landmark3D;
    leftToe?: Landmark3D;
    rightAnkle?: Landmark3D;
    rightHeel?: Landmark3D;
    rightToe?: Landmark3D;
  };
  modelPath: string;
}

export function FootwearScene({ landmarks, modelPath }: FootwearSceneProps) {
  const leftShoeRef = useRef<THREE.Group>(null);
  const rightShoeRef = useRef<THREE.Group>(null);

  // Left foot smoothed transform vectors
  const leftSmoothedPos = useRef(new THREE.Vector3(0, -10, 0));
  const leftSmoothedRot = useRef(new THREE.Quaternion());
  const leftSmoothedScale = useRef(new THREE.Vector3(1, 1, 1));

  // Right foot smoothed transform vectors
  const rightSmoothedPos = useRef(new THREE.Vector3(0, -10, 0));
  const rightSmoothedRot = useRef(new THREE.Quaternion());
  const rightSmoothedScale = useRef(new THREE.Vector3(1, 1, 1));

  useFrame((_, delta) => {
    // 1. Process Left Foot
    if (landmarks.leftAnkle && landmarks.leftHeel && landmarks.leftToe && leftShoeRef.current) {
      const { position, rotation, scale } = FootMathEngine.computeFootTransform(
        landmarks.leftAnkle,
        landmarks.leftHeel,
        landmarks.leftToe,
        typeof window !== 'undefined' ? window.innerWidth : 1920,
        typeof window !== 'undefined' ? window.innerHeight : 1080,
        false
      );

      // Delta-time compensated alpha damping (target ~0.35 at 60 FPS)
      const alpha = Math.min(1.0, delta * 20.0 * 0.35);
      FootMathEngine.smoothTransform(
        leftSmoothedPos.current,
        position,
        leftSmoothedRot.current,
        rotation,
        leftSmoothedScale.current,
        scale,
        alpha
      );

      leftShoeRef.current.position.copy(leftSmoothedPos.current);
      leftShoeRef.current.quaternion.copy(leftSmoothedRot.current);
      leftShoeRef.current.scale.copy(leftSmoothedScale.current);
      leftShoeRef.current.visible = true;
    } else if (leftShoeRef.current) {
      // Hide or smooth offscreen if lost
      leftShoeRef.current.visible = false;
    }

    // 2. Process Right Foot
    if (landmarks.rightAnkle && landmarks.rightHeel && landmarks.rightToe && rightShoeRef.current) {
      const { position, rotation, scale } = FootMathEngine.computeFootTransform(
        landmarks.rightAnkle,
        landmarks.rightHeel,
        landmarks.rightToe,
        typeof window !== 'undefined' ? window.innerWidth : 1920,
        typeof window !== 'undefined' ? window.innerHeight : 1080,
        true
      );

      const alpha = Math.min(1.0, delta * 20.0 * 0.35);
      FootMathEngine.smoothTransform(
        rightSmoothedPos.current,
        position,
        rightSmoothedRot.current,
        rotation,
        rightSmoothedScale.current,
        scale,
        alpha
      );

      rightShoeRef.current.position.copy(rightSmoothedPos.current);
      rightShoeRef.current.quaternion.copy(rightSmoothedRot.current);
      rightShoeRef.current.scale.copy(rightSmoothedScale.current);
      rightShoeRef.current.visible = true;
    } else if (rightShoeRef.current) {
      rightShoeRef.current.visible = false;
    }
  });

  return (
    <>
      {/* Studio Lighting System */}
      <ambientLight intensity={0.9} />
      <directionalLight
        position={[3, 10, 6]}
        intensity={1.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-4, 6, -2]} intensity={0.5} />
      <pointLight position={[0, -0.2, 1]} intensity={0.6} color="#00F0FF" />

      {/* Left Foot Group with Occlusion + Model */}
      <group ref={leftShoeRef} visible={false}>
        <OcclusionFoot />
        <ShoeModel modelPath={modelPath} isRightFoot={false} />
      </group>

      {/* Right Foot Group with Occlusion + Model */}
      <group ref={rightShoeRef} visible={false}>
        <OcclusionFoot />
        <ShoeModel modelPath={modelPath} isRightFoot={true} />
      </group>

      {/* Virtual Floor Ground Shadow Receiver */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.28, 0]} receiveShadow>
        <planeGeometry args={[15, 15]} />
        <shadowMaterial opacity={0.38} />
      </mesh>
    </>
  );
}
