'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FaceMeshRunner, FaceLandmarksBundle } from '@/lib/face-mesh-runner';
import { FaceMathEngine, BiometricFacialRatios } from '@/lib/face-math-engine';

export interface UseFaceTrackerOptions {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
}

export function useFaceTracker({ videoRef, isActive }: UseFaceTrackerOptions) {
  const runnerRef = useRef<FaceMeshRunner | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const [landmarks, setLandmarks] = useState<FaceLandmarksBundle>({
    landmarks: [],
    isDetected: false,
    timestamp: 0,
  });

  const [biometrics, setBiometrics] = useState<BiometricFacialRatios>(() =>
    FaceMathEngine.classifyFaceShape([])
  );

  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [fps, setFps] = useState<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastFpsCalcRef = useRef<number>(performance.now());

  const handleFaceResults = useCallback((bundle: FaceLandmarksBundle) => {
    setLandmarks(bundle);

    if (bundle.isDetected && bundle.landmarks.length >= 454) {
      const bio = FaceMathEngine.classifyFaceShape(bundle.landmarks);
      setBiometrics(bio);
    }

    frameCountRef.current += 1;
    const now = performance.now();
    if (now - lastFpsCalcRef.current >= 1000) {
      setFps(Math.round((frameCountRef.current * 1000) / (now - lastFpsCalcRef.current)));
      frameCountRef.current = 0;
      lastFpsCalcRef.current = now;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const runner = new FaceMeshRunner();
    runnerRef.current = runner;

    runner
      .initialize(handleFaceResults)
      .then((success) => {
        if (mounted) {
          setIsInitializing(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          console.error('Error starting FaceMesh runner:', err);
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
  }, [handleFaceResults]);

  // Frame processing loop
  useEffect(() => {
    if (!isActive || isInitializing) return;

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
    biometrics,
    isInitializing,
    fps,
    isTracking: landmarks.isDetected,
  };
}

