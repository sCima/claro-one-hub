'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Send, Sparkles, MessageCircle, ChevronDown, Headphones,
  MessageSquare, Phone, ArrowRight, CheckCircle2, ShieldCheck, Lock,
} from 'lucide-react';
import type { Service, Invoice, ClubeData } from '../../../data/mockData';
import { useClaroContext } from '../../../context/ClaroContext';
import { detectIntent, intentLabel } from '../../../services/claraNlu';
import { buildReply, resumeLine, type ClaraContext as Ctx } from '../../../services/claraReply';
import type { Canal } from '../../../services/session';

const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');

const CANAL: Canal = 'web';

interface Message {
  id: string;
  role: 'user' | 'clara';
  text: string;
  ts: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  userName?: string;
  services: Service[];
  invoices: Invoice[];
  clube: ClubeData | null;
  prefill?: string | null;
  onPrefillConsumed?: () => void;
}

const SUGGESTIONS = [
  'Qual o valor da minha fatura?',
  'Preciso da 2ª via do boleto',
  'Quero trocar de plano',
  'Minha internet caiu',
];

const HANDOVER_CHANNELS = [
  { id: 'chat',  icon: Headphones,    label: 'Chat Online',  meta: 'Espera ~2 min' },
  { id: 'wpp',   icon: MessageSquare, label: 'WhatsApp',     meta: 'Imediato' },
  { id: 'fone',  icon: Phone,         label: 'Ligar 106',    meta: 'Voz · 24h' },
];

