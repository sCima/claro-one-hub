'use client';

import { motion } from 'framer-motion';

const MARQUEE = [
  'Combo Multi · Internet 1 Giga + TV + Celular por R$ 199,90',
  'Claro Fixo Ilimitado com 50% off nos 3 primeiros meses',
  'Troque de aparelho no Clube Ouro com até 30% de desconto',
  'Claro TV+ com Netflix Premium incluso a partir de R$ 139,90',
  'Instalação grátis da fibra óptica até 30/05',
];

export function OfferStrip() {
  return (
    <div className="bg-[#D52B1E] text-white overflow-hidden">
      <motion.div
        className="flex gap-12 py-2.5 whitespace-nowrap text-xs font-medium tracking-wide"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
      >
        {[...MARQUEE, ...MARQUEE].map((item, i) => (
          <span key={i} className="flex items-center gap-3 shrink-0">
            <span className="w-1 h-1 rounded-full bg-white/60" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
