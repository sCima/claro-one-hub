'use client';

import { useState } from 'react';
import { Gift } from 'lucide-react';
import type { ClubeData, ClubeReward } from '../../../data/mockData';

const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');
const fmtNum = (n: number) => n.toLocaleString('pt-BR');

interface Props {
  clube: ClubeData;
  onRedeem: (reward: ClubeReward) => void;
}

export function ClubePage({ clube, onRedeem }: Props) {
  const cats = ['Todas', ...new Set(clube.rewards.map(r => r.category))];
  const [cat, setCat] = useState('Todas');

  const filtered = cat === 'Todas' ? clube.rewards : clube.rewards.filter(r => r.category === cat);

  return (
    <div className="space-y-6">
      <header className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white rounded-3xl p-8 lg:p-10 relative overflow-hidden">
        <div aria-hidden className="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-white/15 blur-3xl" />
        <div className="relative grid lg:grid-cols-3 gap-6 items-end">
          <div className="lg:col-span-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-80 mb-1">Claro Clube</p>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight">Tier {clube.tier}</h1>
            <p className="opacity-80 mt-2 max-w-md">
              2x acúmulo nas faturas, fast lane no suporte e acesso antecipado a shows e lançamentos Apple.
            </p>
          </div>
          <div className="bg-black/20 backdrop-blur rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-80">Saldo atual</p>
            <p className="text-4xl font-black tabular-nums mt-2">
              {fmtNum(clube.points)}<span className="text-base font-bold opacity-70 ml-1">pts</span>
            </p>
            <p className="text-xs opacity-80 mt-2">
              {fmtNum(clube.expiringPoints)} pts expiram em {clube.expiringDate.split('-').reverse().join('/')}
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {cats.map(c => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={cx(
              'text-xs font-bold rounded-full px-4 py-2 transition-colors',
              c === cat
                ? 'bg-warm-900 text-white dark:bg-warm-50 dark:text-warm-900'
                : 'bg-white dark:bg-warm-800 text-warm-600 dark:text-warm-200 border border-warm-200/70 dark:border-warm-700 hover:border-warm-900 dark:hover:border-warm-50'
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(r => {
          const reachable = clube.points >= r.cost;
          return (
            <div
              key={r.id}
              className="bg-white dark:bg-warm-800 border border-warm-200/70 dark:border-warm-700 rounded-3xl p-6 flex flex-col"
            >
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-warm-100 to-warm-200 dark:from-warm-700 dark:to-warm-600 mb-5 flex items-center justify-center relative overflow-hidden">
                <Gift size={42} className="text-warm-400 dark:text-warm-300" />
                <div className="absolute top-3 right-3">
                  <span className={cx(
                    'inline-flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase rounded-full px-2.5 py-1',
                    reachable
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-warm-100 text-warm-700 dark:bg-warm-700 dark:text-warm-200'
                  )}>
                    {r.category}
                  </span>
                </div>
              </div>
              <p className="text-sm font-black mb-1">{r.label}</p>
              <p className="text-[11px] text-warm-500 mb-4">Validade 90 dias após resgate</p>
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-warm-100 dark:border-warm-700">
                <span className={cx('text-sm font-black tabular-nums', reachable ? 'text-amber-700 dark:text-amber-400' : 'text-warm-400')}>
                  {fmtNum(r.cost)} pts
                </span>
                <button
                  disabled={!reachable}
                  onClick={() => onRedeem(r)}
                  className="text-xs font-bold rounded-full px-4 py-2 bg-warm-900 dark:bg-warm-50 dark:text-warm-900 text-white hover:bg-claro dark:hover:bg-claro dark:hover:text-white disabled:bg-warm-200 dark:disabled:bg-warm-700 disabled:text-warm-400 transition-colors"
                >
                  {reachable ? 'Resgatar' : 'Insuficiente'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
