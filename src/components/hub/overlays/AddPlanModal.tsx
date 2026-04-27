'use client';

import { useState, useEffect } from 'react';
import {
  X, Check, ArrowRight, PlayCircle, Tv, Antenna, Phone, Plus,
} from 'lucide-react';
import { availablePlans, type AvailablePlan } from '../../../data/mockData';

const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');
const fmtBRL = (n: number) => n.toFixed(2).replace('.', ',');

const ICON_MAP = { PlayCircle, Tv, Antenna, Phone } as const;
type IconName = keyof typeof ICON_MAP;

interface Props {
  open: boolean;
  preselectId?: string | null;
  onClose: () => void;
  onConfirm: (plan: AvailablePlan) => void;
}

export function AddPlanModal({ open, preselectId, onClose, onConfirm }: Props) {
  const [stage, setStage] = useState<'select' | 'done'>('select');
  const [selected, setSelected] = useState<AvailablePlan | null>(null);

  useEffect(() => {
    if (open) {
      setStage('select');
      const initial = preselectId
        ? availablePlans.find((p) => p.id === preselectId) ?? availablePlans[0]
        : availablePlans[0];
      setSelected(initial);
    }
  }, [open, preselectId]);

  if (!open) return null;

  const confirm = () => {
    if (!selected) return;
    onConfirm(selected);
    setStage('done');
    setTimeout(() => { onClose(); }, 1600);
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-warm-900/50 backdrop-blur-sm anim-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-warm-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-warm-900 text-white px-7 py-6 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-60 mb-1 flex items-center gap-2">
              <Plus size={12} /> Combo Multi
            </p>
            <p className="text-2xl font-black">Adicionar plano ao combo</p>
            <p className="text-[12px] opacity-70 mt-1.5">
              Quanto mais serviços, maior o desconto na fatura.
            </p>
          </div>
          <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">
            <X size={18} />
          </button>
        </div>

        {stage === 'select' && (
          <>
            <div className="p-6 overflow-y-auto flex-1">
              <ul className="space-y-2">
                {availablePlans.map((p) => {
                  const Icon = ICON_MAP[p.icon as IconName] ?? PlayCircle;
                  const isSel = selected?.id === p.id;
                  return (
                    <li key={p.id}>
                      <button
                        onClick={() => setSelected(p)}
                        className={cx(
                          'w-full flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left',
                          isSel
                            ? 'border-claro bg-claro-soft dark:bg-claro/10'
                            : 'border-warm-200 dark:border-warm-700 hover:border-warm-400'
                        )}
                      >
                        <div
                          className={cx(
                            'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
                            isSel
                              ? 'bg-claro text-white'
                              : 'bg-warm-100 dark:bg-warm-700 text-warm-600 dark:text-warm-200'
                          )}
                        >
                          <Icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3 mb-1">
                            <p className="text-sm font-black">{p.brand}</p>
                            <div className="flex items-baseline gap-0.5 shrink-0">
                              {p.price === 0 ? (
                                <span className="text-sm font-black text-green-600 dark:text-green-400 uppercase tracking-wider">Grátis</span>
                              ) : (
                                <>
                                  <span className="text-[10px] font-bold text-warm-400">R$</span>
                                  <span className="text-base font-black tabular-nums">{fmtBRL(p.price)}</span>
                                  <span className="text-[10px] text-warm-400">/mês</span>
                                </>
                              )}
                            </div>
                          </div>
                          <p className="text-[12px] text-warm-500 leading-snug">{p.desc}</p>
                          {p.comboDiscount > 0 && (
                            <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold tracking-widest uppercase rounded-full px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              + {p.comboDiscount}% off no combo
                            </span>
                          )}
                        </div>
                        <span
                          className={cx(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 shrink-0',
                            isSel ? 'border-claro bg-claro' : 'border-warm-300'
                          )}
                        >
                          {isSel && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="border-t border-warm-100 dark:border-warm-700 p-5 flex items-center justify-between gap-4 bg-warm-50/60 dark:bg-warm-800">
              <div className="text-xs text-warm-500">
                {selected ? (
                  <>
                    Adicionando <span className="font-bold text-warm-900 dark:text-warm-50">{selected.brand}</span> ·{' '}
                    {selected.price === 0 ? (
                      <span className="font-black text-green-600 dark:text-green-400 uppercase tracking-wider">Grátis</span>
                    ) : (
                      <>
                        <span className="font-black tabular-nums text-warm-900 dark:text-warm-50">
                          R$ {fmtBRL(selected.price)}
                        </span>
                        /mês
                      </>
                    )}
                  </>
                ) : 'Selecione um plano acima'}
              </div>
              <button
                onClick={confirm}
                disabled={!selected}
                className="inline-flex items-center gap-2 font-bold rounded-full transition-colors text-sm px-6 py-3 bg-claro text-white hover:bg-claro-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adicionar ao combo <ArrowRight size={14} />
              </button>
            </div>
          </>
        )}

        {stage === 'done' && (
          <div className="p-12 text-center anim-in">
            <div className="relative w-20 h-20 mx-auto mb-5">
              <div className="absolute inset-0 bg-green-500/20 rounded-full ping-dot" />
              <div className="relative w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
                <Check size={40} strokeWidth={3.5} className="text-white" />
              </div>
            </div>
            <p className="text-xl font-black mb-1">{selected?.brand} adicionado!</p>
            <p className="text-sm text-warm-500">
              Já está disponível no seu combo. Aparecerá na próxima fatura.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
