'use client';

import { useState } from 'react';
import { MessageCircle, MessageSquare, Phone, ShoppingBag, ChevronDown } from 'lucide-react';
import { useClaroContext } from '../../../context/ClaroContext';
import { faqs } from '../../../data/mockData';

const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');

const CHANNEL_ICONS = { MessageCircle, MessageSquare, Phone, ShoppingBag } as const;
type ChannelIconName = keyof typeof CHANNEL_ICONS;

export function SupportPage() {
  const { supportChannels } = useClaroContext();
  const [open, setOpen] = useState<number>(-1);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] font-bold text-claro uppercase tracking-[0.22em] mb-2">Atendimento</p>
        <h1 className="text-4xl font-black tracking-tight">Suporte</h1>
        <p className="text-sm text-warm-500 mt-2">Fale com a Claro pelo canal que preferir.</p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {supportChannels.map(ch => {
          const Icon = CHANNEL_ICONS[ch.icon as ChannelIconName];
          return (
            <div
              key={ch.id}
              className="bg-white dark:bg-warm-800 border border-warm-200/70 dark:border-warm-700 rounded-3xl p-6 flex flex-col gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-claro-soft flex items-center justify-center">
                {Icon && <Icon size={22} className="text-claro" />}
              </div>
              <div className="flex-1">
                <p className="font-black text-sm mb-1">{ch.label}</p>
                {ch.wait && (
                  <p className="text-[11px] text-warm-500">
                    Tempo de espera: <span className="font-bold text-green-600 dark:text-green-400">{ch.wait}</span>
                  </p>
                )}
                {ch.number && (
                  <p className="text-[11px] text-warm-500">
                    Ligue: <span className="font-bold text-warm-900 dark:text-warm-50">{ch.number}</span>
                  </p>
                )}
                <span className={cx(
                  'inline-flex items-center mt-2 text-[10px] font-bold tracking-widest uppercase rounded-full px-2.5 py-1',
                  ch.available
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-warm-100 text-warm-500 dark:bg-warm-700 dark:text-warm-400'
                )}>
                  {ch.available ? 'Disponível' : 'Indisponível'}
                </span>
              </div>
              <button className="w-full text-xs font-bold rounded-full py-2.5 bg-warm-900 text-white hover:bg-claro dark:bg-warm-50 dark:text-warm-900 dark:hover:bg-claro dark:hover:text-white transition-colors">
                Iniciar
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-warm-800 border border-warm-200/70 dark:border-warm-700 rounded-3xl overflow-hidden">
        <div className="px-6 py-6 border-b border-warm-100 dark:border-warm-700">
          <h2 className="text-xl font-bold tracking-tight">Perguntas frequentes</h2>
        </div>
        <ul className="divide-y divide-warm-100 dark:divide-warm-700">
          {faqs.map((faq, i) => (
            <li key={i}>
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left transition-colors"
              >
                <span className="text-sm font-bold">{faq.q}</span>
                <ChevronDown
                  size={16}
                  className={cx(
                    'text-warm-400 shrink-0 transition-transform duration-200',
                    open === i && 'rotate-180'
                  )}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-5 anim-in">
                  <p className="text-sm text-claro leading-relaxed">{faq.a}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
