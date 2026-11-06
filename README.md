# AURA Dual-Mode Virtual Try-On Studio (Footwear AR + Apparel AI)

A production-grade, enterprise monorepo combining client-side real-time **Footwear Augmented Reality (AR)** with high-fidelity server-side **Apparel AI Virtual Try-On (VTON)**.

---

## 1. System Architecture

```
                                  ┌────────────────────────────────────────┐
                                  │      Client (Next.js 14 App Router)    │
                                  └────┬──────────────────────────────┬─────┘
                                       │                              │
                     Mode A: Footwear AR                             Mode B: Apparel AI
        (MediaPipe Pose 27-32 + Three.js WebGL)         (Snapshot Capture + SVG Torso Guide)
                                       │                              │
                                       ▼                              ▼
                       ┌────────────────────────┐    Multipart Form: [User Photo + Garment SKU]
                       │ Client GPU: 60 FPS AR  │                     │
                       │ - Orthonormal Basis    │                     ▼
                       │ - SLERP (alpha=0.35)   │      ┌─────────────────────────────┐
                       │ - Depth Occlusion      │      │  ASP.NET Core 9 Minimal API │
                       └────────────────────────┘      └──────────────┬──────────────┘
                                                                      │
                                                   ┌──────────────────┴──────────────────┐
                                                   │                                     │
                                                   ▼                                     ▼
                                       ┌───────────────────────┐             ┌───────────────────────┐
                                       │   Redis Job Cache     │             │  Replicate IDM-VTON   │
                                       │ (Token Bucket Limiter)│             │  (Latent Diffusion)   │
                                       └───────────────────────┘             └───────────────────────┘
```

---

## 2. Monorepo Structure

```
aura-vton-monorepo/
├── apps/
│   └── web/                                  # Next.js 14 App Router Frontend
│       ├── app/
│       │   ├── layout.tsx                    # Studio layout, Dual-Mode switcher, health telemetry
│       │   ├── page.tsx                      # Landing showcase, catalog filters, tech specs
│       │   ├── try-on/
│       │   │   ├── footwear/page.tsx         # Real-time AR Footwear Studio (Three.js + MediaPipe)
│       │   │   └── apparel/page.tsx          # Generative AI Apparel Studio (IDM-VTON)
│       │   └── api/
│       │       └── proxy/[...path]/route.ts  # Server-side transparent API proxy
│       ├── components/
│       │   ├── ar-footwear/
│       │   │   ├── CanvasContainer.tsx       # @react-three/fiber Canvas with shadow setup
│       │   │   ├── FootwearScene.tsx         # SLERP-damped foot tracking & lighting
│       │   │   ├── OcclusionFoot.tsx         # Depth-only invisible geometry (colorWrite: false)
│       │   │   └── ShoeModel.tsx             # GLTF / Draco model loader with fallback
│       │   ├── ai-garment/
│       │   │   ├── CameraCapture.tsx         # Snapshot capture & offscreen canvas rasterizer
│       │   │   ├── TorsoGuideOverlay.tsx     # SVG posture & torso alignment guides
│       │   │   ├── ScrubComparisonSlider.tsx # Interactive touch/mouse before/after slider
│       │   │   └── InferenceProgress.tsx     # Diffusion progress tracker & step animator
│       │   ├── camera/
│       │   │   ├── CameraManager.tsx         # Camera permission & stream lifecycle manager
│       │   │   └── ViewportControls.tsx      # HUD overlay: FPS counter, camera flip, calibration
│       │   └── catalog/
│       │       ├── ProductCard.tsx           # Product showcase card
│       │       └── VariantSelector.tsx       # Studio session model/garment switcher
│       ├── hooks/
│       │   ├── useCameraStream.ts            # getUserMedia handling with environment/user fallback
│       │   ├── useFootTracker.ts             # MediaPipe Pose pipeline throttled to 30 FPS
│       │   └── useVtonJob.ts                 # Asynchronous job dispatch & status polling
│       ├── lib/
│       │   ├── math-utils.ts                 # Spatial math: Orthonormal basis, Quaternions, SLERP
│       │   ├── mediapipe-runner.ts           # MediaPipe Pose engine for keypoints 27-32
│       │   └── three-engine.ts               # Procedural 3D sneaker mesh & lighting configs
│       └── public/
│           ├── draco/                        # Draco WebAssembly and JS decoders
│           └── models/shoes/                 # 3D GLTF/GLB models (runner_v1.glb, street_sneaker.glb)
├── services/
│   └── api/                                  # ASP.NET Core 9 Minimal API Gateway
│       ├── Aura.Api.csproj                   # .NET 9 Web SDK project configuration
│       ├── Program.cs                        # DI setup, CORS, RateLimiting, Health Checks, OpenApi
│       ├── Contracts/
│       │   ├── Requests/GarmentTryOnRequest.cs
│       │   └── Responses/
│       │       ├── TryOnJobStatusResponse.cs
│       │       └── CatalogItemResponse.cs
│       ├── Endpoints/
│       │   ├── CatalogEndpoints.cs           # GET /api/catalog/items, GET /api/catalog/items/{sku}
│       │   └── TryOnEndpoints.cs             # POST /api/tryon/garment, GET /api/tryon/status/{jobId}
│       ├── Services/
│       │   ├── ICatalogService.cs & CatalogService.cs
│       │   ├── IStorageService.cs & S3StorageService.cs
│       │   └── IVtonInferenceService.cs & ReplicateVtonService.cs
│       ├── Infrastructure/
│       │   ├── RedisJobCache.cs              # Distributed Redis cache with in-memory fallback
│       │   └── RateLimitingConfiguration.cs  # Partitioned TokenBucket and FixedWindow rate limiters
│       ├── appsettings.json                  # Replicate token and Redis connection strings
│       └── Dockerfile                        # Multi-stage Linux-Alpine container
├── models/
│   └── assets/                               # Source 3D models and Draco binaries
├── docker-compose.yml                        # Production orchestration (Web, API, Redis)
└── pnpm-workspace.yaml                       # Monorepo workspace configuration
```

