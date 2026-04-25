'use client';

import { Smartphone, Wifi, Tv, Phone, ChevronRight, type LucideIcon } from 'lucide-react';
import type { Service } from '../../../data/mockData';
import type { SectionId } from '../HubSidebar';

const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');

const ICON_MAP: Record<Service['type'], LucideIcon> = {
  mobile:    Smartphone,
  broadband: Wifi,
  tv:        Tv,
  fixo:      Phone,
};

const ROUTE_MAP: Record<Service['type'], SectionId> = {
  mobile:    'mobile',
  broadband: 'internet',
  tv:        'tv',
  fixo:      'voice',
};

interface Props {
  services: Service[];
  onOpen: (page: SectionId) => void;
}

export function ServicesPanel({ services, onOpen }: Props) {
  return (
    <section data-tour="services">
      <header className="flex items-end justify-between mb-5 gap-4">
        <div>
          <p className="text-[10px] font-bold text-claro uppercase tracking-[0.22em] mb-1">Meus serviços</p>
          <h2 className="text-2xl lg:text-[28px] font-black text-warm-900 dark:text-warm-50 tracking-tight leading-tight">
            {services.length} ativos no combo
          </h2>
        </div>
        <button className="text-xs font-bold text-warm-500 hover:text-warm-900 dark:hover:text-warm-50 flex items-center gap-1">
          Gerenciar <ChevronRight size={14} />
        </button>
      </header>

      <div className="grid sm:grid-cols-2 gap-3">
        {services.map((s) => {
          const Icon = ICON_MAP[s.type];
          const usage =
            s.dataUsed != null && s.dataLimit != null
              ? Math.round((s.dataUsed / s.dataLimit) * 100)
              : null;

          return (
            <button
              key={s.id}
              onClick={() => onOpen(ROUTE_MAP[s.type])}
              className="group text-left bg-white dark:bg-warm-800 border border-warm-200/70 dark:border-warm-700 rounded-2xl p-5 hover:border-warm-900 dark:hover:border-warm-50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-warm-100 dark:bg-warm-700 group-hover:bg-claro flex items-center justify-center transition-colors">
                    <Icon size={16} className="text-claro group-hover:text-white transition-colors" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-warm-400 uppercase tracking-[0.22em]">{s.label}</p>
                    <p className="text-sm font-black leading-tight">{s.plan}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-400 rounded-full px-2 py-0.5">
                  Ativo
                </span>
              </div>

              <p className="text-[11px] text-warm-500 mb-4 truncate">{s.identifier}</p>

              {usage != null ? (
                <div className="mb-4">
                  <div className="flex justify-between text-[10px] text-warm-500 mb-1.5">
                    <span>
                      <b className="text-warm-900 dark:text-warm-50">{s.dataUsed} {s.unit}</b> usados
                    </span>
                    <span>{s.dataLimit} {s.unit}</span>
                  </div>
                  <div className="w-full bg-warm-100 dark:bg-warm-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={cx('h-full rounded-full transition-all', usage > 80 ? 'bg-amber-500' : 'bg-claro')}
                      style={{ width: `${usage}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-warm-400 mt-1.5">{usage}% do plano consumido</p>
                </div>
              ) : s.streaming ? (
                <div className="flex flex-wrap gap-1 mb-4">
                  {s.streaming.map((st) => (
                    <span key={st} className="text-[10px] font-medium bg-warm-100 dark:bg-warm-700 text-warm-600 dark:text-warm-200 px-2 py-0.5 rounded">
                      {st}
                    </span>
                  ))}
                  {s.channels && (
                    <span className="text-[10px] font-medium bg-warm-100 dark:bg-warm-700 text-warm-600 dark:text-warm-200 px-2 py-0.5 rounded">
                      +{s.channels} canais
                    </span>
                  )}
                </div>
              ) : (
                <div className="mb-4 flex items-center gap-1 text-[11px] text-warm-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Linha disponível 24h
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-warm-100 dark:border-warm-700">
                <span className="text-[11px] text-warm-500">
                  <b className="text-warm-900 dark:text-warm-50">R$ {s.amount.toFixed(2).replace('.', ',')}</b> /mês
                </span>
                <span className="text-[11px] font-bold text-warm-900 dark:text-warm-50 group-hover:text-claro flex items-center gap-1">
                  Detalhes <ChevronRight size={12} />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
