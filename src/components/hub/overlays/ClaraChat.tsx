'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Send, Sparkles, MessageCircle, ChevronDown, Headphones,
  MessageSquare, Phone, ArrowRight, CheckCircle2,
} from 'lucide-react';
import type { Service, Invoice, ClubeData } from '../../../data/mockData';
import { claraIntents, type ClaraIntentId } from '../../../data/mockData';
import { useClaroContext } from '../../../context/ClaroContext';

const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');
const fmtBRL = (n: number) => n.toFixed(2).replace('.', ',');

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

type Ctx = { name: string; services: Service[]; invoices: Invoice[]; clube: ClubeData | null };

/* ─── Sprint 2 §3.4 · Classificação de intenção ──────────────────────────── */
function classifyIntent(input: string): ClaraIntentId {
  const q = input.toLowerCase().trim();
  for (const it of claraIntents) {
    if (it.patterns.test(q)) return it.id;
  }
  return 'fora_de_escopo';
}

/* ─── Resposta da Clara por intent (consulta os dados reais do cliente) ──── */
function buildReply(intent: ClaraIntentId, ctx: Ctx): string {
  const pending = ctx.invoices.find((i) => i.status === 'pending');
  const monthly = ctx.services.reduce((s, x) => s + x.amount, 0);
  const br = (iso: string) => iso.split('-').reverse().join('/');

  switch (intent) {
    case 'saudacao':
      return `Olá, ${ctx.name}! Eu sou a Clara, sua assistente Claro. Como posso te ajudar hoje?`;

    case 'consultar_fatura':
      return pending
        ? `Sua fatura de ${pending.month} está aberta no valor de R$ ${fmtBRL(pending.amount)}, com vencimento em ${br(pending.dueDate)}. Quer pagar agora? Toque em "Faturas" no menu lateral ou diretamente no card escuro da Visão geral.`
        : `Você está em dia — nenhuma fatura aberta no momento. 🎉`;

    case 'segunda_via_fatura':
      return pending
        ? `Gerei a 2ª via da fatura de ${pending.month} (R$ ${fmtBRL(pending.amount)}). O link do boleto é válido por 24h. Quer que eu envie por e-mail ou WhatsApp?`
        : `Não há fatura em aberto para gerar 2ª via. A última fatura já consta como paga. ✅`;

    case 'consultar_plano':
      return `Você está no Combo Multi com ${ctx.services.length} serviço(s): ${ctx.services.map((s) => s.label).join(', ')}. Total de R$ ${fmtBRL(monthly)}/mês. Quer ver os detalhes de algum serviço específico?`;

    case 'alterar_plano':
      return `Tenho ofertas elegíveis para você! Posso adicionar serviços como Claro Vídeo, hdtv ou Claro Fone ao seu combo (com desconto progressivo). Toque em "+ Adicionar plano" no painel de Serviços para ver as opções.`;

    case 'status_servico': {
      const net = ctx.services.find((s) => s.type === 'broadband');
      return net
        ? `Verifiquei sua ${net.label} ("${net.plan}"): detectei uma instabilidade localizada na fibra do seu bairro (incidente registrado). Já reiniciei seu equipamento remotamente — reparo previsto para hoje. Acompanhe o banner de status no topo da Visão geral.`
        : `Consultei o status de rede da sua região: tudo operando normalmente. Se o problema persistir, posso te transferir para um técnico.`;
    }

    case 'solicitar_atendente':
      return `Sem problema, ${ctx.name}. Vou te transferir para um especialista humano com TODO o histórico desta conversa — você não vai precisar repetir nada. Escolha o canal abaixo:`;

    case 'despedida':
      return `Por nada, ${ctx.name}! 😊 Qualquer coisa, é só me chamar de novo. Até mais!`;

    case 'fora_de_escopo':
    default:
      return `Essa eu não consegui resolver sozinha 🤔. Posso te conectar com um atendente humano agora — ele recebe todo o contexto desta conversa. Quer que eu transfira?`;
  }
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
  const { logClaraInteraction, requestHandover } = useClaroContext();
  const ctx = useMemo<Ctx>(() => ({ name: userName.split(' ')[0], services, invoices, clube }),
    [userName, services, invoices, clube]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [handoverOpen, setHandoverOpen] = useState(false);
  const [handoverDone, setHandoverDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastReason = useRef<string>('Atendimento solicitado pelo cliente');

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        id: 'm-init', role: 'clara',
        text: `Olá, ${ctx.name}! Eu sou a Clara, sua assistente Claro. Como posso te ajudar hoje?`,
        ts: Date.now(),
      }]);
    }
  }, [open, ctx.name, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing, handoverOpen, handoverDone]);

  const send = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;

    const intent = classifyIntent(content);
    const intentDef = claraIntents.find((i) => i.id === intent);
    const resolvedAuto = intentDef?.resolvedAuto ?? false;

    setMessages((m) => [...m, { id: 'u-' + Date.now(), role: 'user', text: content, ts: Date.now() }]);
    setInput('');
    setTyping(true);

    const delay = 700 + Math.min(content.length * 22, 1300);
    setTimeout(() => {
      const reply = buildReply(intent, ctx);
      setMessages((m) => [...m, { id: 'c-' + Date.now(), role: 'clara', text: reply, ts: Date.now() }]);
      setTyping(false);

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
      const t = setTimeout(() => { send(prefill); onPrefillConsumed?.(); }, 400);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, prefill]);

  const confirmHandover = () => {
    requestHandover({
      reason: lastReason.current,
      history: messages.map((m) => ({ role: m.role, text: m.text })),
    });
    setHandoverOpen(false);
    setHandoverDone(true);
    setMessages((m) => [...m, {
      id: 'h-' + Date.now(), role: 'clara',
      text: 'Pronto! Você entrou na fila de atendimento humano e o especialista já recebeu todo o histórico desta conversa. Pode aguardar aqui mesmo — não vai precisar repetir nada. 🤝',
      ts: Date.now(),
    }]);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
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
                    onClick={confirmHandover}
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
                onClick={() => send(s)}
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
        onSubmit={(e) => { e.preventDefault(); send(); }}
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
