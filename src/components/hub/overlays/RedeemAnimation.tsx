'use client';

import { useEffect } from 'react';
import { Gift } from 'lucide-react';
import type { ClubeReward } from '../../../data/mockData';

const fmtNum = (n: number) => n.toLocaleString('pt-BR');

interface Props {
  reward: ClubeReward;
  onDone: () => void;
}

export function RedeemAnimation({ reward, onDone }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  if (!reward) return null;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-warm-900/60 backdrop-blur-sm anim-in"
      onClick={onDone}
    >
      <div className="bg-white dark:bg-warm-800 rounded-3xl p-10 text-center max-w-sm shadow-2xl">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 bg-amber-400/30 rounded-full ping-dot" />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <Gift size={44} className="text-white" />
          </div>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-700 dark:text-amber-400 mb-2">
          Resgate confirmado
        </p>
        <p className="text-xl font-black mb-1">{reward.label}</p>
        <p className="text-sm text-warm-500">{fmtNum(reward.cost)} pts debitados · cupom no e-mail</p>
      </div>
    </div>
  );
}