---

## 3. Mathematical Foundations: Spatial Foot Tracking

MediaPipe Pose topological indices tracked:
- **Left Foot:** Keypoints `27` (Left Ankle), `29` (Left Heel), `31` (Left Foot Index / Toe)
- **Right Foot:** Keypoints `28` (Right Ankle), `30` (Right Heel), `32` (Right Foot Index / Toe)

### Vector Basis Derivations
1. **Forward Vector ($\vec{V}_{\text{forward}}$):** Points from Heel to Toe
   $$\vec{V}_{\text{forward}} = \text{Normalize}(\vec{P}_{\text{toe}} - \vec{P}_{\text{heel}})$$

2. **Leg Vector ($\vec{V}_{\text{leg}}$):** Points from Heel to Ankle
   $$\vec{V}_{\text{leg}} = \text{Normalize}(\vec{P}_{\text{ankle}} - \vec{P}_{\text{heel}})$$

3. **Lateral / Normal Axis ($\vec{V}_{\text{lateral}}$):** Orthogonal cross-product
   $$\vec{V}_{\text{lateral}} = \text{Normalize}(\vec{V}_{\text{forward}} \times \vec{V}_{\text{leg}})$$

4. **Upright Normal Vector ($\vec{V}_{\text{up}}$):** Orthogonal to forward and lateral
   $$\vec{V}_{\text{up}} = \text{Normalize}(\vec{V}_{\text{lateral}} \times \vec{V}_{\text{forward}})$$

5. **Rotation Matrix & Quaternion:**
   $$\mathbf{R} = \begin{bmatrix} \vec{V}_{\text{lateral}} & \vec{V}_{\text{up}} & \vec{V}_{\text{forward}} \end{bmatrix} \implies \mathbf{q} = \text{QuaternionFromRotationMatrix}(\mathbf{R})$$

6. **SLERP Stabilization ($\alpha = 0.35$):**
   $$\mathbf{q}_{\text{smoothed}} = \text{SLERP}(\mathbf{q}_{\text{current}}, \mathbf{q}_{\text{target}}, \alpha)$$

7. **Dynamic Scaling:**
   $$S = \|\vec{P}_{\text{toe}} - \vec{P}_{\text{heel}}\|_2 \times 1.85$$

---

## 4. Running the Project Locally

### Prerequisites
- Node.js 20+
- .NET 9 SDK
- (Optional) Docker & Docker Compose

### 1. Launch Backend API Gateway
```bash
cd services/api
dotnet run --urls http://localhost:5000
```
- Health Check: `http://localhost:5000/health`
- Catalog Items: `http://localhost:5000/api/catalog/items`
- OpenAPI Specification: `http://localhost:5000/openapi/v1.json`

### 2. Launch Web Frontend
```bash
cd apps/web
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser:
- **Home & Catalog:** `http://localhost:3000`
- **Footwear AR Studio:** `http://localhost:3000/try-on/footwear`
- **Apparel AI Studio:** `http://localhost:3000/try-on/apparel`

---

## 5. Docker Orchestration

Run the complete multi-service stack with a single command:
```bash
docker compose up --build
```
This launches:
- `web`: Next.js 14 App Router on `http://localhost:3000`
- `api`: ASP.NET Core 9 Minimal API Gateway on `http://localhost:5000`
- `redis`: Redis 7 alpine on port `6379`

