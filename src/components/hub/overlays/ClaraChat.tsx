'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { X, Send, Sparkles, MessageCircle, ChevronDown } from 'lucide-react';
import type { Service, Invoice, ClubeData } from '../../../data/mockData';

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
  /* contexto pra Clara responder com dados reais */
  userName?: string;
  services: Service[];
  invoices: Invoice[];
  clube: ClubeData | null;
  /* Pergunta pré-pronta a ser enviada automaticamente quando o chat abrir */
  prefill?: string | null;
  onPrefillConsumed?: () => void;
}

/* Gera resposta da Clara baseada em palavras-chave */
function claraReply(input: string, ctx: { name: string; services: Service[]; invoices: Invoice[]; clube: ClubeData | null }): string {
  const q = input.toLowerCase().trim();
  const pendingInv = ctx.invoices.find((i) => i.status === 'pending');
  const monthly = ctx.services.reduce((sum, s) => sum + s.amount, 0);

  /* Saudação */
  if (/\b(oi|olá|ola|hey|hello|bom dia|boa tarde|boa noite)\b/.test(q)) {
    return `Oi, ${ctx.name}! 👋 Posso te ajudar com fatura, planos, consumo, suporte ou o Claro Clube. Em que posso ser útil agora?`;
  }
  /* Fatura / pagamento */
  if (/(fatura|pagar|vencimento|boleto|pix|cobranca|cobrança)/.test(q)) {
    if (pendingInv) {
      return `Sua fatura de ${pendingInv.month} está aberta no valor de R$ ${fmtBRL(pendingInv.amount)} com vencimento em ${pendingInv.dueDate.split('-').reverse().join('/')}. Quer pagar agora? Toque em "Faturas" no menu lateral, ou direto no card escuro da Visão geral.`;
    }
    return `Você está em dia! Nenhuma fatura aberta no momento. 🎉`;
  }
  /* Plano / combo */
  if (/(plano|combo|trocar plano|mudar plano|migrar)/.test(q)) {
    return `Você está no Combo Multi com ${ctx.services.length} serviço(s) ativos, totalizando R$ ${fmtBRL(monthly)}/mês. Para adicionar um plano novo, clique no botão "+ Adicionar plano" no painel de Serviços. Para trocar um existente, abra o serviço na sidebar.`;
  }
  /* Internet / wi-fi */
  if (/(internet|wifi|wi-fi|fibra|banda)/.test(q)) {
    const internet = ctx.services.find((s) => s.type === 'broadband');
    if (internet) return `Sua Claro Internet está no plano "${internet.plan}" — usando ${internet.dataUsed} ${internet.unit ?? 'GB'} este mês. Status: ✅ funcionando normalmente.`;
    return `Você ainda não tem Claro Internet contratada. Posso te mostrar planos a partir de R$ 99,90?`;
  }
  /* 5G / celular */
  if (/(5g|celular|movel|móvel|chip|recarga)/.test(q)) {
    const mob = ctx.services.find((s) => s.type === 'mobile');
    if (mob) return `Sua linha Claro Celular: ${mob.identifier} no plano "${mob.plan}". Você usou ${mob.dataUsed}${mob.unit} de ${mob.dataLimit}${mob.unit} este mês. 5G+ está incluso e ativo na sua área.`;
    return `Não vejo uma linha Claro Celular ativa nessa conta. Quer contratar uma? Os planos começam em R$ 29,90 (Pré 30).`;
  }
  /* TV */
  if (/(tv|canal|canais|streaming|netflix|hbo|globoplay|parabolica|parabólica)/.test(q)) {
    const tv = ctx.services.find((s) => s.type === 'tv');
    if (tv) return `Seu Claro TV+ "${tv.plan}" tem ${tv.channels ?? 0} canais e inclui ${(tv.streaming ?? []).join(', ')}. Se quiser TV gratuita pra outra residência, dá uma olhada no Claro tv Livre (parabólica banda Ku, sem mensalidade).`;
    return `Sem Claro TV+ contratada. Os pacotes começam em R$ 79,90. Para opção sem mensalidade, temos Claro tv Livre e Claro hdtv Livre via parabólica.`;
  }
  /* Claro Vídeo / streaming */
  if (/(claro video|claro vídeo|video sob demanda|vod)/.test(q)) {
    return `Claro Vídeo é nosso streaming sob demanda — filmes, séries e novelas latinas exclusivas. Mensal R$ 19,90 ou anual R$ 199 (2 meses grátis). Toque em "+ Adicionar plano" pra incluir no combo.`;
  }
  /* Claro Fone / VoIP empresarial */
  if (/(claro fone|voip|pabx|ramal|ramais|empresa)/.test(q)) {
    return `Claro Fone é nossa solução de voz IP profissional com PABX em nuvem. Planos: Básico R$ 29,90 (1 ramal), Profissional R$ 79,90 (até 5 ramais com URA), Empresarial R$ 199,90 (ramais ilimitados + integração CRM).`;
  }
  /* Claro Fixo */
  if (/(fixo|telefone fixo|residencial)/.test(q)) {
    const fix = ctx.services.find((s) => s.type === 'fixo');
    if (fix) return `Seu Claro Fixo está no "${fix.plan}" — ${fix.identifier}. Tudo funcionando normalmente.`;
    return `Claro Fixo é nosso telefone residencial digital. Plano Ilimitado por R$ 49,90/mês (chamadas ilimitadas para fixo Brasil).`;
  }
  /* Clube / pontos */
  if (/(clube|pontos|recompensa|resgate|milhas)/.test(q)) {
    if (ctx.clube) return `Você tem ${ctx.clube.points.toLocaleString('pt-BR')} pontos no Claro Clube · tier ${ctx.clube.tier}. Vencem ${ctx.clube.expiringPoints} pontos em ${ctx.clube.expiringDate.split('-').reverse().join('/')}. Quer ver o que dá pra resgatar?`;
    return `Não consegui carregar seu saldo do Clube agora. Tente abrir a página "Claro Clube" na sidebar.`;
  }
  /* Cancelar */
  if (/(cancelar|encerrar|sair|portabilidade)/.test(q)) {
    return `Para cancelar um serviço: vá em "Meus serviços" > escolha o serviço > "Gerenciar plano" > "Cancelar". Atendimento humano em até 5 min. Quer que eu te conecte agora?`;
  }
  /* Cobertura */
  if (/(cobertura|sinal|antena|área|area|região|regiao)/.test(q)) {
    return `O 5G+ Claro está em mais de 720 cidades. Pra checar sua região exata, consulte cobertura.claro.com.br ou me diga sua cidade que eu confirmo.`;
  }
  /* Suporte / humano */
  if (/(humano|atendente|suporte|reclamar|ajuda|problema)/.test(q)) {
    return `Posso te conectar com um atendente humano agora pelo Chat (espera ~2 min) ou por WhatsApp (imediato). Qual você prefere?`;
  }
  /* Obrigado */
  if (/(obrigad|valeu|thanks|brigad)/.test(q)) {
    return `Por nada, ${ctx.name}! 😊 Qualquer coisa, é só chamar.`;
  }
  /* Default */
  return `Anotei sua dúvida: "${input}". Não tenho 100% de certeza da resposta — quer que eu transfira pra um especialista humano? Enquanto isso, dá uma olhada nas Perguntas frequentes em "Suporte".`;
}

