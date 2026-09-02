'use client';

/* ─────────────────────────────────────────────────────────────────────────────
 * One Hub · "Meu Atendimento" — visão do cliente da jornada de suporte.
 *
 * Reúne num só lugar: a conversa contínua (qualquer canal), o status do
 * chamado quando há handover, a avaliação (CSAT) e os canais de contato.
 * É a materialização do §4: continuidade de contexto sem reidentificação.
 * ───────────────────────────────────────────────────────────────────────────── */

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles, MessageSquare, Phone, Smartphone, Headphones, ArrowRight,
  CheckCircle2, Clock, UserCheck, Bot, Star, RotateCcw, ShieldCheck,
} from 'lucide-react';
import { useClaroContext } from '../../../context/ClaroContext';
import { channelsUsed, CANAL_LABEL, type Canal } from '../../../services/session';
import { intentLabel } from '../../../services/claraNlu';

const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');
const hhmm = (ts: number) => new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

const CANAL_ICON: Record<Canal, typeof Bot> = { web: Headphones, app: Smartphone, whatsapp: MessageSquare };

const openClara = () => window.dispatchEvent(new CustomEvent('onehub:open-clara'));

export function AtendimentoPage() {
  const { session, myTicket, submitCsat } = useClaroContext();
  const [rated, setRated] = useState(false);

  const historico = session?.historico ?? [];
  const canais = session ? channelsUsed(session) : [];
  const hasConversation = historico.length > 0;

  /* etapas do chamado */
  const step = !myTicket ? 0
    : myTicket.status === 'novo' ? 1
    : myTicket.status === 'em_atendimento' ? 2
    : 3;
  const steps = [
    { label: 'Clara (autoatendimento)', icon: Bot },
    { label: 'Na fila de atendimento', icon: Clock },
    { label: 'Com atendente humano', icon: UserCheck },
    { label: 'Resolvido', icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] font-bold text-claro uppercase tracking-[0.22em] mb-2">Atendimento</p>
        <h1 className="text-4xl font-black tracking-tight">Meu Atendimento</h1>
        <p className="text-sm text-warm-500 mt-2">
          Sua conversa continua de onde parou — em qualquer canal, sem repetir nada.
        </p>
      </header>

      {/* ─── Canais de contato em destaque ─── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <ChannelCard icon={Sparkles} label="Falar com a Clara" meta="IA · resposta imediata" onClick={openClara} tone="claro" />
        <ChannelCard icon={MessageSquare} label="WhatsApp" meta="Mesma conversa, no seu celular" href="/whatsapp" tone="green" />
        <ChannelCard icon={Smartphone} label="App Claro" meta="Continue pelo aplicativo" href="/app" />
        <ChannelCard icon={Phone} label="Ligar 106" meta="Voz · 24h" href="tel:106" />
      </div>

      {/* ─── Status do chamado ─── */}
      {myTicket && (
        <section className="bg-white dark:bg-warm-800 border border-warm-200/70 dark:border-warm-700 rounded-3xl p-6">
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-warm-400">Chamado</p>
              <p className="text-lg font-black font-mono">{myTicket.ticketId}</p>
              <p className="text-[12px] text-warm-500">{myTicket.category} · aberto via {CANAL_LABEL[myTicket.channel === 'portal' ? 'web' : myTicket.channel as Canal] ?? myTicket.channel}</p>
            </div>
            <span className={cx('text-[11px] font-bold rounded-full px-3 py-1',
              step === 3 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300')}>
              {step === 3 ? 'Resolvido' : step === 2 ? 'Em atendimento' : 'Aguardando atendente'}
            </span>
          </div>

          <ol className="relative border-l-2 border-warm-100 dark:border-warm-700 ml-2 space-y-4">
            {steps.map((s, i) => {
              const done = i <= step;
              const Icon = s.icon;
              return (
                <li key={s.label} className="ml-5">
                  <span className={cx('absolute -left-[13px] w-6 h-6 rounded-full flex items-center justify-center',
                    done ? 'bg-claro text-white' : 'bg-warm-100 dark:bg-warm-700 text-warm-400')}>
                    <Icon size={12} />
                  </span>
                  <p className={cx('text-[13px] font-bold', done ? 'text-warm-900 dark:text-warm-50' : 'text-warm-400')}>{s.label}</p>
                  {i === step && step < 3 && (
                    <p className="text-[11px] text-warm-500">
                      {step === 1 ? 'Um especialista vai te atender em breve — pode acompanhar aqui.' : 'Atendente com todo o histórico da sua conversa.'}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>

          {/* CSAT */}
          {step === 3 && (
            <div className="mt-6 pt-5 border-t border-warm-100 dark:border-warm-700">
              {myTicket.csat != null || rated ? (
                <p className="text-[13px] font-bold text-green-600 dark:text-green-400 flex items-center gap-1.5">
                  <CheckCircle2 size={15} /> Obrigado pela avaliação!
                </p>
              ) : (
                <>
                  <p className="text-[13px] font-bold mb-2">Como foi seu atendimento?</p>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => { submitCsat(n); setRated(true); }}
                        aria-label={`${n} de 5`}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star size={26} className="text-warm-300 hover:text-amber-500 hover:fill-amber-500" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      )}

      {/* ─── Conversa contínua ─── */}
      <section className="bg-white dark:bg-warm-800 border border-warm-200/70 dark:border-warm-700 rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-warm-100 dark:border-warm-700 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-black flex items-center gap-2"><Sparkles size={15} className="text-claro" /> Sua conversa</p>
            {hasConversation && session && (
              <p className="text-[11px] text-warm-500 mt-0.5">
                {canais.map((c, i) => (
                  <span key={c}>
                    {i > 0 && <span className="text-warm-300"> → </span>}
                    {CANAL_LABEL[c]}
                  </span>
                ))}
                {session.status === 'handover' && <span className="text-warm-300"> → </span>}
                {session.status === 'handover' && <span>Atendente humano</span>}
                {' · '}{historico.length} mensagem(ns)
                {session.contextoAtual.lastIntent && ` · assunto: ${intentLabel(session.contextoAtual.lastIntent)}`}
              </p>
            )}
          </div>
          <button onClick={openClara} className="text-xs font-bold rounded-full bg-claro text-white px-4 py-2 hover:bg-claro-dark transition-colors inline-flex items-center gap-1.5">
            {hasConversation ? <><RotateCcw size={13} /> Retomar conversa</> : <><Sparkles size={13} /> Iniciar conversa</>}
          </button>
        </div>

        {hasConversation ? (
          <ul className="max-h-[440px] overflow-y-auto px-4 py-4 space-y-2">
            {historico.map((m) => {
              const mine = m.role === 'user';
              const ChIcon = CANAL_ICON[m.canal];
              return (
                <li key={m.id} className={cx('flex', mine ? 'justify-end' : 'justify-start')}>
                  <div className={cx('max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed',
                    mine ? 'bg-claro text-white rounded-br-sm'
                    : m.role === 'agent' ? 'bg-warm-900 text-white dark:bg-warm-50 dark:text-warm-900 rounded-bl-sm'
                    : 'bg-warm-50 dark:bg-warm-700 rounded-bl-sm')}>
                    {!mine && (
                      <span className="flex items-center gap-1 text-[10px] font-bold opacity-70 mb-0.5">
                        {m.role === 'agent' ? <UserCheck size={9} /> : <Sparkles size={9} />}
                        {m.role === 'agent' ? 'Atendente' : 'Clara'}
                      </span>
                    )}
                    <p>{m.text}</p>
                    <span className={cx('flex items-center gap-1 text-[9px] mt-1', mine ? 'text-white/70 justify-end' : 'text-warm-400')}>
                      <ChIcon size={9} /> {CANAL_LABEL[m.canal]} · {hhmm(m.ts)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="px-6 py-12 text-center">
            <Bot size={32} className="mx-auto text-warm-300 mb-2" />
            <p className="text-sm text-warm-500">Nenhuma conversa ainda. Fale com a Clara — o histórico fica disponível em qualquer canal.</p>
          </div>
        )}
      </section>

      <p className="text-[10px] text-warm-400 flex items-center gap-1.5">
        <ShieldCheck size={11} /> Conversa vinculada ao seu CPF (não ao canal) · dados tratados conforme a LGPD.
      </p>
    </div>
  );
}

function ChannelCard({
  icon: Icon, label, meta, href, onClick, tone,
}: {
  icon: typeof Phone; label: string; meta: string;
  href?: string; onClick?: () => void; tone?: 'claro' | 'green';
}) {
  const cls = cx(
    'group flex flex-col gap-2 p-5 rounded-3xl border text-left transition-colors',
    tone === 'claro' ? 'bg-claro text-white border-claro hover:bg-claro-dark'
    : tone === 'green' ? 'bg-[#25D366] text-white border-[#25D366] hover:bg-[#1fb457]'
    : 'bg-white dark:bg-warm-800 border-warm-200/70 dark:border-warm-700 hover:border-claro',
  );
  const inner = (
    <>
      <div className={cx('w-11 h-11 rounded-2xl flex items-center justify-center',
        tone ? 'bg-white/15' : 'bg-claro-soft dark:bg-claro/15')}>
        <Icon size={20} className={tone ? 'text-white' : 'text-claro'} />
      </div>
      <div>
        <p className="font-black text-sm">{label}</p>
        <p className={cx('text-[11px]', tone ? 'text-white/80' : 'text-warm-500')}>{meta}</p>
      </div>
      <ArrowRight size={15} className={cx('mt-1 transition-transform group-hover:translate-x-0.5', tone ? 'text-white/80' : 'text-warm-400')} />
    </>
  );
  if (href?.startsWith('tel:')) return <a href={href} className={cls}>{inner}</a>;
  if (href) return <Link href={href} className={cls}>{inner}</Link>;
  return <button onClick={onClick} className={cls}>{inner}</button>;
}
