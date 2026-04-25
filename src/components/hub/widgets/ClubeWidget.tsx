'use client';

import { Award, Sparkles } from 'lucide-react';
import type { ClubeData, ClubeReward } from '../../../data/mockData';

const fmtNum = (n: number) => n.toLocaleString('pt-BR');

interface Props {
  clube: ClubeData;
  onRedeem: (reward: ClubeReward) => void;
}

export function ClubeWidget({ clube, onRedeem }: Props) {
  const progress = Math.min((clube.points / clube.nextTierAt) * 100, 100);
  const remaining = clube.nextTierAt - clube.points;

  return (
    <section
      className="bg-gradient-to-br from-amber-50 via-white to-white dark:from-amber-900/20 dark:via-warm-800 dark:to-warm-800 border border-amber-100 dark:border-warm-700 rounded-3xl p-7 relative overflow-hidden"
      data-tour="clube"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/40 dark:bg-amber-500/10 rounded-full blur-3xl" />

      <header className="relative flex items-start justify-between mb-5">
        <div>
          <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-[0.22em] mb-1">
            Claro Clube · {clube.tier}
          </p>
          <h3 className="text-2xl font-black tracking-tight">Seus pontos</h3>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
          <Award size={20} className="text-amber-700 dark:text-amber-400" />
        </div>
      </header>

      <div className="relative">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-5xl font-black tracking-tight tabular-nums">{fmtNum(clube.points)}</span>
          <span className="text-sm text-warm-500 font-bold">pts</span>
          <span className="ml-auto text-[10px] font-bold bg-warm-900 dark:bg-warm-50 dark:text-warm-900 text-white rounded-full px-2 py-0.5 flex items-center gap-1">
            <Sparkles size={10} /> {clube.multiplier}x acúmulo
          </span>
        </div>

        <p className="text-xs text-warm-500 mb-4">
          Faltam <b className="text-warm-900 dark:text-warm-50">{fmtNum(remaining)} pts</b> para o tier Diamante
        </p>

        <div className="w-full h-2 bg-amber-100 dark:bg-warm-700 rounded-full overflow-hidden mb-1">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-warm-400 font-bold">
          <span>Ouro</span>
          <span>{fmtNum(clube.nextTierAt)}</span>
        </div>

        <div className="mt-5 pt-5 border-t border-amber-100 dark:border-warm-700">
          <p className="text-[10px] font-bold text-warm-500 uppercase tracking-[0.22em] mb-3">Resgates rápidos</p>
          <ul className="space-y-2">
            {clube.rewards.slice(0, 3).map((r) => {
              const reachable = clube.points >= r.cost;
              return (
                <li key={r.id}>
                  <button
                    disabled={!reachable}
                    onClick={() => onRedeem(r)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                  >
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-bold text-warm-900 dark:text-warm-50 truncate">{r.label}</p>
                      <p className="text-[10px] text-warm-400">{r.category}</p>
                    </div>
                    <span className="text-[11px] font-black tabular-nums">{fmtNum(r.cost)} pts</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
