'use client';

import { Rocket } from 'lucide-react';

export function UpgradeCTA() {
  return (
    <div className="relative overflow-hidden rounded-3xl p-7 bg-gradient-to-br from-claro to-claro-dark text-white">
      <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex items-center gap-6 flex-wrap">
        <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
          <Rocket size={22} />
        </div>
        <div className="flex-1 min-w-[240px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-80 mb-1">Upgrade sugerido</p>
          <p className="text-xl font-black leading-tight">
            Suba para o Combo Multi 4 e economize R$ 89/mês
          </p>
          <p className="text-sm opacity-80 mt-1">
            Adicione Claro Fone e ganhe 500 pts Clube por 6 meses.
          </p>
        </div>
        <button className="bg-white text-claro font-bold text-sm rounded-full px-6 py-3 hover:bg-warm-100">
          Simular upgrade
        </button>
      </div>
    </div>
  );
}
