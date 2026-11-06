import * as THREE from 'three';
import { Landmark3D } from './math-utils';

export type FaceShapeArchetype =
  | 'Round Face'
  | 'Square Face'
  | 'Oval Face'
  | 'Oblong / Rectangular Face'
  | 'Heart & Diamond Face';

export interface BiometricFacialRatios {
  faceLength: number;
  cheekboneWidth: number;
  jawlineWidth: number;
  foreheadWidth: number;
  lengthToWidthRatio: number;
  cheekToJawRatio: number;
  foreheadToJawRatio: number;
  archetype: FaceShapeArchetype;
  recommendedGroomingStrategy: string;
}

export interface MustacheTransformResult {
  position: THREE.Vector3;
  rotation: THREE.Quaternion;
  scale: THREE.Vector3;
  skinStretchFactor: number;
}

export interface BeardTransformResult {
  position: THREE.Vector3;
  rotation: THREE.Quaternion;
  scale: THREE.Vector3;
  jawWidth: number;
  gonialAngleDeg: number;
}

export class FaceMathEngine {
  private static readonly EPSILON = 1e-6;

  /**
   * Section 7.1: Mustache Alignment & Philtrum Geometry
   * Upper lip border landmarks: 0 (upper lip top), 164 (philtrum bottom), 37 (upper lip left), 267 (upper lip right)
   * Subnasale and philtrum column: 2 (nose tip), 94 (subnasale), 324 (right subnasale)
   */
  public static computeMustacheTransform(
    upperLipTop: Landmark3D,    // #0
    philtrumBottom: Landmark3D, // #164
    lipLeft: Landmark3D,        // #37
    lipRight: Landmark3D,       // #267
    subnasale: Landmark3D,      // #94 or #2
    viewportWidth: number = 1280,
    viewportHeight: number = 720
  ): MustacheTransformResult {
    // Project MediaPipe normalized landmarks to NDC screen space (-1 to 1)
    const pUpperLip = new THREE.Vector3(upperLipTop.x * 2 - 1, -(upperLipTop.y * 2 - 1), -upperLipTop.z * 2);
    const pPhiltrum = new THREE.Vector3(philtrumBottom.x * 2 - 1, -(philtrumBottom.y * 2 - 1), -philtrumBottom.z * 2);
    const pLipLeft = new THREE.Vector3(lipLeft.x * 2 - 1, -(lipLeft.y * 2 - 1), -lipLeft.z * 2);
    const pLipRight = new THREE.Vector3(lipRight.x * 2 - 1, -(lipRight.y * 2 - 1), -lipRight.z * 2);
    const pSubnasale = new THREE.Vector3(subnasale.x * 2 - 1, -(subnasale.y * 2 - 1), -subnasale.z * 2);

    // Lateral axis: from left lip corner to right lip corner
    const vLateral = new THREE.Vector3().subVectors(pLipRight, pLipLeft);
    const lipSpan = Math.max(vLateral.length(), 0.04);
    vLateral.normalize();

    // Up axis: from upper lip toward subnasale/philtrum
    const vUp = new THREE.Vector3().subVectors(pSubnasale, pUpperLip).normalize();

    // Forward normal axis
    const vForward = new THREE.Vector3().crossVectors(vLateral, vUp).normalize();
    // Re-orthogonalize up vector
    vUp.crossVectors(vForward, vLateral).normalize();

    // Basis rotation matrix
    const rotMatrix = new THREE.Matrix4();
    rotMatrix.makeBasis(vLateral, vUp, vForward);
    const rotation = new THREE.Quaternion().setFromRotationMatrix(rotMatrix);

    // Dynamic skin stretch coefficient during lip articulation
    // Standard baseline distance between philtrum bottom and upper lip is ~0.02 in NDC
    const currentDist = pUpperLip.distanceTo(pPhiltrum);
    const baseDist = 0.025;
    const skinStretchFactor = Math.max(0.7, Math.min(1.5, currentDist / baseDist));

    // Anchor position between subnasale and upper lip
    const position = new THREE.Vector3()
      .addVectors(pUpperLip, pSubnasale)
      .multiplyScalar(0.5)
      .addScaledVector(vForward, 0.015);

    const scaleX = lipSpan * 1.35;
    const scaleY = currentDist * 3.8 * skinStretchFactor;
    const scaleZ = lipSpan * 0.4;
    const scale = new THREE.Vector3(scaleX, scaleY, scaleZ);

    return {
      position,
      rotation,
      scale,
      skinStretchFactor,
    };
  }

