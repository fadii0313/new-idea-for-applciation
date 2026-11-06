'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export type VtonJobStatus = 'idle' | 'uploading' | 'starting' | 'processing' | 'succeeded' | 'failed';

export interface UseVtonJobReturn {
  status: VtonJobStatus;
  jobId: string | null;
  outputUrl: string | null;
  error: string | null;
  progressPercent: number;
  submitTryOn: (imageBlob: Blob, garmentSku: string) => Promise<void>;
  reset: () => void;
}

export function useVtonJob(): UseVtonJobReturn {
  const [status, setStatus] = useState<VtonJobStatus>('idle');
  const [jobId, setJobId] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCancelledRef = useRef<boolean>(false);

  const clearPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearPolling();
    isCancelledRef.current = true;
    setStatus('idle');
    setJobId(null);
    setOutputUrl(null);
    setError(null);
    setProgressPercent(0);
  }, [clearPolling]);

  const pollJobStatus = useCallback(
    async (id: string) => {
      clearPolling();
      isCancelledRef.current = false;

      let elapsedAttempts = 0;
      const maxAttempts = 60; // 60 attempts * 2.5s = 150s max

      pollIntervalRef.current = setInterval(async () => {
        if (isCancelledRef.current) {
          clearPolling();
          return;
        }

        elapsedAttempts += 1;

        try {
          const apiBase = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:5000';
          const res = await fetch(`${apiBase}/api/tryon/status/${id}`);

          if (!res.ok) {
            if (elapsedAttempts > 5) {
              throw new Error(`Inference polling failed: HTTP ${res.status}`);
            }
            return;
          }

          const data = await res.json();
          const currentStatus = (data.status || '').toLowerCase();

          if (currentStatus === 'starting') {
            setStatus('starting');
            setProgressPercent(15);
          } else if (currentStatus === 'processing') {
            setStatus('processing');
            // Progressively increment progress bar between 30% and 85%
            setProgressPercent((prev) => Math.min(85, Math.max(35, prev + 10)));
          } else if (currentStatus === 'succeeded') {
            clearPolling();
            setStatus('succeeded');
            setProgressPercent(100);
            setOutputUrl(data.outputUrl || null);
          } else if (currentStatus === 'failed') {
            clearPolling();
            setStatus('failed');
            setError(data.error || 'Generative diffusion try-on failed.');
          }
        } catch (err: any) {
          console.warn('Polling error iteration:', err);
          if (elapsedAttempts >= maxAttempts) {
            clearPolling();
            setStatus('failed');
            setError(err.message || 'Job timed out waiting for diffusion inference.');
          }
        }
      }, 2500);
    },
    [clearPolling]
  );

  const submitTryOn = useCallback(
    async (imageBlob: Blob, garmentSku: string) => {
      reset();
      isCancelledRef.current = false;
      setStatus('uploading');
      setProgressPercent(10);

      try {
        const formData = new FormData();
        formData.append('userImage', imageBlob, 'capture.jpg');
        formData.append('garmentSku', garmentSku);

        const apiBase = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:5000';
        const res = await fetch(`${apiBase}/api/tryon/garment`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Upload failed with status code ${res.status}`);
        }

        const data = await res.json();
        const queuedJobId = data.jobId;
        setJobId(queuedJobId);
        setStatus('starting');
        setProgressPercent(20);

        // Start background polling
        pollJobStatus(queuedJobId);
      } catch (err: any) {
        console.error('Submit try-on error:', err);
        setStatus('failed');
        setError(err.message || 'Failed to submit snapshot to virtual try-on engine.');
      }
    },
    [pollJobStatus, reset]
  );

  useEffect(() => {
    return () => {
      clearPolling();
      isCancelledRef.current = true;
    };
  }, [clearPolling]);

  return {
    status,
    jobId,
    outputUrl,
    error,
    progressPercent,
    submitTryOn,
    reset,
  };
}
