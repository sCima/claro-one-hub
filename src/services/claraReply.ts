/* ─────────────────────────────────────────────────────────────────────────────
 * One Hub · Geração de resposta da Clara por intent
 *
 * Consome os dados reais do cliente (serviços, faturas, clube) e devolve o texto
 * da resposta. Compartilhado entre o Web Chat (ClaraChat) e o canal WhatsApp,
 * garantindo que a Clara responda igual em qualquer canal.
 * ───────────────────────────────────────────────────────────────────────────── */

import type { Service, Invoice, ClubeData, ClaraIntentId } from '../data/mockData';
import type { Canal } from './session';

export interface ClaraContext {
  name: string;
  services: Service[];
  invoices: Invoice[];
  clube: ClubeData | null;
  /** RF006 — aviso de incidente técnico ativo na região do cliente */
  incidentNote?: string | null;
}

const fmtBRL = (n: number) => n.toFixed(2).replace('.', ',');
const br = (iso: string) => iso.split('-').reverse().join('/');

/**
 * Frase curta de "retomada" quando o cliente chega por outro canal com uma
 * sessão em andamento (§4 — resume o contexto para a Clara antes da 1ª resposta).
 */
export function resumeLine(name: string, lastIntent: string | null, canalAnterior: Canal): string {
  const origem = canalAnterior === 'whatsapp' ? 'no WhatsApp' : canalAnterior === 'app' ? 'no app' : 'no portal';
  if (!lastIntent || lastIntent === 'saudacao' || lastIntent === 'despedida') {
    return `Oi de novo, ${name}! Recuperei nossa conversa que começou ${origem}. Como posso continuar te ajudando?`;
  }
  const assunto: Record<string, string> = {
    consultar_fatura: 'a consulta da sua fatura',
    segunda_via_fatura: 'a 2ª via do seu boleto',
    consultar_plano: 'os detalhes do seu plano',
    alterar_plano: 'a mudança de plano',
    status_servico: 'o problema no seu serviço',
    solicitar_atendente: 'a transferência para um atendente',
    fora_de_escopo: 'sua última dúvida',
  };
  return `Oi de novo, ${name}! Estávamos falando sobre ${assunto[lastIntent] ?? 'seu atendimento'} ${origem}. Não precisa repetir nada — vamos continuar daqui.`;
}

/* Ações que a Clara oferece junto da resposta (RNF002 — navegação guiada).
 * O ClaraChat despacha `event` (CustomEvent) e o Dashboard executa. */
export interface ClaraAction {
  label: string;
  event: 'onehub:navigate' | 'onehub:pay' | 'onehub:open-store';
  detail?: string;
}

export function replyActions(intent: ClaraIntentId, ctx: ClaraContext): ClaraAction[] {
  const hasPending = ctx.invoices.some((i) => i.status === 'pending');
  switch (intent) {
    case 'consultar_fatura':
      return hasPending
        ? [{ label: 'Ver faturas', event: 'onehub:navigate', detail: 'invoices' }, { label: 'Pagar agora', event: 'onehub:pay' }]
        : [{ label: 'Ver faturas', event: 'onehub:navigate', detail: 'invoices' }];
    case 'segunda_via_fatura':
      return [{ label: 'Abrir faturas', event: 'onehub:navigate', detail: 'invoices' }];
    case 'consultar_plano':
      return [{ label: 'Meus serviços', event: 'onehub:navigate', detail: 'overview' }];
    case 'alterar_plano':
      return [{ label: 'Ver planos disponíveis', event: 'onehub:open-store' }];
    case 'status_servico':
      return [{ label: 'Acompanhar atendimento', event: 'onehub:navigate', detail: 'atendimento' }];
    default:
      return [];
  }
}

export function buildReply(intent: ClaraIntentId, ctx: ClaraContext): string {
  const pending = ctx.invoices.find((i) => i.status === 'pending');
  const monthly = ctx.services.reduce((s, x) => s + (x.amount ?? 0), 0);

  switch (intent) {
    case 'saudacao':
      return `Olá, ${ctx.name}! Eu sou a Clara, sua assistente Claro. Como posso te ajudar hoje?`;

    case 'consultar_fatura':
      return pending
        ? `Sua fatura de ${pending.month} está aberta no valor de R$ ${fmtBRL(pending.amount)}, com vencimento em ${br(pending.dueDate)}. Quer pagar agora? Toque em "Faturas" no menu ou no card escuro da Visão geral.`
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
      if (ctx.incidentNote) return ctx.incidentNote;
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
