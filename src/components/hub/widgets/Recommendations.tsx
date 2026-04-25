'use client';

import React from 'react';
import { PlayCircle, Phone, Gift, Tv, ArrowUpRight, type LucideIcon } from 'lucide-react';
import type { Recommendation } from '../../../data/mockData';

const ICON_COMPONENTS: Record<string, LucideIcon> = {
  PlayCircle,
  Phone,
  Gift,
  Tv,
};

interface Props {
  items: Recommendation[];
}

export function Recommendations({ items }: Props) {
  return (
    <section>
      <header className="flex items-end justify-between mb-5">
        <div>
          <p className="text-[10px] font-bold text-claro uppercase tracking-[0.22em] mb-1">
            Personalizado para você
          </p>
          <h2 className="text-2xl font-black tracking-tight">Pra somar ao seu combo</h2>
        </div>
      </header>

      <div className="grid sm:grid-cols-3 gap-3">
        {items.map((r) => {
          const I = ICON_COMPONENTS[r.icon] ?? Tv;
          return (
            <a
              key={r.slug}
              href="#"
              className="group relative block bg-white dark:bg-warm-800 border border-warm-200/70 dark:border-warm-700 hover:border-claro rounded-2xl p-5 transition-colors h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-warm-100 dark:bg-warm-700 flex items-center justify-center group-hover:bg-claro transition-colors">
                  <I size={20} className="text-claro group-hover:text-white transition-colors" />
                </div>
                <ArrowUpRight
                  size={16}
                  className="text-warm-300 group-hover:text-claro group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                />
              </div>

              <p className="text-sm font-black mb-1">{r.brand}</p>
              <p className="text-[11px] text-warm-500 leading-snug mb-4">{r.reason}</p>

              <div className="flex items-baseline gap-1 pt-3 border-t border-warm-100 dark:border-warm-700">
                <span className="text-[10px] text-warm-400">a partir de</span>
                <span className="text-sm font-black tabular-nums">
                  R$ {r.priceFrom.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
