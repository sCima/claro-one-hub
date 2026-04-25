'use client';

import { Smartphone, Wifi, Tv, Phone, ArrowLeft, Check } from 'lucide-react';
import { serviceDetails } from '../../../data/mockData';
import type { ServiceDetailKey } from '../../../data/mockData';

const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');
const fmtBRL = (n: number) => n.toFixed(2).replace('.', ',');

const ICON_MAP = { Smartphone, Wifi, Tv, Phone } as const;
type IconName = keyof typeof ICON_MAP;

interface Props {
  slug: ServiceDetailKey;
  onBack: () => void;
}

export function ServiceDetailPage({ slug, onBack }: Props) {
  const detail = serviceDetails[slug];
  if (!detail) return null;

  const I = ICON_MAP[detail.icon as IconName];

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="text-xs font-bold text-warm-500 hover:text-warm-900 dark:hover:text-warm-50 flex items-center gap-1"
      >
        <ArrowLeft size={14} /> Voltar para Visão geral
      </button>

      <header className="bg-white dark:bg-warm-800 border border-warm-200/70 dark:border-warm-700 rounded-3xl p-8 lg:p-10 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-claro-soft flex items-center justify-center">
              <I size={22} className="text-claro" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-claro uppercase tracking-[0.22em]">Serviço Claro</p>
              <h1 className="text-3xl font-black tracking-tight">{detail.label}</h1>
            </div>
          </div>
          <p className="text-2xl font-black text-warm-900 dark:text-warm-50 leading-tight tracking-tight max-w-xl">
            {detail.tagline}.
          </p>
          <p className="text-warm-500 mt-3 max-w-xl">{detail.pitch}</p>
        </div>
        <div className="bg-warm-100 dark:bg-warm-700 rounded-2xl p-5">
          <p className="text-[10px] font-bold text-warm-400 uppercase tracking-[0.22em] mb-3">Seu plano atual</p>
          <p className="text-2xl font-black mb-4">
            {detail.plans.find(p => p.popular)?.name ?? detail.plans[0].name}
          </p>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase rounded-full px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <Check size={10} strokeWidth={3} /> Tudo funcionando
          </span>
          <button className="w-full mt-5 inline-flex items-center justify-center font-bold rounded-full transition-colors text-sm px-5 py-2.5 bg-warm-900 text-white hover:bg-claro dark:bg-warm-50 dark:text-warm-900 dark:hover:bg-claro dark:hover:text-white">
            Gerenciar plano
          </button>
        </div>
      </header>

      <section>
        <header className="mb-5">
          <p className="text-[10px] font-bold text-claro uppercase tracking-[0.22em] mb-1">Trocar de plano</p>
          <h2 className="text-2xl font-black tracking-tight">Disponíveis para você</h2>
        </header>
        <div className="grid lg:grid-cols-3 gap-3">
          {detail.plans.map(p => (
            <div
              key={p.name}
              className={cx(
                'relative rounded-3xl p-7 border',
                p.popular
                  ? 'bg-warm-900 text-white border-warm-900'
                  : 'bg-white dark:bg-warm-800 border-warm-200/70 dark:border-warm-700'
              )}
            >
              {p.popular && (
                <span className="absolute -top-3 left-7 bg-claro text-white text-[10px] font-black tracking-widest uppercase rounded-full px-3 py-1">
                  Atual
                </span>
              )}
              <p className={cx('text-[10px] font-bold uppercase tracking-[0.22em] mb-2', p.popular ? 'opacity-60' : 'text-warm-400')}>
                {detail.label}
              </p>
              <h3 className="text-2xl font-black mb-4">{p.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-sm font-bold">R$</span>
                <span className="text-4xl font-black tabular-nums">{Math.floor(p.price)}</span>
                <span className="text-lg font-black">,{fmtBRL(p.price).split(',')[1]}</span>
                <span className={cx('text-xs ml-1', p.popular ? 'opacity-60' : 'text-warm-400')}>/mês</span>
              </div>
              <ul className="space-y-3 text-sm mb-6">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={14} strokeWidth={2.5} className="mt-0.5 shrink-0 text-claro" /> {f}
                  </li>
                ))}
              </ul>
              <button
                disabled={p.popular}
                className={cx(
                  'w-full text-sm font-bold rounded-full py-3 transition-colors',
                  p.popular
                    ? 'bg-white/10 text-white cursor-default'
                    : 'bg-warm-900 text-white hover:bg-claro dark:bg-warm-50 dark:text-warm-900 dark:hover:bg-claro dark:hover:text-white'
                )}
              >
                {p.popular ? 'Plano atual' : 'Mudar para este plano'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
