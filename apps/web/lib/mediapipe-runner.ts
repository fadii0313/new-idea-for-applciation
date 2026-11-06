import { Landmark3D } from './math-utils';

export interface FootLandmarksBundle {
  leftAnkle?: Landmark3D;
  leftHeel?: Landmark3D;
  leftToe?: Landmark3D;
  rightAnkle?: Landmark3D;
  rightHeel?: Landmark3D;
  rightToe?: Landmark3D;
  isDetected: boolean;
  timestamp: number;
}

export type PoseResultsCallback = (bundle: FootLandmarksBundle) => void;

/**
 * High-performance MediaPipe Pose runner for foot tracking.
 * Manages pose inference lifecycle with frame throttling and off-thread resilience.
 */
export class MediaPipePoseRunner {
  private pose: any = null;
  private isInitialized = false;
  private isProcessing = false;
  private lastProcessedTimestamp = 0;
  private targetFpsIntervalMs = 1000 / 30; // 30 FPS target for inference loop

  public async initialize(onResults: PoseResultsCallback): Promise<boolean> {
    try {
      // Dynamic import to avoid SSR issues with MediaPipe window references
      const poseModule = await import('@mediapipe/pose');
      const PoseClass = (poseModule as any).Pose || (poseModule as any).default?.Pose;

      if (!PoseClass) {
        console.warn('MediaPipe Pose class could not be resolved from module');
        return false;
      }

      this.pose = new PoseClass({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      this.pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.pose.onResults((results: any) => {
        this.isProcessing = false;
        if (!results || !results.poseLandmarks) {
          onResults({
            isDetected: false,
            timestamp: Date.now(),
          });
          return;
        }

        const lms = results.poseLandmarks;

        // Keypoints from MediaPipe Pose 33-point topological map:
        // 27: left_ankle, 28: right_ankle
        // 29: left_heel, 30: right_heel
        // 31: left_foot_index, 32: right_foot_index
        const leftAnkle = lms[27];
        const rightAnkle = lms[28];
        const leftHeel = lms[29];
        const rightHeel = lms[30];
        const leftToe = lms[31];
        const rightToe = lms[32];

        const hasLeft = leftAnkle && leftHeel && leftToe && (leftAnkle.visibility ?? 1) > 0.3;
        const hasRight = rightAnkle && rightHeel && rightToe && (rightAnkle.visibility ?? 1) > 0.3;

        onResults({
          leftAnkle: hasLeft ? leftAnkle : undefined,
          leftHeel: hasLeft ? leftHeel : undefined,
          leftToe: hasLeft ? leftToe : undefined,
          rightAnkle: hasRight ? rightAnkle : undefined,
          rightHeel: hasRight ? rightHeel : undefined,
          rightToe: hasRight ? rightToe : undefined,
          isDetected: !!(hasLeft || hasRight),
          timestamp: Date.now(),
        });
      });

      await this.pose.initialize();
      this.isInitialized = true;
      return true;
    } catch (err) {
      console.error('Failed to initialize MediaPipe Pose runner:', err);
      return false;
    }
  }

  public async sendFrame(videoElement: HTMLVideoElement): Promise<void> {
    if (!this.isInitialized || !this.pose || this.isProcessing) {
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
      await this.pose.send({ image: videoElement });
    } catch (err) {
      this.isProcessing = false;
      console.warn('MediaPipe send frame error:', err);
    }
  }

  public close(): void {
    if (this.pose) {
      try {
        this.pose.close();
      } catch (err) {
        console.warn('Error closing pose detector:', err);
      }
      this.pose = null;
      this.isInitialized = false;
    }
  }
}

