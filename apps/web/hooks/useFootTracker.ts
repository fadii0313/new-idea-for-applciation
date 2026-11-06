'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MediaPipePoseRunner, FootLandmarksBundle } from '@/lib/mediapipe-runner';

export interface UseFootTrackerOptions {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
  onLandmarksUpdate?: (bundle: FootLandmarksBundle) => void;
}

export function useFootTracker({ videoRef, isActive, onLandmarksUpdate }: UseFootTrackerOptions) {
  const runnerRef = useRef<MediaPipePoseRunner | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const [landmarks, setLandmarks] = useState<FootLandmarksBundle>({
    isDetected: false,
    timestamp: 0,
  });
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [fps, setFps] = useState<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastFpsCalcRef = useRef<number>(performance.now());

  const handlePoseResults = useCallback(
    (bundle: FootLandmarksBundle) => {
      setLandmarks(bundle);
      if (onLandmarksUpdate) {
        onLandmarksUpdate(bundle);
      }

      // Calculate runtime FPS
      frameCountRef.current += 1;
      const now = performance.now();
      if (now - lastFpsCalcRef.current >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / (now - lastFpsCalcRef.current)));
        frameCountRef.current = 0;
        lastFpsCalcRef.current = now;
      }
    },
    [onLandmarksUpdate]
  );

  useEffect(() => {
    let mounted = true;
    const runner = new MediaPipePoseRunner();
    runnerRef.current = runner;

    runner
      .initialize(handlePoseResults)
      .then((success) => {
        if (mounted) {
          setIsInitializing(false);
          if (!success) {
            console.warn('Pose tracker initialized in mock fallback mode');
          }
        }
      })
      .catch((err) => {
        if (mounted) {
          console.error('Error starting pose runner:', err);
          setIsInitializing(false);
        }
      });

    return () => {
      mounted = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      runner.close();
      runnerRef.current = null;
    };
  }, [handlePoseResults]);

  // Frame processing loop
  useEffect(() => {
    if (!isActive || isInitializing) {
      return;
    }

    let isRunning = true;

    const processLoop = () => {
      if (!isRunning) return;

      if (videoRef.current && runnerRef.current && videoRef.current.readyState >= 2) {
        runnerRef.current.sendFrame(videoRef.current);
      }

      animFrameIdRef.current = requestAnimationFrame(processLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(processLoop);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isActive, isInitializing, videoRef]);

  return {
    landmarks,
    isInitializing,
    fps,
    isTracking: landmarks.isDetected,
  };
}

