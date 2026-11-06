import type { Metadata } from 'next';
import Link from 'next/link';
import { Footprints, Sparkles, Scissors, Compass } from 'lucide-react';
import './globals.css';

export const metadata: Metadata = {
  title: 'AURA Studio | Footwear AR • Apparel AI • Facial Grooming • Style Advisor',
  description:
    'Real-time sub-millimeter footwear AR tracking with Three.js & MediaPipe, paired with IDM-VTON generative latent diffusion for photo-realistic apparel fitting, facial grooming inpainting, and AI fashion coordination.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090A0F] text-neutral-100 flex flex-col antialiased selection:bg-cyan-500 selection:text-black">
        {/* Global Navigation Header */}
        <header className="sticky top-0 z-50 w-full border-b border-neutral-800/80 bg-neutral-950/70 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-fuchsia-500 flex items-center justify-center font-black text-black text-sm tracking-tighter shadow-[0_0_20px_rgba(0,240,255,0.4)] group-hover:scale-105 transition-transform">
                AU
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-wider text-white flex items-center gap-1.5">
                  AURA <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">STUDIO</span>
                </span>
                <span className="text-[9px] uppercase font-mono text-neutral-400 tracking-widest hidden sm:inline">
                  INTELLIGENT VIRTUAL TRY-ON
                </span>
              </div>
            </Link>

            {/* Navigation Mode Switcher */}
            <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-1">
              <Link
                href="/try-on/footwear"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800/80 border border-transparent hover:border-neutral-700 transition shrink-0"
              >
                <Footprints className="w-3.5 h-3.5 text-cyan-400" />
                <span>Footwear AR</span>
              </Link>

              <Link
                href="/try-on/apparel"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800/80 border border-transparent hover:border-neutral-700 transition shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>Apparel AI</span>
              </Link>

              <Link
                href="/try-on/grooming"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800/80 border border-transparent hover:border-neutral-700 transition shrink-0"
              >
                <Scissors className="w-3.5 h-3.5 text-amber-400" />
                <span>Facial Grooming</span>
              </Link>

              <Link
                href="/advisor"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800/80 border border-transparent hover:border-neutral-700 transition shrink-0"
              >
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>Style Advisor</span>
              </Link>
            </nav>

            {/* Backend Gateway Health Indicator */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-2 px-3 py-1 bg-neutral-900/90 border border-neutral-800 rounded-full text-[11px] font-mono text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>ASP.NET 9 Minimal API</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="w-full border-t border-neutral-800/60 bg-neutral-950/40 py-6 text-center text-xs text-neutral-500 font-mono">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>AURA Virtual Try-On Studio • Footwear AR + Apparel AI + Facial Grooming + Style Advisory</span>
            <span className="text-[11px] text-neutral-600">
              Three.js • MediaPipe 468 FaceMesh • ASP.NET Core 9 • Replicate Inpainting • Redis
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
