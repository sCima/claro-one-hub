'use client';

/* One Hub · aviso persistente de conversa/atendimento em andamento.
 * Reforça o §4: o cliente sempre sabe que tem um atendimento vivo e pode
 * retomá-lo de qualquer tela, sem recomeçar. */

import { MessageCircle, X, ArrowRight } from 'lucide-react';
import { useClaroContext } from '../../../context/ClaroContext';
import { intentLabel } from '../../../services/claraNlu';

interface Props {
  onDismiss: () => void;
  onResume: () => void;      // abre a Clara
  onOpenAtendimento: () => void;
}

export function ActiveConversationBanner({ onDismiss, onResume, onOpenAtendimento }: Props) {
  const { session, myTicket } = useClaroContext();

  const historico = session?.historico ?? [];
  const ticketOpen = myTicket && myTicket.status !== 'resolvido';
  const lastIntent = session?.contextoAtual.lastIntent;
  const conversationLive =
    historico.length > 0 &&
    session?.status !== 'encerrada' &&
    lastIntent && lastIntent !== 'despedida' && lastIntent !== 'saudacao';

  if (!ticketOpen && !conversationLive) return null;

  const assunto = lastIntent ? intentLabel(lastIntent) : 'seu atendimento';

  return (
    <div className="bg-claro-soft dark:bg-claro/10 border-b border-claro/20 text-claro-dark dark:text-claro text-xs px-6 lg:px-10 py-2.5 flex items-center gap-3">
      <MessageCircle size={14} className="shrink-0" />
      <span className="flex-1 min-w-0">
        {ticketOpen
          ? <><b>Atendimento em andamento</b> · chamado {myTicket!.ticketId} ({myTicket!.status === 'em_atendimento' ? 'com atendente' : 'na fila'})</>
          : <><b>Conversa em andamento</b> sobre {assunto} — você não precisa recomeçar</>}
      </span>
      <button
        onClick={ticketOpen ? onOpenAtendimento : onResume}
        className="shrink-0 inline-flex items-center gap-1 font-bold hover:underline"
      >
        {ticketOpen ? 'Acompanhar' : 'Retomar'} <ArrowRight size={12} />
      </button>
      <button onClick={onDismiss} className="opacity-60 hover:opacity-100 shrink-0" aria-label="Dispensar aviso">
        <X size={13} />
      </button>
    </div>
  );
}
