'use client';

import { useEffect } from 'react';
import Image from 'next/image';

const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');

interface Props {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: Props) {
  useEffect(() => {
    const t = setTimeout(onComplete, 2200);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[200] bg-warm-50 dark:bg-warm-900 flex items-center justify-center overflow-hidden"
      style={{ animation: 'fade-out 2.6s ease forwards' }}
    >
      {/* Wave rising */}
      <div
        className="absolute inset-x-0 bottom-0 h-full pointer-events-none"
        style={{ animation: 'wave-rise 1.6s cubic-bezier(.22,1,.36,1) forwards' }}
      >
        <svg
          viewBox="0 0 1440 800"
          preserveAspectRatio="none"
          className="w-full h-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="wavegrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D52B1E" />
              <stop offset="100%" stopColor="#9A1F16" />
            </linearGradient>
          </defs>
          <path
            d="M0,260 C240,180 480,340 720,260 C960,180 1200,340 1440,260 L1440,800 L0,800 Z"
            fill="#D52B1E"
            opacity="0.35"
          >
            <animate
              attributeName="d"
              dur="4s"
              repeatCount="indefinite"
              values="M0,260 C240,180 480,340 720,260 C960,180 1200,340 1440,260 L1440,800 L0,800 Z;
                      M0,300 C240,220 480,380 720,300 C960,220 1200,380 1440,300 L1440,800 L0,800 Z;
                      M0,260 C240,180 480,340 720,260 C960,180 1200,340 1440,260 L1440,800 L0,800 Z"
            />
          </path>
          <path
            d="M0,340 C180,260 420,420 720,340 C1020,260 1260,420 1440,340 L1440,800 L0,800 Z"
            fill="url(#wavegrad)"
          >
            <animate
              attributeName="d"
              dur="3.2s"
              repeatCount="indefinite"
              values="M0,340 C180,260 420,420 720,340 C1020,260 1260,420 1440,340 L1440,800 L0,800 Z;
                      M0,380 C180,300 420,460 720,380 C1020,300 1260,460 1440,380 L1440,800 L0,800 Z;
                      M0,340 C180,260 420,420 720,340 C1020,260 1260,420 1440,340 L1440,800 L0,800 Z"
            />
          </path>
        </svg>
      </div>

      {/* Logo centered */}
      <div className="relative z-10 flex flex-col items-center">
        <Image
          src="/logo-redondo.png"
          alt="Claro"
          width={112}
          height={112}
          className="w-28 h-28 drop-shadow-2xl"
          priority
          style={{ animation: 'slide-up-fade 600ms 200ms cubic-bezier(.22,1,.36,1) both' }}
        />
        <p
          className="mt-6 text-[10px] font-bold tracking-[0.4em] uppercase text-warm-700 dark:text-warm-200"
          style={{ animation: 'slide-up-fade 600ms 500ms cubic-bezier(.22,1,.36,1) both' }}
        >
          One Hub
        </p>
        <div className="mt-4 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-warm-400 dark:bg-warm-50/70"
              style={{ animation: `slide-up-fade 400ms ${600 + i * 120}ms both` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