const SUGGESTIONS = [
  'Qual o valor da minha fatura?',
  'Como adicionar um plano?',
  'Quantos pontos tenho no Clube?',
  'O 5G está na minha região?',
];

export function ClaraChat({
  open, onClose, userName = 'cliente', services, invoices, clube,
  prefill, onPrefillConsumed,
}: Props) {
  const ctx = useMemo(() => ({ name: userName.split(' ')[0], services, invoices, clube }),
    [userName, services, invoices, clube]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* Mensagem inicial sempre que o chat abre */
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        id: 'm-init',
        role: 'clara',
        text: `Olá, ${ctx.name}! Eu sou a Clara, sua assistente Claro. Como posso te ajudar hoje?`,
        ts: Date.now(),
      }]);
    }
  }, [open, ctx.name, messages.length]);

  /* Auto-scroll quando chega mensagem */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;

    setMessages((m) => [
      ...m,
      { id: 'u-' + Date.now(), role: 'user', text: content, ts: Date.now() },
    ]);
    setInput('');
    setTyping(true);

    /* Resposta simulada com delay variável (mais natural) */
    const delay = 700 + Math.min(content.length * 25, 1400);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { id: 'c-' + Date.now(), role: 'clara', text: claraReply(content, ctx), ts: Date.now() },
      ]);
      setTyping(false);
    }, delay);
  };

  /* Auto-envia a pergunta pré-pronta vinda da busca */
  useEffect(() => {
    if (open && prefill && messages.length <= 1) {
      const t = setTimeout(() => {
        send(prefill);
        onPrefillConsumed?.();
      }, 400);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, prefill]);

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
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
          <div
            key={m.id}
            className={cx('flex bubble-in', m.role === 'user' ? 'justify-end' : 'justify-start')}
          >
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

        {/* Sugestões só na primeira interação */}
        {messages.length === 1 && !typing && (
          <div className="pt-2 space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-warm-400 px-1">
              Sugestões
            </p>
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
