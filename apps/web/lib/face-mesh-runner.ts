import { Landmark3D } from './math-utils';

export interface FaceLandmarksBundle {
  landmarks: Landmark3D[];
  upperLipTop?: Landmark3D;    // 0
  philtrumBottom?: Landmark3D; // 164
  lipLeft?: Landmark3D;        // 37
  lipRight?: Landmark3D;       // 267
  subnasale?: Landmark3D;      // 2 or 94
  chinTip?: Landmark3D;        // 152
  jawLeft?: Landmark3D;        // 172
  jawRight?: Landmark3D;       // 397
  foreheadTop?: Landmark3D;    // 10
  cheekLeft?: Landmark3D;      // 234
  cheekRight?: Landmark3D;     // 454
  leftIris?: Landmark3D;       // 468
  rightIris?: Landmark3D;      // 473
  isDetected: boolean;
  timestamp: number;
}

export type FaceMeshResultsCallback = (bundle: FaceLandmarksBundle) => void;

export class FaceMeshRunner {
  private faceMesh: any = null;
  private isInitialized = false;
  private isProcessing = false;
  private lastProcessedTimestamp = 0;
  private targetFpsIntervalMs = 1000 / 30; // 30 FPS target for facial pipeline

  public async initialize(onResults: FaceMeshResultsCallback): Promise<boolean> {
    try {
      const faceMeshModule = await import('@mediapipe/face_mesh');
      const FaceMeshClass =
        (faceMeshModule as any).FaceMesh || (faceMeshModule as any).default?.FaceMesh;

      if (!FaceMeshClass) {
        console.warn('FaceMesh class could not be resolved from module');
        return false;
      }

      this.faceMesh = new FaceMeshClass({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      this.faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true, // includes iris landmarks 468-477
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.faceMesh.onResults((results: any) => {
        this.isProcessing = false;
        if (!results || !results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
          onResults({
            landmarks: [],
            isDetected: false,
            timestamp: Date.now(),
          });
          return;
        }

        const lms: Landmark3D[] = results.multiFaceLandmarks[0];

        onResults({
          landmarks: lms,
          upperLipTop: lms[0],
          philtrumBottom: lms[164],
          lipLeft: lms[37],
          lipRight: lms[267],
          subnasale: lms[2] || lms[94],
          chinTip: lms[152],
          jawLeft: lms[172],
          jawRight: lms[397],
          foreheadTop: lms[10],
          cheekLeft: lms[234],
          cheekRight: lms[454],
          leftIris: lms[468],
          rightIris: lms[473],
          isDetected: true,
          timestamp: Date.now(),
        });
      });

      await this.faceMesh.initialize();
      this.isInitialized = true;
      return true;
    } catch (err) {
      console.error('Failed to initialize FaceMesh runner:', err);
      return false;
    }
  }

  public async sendFrame(videoElement: HTMLVideoElement): Promise<void> {
    if (!this.isInitialized || !this.faceMesh || this.isProcessing) {
      return;
    }

    const now = performance.now();
    if (now - this.lastProcessedTimestamp < this.targetFpsIntervalMs) {
      return;
    }

    if (videoElement.readyState < 2) {
      return;
    }

    this.isProcessing = true;
    this.lastProcessedTimestamp = now;

    try {
      await this.faceMesh.send({ image: videoElement });
    } catch (err) {
      this.isProcessing = false;
      console.warn('FaceMesh send frame error:', err);
    }
  }

  public close(): void {
    if (this.faceMesh) {
      try {
        this.faceMesh.close();
      } catch (err) {
        console.warn('Error closing face mesh:', err);
      }
      this.faceMesh = null;
      this.isInitialized = false;
    }
  }
}
