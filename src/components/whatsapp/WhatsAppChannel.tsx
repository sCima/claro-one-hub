'use client';

/* ─────────────────────────────────────────────────────────────────────────────
 * One Hub · Simulação do canal WhatsApp (Documento §2 / §4 · RF001 · RF005)
 *
 * Demonstra a continuidade de contexto entre canais: o cliente que já falou
 * com a Clara no Web Chat entra aqui, é reconhecido pelo número cadastrado,
 * e a MESMA sessão (mesmo session_id) é recuperada com todo o histórico —
 * sem reidentificação, sem repetir o problema.
 * ───────────────────────────────────────────────────────────────────────────── */

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Send, ArrowLeft, Check, CheckCheck, ShieldCheck, RefreshCw, Sparkles, Phone,
} from 'lucide-react';
import { useClaroContext } from '../../context/ClaroContext';
import { claroApi } from '../../services/claroApi';
import { detectIntent, intentLabel } from '../../services/claraNlu';
import { buildReply, resumeLine, type ClaraContext as Ctx } from '../../services/claraReply';
import { recoverSessionByPhone, channelsUsed, CANAL_LABEL, type Canal } from '../../services/session';
import { mockUser, accountProfiles } from '../../data/mockData';
import type { Service, Invoice, ClubeData } from '../../data/mockData';

const KNOWN_PHONES = Object.values(accountProfiles).map((p) => p.phone.replace(/\D/g, ''));

