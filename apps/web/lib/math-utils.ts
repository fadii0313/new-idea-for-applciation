import * as THREE from 'three';

export interface Landmark3D {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface FootTransformResult {
  position: THREE.Vector3;
  rotation: THREE.Quaternion;
  scale: THREE.Vector3;
  confidence: number;
}

export class FootMathEngine {
  private static readonly EPSILON = 1e-6;
  private static readonly DEFAULT_SCALE_FACTOR = 1.85;

  /**
   * Derives an orthonormal basis and transform (position, rotation, scale)
   * from 3D foot landmarks (Ankle, Heel, Toe / Foot Index).
   */
  public static computeFootTransform(
    ankle: Landmark3D,
    heel: Landmark3D,
    toe: Landmark3D,
    viewportWidth: number = 1920,
    viewportHeight: number = 1080,
    isRightFoot: boolean = false
  ): FootTransformResult {
    // Project MediaPipe normalized coordinates (0..1) to NDC (-1..1) 3D camera space
    const pAnkle = new THREE.Vector3(ankle.x * 2 - 1, -(ankle.y * 2 - 1), -ankle.z * 2);
    const pHeel = new THREE.Vector3(heel.x * 2 - 1, -(heel.y * 2 - 1), -heel.z * 2);
    const pToe = new THREE.Vector3(toe.x * 2 - 1, -(toe.y * 2 - 1), -toe.z * 2);

    // Compute Directional Basis Vectors
    // Forward axis points from Heel to Toe
    const vForward = new THREE.Vector3().subVectors(pToe, pHeel);
    if (vForward.lengthSq() < this.EPSILON) {
      vForward.set(0, 0, 1);
    } else {
      vForward.normalize();
    }

    // Leg direction vector from Heel to Ankle
    const vLeg = new THREE.Vector3().subVectors(pAnkle, pHeel);
    if (vLeg.lengthSq() < this.EPSILON) {
      vLeg.set(0, 1, 0);
    } else {
      vLeg.normalize();
    }

    // Cross product gives normal / lateral axis
    const vLateral = new THREE.Vector3();
    if (isRightFoot) {
      // Invert cross product for right foot symmetry
      vLateral.crossVectors(vLeg, vForward).normalize();
    } else {
      vLateral.crossVectors(vForward, vLeg).normalize();
    }

    if (vLateral.lengthSq() < this.EPSILON) {
      vLateral.set(1, 0, 0);
    }

    // Up vector orthogonal to both forward and lateral
    const vUp = new THREE.Vector3().crossVectors(vLateral, vForward).normalize();

    // Construct Rotation Matrix from Orthonormal Basis [Lateral, Up, Forward]
    const rotMatrix = new THREE.Matrix4();
    rotMatrix.makeBasis(vLateral, vUp, vForward);

    const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(rotMatrix);

    // Dynamic scale derived from Euclidean distance between Ankle and Toe
    const footLength = pToe.distanceTo(pHeel);
    const ankleToToeDist = pToe.distanceTo(pAnkle);
    const measuredLength = Math.max(footLength, ankleToToeDist, 0.05);

    const scaleVal = Math.max(measuredLength * this.DEFAULT_SCALE_FACTOR, 0.08);
    const targetScale = new THREE.Vector3(scaleVal, scaleVal, scaleVal);

    // Instep Anchor: Center point between heel and toe, offset slightly upward along vUp
    const instepPosition = new THREE.Vector3()
      .addVectors(pHeel, pToe)
      .multiplyScalar(0.5)
      .addScaledVector(vUp, 0.035);

    // Confidence metric based on landmark visibility
    const avgVisibility =
      ((ankle.visibility ?? 0.8) + (heel.visibility ?? 0.8) + (toe.visibility ?? 0.8)) / 3.0;

    return {
      position: instepPosition,
      rotation: targetQuaternion,
      scale: targetScale,
      confidence: avgVisibility,
    };
  }

  /**
   * Applies dampening and Spherical Linear Interpolation (SLERP) across animation ticks
   * to eliminate webcam tracking jitter.
   */
  public static smoothTransform(
    currentPos: THREE.Vector3,
    targetPos: THREE.Vector3,
    currentRot: THREE.Quaternion,
    targetRot: THREE.Quaternion,
    currentScale: THREE.Vector3,
    targetScale: THREE.Vector3,
    alpha: number = 0.35
  ): void {
    const clampedAlpha = Math.max(0.01, Math.min(1.0, alpha));
    currentPos.lerp(targetPos, clampedAlpha);
    currentRot.slerp(targetRot, clampedAlpha);
    currentScale.lerp(targetScale, clampedAlpha);
  }
}

