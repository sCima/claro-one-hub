'use client';

import { motion } from 'framer-motion';

const WAVE = `
M -100 0
Q -75 -22 -50 0 T 0 0 T 50 0 T 100 0 T 150 0 T 200 0
T 250 0 T 300 0 T 350 0 T 400 0 T 450 0 T 500 0 T 550 0
L 550 800 L -100 800 Z
`;

export function LoadingScreen({ onComplete }: { onComplete?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
      className="fixed inset-0 z-[200] bg-white flex items-center justify-center overflow-hidden"
    >
      {/* sutil grão de fundo */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '4px 4px',
        }}
      />

      <div className="relative w-72 sm:w-[28rem]">
        <svg viewBox="0 0 480 160" className="w-full overflow-visible" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="wave-clip" clipPathUnits="userSpaceOnUse">
              <motion.g
                initial={{ x: -480, y: 320 }}
                animate={{ x: 220, y: -220 }}
                transition={{ duration: 2.0, ease: [0.65, 0, 0.35, 1] }}
                onAnimationComplete={onComplete}
              >
                <g transform="rotate(-45 0 0)">
                  <path d={WAVE} fill="white" />
                </g>
              </motion.g>
            </clipPath>
          </defs>

          {/* Base — outline cinza */}
          <text
            x="240" y="118" textAnchor="middle"
            fontFamily="Arial Black, Arial, sans-serif"
            fontSize="138" fontWeight="900" fontStyle="italic"
            letterSpacing="-4"
            fill="none" stroke="#E6E6E6" strokeWidth="1.5"
          >claro</text>

          {/* Vermelho preenchido pela onda */}
          <g clipPath="url(#wave-clip)">
            <text
              x="240" y="118" textAnchor="middle"
              fontFamily="Arial Black, Arial, sans-serif"
              fontSize="138" fontWeight="900" fontStyle="italic"
              letterSpacing="-4"
              fill="#D52B1E"
            >claro</text>
          </g>
        </svg>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.4 }}
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.4em] uppercase text-[#ADAFAF]"
        >
          One Hub · 2026
        </motion.div>
      </div>
    </motion.div>
  );
}
