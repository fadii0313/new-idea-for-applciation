'use client';

import React from 'react';
import { Cpu, Sparkles, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { VtonJobStatus } from '@/hooks/useVtonJob';

interface InferenceProgressProps {
  status: VtonJobStatus;
  progressPercent: number;
  error?: string | null;
  onRetry?: () => void;
}

export function InferenceProgress({
  status,
  progressPercent,
  error,
  onRetry,
}: InferenceProgressProps) {
  if (status === 'idle') return null;

  const getStatusDetails = () => {
    switch (status) {
      case 'uploading':
        return {
          title: 'Uploading Snapshot',
          desc: 'Transferring high-res image to AURA API Gateway...',
          icon: RefreshCw,
          spin: true,
        };
      case 'starting':
        return {
          title: 'Initializing IDM-VTON Diffusion Pipeline',
          desc: 'Allocating GPU workers, parsing body keypoints & parsing garment geometry...',
          icon: Cpu,
          spin: true,
        };
      case 'processing':
        return {
          title: 'Synthesizing Garment Fit (Diffusion Iterations)',
          desc: 'Performing latent image-to-image warp, texture mapping, and ambient shadow matching...',
          icon: Sparkles,
          spin: true,
        };
      case 'succeeded':
        return {
          title: 'Try-On Synthesis Completed',
          desc: 'Garment rendered with sub-millimeter drape fidelity.',
          icon: CheckCircle2,
          spin: false,
        };
      case 'failed':
        return {
          title: 'Synthesis Interrupted',
          desc: error || 'Inference provider reported an error. Please try again.',
          icon: AlertTriangle,
          spin: false,
        };
    }
  };

  const details = getStatusDetails();
  const Icon = details.icon;

  return (
    <div className="w-full max-w-md mx-auto p-5 bg-neutral-900/90 border border-neutral-800 rounded-2xl backdrop-blur-xl shadow-xl flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              status === 'failed'
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : status === 'succeeded'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
            }`}
          >
            <Icon className={`w-5 h-5 ${details.spin ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">{details.title}</h4>
            <p className="text-xs text-neutral-400 mt-0.5">{details.desc}</p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-cyan-400 shrink-0">
          {progressPercent}%
        </span>
      </div>

      {/* Progress Bar Track */}
      <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden p-0.5 border border-white/5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            status === 'failed'
              ? 'bg-red-500'
              : status === 'succeeded'
              ? 'bg-emerald-400'
              : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {status === 'failed' && onRetry && (
        <button
          onClick={onRetry}
          className="self-end px-4 py-1.5 text-xs font-medium text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

