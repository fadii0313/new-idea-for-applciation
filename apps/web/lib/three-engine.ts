import * as THREE from 'three';

export interface SceneLightingConfig {
  ambientIntensity: number;
  directionalIntensity: number;
  directionalPosition: [number, number, number];
}

export const DEFAULT_LIGHTING_CONFIG: SceneLightingConfig = {
  ambientIntensity: 0.9,
  directionalIntensity: 1.6,
  directionalPosition: [3, 8, 5],
};

/**
 * Procedural sneaker mesh generator for immediate fallback / offline preview
 * when external GLTF/GLB models are downloading or during initial development.
 */
export function createProceduralShoeGeometry(): THREE.Group {
  const shoeGroup = new THREE.Group();

  // 1. Rubber Outsole / Midsole
  const soleGeo = new THREE.BoxGeometry(0.12, 0.035, 0.28);
  const soleMat = new THREE.MeshStandardMaterial({
    color: 0x111116,
    roughness: 0.8,
    metalness: 0.1,
  });
  const soleMesh = new THREE.Mesh(soleGeo, soleMat);
  soleMesh.position.set(0, -0.015, 0.02);
  soleMesh.castShadow = true;
  shoeGroup.add(soleMesh);

  // 2. Aerogel Midsole Cushion Cushioning Layer
  const cushionGeo = new THREE.BoxGeometry(0.115, 0.015, 0.26);
  const cushionMat = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    roughness: 0.3,
    metalness: 0.2,
    emissive: 0x004050,
  });
  const cushionMesh = new THREE.Mesh(cushionGeo, cushionMat);
  cushionMesh.position.set(0, 0.005, 0.02);
  shoeGroup.add(cushionMesh);

  // 3. Engineered Mesh Upper
  const upperGeo = new THREE.CylinderGeometry(0.048, 0.055, 0.18, 16);
  upperGeo.rotateX(Math.PI / 2.3);
  const upperMat = new THREE.MeshStandardMaterial({
    color: 0x222634,
    roughness: 0.6,
    metalness: 0.3,
  });
  const upperMesh = new THREE.Mesh(upperGeo, upperMat);
  upperMesh.position.set(0, 0.045, -0.01);
  upperMesh.castShadow = true;
  shoeGroup.add(upperMesh);

  // 4. Toe Box Cap
  const toeGeo = new THREE.SphereGeometry(0.052, 16, 16);
  toeGeo.scale(1.1, 0.6, 1.4);
  const toeMat = new THREE.MeshStandardMaterial({
    color: 0x1b1f2e,
    roughness: 0.5,
  });
  const toeMesh = new THREE.Mesh(toeGeo, toeMat);
  toeMesh.position.set(0, 0.02, 0.09);
  toeMesh.castShadow = true;
  shoeGroup.add(toeMesh);

  // 5. Collar & Tongue
  const collarGeo = new THREE.TorusGeometry(0.04, 0.018, 12, 24);
  collarGeo.rotateX(Math.PI / 2);
  const collarMat = new THREE.MeshStandardMaterial({
    color: 0xff007a,
    roughness: 0.7,
  });
  const collarMesh = new THREE.Mesh(collarGeo, collarMat);
  collarMesh.position.set(0, 0.07, -0.06);
  shoeGroup.add(collarMesh);

  return shoeGroup;
}
