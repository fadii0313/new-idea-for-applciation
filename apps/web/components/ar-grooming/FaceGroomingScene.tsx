'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FaceLandmarksBundle } from '@/lib/face-mesh-runner';
import { FaceMathEngine } from '@/lib/face-math-engine';
import { createMustacheMesh, createBeardMesh, createHeadwearMesh } from '@/lib/hair-shader';

interface FaceGroomingSceneProps {
  landmarks: FaceLandmarksBundle;
  mustacheStyle?: string | null;
  beardStyle?: string | null;
  headwearType?: string | null;
  hairColor?: string;
}

export function FaceGroomingScene({
  landmarks,
  mustacheStyle = 'Chevron',
  beardStyle = 'Short Boxed Beard',
  headwearType = null,
  hairColor = '#221611',
}: FaceGroomingSceneProps) {
  const mustacheRef = useRef<THREE.Group>(null);
  const beardRef = useRef<THREE.Group>(null);
  const headwearRef = useRef<THREE.Group>(null);

  // Smoothed transforms
  const mustachePos = useRef(new THREE.Vector3());
  const mustacheRot = useRef(new THREE.Quaternion());
  const mustacheScale = useRef(new THREE.Vector3(1, 1, 1));

  const beardPos = useRef(new THREE.Vector3());
  const beardRot = useRef(new THREE.Quaternion());
  const beardScale = useRef(new THREE.Vector3(1, 1, 1));

  const headwearPos = useRef(new THREE.Vector3());
  const headwearRot = useRef(new THREE.Quaternion());

  // Procedural 3D Hair Meshes
  const mustacheMesh = useMemo(() => {
    if (!mustacheStyle) return null;
    return createMustacheMesh(mustacheStyle, hairColor);
  }, [mustacheStyle, hairColor]);

  const beardMesh = useMemo(() => {
    if (!beardStyle) return null;
    return createBeardMesh(beardStyle, hairColor);
  }, [beardStyle, hairColor]);

  const headwearMesh = useMemo(() => {
    if (!headwearType) return null;
    return createHeadwearMesh(headwearType);
  }, [headwearType]);

  useFrame((_, delta) => {
    const alpha = Math.min(1.0, delta * 20.0 * 0.35);

    // 1. Position and orient Mustache
    if (
      mustacheRef.current &&
      landmarks.upperLipTop &&
      landmarks.philtrumBottom &&
      landmarks.lipLeft &&
      landmarks.lipRight &&
      landmarks.subnasale
    ) {
      const transform = FaceMathEngine.computeMustacheTransform(
        landmarks.upperLipTop,
        landmarks.philtrumBottom,
        landmarks.lipLeft,
        landmarks.lipRight,
        landmarks.subnasale
      );

      mustachePos.current.lerp(transform.position, alpha);
      mustacheRot.current.slerp(transform.rotation, alpha);
      mustacheScale.current.lerp(transform.scale, alpha);

      mustacheRef.current.position.copy(mustachePos.current);
      mustacheRef.current.quaternion.copy(mustacheRot.current);
      mustacheRef.current.scale.copy(mustacheScale.current);
      mustacheRef.current.visible = true;
    } else if (mustacheRef.current) {
      mustacheRef.current.visible = false;
    }

    // 2. Position and orient Beard
    if (
      beardRef.current &&
      landmarks.chinTip &&
      landmarks.jawLeft &&
      landmarks.jawRight &&
      landmarks.subnasale
    ) {
      const transform = FaceMathEngine.computeBeardTransform(
        landmarks.chinTip,
        landmarks.jawLeft,
        landmarks.jawRight,
        landmarks.subnasale
      );

      beardPos.current.lerp(transform.position, alpha);
      beardRot.current.slerp(transform.rotation, alpha);
      beardScale.current.lerp(transform.scale, alpha);

      beardRef.current.position.copy(beardPos.current);
      beardRef.current.quaternion.copy(beardRot.current);
      beardRef.current.scale.copy(beardScale.current);
      beardRef.current.visible = true;
    } else if (beardRef.current) {
      beardRef.current.visible = false;
    }

    // 3. Headwear & Eyewear orientation
    if (headwearRef.current && landmarks.foreheadTop && landmarks.chinTip && landmarks.cheekLeft && landmarks.cheekRight) {
      const pTop = new THREE.Vector3(landmarks.foreheadTop.x * 2 - 1, -(landmarks.foreheadTop.y * 2 - 1), -landmarks.foreheadTop.z * 2);
      const pChin = new THREE.Vector3(landmarks.chinTip.x * 2 - 1, -(landmarks.chinTip.y * 2 - 1), -landmarks.chinTip.z * 2);
      const pLeft = new THREE.Vector3(landmarks.cheekLeft.x * 2 - 1, -(landmarks.cheekLeft.y * 2 - 1), -landmarks.cheekLeft.z * 2);
      const pRight = new THREE.Vector3(landmarks.cheekRight.x * 2 - 1, -(landmarks.cheekRight.y * 2 - 1), -landmarks.cheekRight.z * 2);

      const vLateral = new THREE.Vector3().subVectors(pRight, pLeft).normalize();
      const vUp = new THREE.Vector3().subVectors(pTop, pChin).normalize();
      const vForward = new THREE.Vector3().crossVectors(vLateral, vUp).normalize();
      vUp.crossVectors(vForward, vLateral).normalize();

      const rotMatrix = new THREE.Matrix4().makeBasis(vLateral, vUp, vForward);
      const rot = new THREE.Quaternion().setFromRotationMatrix(rotMatrix);

      headwearPos.current.lerp(pTop, alpha);
      headwearRot.current.slerp(rot, alpha);

      headwearRef.current.position.copy(headwearPos.current);
      headwearRef.current.quaternion.copy(headwearRot.current);
      headwearRef.current.visible = true;
    } else if (headwearRef.current) {
      headwearRef.current.visible = false;
    }
  });

  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[2, 6, 4]} intensity={1.5} castShadow />
      <directionalLight position={[-3, 4, 2]} intensity={0.6} color="#ffe5cc" />
      <pointLight position={[0, -0.5, 1]} intensity={0.4} color="#00F0FF" />

      {/* Mustache Mesh Instance */}
      {mustacheMesh && (
        <group ref={mustacheRef} visible={false}>
          <primitive object={mustacheMesh} />
        </group>
      )}

      {/* Beard Mesh Instance */}
      {beardMesh && (
        <group ref={beardRef} visible={false}>
          <primitive object={beardMesh} />
        </group>
      )}

      {/* Headwear / Eyewear Accessory Instance */}
      {headwearMesh && (
        <group ref={headwearRef} visible={false}>
          <primitive object={headwearMesh} />
        </group>
      )}
    </>
  );
}

