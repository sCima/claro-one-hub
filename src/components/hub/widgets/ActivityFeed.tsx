'use client';

import { CreditCard, Smartphone, Gift, TrendingUp, TrendingDown, Plus, type LucideIcon } from 'lucide-react';
import type { Activity } from '../../../data/mockData';

const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');

const fmtDate = (iso: string) => {
  const [, m, d] = iso.split('-');
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${d} ${months[+m - 1]}`;
};

const ICONS: Record<string, LucideIcon> = {
  CreditCard,
  Smartphone,
  Gift,
  TrendingUp,
  TrendingDown,
  Plus,
};

interface Props {
  items: Activity[];
}

export function ActivityFeed({ items }: Props) {
  return (
    <section className="bg-white dark:bg-warm-800 border border-warm-200/70 dark:border-warm-700 rounded-3xl p-7">
      <header className="flex items-end justify-between mb-5">
        <div>
          <p className="text-[10px] font-bold text-claro uppercase tracking-[0.22em] mb-1">
            Últimas movimentações
          </p>
          <h3 className="text-2xl font-black tracking-tight">Atividade</h3>
        </div>
      </header>

      <ul className="space-y-1">
        {items.map((a) => {
          const Icon = ICONS[a.icon] ?? CreditCard;
          const positive = a.amount > 0;
          const isPoints = a.unit === 'pts';
          const fmt = isPoints
            ? `${positive ? '+' : ''}${Math.abs(a.amount).toLocaleString('pt-BR')} pts`
            : `${positive ? '+' : '−'} R$ ${Math.abs(a.amount).toFixed(2).replace('.', ',')}`;

          return (
            <li
              key={a.id}
              className="flex items-center gap-4 py-3 border-b border-warm-100 dark:border-warm-700 last:border-0"
            >
              <div className="w-9 h-9 rounded-xl bg-warm-100 dark:bg-warm-700 flex items-center justify-center shrink-0">
                <Icon size={16} className="text-warm-700 dark:text-warm-300" strokeWidth={1.7} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{a.label}</p>
                <p className="text-[10px] text-warm-400 mt-0.5">{fmtDate(a.date)} · {a.type}</p>
              </div>
              <span
                className={cx(
                  'text-sm font-black tabular-nums shrink-0',
                  positive ? 'text-green-600' : isPoints ? 'text-amber-700' : 'text-warm-900 dark:text-warm-50',
                )}
              >
                {fmt}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
