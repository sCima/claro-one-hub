'use client';

/* Notificação proativa de incidente técnico (RF006) — banner na Visão Geral.
 * O conteúdo vem dos incidentes ATIVOS registrados pela equipe técnica no
 * One Hub Admin; sem incidente ativo, o banner não aparece. */

import { useState } from 'react';
import { AlertTriangle, X, Info } from 'lucide-react';
import { useClaroContext } from '../../context/ClaroContext';
import { INCIDENT_SERVICO_LABEL, INCIDENT_SEVERITY } from '../../data/mockData';

const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');

interface Props {
  onDismiss: () => void;
}

export function NetworkStatusBanner({ onDismiss }: Props) {
  const { activeIncidents } = useClaroContext();
  const [openId, setOpenId] = useState<string | null>(null);

  if (activeIncidents.length === 0) return null;

  /* mostra o mais severo; os demais entram num contador */
  const order = { critico: 0, alto: 1, moderado: 2, informativo: 3 } as const;
  const sorted = [...activeIncidents].sort((a, b) => order[a.severidade] - order[b.severidade]);
  const inc = sorted[0];
  const others = sorted.length - 1;
  const critico = inc.severidade === 'critico';
  const expanded = openId === inc.id;

  return (
    <div
      className={cx(
        'text-xs px-6 lg:px-10 py-2.5 border-b',
        critico
          ? 'bg-claro/10 dark:bg-claro/15 border-claro/30 text-claro-dark dark:text-claro'
          : 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/40 text-amber-900 dark:text-amber-200',
      )}
    >
      <div className="flex items-center gap-3">
        {critico ? <AlertTriangle size={14} className="text-claro shrink-0" /> : <AlertTriangle size={14} className="text-amber-600 shrink-0" />}
        <span className="flex-1 min-w-0">
          <b>{inc.titulo}</b>
          {' · '}{inc.servicos.map((s) => INCIDENT_SERVICO_LABEL[s]).join(', ')}
          {' · '}{inc.previsao}
          {others > 0 && <span className="opacity-70"> · +{others} incidente(s)</span>}
        </span>
        <span className={cx('hidden sm:inline text-[9px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5', INCIDENT_SEVERITY[inc.severidade].badge)}>
          {INCIDENT_SEVERITY[inc.severidade].label}
        </span>
        <button
          onClick={() => setOpenId(expanded ? null : inc.id)}
          className="text-[10px] font-bold hover:underline shrink-0"
        >
          {expanded ? 'Ocultar' : 'Detalhes'}
        </button>
        <button onClick={onDismiss} className="opacity-60 hover:opacity-100 shrink-0" aria-label="Fechar aviso">
          <X size={14} />
        </button>
      </div>

      {expanded && (
        <div className="mt-2 pl-7 flex items-start gap-2 text-[11px] leading-relaxed opacity-90">
          <Info size={12} className="shrink-0 mt-0.5" />
          <span>
            {inc.descricao} <span className="opacity-70">— protocolo {inc.id}, aberto por {inc.abertoPor}.</span>
          </span>
        </div>
      )}
    </div>
  );
}
