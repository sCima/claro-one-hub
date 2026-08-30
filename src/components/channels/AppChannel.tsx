'use client';

/* ─────────────────────────────────────────────────────────────────────────────
 * One Hub · Simulação do canal App (Documento §4.1 — canal_origem 'app').
 *
 * O app já reconhece o cliente logado (não pede telefone). A conversa é a
 * MESMA sessão do Web Chat / WhatsApp — continuidade total de contexto.
 * ───────────────────────────────────────────────────────────────────────────── */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Send, ArrowLeft, Sparkles, Wifi, Signal, BatteryFull, UserCheck } from 'lucide-react';
import { useClaraChannel } from '../../hooks/useClaraChannel';
import { channelsUsed, CANAL_LABEL } from '../../services/session';
import { intentLabel } from '../../services/claraNlu';

const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');
const hhmm = (ts: number) => new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export function AppChannel() {
  const { session, history, typing, send } = useClaraChannel('app', {
    greeting: (n) => `Oi, ${n}! Você está no app da Claro. Sou a Clara — como posso ajudar?`,
  });
  const [input, setInput] = useState('');
  const [clock, setClock] = useState('09:41');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const upd = () => setClock(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    upd();
    const id = setInterval(upd, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [history.length, typing]);

  const canais = session ? channelsUsed(session) : [];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = input;
    setInput('');
    void send(v);
  };

  return (
    <div className="min-h-screen bg-warm-100 dark:bg-warm-900 flex items-center justify-center p-0 sm:p-6">
      <div className="w-full sm:max-w-[400px] h-screen sm:h-[780px] sm:rounded-[2rem] overflow-hidden shadow-2xl border border-warm-200/60 dark:border-warm-700 flex flex-col bg-white dark:bg-warm-900">
        {/* status bar do celular */}
        <div className="bg-claro text-white/90 px-5 py-1.5 flex items-center justify-between text-[10px] font-bold shrink-0">
          <span>{clock}</span>
          <span className="flex items-center gap-1"><Signal size={11} /><Wifi size={11} /><BatteryFull size={13} /></span>
        </div>

        {/* header do app */}
        <header className="bg-claro text-white px-4 pb-3 pt-1 flex items-center gap-3 shrink-0">
          <Link href="/hub" className="opacity-90 hover:opacity-100" aria-label="Voltar ao Hub">
            <ArrowLeft size={20} />
          </Link>
          <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
            <Sparkles size={17} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black leading-tight">Minha Claro · Clara</p>
            <p className="text-[11px] opacity-80 leading-tight">Assistente virtual · app</p>
          </div>
        </header>

        {/* mensagens */}
        <div
          ref={scrollRef}
          role="log"
          aria-live="polite"
          className="flex-1 overflow-y-auto px-3 py-4 space-y-2 bg-warm-50 dark:bg-warm-900/40"
        >
          {history.map((m) => {
            const mine = m.role === 'user';
            const fromOther = m.canal !== 'app';
            return (
              <div key={m.id} className={cx('flex', mine ? 'justify-end' : 'justify-start')}>
                <div className={cx(
                  'max-w-[82%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm',
                  mine ? 'bg-claro text-white rounded-br-sm'
                  : m.role === 'agent' ? 'bg-warm-900 text-white dark:bg-warm-50 dark:text-warm-900 rounded-bl-sm'
                  : 'bg-white dark:bg-warm-800 rounded-bl-sm',
                )}>
                  {!mine && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-claro dark:text-claro mb-0.5">
                      {m.role === 'agent' ? <UserCheck size={9} /> : <Sparkles size={9} />}
                      {m.role === 'agent' ? 'Atendente' : 'Clara'}
                    </span>
                  )}
                  <p>{m.text}</p>
                  <span className={cx('block text-[9px] mt-1', mine ? 'text-white/70 text-right' : 'text-warm-400')}>
                    {fromOther && <span className="italic mr-1">· {CANAL_LABEL[m.canal]}</span>}
                    {hhmm(m.ts)}
                  </span>
                </div>
              </div>
            );
          })}
          {typing && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-warm-800 rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm text-warm-400">
                <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
              </div>
            </div>
          )}
        </div>

        {/* rodapé: contexto da sessão */}
        <div className="bg-warm-100/80 dark:bg-warm-800/70 text-[10px] text-warm-500 px-3 py-1.5 flex items-center gap-3 shrink-0 border-t border-warm-200/50 dark:border-warm-700">
          <span>canais: <b>{canais.map((c) => CANAL_LABEL[c]).join(' → ')}</b></span>
          {session?.contextoAtual.lastIntent && (
            <span className="truncate">contexto: <b>{intentLabel(session.contextoAtual.lastIntent)}</b></span>
          )}
        </div>

        <form onSubmit={submit} className="bg-white dark:bg-warm-800 p-2.5 flex items-center gap-2 shrink-0 border-t border-warm-100 dark:border-warm-700">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Mensagem"
            aria-label="Sua mensagem"
            className="flex-1 bg-warm-100 dark:bg-warm-700 rounded-full px-4 py-2.5 text-[13px] outline-none placeholder:text-warm-400 focus:ring-2 focus:ring-claro/40"
            autoFocus
          />
          <button
            type="submit"
            disabled={!input.trim() || typing}
            className="w-10 h-10 rounded-full bg-claro text-white flex items-center justify-center hover:bg-claro-dark disabled:opacity-40 transition-colors"
            aria-label="Enviar"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