  /**
   * Section 7.1: Jawline & Chin Contour Tracking
   * Chin: 152
   * Jawline left: 172, 136, 150
   * Jawline right: 397, 365, 379
   */
  public static computeBeardTransform(
    chinTip: Landmark3D,      // #152
    jawLeft: Landmark3D,      // #172 (left gonial angle / mandibular notch)
    jawRight: Landmark3D,     // #397 (right gonial angle)
    subnasale: Landmark3D     // #2 or #94
  ): BeardTransformResult {
    const pChin = new THREE.Vector3(chinTip.x * 2 - 1, -(chinTip.y * 2 - 1), -chinTip.z * 2);
    const pJawLeft = new THREE.Vector3(jawLeft.x * 2 - 1, -(jawLeft.y * 2 - 1), -jawLeft.z * 2);
    const pJawRight = new THREE.Vector3(jawRight.x * 2 - 1, -(jawRight.y * 2 - 1), -jawRight.z * 2);
    const pSubnasale = new THREE.Vector3(subnasale.x * 2 - 1, -(subnasale.y * 2 - 1), -subnasale.z * 2);

    const vLateral = new THREE.Vector3().subVectors(pJawRight, pJawLeft);
    const jawWidth = Math.max(vLateral.length(), 0.1);
    vLateral.normalize();

    const vUp = new THREE.Vector3().subVectors(pSubnasale, pChin).normalize();
    const vForward = new THREE.Vector3().crossVectors(vLateral, vUp).normalize();
    vUp.crossVectors(vForward, vLateral).normalize();

    const rotMatrix = new THREE.Matrix4();
    rotMatrix.makeBasis(vLateral, vUp, vForward);
    const rotation = new THREE.Quaternion().setFromRotationMatrix(rotMatrix);

    // Approximate gonial angle in degrees (angle of mandible)
    const chinToJawLeft = new THREE.Vector3().subVectors(pJawLeft, pChin).normalize();
    const chinToJawRight = new THREE.Vector3().subVectors(pJawRight, pChin).normalize();
    const dot = Math.max(-1, Math.min(1, chinToJawLeft.dot(chinToJawRight)));
    const gonialAngleDeg = Math.round((Math.acos(dot) * 180) / Math.PI);

    // Position centered at lower face / jaw
    const position = new THREE.Vector3()
      .addVectors(pChin, pSubnasale)
      .multiplyScalar(0.5)
      .addScaledVector(vForward, 0.02);

    const faceHeight = pChin.distanceTo(pSubnasale);
    const scale = new THREE.Vector3(jawWidth * 1.15, faceHeight * 1.6, jawWidth * 0.7);

    return {
      position,
      rotation,
      scale,
      jawWidth,
      gonialAngleDeg,
    };
  }

  /**
   * Section 8.1: Geometric Face Shape Classification & Grooming Logic
   * Hairline/forehead top: 10
   * Chin tip: 152
   * Temples/forehead: 103 (left), 332 (right)
   * Zygomatic arch (cheekbones): 234 (left), 454 (right)
   * Mandibular jawline corners: 172 (left), 397 (right)
   */
  public static classifyFaceShape(landmarks: Landmark3D[]): BiometricFacialRatios {
    if (!landmarks || landmarks.length < 454) {
      // Fallback default balanced archetype
      return {
        faceLength: 0.22,
        cheekboneWidth: 0.15,
        jawlineWidth: 0.12,
        foreheadWidth: 0.14,
        lengthToWidthRatio: 1.45,
        cheekToJawRatio: 1.25,
        foreheadToJawRatio: 1.15,
        archetype: 'Oval Face',
        recommendedGroomingStrategy:
          'Harmonious natural proportions. Versatile canvas supporting Chevron mustaches, clean stubble, or classic full beards.',
      };
    }

    const pForeheadTop = landmarks[10];
    const pChin = landmarks[152];
    const pForeheadLeft = landmarks[103];
    const pForeheadRight = landmarks[332];
    const pCheekLeft = landmarks[234];
    const pCheekRight = landmarks[454];
    const pJawLeft = landmarks[172];
    const pJawRight = landmarks[397];

    const dist = (a: Landmark3D, b: Landmark3D) =>
      Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0));

    const faceLength = dist(pForeheadTop, pChin);
    const foreheadWidth = dist(pForeheadLeft, pForeheadRight);
    const cheekboneWidth = dist(pCheekLeft, pCheekRight);
    const jawlineWidth = dist(pJawLeft, pJawRight);

    const lengthToWidthRatio = faceLength / Math.max(cheekboneWidth, this.EPSILON);
    const cheekToJawRatio = cheekboneWidth / Math.max(jawlineWidth, this.EPSILON);
    const foreheadToJawRatio = foreheadWidth / Math.max(jawlineWidth, this.EPSILON);

    let archetype: FaceShapeArchetype;
    let recommendedGroomingStrategy: string;

    if (lengthToWidthRatio > 1.55) {
      archetype = 'Oblong / Rectangular Face';
      recommendedGroomingStrategy =
        'Extended vertical proportion. Broaden lateral width with full mustache styles, fuller sideburns, and shallow chin hair to prevent vertical elongation.';
    } else if (foreheadToJawRatio > 1.28 || (cheekToJawRatio > 1.35 && jawlineWidth < 0.1)) {
      archetype = 'Heart & Diamond Face';
      recommendedGroomingStrategy =
        'Narrow chin with prominent cheekbones/forehead. Build volume at the jawline and chin with a classic chin strap or uniform medium beard for equilibrium.';
    } else if (lengthToWidthRatio < 1.26) {
      if (cheekToJawRatio < 1.15) {
        archetype = 'Square Face';
        recommendedGroomingStrategy =
          'Prominent, angular jawline. Soften edges with rounded beards, heavy stubble, or a soft Balbo. Avoid harsh boxed cheek lines.';
      } else {
        archetype = 'Round Face';
        recommendedGroomingStrategy =
          'Balanced height and width with soft curves. Add vertical elongation and angularity using a Van Dyke, sharp Goatee, or tapered Short Boxed Beard with trimmed sideburns.';
      }
    } else {
      archetype = 'Oval Face';
      recommendedGroomingStrategy =
        'Harmonious natural proportions. Versatile canvas supporting Chevron mustaches, clean stubble, or classic full beards.';
    }

    return {
      faceLength: Math.round(faceLength * 100) / 100,
      cheekboneWidth: Math.round(cheekboneWidth * 100) / 100,
      jawlineWidth: Math.round(jawlineWidth * 100) / 100,
      foreheadWidth: Math.round(foreheadWidth * 100) / 100,
      lengthToWidthRatio: Math.round(lengthToWidthRatio * 100) / 100,
      cheekToJawRatio: Math.round(cheekToJawRatio * 100) / 100,
      foreheadToJawRatio: Math.round(foreheadToJawRatio * 100) / 100,
      archetype,
      recommendedGroomingStrategy,
    };
  }
}

