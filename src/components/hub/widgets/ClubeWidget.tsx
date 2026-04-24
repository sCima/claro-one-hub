'use client';

import { motion } from 'framer-motion';
import { Award, Sparkles, ArrowRight } from 'lucide-react';
import { mockClube } from '../../../data/mockData';

type Clube = typeof mockClube;

const fmt = (n: number) => n.toLocaleString('pt-BR');

export function ClubeWidget({ clube }: { clube: Clube }) {
  const progress = Math.min((clube.points / clube.nextTierAt) * 100, 100);
  const remaining = clube.nextTierAt - clube.points;

  return (
    <section className="bg-gradient-to-br from-yellow-50 via-white to-white border border-yellow-100 rounded-3xl p-7 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200/40 rounded-full blur-3xl" />

      <header className="relative flex items-start justify-between mb-5">
        <div>
          <p className="text-[10px] font-bold text-yellow-700 uppercase tracking-widest mb-1">
            Claro Clube · {clube.tier}
          </p>
          <h3 className="text-2xl font-black text-black tracking-tight">Seus pontos</h3>
        </div>
        <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
          <Award className="w-5 h-5 text-yellow-700" strokeWidth={1.6} />
        </div>
      </header>

      <div className="relative">
        <div className="flex items-baseline gap-2 mb-1">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black text-black tracking-tight"
          >
            {fmt(clube.points)}
          </motion.span>
          <span className="text-sm text-gray-500 font-bold">pts</span>
          <span className="ml-auto text-[10px] font-bold bg-black text-white rounded-full px-2 py-0.5 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> {clube.multiplier}x acúmulo
          </span>
        </div>

        <p className="text-xs text-gray-500 mb-4">
          Faltam <b className="text-black">{fmt(remaining)} pts</b> para o tier Diamante
        </p>

        <div className="w-full h-2 bg-yellow-100 rounded-full overflow-hidden mb-1">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 font-bold">
          <span>Ouro</span>
          <span>{fmt(clube.nextTierAt)}</span>
        </div>

        <div className="mt-5 pt-5 border-t border-yellow-100">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Resgates rápidos</p>
          <ul className="space-y-2">
            {clube.rewards.slice(0, 3).map((r) => {
              const reachable = clube.points >= r.cost;
              return (
                <li
                  key={r.id}
                  className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors
                    ${reachable ? 'hover:bg-yellow-50' : 'opacity-50'}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-black truncate">{r.label}</p>
                    <p className="text-[10px] text-gray-400">{r.category}</p>
                  </div>
                  <span className="text-[11px] font-black text-black">{fmt(r.cost)} pts</span>
                </li>
              );
            })}
          </ul>
          <button className="mt-3 w-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-black hover:text-[#D52B1E] transition-colors">
            Ver catálogo completo <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </section>
  );
}