const CANAL: Canal = 'whatsapp';
const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');
const hhmm = (ts: number) => new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export function WhatsAppChannel() {
  const {
    session, activeUser, user, services, invoices, clube,
    startSession, appendSessionMessage, updateSessionContext,
    requestHandover, logClaraInteraction,
    claraConsent, acceptClaraConsent, activeIncidents,
  } = useClaroContext();

  const [phase, setPhase] = useState<'identify' | 'chat'>('identify');
  const [phoneInput, setPhoneInput] = useState(mockUser.phone);
  const [consentChecked, setConsentChecked] = useState(false);
  const [idError, setIdError] = useState<string | null>(null);
  const [recovered, setRecovered] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const greetedRef = useRef(false);

  /* dados do cliente para as respostas da Clara — usa o contexto se houver,
   * senão busca direto (cliente chegou pelo WhatsApp sem abrir o portal) */
  const [localData, setLocalData] = useState<{ services: Service[]; invoices: Invoice[]; clube: ClubeData | null }>({
    services: [], invoices: [], clube: null,
  });
  useEffect(() => {
    if (services.length) return;
    let alive = true;
    Promise.all([claroApi.getServices(), claroApi.getInvoices(), claroApi.getClube()])
      .then(([s, i, c]) => { if (alive) setLocalData({ services: s, invoices: i, clube: c as ClubeData }); })
      .catch(() => {});
    return () => { alive = false; };
  }, [services.length]);

  const name = (activeUser ?? user)?.name ?? mockUser.name;
  const incidentNote = useMemo(() => {
    const inc = activeIncidents.find((i) => i.servicos.includes('internet'));
    return inc
      ? `Detectei um incidente técnico ativo na sua região (${inc.regiao}): ${inc.titulo}. ${inc.previsao}. Protocolo ${inc.id} — a equipe já está atuando.`
      : null;
  }, [activeIncidents]);
  const ctx = useMemo<Ctx>(() => {
    const d = services.length ? { services, invoices, clube } : localData;
    return { name: name.split(' ')[0], services: d.services, invoices: d.invoices, clube: d.clube, incidentNote };
  }, [name, services, invoices, clube, localData, incidentNote]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [session?.historico.length, typing, phase]);

  /* ─── Passo 1 · reconhecimento pelo número cadastrado (§4) ──────────────── */
  const identify = async () => {
    const digits = phoneInput.replace(/\D/g, '');
    if (!KNOWN_PHONES.includes(digits)) {
      setIdError('Número não encontrado no cadastro Claro. Use o telefone do titular da conta.');
      return;
    }
    if (!claraConsent && !consentChecked) {
      setIdError('É preciso aceitar o registro da conversa (LGPD) para continuar.');
      return;
    }
    setIdError(null);
    if (!claraConsent) acceptClaraConsent();
    const prior = await recoverSessionByPhone(phoneInput).catch(() => null);
    await startSession(CANAL);
    setRecovered(!!prior && prior.historico.length > 0);
    setPhase('chat');
  };

  /* ─── Retomada de contexto ao entrar no chat ───────────────────────────── */
  useEffect(() => {
    if (phase !== 'chat' || greetedRef.current || !session) return;
    greetedRef.current = true;
    const hasHistory = session.historico.length > 0;
    const text = hasHistory
      ? resumeLine(ctx.name, session.contextoAtual.lastIntent, session.canalOrigem)
      : `Olá, ${ctx.name}! Aqui é a Clara, no WhatsApp da Claro. Como posso te ajudar?`;
    appendSessionMessage({ role: 'clara', text, canal: CANAL });
  }, [phase, session, ctx.name, appendSessionMessage]);

  const send = async (raw?: string) => {
    const content = (raw ?? input).trim();
    if (!content || !session) return;
    appendSessionMessage({ role: 'user', text: content, canal: CANAL });
    setInput('');
    setTyping(true);

    const { intent, entities, resolvedAuto } = await detectIntent(content, session.sessionId);
    const delay = 500 + Math.min(content.length * 20, 1000);
    setTimeout(() => {
      const reply = buildReply(intent, ctx);
      appendSessionMessage({ role: 'clara', text: reply, canal: CANAL });
      updateSessionContext({ lastIntent: intent, entities, summary: `${intentLabel(intent)} (via ${CANAL})` });
      logClaraInteraction(intent, resolvedAuto);
      setTyping(false);

      if (intent === 'solicitar_atendente' || intent === 'fora_de_escopo') {
        const hist = (session.historico ?? [])
          .filter((m) => m.role === 'user' || m.role === 'clara')
          .map((m) => ({ role: m.role as 'user' | 'clara', text: m.text }));
        hist.push({ role: 'clara', text: reply });
        requestHandover({
          reason: intent === 'solicitar_atendente'
            ? 'Cliente solicitou atendente humano (WhatsApp)'
            : `Intent fora de escopo no WhatsApp: "${content}"`,
          canal: CANAL,
          history: hist,
        });
        setTimeout(() => {
          appendSessionMessage({
            role: 'clara', canal: CANAL,
            text: 'Encaminhei você para um atendente humano com todo o histórico — inclusive o que você já tinha falado no portal. É só aguardar aqui. 🤝',
          });
        }, 700);
      }
    }, delay);
  };

  const history = session?.historico ?? [];
  const canais = session ? channelsUsed(session) : [];

  return (
    <div className="min-h-screen bg-warm-100 dark:bg-warm-900 flex items-center justify-center p-0 sm:p-6">
      <div className="w-full sm:max-w-[420px] h-screen sm:h-[760px] sm:rounded-3xl overflow-hidden shadow-2xl border border-warm-200/60 dark:border-warm-700 flex flex-col bg-[#ECE5DD] dark:bg-warm-900">
        {/* Top bar estilo WhatsApp */}
        <header className="bg-[#075E54] text-white px-4 py-3 flex items-center gap-3 shrink-0">
          <Link href="/hub" className="opacity-90 hover:opacity-100" aria-label="Voltar ao Hub">
            <ArrowLeft size={20} />
          </Link>
          <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
            <Sparkles size={17} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold leading-tight">Claro · Clara</p>
            <p className="text-[11px] opacity-80 leading-tight">
              {phase === 'chat' ? 'conta comercial · online' : 'WhatsApp Business API (simulação)'}
            </p>
          </div>
          <Phone size={17} className="opacity-90" />
        </header>

        {phase === 'identify' ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center bg-[#ECE5DD] dark:bg-warm-900">
            <div className="w-14 h-14 rounded-2xl bg-[#25D366]/15 flex items-center justify-center">
              <ShieldCheck size={26} className="text-[#075E54] dark:text-[#25D366]" />
            </div>
            <div>
              <h1 className="text-lg font-black text-warm-900 dark:text-warm-50">Entrar no WhatsApp da Claro</h1>
              <p className="text-[12px] text-warm-500 mt-1 max-w-[280px]">
                O backend reconhece você pelo <b>número cadastrado</b> e recupera a
                conversa ativa — de qualquer canal (§4 · RF005).
              </p>
            </div>
            <div className="w-full max-w-[300px] space-y-2">
              <input
                value={phoneInput}
                onChange={(e) => { setPhoneInput(e.target.value); setIdError(null); }}
                placeholder="(11) 90000-0000"
                className="w-full bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-xl px-4 py-3 text-sm text-center outline-none focus:ring-2 focus:ring-[#25D366]/40"
              />
              {!claraConsent && (
                <label className="flex items-start gap-2 text-left text-[11px] text-warm-500 py-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentChecked}
                    onChange={(e) => { setConsentChecked(e.target.checked); setIdError(null); }}
                    className="mt-0.5 accent-[#25D366]"
                  />
                  <span>Aceito que a conversa com a Clara seja <b>registrada</b> e tratada conforme a <b>LGPD</b>.</span>
                </label>
              )}
              {idError && <p className="text-[11px] text-claro font-bold">{idError}</p>}
              <button
                onClick={() => void identify()}
                className="w-full bg-[#25D366] text-white font-bold rounded-xl py-3 text-sm hover:bg-[#1fb457] transition-colors"
              >
                Iniciar conversa
              </button>
              <p className="text-[10px] text-warm-400">
                Dica: use <span className="font-mono">{mockUser.phone}</span> (titular)
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Faixa de continuidade */}
            {recovered && (
              <div className="bg-[#25D366]/12 dark:bg-[#25D366]/10 text-[#075E54] dark:text-[#25D366] text-[11px] font-bold px-4 py-2 flex items-center gap-2 shrink-0 border-b border-[#25D366]/20">
                <RefreshCw size={12} />
                Sessão <span className="font-mono">{session?.sessionId}</span> recuperada · continuada de {CANAL_LABEL[session?.canalOrigem ?? 'web']}
              </div>
            )}

            {/* Mensagens */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(0,0,0,0.02), transparent)' }}
            >
              <p className="text-center">
                <span className="inline-block text-[10px] bg-white/70 dark:bg-warm-800 text-warm-500 rounded-lg px-2 py-1">
                  Mensagens protegidas com criptografia de ponta a ponta
                </span>
              </p>
              {history.map((m) => {
                const mine = m.role === 'user';
                const fromOtherChannel = m.canal !== CANAL;
                return (
                  <div key={m.id} className={cx('flex', mine ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cx(
                        'max-w-[82%] px-2.5 py-1.5 rounded-lg text-[13px] leading-snug shadow-sm',
                        mine
                          ? 'bg-[#DCF8C6] dark:bg-[#075E54] dark:text-warm-50 rounded-br-sm'
                          : 'bg-white dark:bg-warm-800 dark:text-warm-50 rounded-bl-sm',
                      )}
                    >
                      {!mine && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#075E54] dark:text-[#25D366] mb-0.5">
                          <Sparkles size={9} /> Clara
                        </span>
                      )}
                      <p>{m.text}</p>
                      <span className="flex items-center justify-end gap-1 text-[9px] text-warm-400 mt-0.5">
                        {fromOtherChannel && (
                          <span className="italic mr-1">· {CANAL_LABEL[m.canal]}</span>
                        )}
                        {hhmm(m.ts)}
                        {mine && <CheckCheck size={11} className="text-[#34B7F1]" />}
                        {!mine && <Check size={11} className="text-warm-300" />}
                      </span>
                    </div>
                  </div>
                );
              })}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-warm-800 rounded-lg rounded-bl-sm px-3 py-2 shadow-sm text-warm-400">
                    <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                  </div>
                </div>
              )}
            </div>

            {/* Rodapé: contexto da sessão */}
            <div className="bg-white/70 dark:bg-warm-800/70 text-[10px] text-warm-500 px-3 py-1.5 flex items-center gap-3 shrink-0 border-t border-warm-200/50 dark:border-warm-700">
              <span>canais: <b>{canais.map((c) => CANAL_LABEL[c]).join(' → ')}</b></span>
              {session?.contextoAtual.lastIntent && (
                <span className="truncate">contexto: <b>{intentLabel(session.contextoAtual.lastIntent)}</b></span>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); void send(); }}
              className="bg-[#F0F0F0] dark:bg-warm-800 p-2 flex items-center gap-2 shrink-0"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Mensagem"
                className="flex-1 bg-white dark:bg-warm-700 rounded-full px-4 py-2.5 text-[13px] outline-none placeholder:text-warm-400 focus:ring-2 focus:ring-[#25D366]/40"
                autoFocus
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:bg-[#1fb457] disabled:opacity-40 transition-colors"
                aria-label="Enviar"
              >
                <Send size={16} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
