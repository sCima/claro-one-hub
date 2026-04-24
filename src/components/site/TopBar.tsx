'use client';

import { ChevronDown, MapPin, HeadphonesIcon, User2 } from 'lucide-react';

export function TopBar() {
  return (
    <div className="hidden md:block bg-black text-white text-xs">
      <div className="max-w-7xl mx-auto px-6 h-9 flex items-center justify-between">
        <div className="flex items-center gap-5 text-white/70">
          <button className="flex items-center gap-1.5 hover:text-white transition-colors">
            <MapPin className="w-3 h-3" strokeWidth={1.8} /> São Paulo, SP
            <ChevronDown className="w-3 h-3" />
          </button>
          <span className="text-white/30">|</span>
          <a className="hover:text-white transition-colors" href="#">Para Empresas</a>
          <a className="hover:text-white transition-colors" href="#">Investidores</a>
          <a className="hover:text-white transition-colors" href="#">Sustentabilidade</a>
        </div>
        <div className="flex items-center gap-5 text-white/70">
          <a className="flex items-center gap-1.5 hover:text-white transition-colors" href="#">
            <HeadphonesIcon className="w-3 h-3" strokeWidth={1.8} /> Atendimento *1052
          </a>
          <a className="flex items-center gap-1.5 hover:text-white transition-colors" href="#">
            <User2 className="w-3 h-3" strokeWidth={1.8} /> Sou cliente
          </a>
        </div>
      </div>
    </div>
  );
}
