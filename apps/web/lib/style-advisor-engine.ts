import { FaceShapeArchetype } from './face-math-engine';

export type LifestyleAesthetic = 'Streetwear' | 'Smart Casual' | 'Casual Weekend' | 'Formal / Business';

export interface CoordinatedEnsemble {
  id: string;
  aesthetic: LifestyleAesthetic;
  title: string;
  harmonyScore: number;
  description: string;
  grooming: {
    style: string;
    description: string;
    type: 'Mustache' | 'Beard' | 'Clean Shave';
    tryOnUrl: string;
  };
  apparel: {
    sku: string;
    name: string;
    category: string;
    price: number;
    imageUrl: string;
    tryOnUrl: string;
  };
  headwearEyewear: {
    name: string;
    type: 'Headwear' | 'Eyewear';
    description: string;
    imageUrl: string;
  };
  footwear: {
    sku: string;
    name: string;
    price: number;
    imageUrl: string;
    tryOnUrl: string;
  };
}

export class StyleAdvisorEngine {
  public static getCuratedEnsembles(
    faceShape: FaceShapeArchetype = 'Oval Face',
    selectedAesthetic?: LifestyleAesthetic
  ): CoordinatedEnsemble[] {
    const allEnsembles: CoordinatedEnsemble[] = [
      {
        id: 'ens-streetwear-01',
        aesthetic: 'Streetwear',
        title: 'Cyber-Neo Obsidian Drop',
        harmonyScore: faceShape === 'Round Face' || faceShape === 'Square Face' ? 96 : 91,
        description:
          'Sharp, architectural street silhouettes balancing bold facial geometry with heavyweight drop-shoulder fleece.',
        grooming: {
          style: 'Van Dyke',
          description: 'Angular, pointed chin contour and defined floating mustache emphasizing chin length.',
          type: 'Beard',
          tryOnUrl: '/try-on/grooming?beard=Van%20Dyke',
        },
        apparel: {
          sku: 'HOOD-001',
          name: 'Heavyweight Boxy Hoodie - Slate',
          category: 'Upper Body Fleece',
          price: 95.0,
          imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
          tryOnUrl: '/try-on/apparel?sku=HOOD-001',
        },
        headwearEyewear: {
          name: 'Ribbed Knit Studio Beanie + Shield Shades',
          type: 'Headwear',
          description: 'Merino-blend micro-ribbed beanie with wrap-around tinted acrylic shades.',
          imageUrl: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=500&q=80',
        },
        footwear: {
          sku: 'SHOE-001',
          name: 'AURA HyperStrobe Runner V1',
          price: 189.99,
          imageUrl: '/models/shoes/runner_v1_thumb.png',
          tryOnUrl: '/try-on/footwear?sku=SHOE-001',
        },
      },
      {
        id: 'ens-smart-casual-01',
        aesthetic: 'Smart Casual',
        title: 'Atelier Minimalist Luxe',
        harmonyScore: faceShape === 'Oval Face' || faceShape === 'Square Face' ? 98 : 89,
        description:
          'Structured yet relaxed tailoring with clean jawline taper and premium full-grain leather footwear.',
        grooming: {
          style: 'Short Boxed Beard',
          description: 'Neatly groomed perimeter with razor-tapered cheek line and softly contoured jaw.',
          type: 'Beard',
          tryOnUrl: '/try-on/grooming?beard=Short%20Boxed%20Beard',
        },
        apparel: {
          sku: 'JACKET-001',
          name: 'AURA Modular Tech Bomber - Olive',
          category: 'Outerwear',
          price: 240.0,
          imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
          tryOnUrl: '/try-on/apparel?sku=JACKET-001',
        },
        headwearEyewear: {
          name: 'Acetate Clubmaster Eyewear',
          type: 'Eyewear',
          description: 'Hand-polished tortoiseshell acetate with anti-reflective sapphire lenses.',
          imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=500&q=80',
        },
        footwear: {
          sku: 'SHOE-002',
          name: 'AURA Street Sneaker Low',
          price: 149.5,
          imageUrl: '/models/shoes/street_sneaker_thumb.png',
          tryOnUrl: '/try-on/footwear?sku=SHOE-002',
        },
      },
      {
        id: 'ens-casual-weekend-01',
        aesthetic: 'Casual Weekend',
        title: 'Heritage Coastline Relaxed',
        harmonyScore: faceShape === 'Heart & Diamond Face' || faceShape === 'Oblong / Rectangular Face' ? 94 : 88,
        description:
          'Effortless weekend staples combining textured jersey, timeless round eyewear, and court silhouettes.',
        grooming: {
          style: 'Chevron',
          description: 'Full natural mustache with softened corners, paired with 2-day micro stubble.',
          type: 'Mustache',
          tryOnUrl: '/try-on/grooming?mustache=Chevron',
        },
        apparel: {
          sku: 'TEE-001',
          name: 'Cybernetic Graphic Tee - Obsidian',
          category: 'T-Shirts & Tops',
          price: 48.0,
          imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
          tryOnUrl: '/try-on/apparel?sku=TEE-001',
        },
        headwearEyewear: {
          name: 'Vintage 6-Panel Cap + Polarized Rounds',
          type: 'Headwear',
          description: 'Washed chino twill strapback paired with lightweight metal round sunframes.',
          imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=500&q=80',
        },
        footwear: {
          sku: 'SHOE-002',
          name: 'AURA Street Sneaker Low',
          price: 149.5,
          imageUrl: '/models/shoes/street_sneaker_thumb.png',
          tryOnUrl: '/try-on/footwear?sku=SHOE-002',
        },
      },
      {
        id: 'ens-formal-business-01',
        aesthetic: 'Formal / Business',
        title: 'Executive Sovereign Tailoring',
        harmonyScore: faceShape === 'Oval Face' || faceShape === 'Round Face' ? 97 : 92,
        description:
          'Sharp geometric contrast pairing sculpted jawline contours or clean shave with razor-sharp wool lapels.',
        grooming: {
          style: 'Clean Shave & Tight Stubble',
          description: 'Ultra-clean razor fade along the neckline with micro 1-day shadow shading.',
          type: 'Clean Shave',
          tryOnUrl: '/try-on/grooming?shave=clean',
        },
        apparel: {
          sku: 'JACKET-001',
          name: 'AURA Modular Tech Bomber - Olive',
          category: 'Tailored Suiting',
          price: 240.0,
          imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
          tryOnUrl: '/try-on/apparel?sku=JACKET-001',
        },
        headwearEyewear: {
          name: 'Titanium Wire-Frame Spectacles',
          type: 'Eyewear',
          description: 'Featherweight Japanese beta-titanium rimless frames with anti-fatigue coating.',
          imageUrl: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=500&q=80',
        },
        footwear: {
          sku: 'SHOE-003',
          name: 'AURA Apex Horizon Trail',
          price: 210.0,
          imageUrl: '/models/shoes/runner_v1_thumb.png',
          tryOnUrl: '/try-on/footwear?sku=SHOE-003',
        },
      },
    ];

    if (!selectedAesthetic) {
      return allEnsembles;
    }

    return allEnsembles.filter((e) => e.aesthetic === selectedAesthetic);
  }
}
