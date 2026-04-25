'use client';

import { AlertTriangle, X } from 'lucide-react';

const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');

interface Props {
  onDismiss: () => void;
}

export function NetworkStatusBanner({ onDismiss }: Props) {
  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs px-6 lg:px-10 py-2.5 flex items-center gap-3">
      <AlertTriangle size={14} className="text-amber-600 shrink-0" />
      <span className="flex-1">
        <b>Instabilidade localizada</b> na internet fibra em São Paulo (Zona Sul) · equipe técnica atuando · previsão de normalização em 45 min.
      </span>
      <button className="text-[10px] font-bold hover:underline">Status</button>
      <button onClick={onDismiss} className="opacity-60 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}