export function ClaraChat({
  open, onClose, userName = 'cliente', services, invoices, clube,
  prefill, onPrefillConsumed,
}: Props) {
  const router = useRouter();
  const {
    logClaraInteraction, requestHandover,
    session, startSession, appendSessionMessage, updateSessionContext,
    claraConsent, acceptClaraConsent, activeIncidents,
  } = useClaroContext();
  const incidentNote = useMemo(() => {
    const inc = activeIncidents.find((i) => i.servicos.includes('internet'));
    return inc
      ? `Detectei um incidente técnico ativo na sua região (${inc.regiao}): ${inc.titulo}. ${inc.previsao}. Protocolo ${inc.id} — a equipe técnica já está atuando. Você recebeu uma notificação e pode acompanhar pelo banner no topo da Visão Geral.`
      : null;
  }, [activeIncidents]);
  const ctx = useMemo<Ctx>(() => ({ name: userName.split(' ')[0], services, invoices, clube, incidentNote }),
    [userName, services, invoices, clube, incidentNote]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [handoverOpen, setHandoverOpen] = useState(false);
  const [handoverDone, setHandoverDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastReason = useRef<string>('Atendimento solicitado pelo cliente');
  const inited = useRef(false);

  /* ─── Sprint 3 §4 · abre/recupera a sessão vinculada ao cliente ───────────
   * Se já há histórico de outro canal (ex.: WhatsApp), a Clara retoma o
   * contexto em vez de cumprimentar do zero — o cliente não repete nada. */
  useEffect(() => {
    if (!open || inited.current || !claraConsent) return;
    inited.current = true;
    let cancelled = false;
    (async () => {
      const sess = await startSession(CANAL).catch(() => null);
      if (cancelled) return;
      const prior = sess?.historico ?? [];

      if (prior.length > 0) {
        const hydrated: Message[] = prior
          .filter((m) => m.role === 'user' || m.role === 'clara')
          .map((m) => ({ id: m.id, role: m.role as 'user' | 'clara', text: m.text, ts: m.ts }));
        const outraOrigem = (sess?.canalOrigem ?? 'web') !== 'web';
        if (outraOrigem) {
          const text = resumeLine(ctx.name, sess?.contextoAtual.lastIntent ?? null, sess?.canalOrigem ?? 'web');
          setMessages([...hydrated, { id: 'm-resume', role: 'clara', text, ts: Date.now() }]);
          appendSessionMessage({ role: 'clara', text, canal: CANAL });
        } else {
          setMessages(hydrated);
        }
        return;
      }

      const greet = `Olá, ${ctx.name}! Eu sou a Clara, sua assistente Claro. Como posso te ajudar hoje?`;
      setMessages([{ id: 'm-init', role: 'clara', text: greet, ts: Date.now() }]);
      appendSessionMessage({ role: 'clara', text: greet, canal: CANAL });
    })();
    return () => { cancelled = true; };
  }, [open, claraConsent, ctx.name, startSession, appendSessionMessage]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing, handoverOpen, handoverDone]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;

    setMessages((m) => [...m, { id: 'u-' + Date.now(), role: 'user', text: content, ts: Date.now() }]);
    appendSessionMessage({ role: 'user', text: content, canal: CANAL });
    setInput('');
    setTyping(true);

    const sid = session?.sessionId ?? 'web-anon';
    const { intent, entities, resolvedAuto } = await detectIntent(content, sid);

    const delay = 500 + Math.min(content.length * 22, 1100);
    setTimeout(() => {
      const reply = buildReply(intent, ctx);
      setMessages((m) => [...m, { id: 'c-' + Date.now(), role: 'clara', text: reply, ts: Date.now() }]);
      setTyping(false);

      /* Sprint 3 §4.1 — persiste mensagem + contexto_atual na sessão */
      appendSessionMessage({ role: 'clara', text: reply, canal: CANAL });
      updateSessionContext({ lastIntent: intent, entities, summary: `${intentLabel(intent)} (via ${CANAL})` });

      /* Sprint 2 §4.1 — registra métrica de autoatendimento */
      logClaraInteraction(intent, resolvedAuto);

      /* Sprint 2 §4.2 — handover suave */
      if (intent === 'solicitar_atendente' || intent === 'fora_de_escopo') {
        lastReason.current = intent === 'solicitar_atendente'
          ? 'Cliente solicitou atendente humano'
          : `Intent fora de escopo: "${content}"`;
        setHandoverOpen(true);
      }
    }, delay);
  };

  useEffect(() => {
    if (open && prefill && messages.length <= 1) {
      const t = setTimeout(() => { void send(prefill); onPrefillConsumed?.(); }, 400);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, prefill]);

  const confirmHandover = (channelId: string) => {
    requestHandover({
      reason: lastReason.current,
      canal: CANAL,
      history: messages.map((m) => ({ role: m.role, text: m.text })),
    });
    setHandoverOpen(false);
    setHandoverDone(true);

    if (channelId === 'fone') {
      window.location.assign('tel:106');
      return;
    }
    if (channelId === 'wpp') {
      const text = 'Perfeito! Estou te levando para o WhatsApp da Claro com todo o histórico — é só continuar por lá.';
      setMessages((m) => [...m, { id: 'h-' + Date.now(), role: 'clara', text, ts: Date.now() }]);
      appendSessionMessage({ role: 'clara', text, canal: CANAL });
      onClose();
      router.push('/whatsapp');
      return;
    }
    const text = 'Pronto! Você entrou na fila de atendimento humano e o especialista já recebeu todo o histórico desta conversa. Pode aguardar aqui mesmo — não vai precisar repetir nada. 🤝';
    setMessages((m) => [...m, { id: 'h-' + Date.now(), role: 'clara', text, ts: Date.now() }]);
    appendSessionMessage({ role: 'clara', text, canal: CANAL });
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); }
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[95] w-[min(380px,calc(100vw-2rem))] h-[min(580px,calc(100vh-3rem))] flex flex-col bg-white dark:bg-warm-800 rounded-3xl shadow-2xl border border-warm-200/60 dark:border-warm-700 overflow-hidden chat-slide-in">
      {/* Header */}
      <div className="bg-gradient-to-br from-claro to-claro-dark text-white px-5 py-4 flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
          <Sparkles size={18} />
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-claro-dark" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black leading-tight">Clara</p>
          <p className="text-[10px] opacity-80 leading-tight">Assistente IA · Online agora</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center transition-colors"
          aria-label="Fechar chat"
        >
          <ChevronDown size={16} />
        </button>
      </div>

      {/* §7 · Consentimento LGPD no 1º acesso ao chat */}
      {!claraConsent ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center bg-warm-50 dark:bg-warm-900/40">
          <div className="w-14 h-14 rounded-2xl bg-claro-soft dark:bg-claro/15 flex items-center justify-center">
            <ShieldCheck size={26} className="text-claro" />
          </div>
          <div>
            <p className="text-sm font-black text-warm-900 dark:text-warm-50">Antes de começar</p>
            <p className="text-[12px] text-warm-500 mt-1.5 leading-relaxed">
              Sua conversa com a Clara é <b>registrada</b> e vinculada à sua conta para dar
              continuidade ao atendimento em qualquer canal. Os dados são tratados conforme a
              <b> LGPD (Lei 13.709/2018)</b> e você pode exportar ou excluir esse histórico a
              qualquer momento em <b>Configurações › Privacidade</b>.
            </p>
          </div>
          <button
            onClick={acceptClaraConsent}
            className="w-full max-w-[280px] bg-claro text-white font-bold rounded-xl py-3 text-sm hover:bg-claro-dark transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={15} /> Aceito e quero continuar
          </button>
          <p className="text-[10px] text-warm-400 flex items-center gap-1">
            <Lock size={10} /> Comunicação via HTTPS · dados sensíveis criptografados
          </p>
        </div>
      ) : (
      <>
      {/* Mensagens */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-warm-50 dark:bg-warm-900/40">
        {messages.map((m) => (
          <div key={m.id} className={cx('flex bubble-in', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div
              className={cx(
                'max-w-[85%] px-3.5 py-2.5 text-[13px] leading-relaxed',
                m.role === 'user'
                  ? 'bg-claro text-white rounded-2xl rounded-br-sm'
                  : 'bg-white dark:bg-warm-700 text-warm-900 dark:text-warm-50 rounded-2xl rounded-bl-sm shadow-sm'
              )}
            >
              {m.text}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex justify-start bubble-in">
            <div className="px-4 py-3 bg-white dark:bg-warm-700 rounded-2xl rounded-bl-sm shadow-sm text-warm-500 dark:text-warm-300">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        {/* Card de handover suave (Sprint 2 §4.2) */}
        {handoverOpen && !typing && (
          <div className="bubble-in bg-white dark:bg-warm-700 rounded-2xl border border-warm-200 dark:border-warm-600 p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-claro mb-3">
              Transferir para humano
            </p>
            <div className="space-y-1.5">
              {HANDOVER_CHANNELS.map((c) => {
                const Icon = c.icon;
                return (
                  <button
                    key={c.id}
                    onClick={() => confirmHandover(c.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-warm-200/70 dark:border-warm-600 hover:border-claro hover:bg-claro-soft dark:hover:bg-claro/10 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-warm-100 dark:bg-warm-600 flex items-center justify-center shrink-0">
                      <Icon size={15} className="text-claro" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-warm-900 dark:text-warm-50">{c.label}</p>
                      <p className="text-[10px] text-warm-500">{c.meta}</p>
                    </div>
                    <ArrowRight size={13} className="text-warm-400 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {handoverDone && !typing && (
          <div className="bubble-in flex items-center gap-2 justify-center text-[11px] font-bold text-green-700 dark:text-green-400 py-1">
            <CheckCircle2 size={14} /> Conversa transferida com histórico
          </div>
        )}

        {/* Sugestões só na primeira interação */}
        {messages.length === 1 && !typing && !handoverOpen && (
          <div className="pt-2 space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-warm-400 px-1">Sugestões</p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => void send(s)}
                className="block w-full text-left text-[12px] px-3 py-2 rounded-xl bg-white dark:bg-warm-700 border border-warm-200/70 dark:border-warm-600 text-warm-700 dark:text-warm-200 hover:border-claro hover:text-claro transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); void send(); }}
        className="border-t border-warm-100 dark:border-warm-700 p-3 flex items-center gap-2 bg-white dark:bg-warm-800"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Pergunte qualquer coisa…"
          className="flex-1 bg-warm-100 dark:bg-warm-700 rounded-full px-4 py-2.5 text-[13px] outline-none placeholder:text-warm-400 focus:ring-2 focus:ring-claro/40"
          autoFocus
        />
        <button
          type="submit"
          disabled={!input.trim() || typing}
          className="w-10 h-10 rounded-full bg-claro text-white flex items-center justify-center hover:bg-claro-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Enviar"
        >
          <Send size={16} />
        </button>
      </form>
      </>
      )}
    </div>
  );
}

/* Botão flutuante para abrir o chat */
export function ClaraFAB({ onClick, hidden }: { onClick: () => void; hidden?: boolean }) {
  if (hidden) return null;
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-[94] group flex items-center gap-2 bg-gradient-to-br from-claro to-claro-dark text-white rounded-full pl-3 pr-5 py-3 shadow-2xl hover:scale-105 transition-transform"
      aria-label="Falar com Clara"
    >
      <span className="relative w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
        <MessageCircle size={18} />
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-claro-dark" />
      </span>
      <span className="text-sm font-bold">Falar com Clara</span>
    </button>
  );
}
