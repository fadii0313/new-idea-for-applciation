import * as THREE from 'three';

/**
 * Section 7.1: Marschner / Kajiya-Kay strand illumination shader
 * Implements anisotropic specular highlights along the hair fiber tangent vector,
 * diffuse scattering, depth occlusion, and alpha transparency blending against skin tone.
 */
export function createHairStrandMaterial(baseColor: string = '#2B1A13'): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(baseColor) },
      uSpecularColor: { value: new THREE.Color('#D89B72') },
      uLightPos: { value: new THREE.Vector3(2.0, 5.0, 3.0) },
      uRoughness: { value: 0.35 },
      uOpacity: { value: 0.96 },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform vec3 uSpecularColor;
      uniform vec3 uLightPos;
      uniform float uRoughness;
      uniform float uOpacity;

      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;

      void main() {
        vec3 N = normalize(vNormal);
        vec3 V = normalize(vViewPosition);
        vec3 L = normalize(uLightPos - vWorldPosition);

        // Kajiya-Kay / Marschner Anisotropic Approximation
        // Hair tangent approximated as perpendicular to normal and local up
        vec3 T = normalize(cross(N, vec3(0.0, 1.0, 0.0)));
        if (length(T) < 0.1) {
          T = normalize(cross(N, vec3(1.0, 0.0, 0.0)));
        }

        float dotTL = dot(T, L);
        float dotTV = dot(T, V);
        float sinTL = sqrt(max(0.0, 1.0 - dotTL * dotTL));
        float sinTV = sqrt(max(0.0, 1.0 - dotTV * dotTV));

        // Diffuse component (wrapping light around hair fibers)
        float diffuse = clamp(sinTL * 0.75 + 0.25, 0.0, 1.0);

        // Anisotropic primary specular highlight
        float specular = pow(clamp(dotTL * dotTV + sinTL * sinTV, 0.0, 1.0), 32.0 / uRoughness);

        // Fresnel edge sheen
        float fresnel = pow(1.0 - max(0.0, dot(N, V)), 3.0) * 0.4;

        vec3 finalColor = uColor * (diffuse + fresnel) + uSpecularColor * specular * 0.6;
        gl_FragColor = vec4(finalColor, uOpacity);
      }
    `,
    transparent: true,
    depthWrite: true,
    side: THREE.DoubleSide,
  });
}

/**
 * Volumetric 3D procedural geometries for Mustache styles (Section 7.1)
 */
export function createMustacheMesh(style: string, color: string = '#221611'): THREE.Group {
  const group = new THREE.Group();
  const material = createHairStrandMaterial(color);

  switch (style.toLowerCase()) {
    case 'chevron': {
      // Dense, wide classic mustache tapering softly at outer corners
      const leftGeom = new THREE.ConeGeometry(0.032, 0.09, 16);
      leftGeom.rotateZ(Math.PI / 2.3);
      leftGeom.scale(1.0, 0.45, 0.6);
      const leftMesh = new THREE.Mesh(leftGeom, material);
      leftMesh.position.set(-0.038, 0, 0);

      const rightGeom = leftGeom.clone();
      rightGeom.rotateZ(-Math.PI / 1.15);
      const rightMesh = new THREE.Mesh(rightGeom, material);
      rightMesh.position.set(0.038, 0, 0);

      const centerGeom = new THREE.CylinderGeometry(0.015, 0.02, 0.04, 12);
      centerGeom.rotateZ(Math.PI / 2);
      const centerMesh = new THREE.Mesh(centerGeom, material);

      group.add(leftMesh, rightMesh, centerMesh);
      break;
    }

    case 'pencil': {
      // Ultra-thin crisp line traced right along upper vermillion border
      const geom = new THREE.CylinderGeometry(0.005, 0.005, 0.11, 16);
      geom.rotateZ(Math.PI / 2);
      const mesh = new THREE.Mesh(geom, material);
      group.add(mesh);
      break;
    }

    case 'handlebar': {
      // Classic curved mustache tapering into curled upturned tips
      const leftGeom = new THREE.TorusGeometry(0.04, 0.012, 12, 24, Math.PI / 1.3);
      leftGeom.rotateZ(Math.PI / 1.2);
      const leftMesh = new THREE.Mesh(leftGeom, material);
      leftMesh.position.set(-0.035, -0.01, 0);

      const rightGeom = new THREE.TorusGeometry(0.04, 0.012, 12, 24, Math.PI / 1.3);
      rightGeom.rotateZ(-Math.PI / 1.2);
      rightGeom.scale(-1, 1, 1);
      const rightMesh = new THREE.Mesh(rightGeom, material);
      rightMesh.position.set(0.035, -0.01, 0);

      group.add(leftMesh, rightMesh);
      break;
    }

    case 'horseshoe': {
      // Upper mustache with vertical downward pipe bars down past jawline
      const topGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.1, 12);
      topGeom.rotateZ(Math.PI / 2);
      const topMesh = new THREE.Mesh(topGeom, material);

      const barL = new THREE.CylinderGeometry(0.01, 0.01, 0.08, 12);
      const meshBarL = new THREE.Mesh(barL, material);
      meshBarL.position.set(-0.05, -0.04, 0);

      const barR = new THREE.CylinderGeometry(0.01, 0.01, 0.08, 12);
      const meshBarR = new THREE.Mesh(barR, material);
      meshBarR.position.set(0.05, -0.04, 0);

      group.add(topMesh, meshBarL, meshBarR);
      break;
    }

    case 'english':
    default: {
      // Long, narrow, horizontally extended style with sharp pointed ends
      const leftGeom = new THREE.ConeGeometry(0.015, 0.1, 12);
      leftGeom.rotateZ(Math.PI / 2);
      const leftMesh = new THREE.Mesh(leftGeom, material);
      leftMesh.position.set(-0.055, 0, 0);

      const rightGeom = new THREE.ConeGeometry(0.015, 0.1, 12);
      rightGeom.rotateZ(-Math.PI / 2);
      const rightMesh = new THREE.Mesh(rightGeom, material);
      rightMesh.position.set(0.055, 0, 0);

      group.add(leftMesh, rightMesh);
      break;
    }
  }

  return group;
}

/**
 * Volumetric 3D procedural geometries for Beard styles (Section 7.1)
 */
export function createBeardMesh(style: string, color: string = '#221611'): THREE.Group {
  const group = new THREE.Group();
  const material = createHairStrandMaterial(color);

  switch (style.toLowerCase()) {
    case 'heavy stubble':
    case 'stubble': {
      // Fine volumetric shadow along chin and lower jawline contour
      const jawBand = new THREE.TorusGeometry(0.09, 0.015, 12, 32, Math.PI);
      jawBand.rotateX(Math.PI / 2.3);
      const mesh = new THREE.Mesh(jawBand, material);
      mesh.position.set(0, -0.03, 0.01);
      group.add(mesh);
      break;
    }

    case 'short boxed beard': {
      // Full contoured jawline with defined cheek line and full chin
      const jawBand = new THREE.TorusGeometry(0.095, 0.026, 16, 32, Math.PI);
      jawBand.rotateX(Math.PI / 2.2);
      const jawMesh = new THREE.Mesh(jawBand, material);
      jawMesh.position.set(0, -0.035, 0.01);

      // Chin volume
      const chinGeom = new THREE.BoxGeometry(0.06, 0.045, 0.04);
      const chinMesh = new THREE.Mesh(chinGeom, material);
      chinMesh.position.set(0, -0.06, 0.025);

      group.add(jawMesh, chinMesh);
      break;
    }

    case 'balbo': {
      // Disconnected mustache + soul patch + wide chin goatee (no sideburns)
      const chinGeom = new THREE.BoxGeometry(0.07, 0.04, 0.035);
      const chinMesh = new THREE.Mesh(chinGeom, material);
      chinMesh.position.set(0, -0.055, 0.02);

      // Soul patch
      const soulGeom = new THREE.CylinderGeometry(0.008, 0.014, 0.025, 8);
      const soulMesh = new THREE.Mesh(soulGeom, material);
      soulMesh.position.set(0, -0.015, 0.015);

      group.add(chinMesh, soulMesh);
      break;
    }

    case 'goatee': {
      // Circular goatee connecting mustache with rounded chin coverage
      const circleGeom = new THREE.TorusGeometry(0.045, 0.018, 12, 24);
      const circleMesh = new THREE.Mesh(circleGeom, material);
      circleMesh.position.set(0, -0.03, 0.02);
      group.add(circleMesh);
      break;
    }

    case 'van dyke':
    default: {
      // Pointed chin beard + floating soul patch
      const coneGeom = new THREE.ConeGeometry(0.028, 0.075, 16);
      coneGeom.rotateX(Math.PI);
      const coneMesh = new THREE.Mesh(coneGeom, material);
      coneMesh.position.set(0, -0.065, 0.025);

      const soulGeom = new THREE.BoxGeometry(0.015, 0.02, 0.015);
      const soulMesh = new THREE.Mesh(soulGeom, material);
      soulMesh.position.set(0, -0.018, 0.015);

      group.add(coneMesh, soulMesh);
      break;
    }
  }

  return group;
}

/**
 * Volumetric 3D procedural accessories for Headwear & Eyewear (Section 8.2)
 */
export function createHeadwearMesh(type: string): THREE.Group {
  const group = new THREE.Group();

  if (type === 'beanie') {
    const geom = new THREE.SphereGeometry(0.12, 24, 16, 0, Math.PI * 2, 0, Math.PI / 1.7);
    const mat = new THREE.MeshStandardMaterial({ color: 0x18181f, roughness: 0.9 });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(0, 0.12, -0.04);
    group.add(mesh);
  } else if (type === 'eyewear_wayfarer') {
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f0f13, roughness: 0.2, metalness: 0.1 });
    const lensMat = new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.1, metalness: 0.8, opacity: 0.75, transparent: true });

    // Left and right frame rims
    const rimL = new THREE.BoxGeometry(0.045, 0.035, 0.01);
    const rimR = rimL.clone();
    const meshL = new THREE.Mesh(rimL, frameMat);
    meshL.position.set(-0.035, 0.02, 0.04);
    const meshR = new THREE.Mesh(rimR, frameMat);
    meshR.position.set(0.035, 0.02, 0.04);

    // Bridge
    const bridge = new THREE.BoxGeometry(0.02, 0.006, 0.008);
    const bridgeMesh = new THREE.Mesh(bridge, frameMat);
    bridgeMesh.position.set(0, 0.025, 0.04);

    group.add(meshL, meshR, bridgeMesh);
  }

  return group;
}
