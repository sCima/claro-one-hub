'use client';

/* One Hub · Central de Atendimento — card em destaque na Visão Geral.
 * Reúne a conversa ativa, o status do chamado e todos os canais num só lugar. */

import Link from 'next/link';
import {
  Sparkles, MessageSquare, Phone, Headphones, ArrowRight, RotateCcw, LifeBuoy,
} from 'lucide-react';
import { useClaroContext } from '../../../context/ClaroContext';
import { intentLabel } from '../../../services/claraNlu';
import { CANAL_LABEL, channelsUsed } from '../../../services/session';

const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');
const openClara = () => window.dispatchEvent(new CustomEvent('onehub:open-clara'));

export function SupportHubCard({ onOpenAtendimento }: { onOpenAtendimento: () => void }) {
  const { session, myTicket } = useClaroContext();
  const historico = session?.historico ?? [];
  const hasConversation = historico.length > 0;
  const canais = session ? channelsUsed(session) : [];
  const ticketOpen = myTicket && myTicket.status !== 'resolvido';

  return (
    <section className="bg-warm-900 dark:bg-warm-800 text-white rounded-3xl p-6 lg:p-7 relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-claro/30 blur-3xl pointer-events-none" />

      <div className="relative flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/50 mb-1 flex items-center gap-1.5">
            <LifeBuoy size={12} /> Central de Atendimento
          </p>
          <h3 className="text-xl lg:text-2xl font-black tracking-tight">
            {hasConversation ? 'Sua conversa está aqui' : 'Precisa de ajuda?'}
          </h3>
        </div>
        <button onClick={onOpenAtendimento} className="text-[11px] font-bold text-white/70 hover:text-white flex items-center gap-1 shrink-0">
          Ver tudo <ArrowRight size={13} />
        </button>
      </div>

      {/* Estado da conversa / chamado */}
      {(hasConversation || ticketOpen) && (
        <button
          onClick={ticketOpen ? onOpenAtendimento : openClara}
          className="relative w-full text-left bg-white/10 hover:bg-white/15 rounded-2xl p-4 mb-4 transition-colors flex items-center gap-3"
        >
          <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center shrink-0">
            {ticketOpen ? <Headphones size={16} /> : <RotateCcw size={16} />}
          </span>
          <div className="flex-1 min-w-0">
            {ticketOpen ? (
              <>
                <p className="text-[13px] font-bold truncate">Chamado {myTicket!.ticketId} · {myTicket!.status === 'em_atendimento' ? 'em atendimento' : 'na fila'}</p>
                <p className="text-[11px] text-white/60 truncate">{myTicket!.category} · acompanhe o andamento</p>
              </>
            ) : (
              <>
                <p className="text-[13px] font-bold truncate">
                  Conversa em andamento
                  {session?.contextoAtual.lastIntent && ` · ${intentLabel(session.contextoAtual.lastIntent)}`}
                </p>
                <p className="text-[11px] text-white/60 truncate">
                  {canais.map((c) => CANAL_LABEL[c]).join(' → ')} · toque para retomar
                </p>
              </>
            )}
          </div>
          <ArrowRight size={15} className="text-white/50 shrink-0" />
        </button>
      )}

      {/* Canais */}
      <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Ch icon={Sparkles} label="Clara" onClick={openClara} highlight />
        <Ch icon={MessageSquare} label="WhatsApp" href="/whatsapp" />
        <Ch icon={Phone} label="Ligar 106" href="tel:106" />
        <Ch icon={Headphones} label="Meu atendimento" onClick={onOpenAtendimento} />
      </div>
    </section>
  );
}

function Ch({ icon: Icon, label, href, onClick, highlight }: {
  icon: typeof Phone; label: string; href?: string; onClick?: () => void; highlight?: boolean;
}) {
  const cls = cx(
    'flex flex-col items-center gap-1.5 rounded-2xl py-3 px-2 text-center transition-colors',
    highlight ? 'bg-claro hover:bg-claro-dark' : 'bg-white/10 hover:bg-white/20',
  );
  const inner = (
    <>
      <Icon size={17} />
      <span className="text-[11px] font-bold leading-tight">{label}</span>
    </>
  );
  if (href?.startsWith('tel:')) return <a href={href} className={cls}>{inner}</a>;
  if (href) return <Link href={href} className={cls}>{inner}</Link>;
  return <button onClick={onClick} className={cls}>{inner}</button>;
}
