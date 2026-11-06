'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { VtonJobStatus } from './useVtonJob';

export interface UseGroomingInpaintReturn {
  status: VtonJobStatus;
  jobId: string | null;
  outputUrl: string | null;
  error: string | null;
  progressPercent: number;
  submitGroomingInpaint: (
    imageBlob: Blob,
    groomingType: string,
    styleName: string
  ) => Promise<void>;
  reset: () => void;
}

export function useGroomingInpaint(): UseGroomingInpaintReturn {
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

  const pollStatus = useCallback(
    async (id: string) => {
      clearPolling();
      isCancelledRef.current = false;

      let elapsedAttempts = 0;
      const maxAttempts = 60;

      pollIntervalRef.current = setInterval(async () => {
        if (isCancelledRef.current) {
          clearPolling();
          return;
        }

        elapsedAttempts += 1;

        try {
          const apiBase = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:5000';
          const res = await fetch(`${apiBase}/api/grooming/status/${id}`);

          if (!res.ok) {
            if (elapsedAttempts > 5) {
              throw new Error(`Grooming status polling failed: HTTP ${res.status}`);
            }
            return;
          }

          const data = await res.json();
          const currentStatus = (data.status || '').toLowerCase();

          if (currentStatus === 'starting') {
            setStatus('starting');
            setProgressPercent(20);
          } else if (currentStatus === 'processing') {
            setStatus('processing');
            setProgressPercent((prev) => Math.min(88, Math.max(35, prev + 12)));
          } else if (currentStatus === 'succeeded') {
            clearPolling();
            setStatus('succeeded');
            setProgressPercent(100);
            setOutputUrl(data.outputUrl || null);
          } else if (currentStatus === 'failed') {
            clearPolling();
            setStatus('failed');
            setError(data.error || 'Grooming diffusion inpainting failed.');
          }
        } catch (err: any) {
          console.warn('Grooming poll error:', err);
          if (elapsedAttempts >= maxAttempts) {
            clearPolling();
            setStatus('failed');
            setError(err.message || 'Timed out waiting for inpainting diffusion.');
          }
        }
      }, 2500);
    },
    [clearPolling]
  );

  const submitGroomingInpaint = useCallback(
    async (imageBlob: Blob, groomingType: string, styleName: string) => {
      reset();
      isCancelledRef.current = false;
      setStatus('uploading');
      setProgressPercent(15);

      try {
        const formData = new FormData();
        formData.append('userImage', imageBlob, 'face_snapshot.jpg');
        formData.append('groomingType', groomingType);
        formData.append('styleName', styleName);

        const apiBase = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:5000';
        const res = await fetch(`${apiBase}/api/grooming/inpaint`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Upload failed with status code ${res.status}`);
        }

        const data = await res.json();
        const queuedId = data.jobId;
        setJobId(queuedId);
        setStatus('starting');
        setProgressPercent(25);

        pollStatus(queuedId);
      } catch (err: any) {
        console.error('Submit grooming error:', err);
        setStatus('failed');
        setError(err.message || 'Failed to submit snapshot to grooming inpainting engine.');
      }
    },
    [pollStatus, reset]
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
    submitGroomingInpaint,
    reset,
  };
}
