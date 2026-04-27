'use client';

import { useEffect } from 'react';
import Image from 'next/image';

interface Props {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: Props) {
  useEffect(() => {
    const t = setTimeout(onComplete, 2400);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[200] bg-white flex items-center justify-center overflow-hidden"
      style={{ animation: 'fade-out 2.8s ease forwards' }}
    >
      {/* Wave rising — fica no fundo, sobe a partir do bottom */}
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
            d="M0,340 C240,260 480,420 720,340 C960,260 1200,420 1440,340 L1440,800 L0,800 Z"
            fill="#D52B1E"
            opacity="0.35"
          >
            <animate
              attributeName="d"
              dur="4s"
              repeatCount="indefinite"
              values="M0,340 C240,260 480,420 720,340 C960,260 1200,420 1440,340 L1440,800 L0,800 Z;
                      M0,380 C240,300 480,460 720,380 C960,300 1200,460 1440,380 L1440,800 L0,800 Z;
                      M0,340 C240,260 480,420 720,340 C960,260 1200,420 1440,340 L1440,800 L0,800 Z"
            />
          </path>
          <path
            d="M0,420 C180,340 420,500 720,420 C1020,340 1260,500 1440,420 L1440,800 L0,800 Z"
            fill="url(#wavegrad)"
          >
            <animate
              attributeName="d"
              dur="3.2s"
              repeatCount="indefinite"
              values="M0,420 C180,340 420,500 720,420 C1020,340 1260,500 1440,420 L1440,800 L0,800 Z;
                      M0,460 C180,380 420,540 720,460 C1020,380 1260,540 1440,460 L1440,800 L0,800 Z;
                      M0,420 C180,340 420,500 720,420 C1020,340 1260,500 1440,420 L1440,800 L0,800 Z"
            />
          </path>
        </svg>
      </div>

      {/* Empilhado: One Hub no branco · X preto · Claro branco no vermelho */}
      <div className="relative z-10 flex flex-col items-center gap-7 sm:gap-9">
        {/* OneHub no fundo branco (acima da onda) */}
        <Image
          src="/logo-onehub.png"
          alt="One Hub"
          width={280}
          height={80}
          className="h-12 sm:h-16 w-auto object-contain"
          priority
          style={{ animation: 'slide-up-fade 700ms 200ms cubic-bezier(.22,1,.36,1) both' }}
        />

        {/* X preto entre os dois logos */}
        <div
          className="flex items-center justify-center"
          style={{ animation: 'slide-up-fade 500ms 450ms cubic-bezier(.22,1,.36,1) both' }}
        >
          <svg
            viewBox="0 0 24 24"
            className="w-7 h-7 sm:w-9 sm:h-9 text-warm-900"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          >
            <line x1="5" y1="5" x2="19" y2="19" />
            <line x1="19" y1="5" x2="5" y2="19" />
          </svg>
        </div>

        {/* Claro branco no fundo vermelho (na onda) */}
        <Image
          src="/logo-texto-branco.png"
          alt="Claro"
          width={280}
          height={96}
          className="h-20 sm:h-28 w-auto object-contain drop-shadow-lg"
          priority
          style={{ animation: 'slide-up-fade 700ms 700ms cubic-bezier(.22,1,.36,1) both' }}
        />
      </div>
    </div>
  );
}
