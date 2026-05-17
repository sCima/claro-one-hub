export const mockUser = {
  id: 'U-001',
  name: 'Rodolfo Sanches',
  cpf: '***.***.123-45',
  email: 'Rodolfo.Sanches@claro.com.br',
  plan: 'Combo Multi 4 Serviços',
  tier: 'Ouro' as const,
  since: '2019-03-15',
  initials: 'RS',
};

export const mockAccounts = [
  { id: 'A1', initials: 'RS', name: 'Rodolfo Sanches',  kind: 'Titular',    plan: 'Combo Multi · Ouro',    active: true  },
  { id: 'A2', initials: 'BF', name: 'Bianca Sanches',   kind: 'Dependente', plan: 'Claro Celular · 50GB',  active: false },
  { id: 'A3', initials: 'LF', name: 'Lucas Sanches',    kind: 'Dependente', plan: 'Claro Celular · Pré',   active: false },
  { id: 'A4', initials: 'RJ', name: 'Sanches Jr. LTDA', kind: 'Conta PJ',   plan: 'Claro Fone · 5 ramais', active: false },
];

/* Dados específicos por conta — utilizados quando usuário troca de conta no topbar */
export const accountProfiles = {
  A1: {
    email: 'rodolfo.sanches@claro.com.br',
    tier: 'Ouro' as const,
    serviceIds: ['SVC-001', 'SVC-002', 'SVC-003', 'SVC-004'],
    invoiceMultiplier: 1,
    clubePoints: 12480,
  },
  A2: {
    email: 'bianca.sanches@claro.com.br',
    tier: 'Prata' as const,
    serviceIds: ['SVC-001'],
    invoiceMultiplier: 0.23,   // só celular ≈ 119,9 / 519,7
    clubePoints: 3200,
  },
  A3: {
    email: 'lucas.sanches@claro.com.br',
    tier: 'Bronze' as const,
    serviceIds: ['SVC-001'],
    invoiceMultiplier: 0.06,   // pré-pago ≈ 30/mês
    clubePoints: 480,
  },
  A4: {
    email: 'financeiro@sanchesjr.com.br',
    tier: 'PJ' as const,
    serviceIds: ['SVC-002', 'SVC-004'],
    invoiceMultiplier: 0.38,   // internet + fixo
    clubePoints: 6400,
  },
} as const;

export const mockServices = [
  { id: 'SVC-001', type: 'mobile' as const,    label: 'Claro Celular',    plan: 'Pós Max 200 GB',  identifier: '(11) 9 8765-4321',        status: 'active' as const, dataUsed: 28.4, dataLimit: 50   as number|null, unit: 'GB' as string|null, dueDate: '2026-05-05', amount: 119.9, streaming: null as string[]|null, channels: null as number|null },
  { id: 'SVC-002', type: 'broadband' as const, label: 'Claro Internet', plan: '1 Giga Fibra',    identifier: 'R. das Flores, 120 — SP', status: 'active' as const, dataUsed: 312,  dataLimit: null as number|null, unit: 'GB' as string|null, dueDate: '2026-05-10', amount: 149.9, streaming: null,              channels: null             },
  { id: 'SVC-003', type: 'tv' as const,        label: 'Claro TV+',      plan: 'Total HD',         identifier: 'Box principal · Sala',    status: 'active' as const, dataUsed: null, dataLimit: null,                unit: null,                dueDate: '2026-05-10', amount: 199.9, streaming: ['Netflix','HBO Max','Globoplay'], channels: 220 },
  { id: 'SVC-004', type: 'fixo' as const,      label: 'Claro Fixo',     plan: 'Ilimitado Brasil', identifier: '(11) 3344-5566',          status: 'active' as const, dataUsed: null, dataLimit: null,                unit: null,                dueDate: '2026-05-10', amount: 49.9,  streaming: null,              channels: null             },
];

export const mockInvoices = [
  { id: 'INV-001', month: 'Abril 2026',     amount: 519.7, status: 'pending' as const, dueDate: '2026-05-10' },
  { id: 'INV-002', month: 'Março 2026',     amount: 519.7, status: 'paid'    as const, dueDate: '2026-04-10' },
  { id: 'INV-003', month: 'Fevereiro 2026', amount: 505.8, status: 'paid'    as const, dueDate: '2026-03-10' },
  { id: 'INV-004', month: 'Janeiro 2026',   amount: 519.7, status: 'paid'    as const, dueDate: '2026-02-10' },
  { id: 'INV-005', month: 'Dezembro 2025',  amount: 489.4, status: 'paid'    as const, dueDate: '2026-01-10' },
  { id: 'INV-006', month: 'Novembro 2025',  amount: 489.4, status: 'paid'    as const, dueDate: '2025-12-10' },
];

export const mockDataHistory = [
  { day: 'Seg', mobile: 2.1, internet: 38 },
  { day: 'Ter', mobile: 4.8, internet: 42 },
  { day: 'Qua', mobile: 3.2, internet: 51 },
  { day: 'Qui', mobile: 5.6, internet: 47 },
  { day: 'Sex', mobile: 6.1, internet: 62 },
  { day: 'Sáb', mobile: 4.3, internet: 71 },
  { day: 'Dom', mobile: 2.3, internet: 58 },
];

export const mockClube = {
  tier: 'Ouro' as const,
  points: 12480,
  nextTierAt: 15000,
  expiringPoints: 320,
  expiringDate: '2026-06-30',
  multiplier: 2,
  rewards: [
    { id: 'RW-1', label: '20% off iPhone 16 Pro',     cost: 8000,  category: 'Aparelhos'    },
    { id: 'RW-2', label: '5.000 milhas Smiles',       cost: 6500,  category: 'Viagens'      },
    { id: 'RW-3', label: 'R$ 50 em iFood',            cost: 1200,  category: 'Parceiros'    },
    { id: 'RW-4', label: 'Show ao vivo · Allianz',    cost: 18000, category: 'Experiências' },
    { id: 'RW-5', label: '30% off Magalu',            cost: 2500,  category: 'Parceiros'    },
    { id: 'RW-6', label: 'Netflix Premium · 3 meses', cost: 3800,  category: 'Streaming'    },
  ],
};

export const mockActivity = [
  { id: 'AC-1', type: 'payment',  label: 'Pagamento Fatura Março',     amount: -519.7, date: '2026-04-08', icon: 'CreditCard',  unit: undefined as string|undefined },
  { id: 'AC-2', type: 'recharge', label: 'Recarga celular · +50 GB',   amount: -29.9,  date: '2026-04-05', icon: 'Smartphone',  unit: undefined },
  { id: 'AC-3', type: 'reward',   label: 'Resgate Clube · iFood R$50', amount: -1200,  date: '2026-04-02', icon: 'Gift',        unit: 'pts'     },
  { id: 'AC-4', type: 'earn',     label: 'Pontos da fatura',           amount: +519,   date: '2026-04-08', icon: 'TrendingUp',  unit: 'pts'     },
  { id: 'AC-5', type: 'payment',  label: 'Pagamento Fatura Fevereiro', amount: -505.8, date: '2026-03-08', icon: 'CreditCard',  unit: undefined },
];

export const mockNotifications = [
  { id: 'N1', title: 'Sua fatura de Abril está disponível',      time: 'há 2h',  unread: true,  level: 'info'  as const },
  { id: 'N2', title: 'Você usou 80% do seu plano de internet',   time: 'ontem',  unread: true,  level: 'warn'  as const },
  { id: 'N3', title: 'Promoção: Apple Music grátis por 3 meses', time: '2 dias', unread: false, level: 'promo' as const },
];

export const mockRecommendations = [
  { slug: 'claro-video', brand: 'Claro Vídeo', icon: 'PlayCircle', priceFrom: 19.9, reason: 'Seu pacote TV+ não inclui Claro Vídeo' },
  { slug: 'claro-fone',  brand: 'Claro Fone',  icon: 'Phone',      priceFrom: 29.9, reason: 'Empresas com Claro Internet têm 30% off' },
  { slug: 'claro-clube', brand: 'Claro Clube', icon: 'Gift',       priceFrom: 0,    reason: 'Suba para Ouro e dobre seus pontos' },
];

/* Planos disponíveis para adicionar ao combo
 * Apenas serviços reais Claro, conforme o Manual de Aplicação de Marcas */
export const availablePlans = [
  { id: 'AP-1', brand: 'Claro Vídeo',       icon: 'PlayCircle' as const, price: 19.9, comboDiscount: 5, desc: 'Streaming sob demanda com filmes, séries e novelas latinas exclusivas. 14 dias grátis para clientes Claro.' },
  { id: 'AP-2', brand: 'Claro hdtv',        icon: 'Tv'         as const, price: 89.9, comboDiscount: 8, desc: '120 canais 100% em HD com som surround 5.1 e bitrate até 18 Mbps. Ideal para Smart TVs e home cinemas.' },
  { id: 'AP-3', brand: 'Claro tv Livre',    icon: 'Antenna'    as const, price: 0,    comboDiscount: 0, desc: 'Parabólica banda Ku com 30+ canais HD. Sem mensalidade, sem fidelidade. Equipamento a partir de R$ 299.' },
  { id: 'AP-4', brand: 'Claro hdtv Livre',  icon: 'Antenna'    as const, price: 0,    comboDiscount: 0, desc: 'TV aberta digital em HD via parabólica banda Ku. Substitui antena UHF, sinal mais limpo. Equipamento R$ 199.' },
  { id: 'AP-5', brand: 'Claro Fone',        icon: 'Phone'      as const, price: 29.9, comboDiscount: 6, desc: 'Voz sobre IP profissional com PABX em nuvem, ramais virtuais e app mobile. Ideal para PJ e home office.' },
];

/* FAQ centralizada — usada na busca + página de Suporte */
export const faqs = [
  { id: 'FAQ-1', q: 'Como pagar com Pix em 1 toque?',                    a: 'Vá em Faturas, toque em "Pagar agora" e escolha Pix. O QR é gerado para o titular do CPF cadastrado.' },
  { id: 'FAQ-2', q: 'Posso compartilhar dados com dependentes?',          a: 'Sim — adicione cada dependente ao combo Multi e ative compartilhamento de dados em Configurações > Dependentes.' },
  { id: 'FAQ-3', q: 'Onde vejo o status da minha região?',                a: 'O banner amarelo no topo do hub mostra incidentes ativos. Você também pode consultar status.claro.com.br.' },
  { id: 'FAQ-4', q: 'Como cancelar um serviço?',                          a: 'Em Meus serviços > Detalhes do serviço > Gerenciar plano > Cancelar. Atendimento humano em 5 min.' },
  { id: 'FAQ-5', q: 'Como funciona o Claro Clube?',                       a: 'Você acumula 1 ponto por R$ 1 gasto na fatura. Pontos podem ser trocados por descontos, milhas e produtos.' },
  { id: 'FAQ-6', q: 'O 5G+ está disponível na minha cidade?',             a: 'Já operamos em mais de 720 cidades. Consulte cobertura.claro.com.br ou pergunte para a Clara aqui no chat.' },
];

export const mockSupportChannels = [
  { id: 'SUP-001', label: 'Chat Online',  icon: 'MessageCircle', available: true, wait: '2 min',    number: null    },
  { id: 'SUP-002', label: 'WhatsApp',     icon: 'MessageSquare', available: true, wait: 'Imediato', number: null    },
  { id: 'SUP-003', label: 'Ligar 106',    icon: 'Phone',         available: true, wait: null,       number: '106'   },
  { id: 'SUP-004', label: 'Loja Virtual', icon: 'ShoppingBag',   available: true, wait: null,       number: null    },
];

/* ─── Clara · Intents (Sprint 2 §3.4) ───────────────────────────────────────
 * Cada intent declara os padrões de reconhecimento (regex) e se a Clara
 * consegue resolver sozinha (resolvedAuto) ou precisa de handover humano. */
export const claraIntents = [
  {
    id: 'consultar_fatura',
    resolvedAuto: true,
    patterns: /(fatura|valor da conta|minha conta|quanto.*deve|quanto.*pagar|vencimento|conta de \w+)/,
    examples: ['Qual o valor da minha fatura?', 'Me mostra a conta de abril'],
  },
  {
    id: 'segunda_via_fatura',
    resolvedAuto: true,
    patterns: /(2.?\s?via|segunda via|boleto|me manda.*conta|reenvi|c.pia da fatura)/,
    examples: ['Preciso da 2ª via', 'Me manda o boleto'],
  },
  {
    id: 'consultar_plano',
    resolvedAuto: true,
    patterns: /(meu plano|qual.*plano|o que.*incluso|o que tenho|meus servi.os|combo)/,
    examples: ['Qual meu plano?', 'O que está incluso?'],
  },
  {
    id: 'alterar_plano',
    resolvedAuto: true,
    patterns: /(trocar.*plano|mudar.*plano|upgrade|fazer upgrade|adicionar plano|contratar|migrar)/,
    examples: ['Quero trocar de plano', 'Tem upgrade disponível?'],
  },
  {
    id: 'status_servico',
    resolvedAuto: true,
    patterns: /(caiu|n.o (pega|funciona|t. funcionando)|sem (sinal|internet|conex.o)|lenta|instabil|problema.*(internet|tv|sinal)|fora do ar)/,
    examples: ['Minha internet caiu', 'A TV não pega'],
  },
  {
    id: 'solicitar_atendente',
    resolvedAuto: false,
    patterns: /(falar com (algu.m|atendente|humano|pessoa)|atendente|humano|reclama|n.o resolveu|quero suporte)/,
    examples: ['Quero falar com alguém', 'Atendente humano'],
  },
  {
    id: 'saudacao',
    resolvedAuto: true,
    patterns: /^(oi|ol.|hey|hello|bom dia|boa tarde|boa noite|e a.|tudo bem)/,
    examples: ['Oi', 'Bom dia'],
  },
  {
    id: 'despedida',
    resolvedAuto: true,
    patterns: /(tchau|obrigad|valeu|brigad|at. mais|flw|thanks)/,
    examples: ['Tchau', 'Obrigado'],
  },
] as const;

export type ClaraIntentId = typeof claraIntents[number]['id'] | 'fora_de_escopo';

/* ─── One Hub Admin · ITSM / Service Desk (Sprint 2 §4.4) ─────────────────── */
export type AdminChannel  = 'whatsapp' | 'portal' | 'app';
export type AdminPriority = 'alta' | 'media' | 'baixa';
export type TicketStatus  = 'novo' | 'em_atendimento' | 'resolvido';

/* SLA-alvo (min) por prioridade — base do cálculo de cumprimento */
export const SLA_TARGET: Record<AdminPriority, number> = { alta: 15, media: 30, baixa: 60 };

/* Categorias ITSM (estilo ServiceNow) */
export const TICKET_CATEGORIES = [
  'Incidente de Rede', 'Faturamento', 'Comercial / Vendas', 'Conta e Acesso', 'Dúvida Geral',
] as const;

export const mockAttendanceQueue = [
  {
    id: 'Q-1',
    ticketId: 'INC-2026-0481',
    name: 'Marcos Vinícius Aragão',
    initials: 'MA',
    cpf: '***.***.882-10',
    contractSince: '2021-07-02',
    channel: 'whatsapp' as AdminChannel,
    priority: 'alta' as AdminPriority,
    status: 'novo' as TicketStatus,
    category: 'Incidente de Rede',
    waitMins: 8,
    openedMinsAgo: 12,
    reason: 'Internet fibra instável há 2 dias',
    serviceHealth: { internet: 'degradado', tv: 'ok', telefonia: 'ok' } as Record<string, 'ok' | 'degradado' | 'offline'>,
    claraHistory: [
      { role: 'clara' as const, text: 'Olá, Marcos! Eu sou a Clara. Como posso ajudar?' },
      { role: 'user'  as const, text: 'minha internet ta caindo direto' },
      { role: 'clara' as const, text: 'Sinto muito! Detectei uma instabilidade na fibra do seu bairro (incidente #INC-4471, aberto às 09:12). Já reiniciei seu modem remotamente. O reparo está previsto para hoje até 18h.' },
      { role: 'user'  as const, text: 'isso não resolveu, quero falar com alguém' },
      { role: 'clara' as const, text: 'Entendo. Vou te transferir para um especialista com todo o histórico. Um instante…' },
    ],
  },
  {
    id: 'Q-2',
    ticketId: 'INC-2026-0480',
    name: 'Patrícia Lemos Tavares',
    initials: 'PT',
    cpf: '***.***.330-55',
    contractSince: '2019-11-20',
    channel: 'portal' as AdminChannel,
    priority: 'media' as AdminPriority,
    status: 'em_atendimento' as TicketStatus,
    category: 'Faturamento',
    waitMins: 3,
    openedMinsAgo: 22,
    reason: 'Contestação de cobrança na fatura',
    serviceHealth: { internet: 'ok', tv: 'ok', telefonia: 'ok' },
    claraHistory: [
      { role: 'clara' as const, text: 'Olá, Patrícia! Como posso ajudar?' },
      { role: 'user'  as const, text: 'tem uma cobrança que não reconheço na minha fatura' },
      { role: 'clara' as const, text: 'Sua fatura de Abril 2026 está em R$ 519,70. Identifiquei um item "Pacote Premiere +R$ 39,90" adicionado em 02/04. Você reconhece essa contratação?' },
      { role: 'user'  as const, text: 'não fui eu que contratei isso' },
      { role: 'clara' as const, text: 'Certo, isso precisa de análise humana. Estou te encaminhando para um atendente com o histórico completo.' },
    ],
  },
  {
    id: 'Q-3',
    ticketId: 'REQ-2026-1192',
    name: 'Sanches Jr. LTDA',
    initials: 'SJ',
    cpf: '40.***.***/0001-47',
    contractSince: '2022-03-15',
    channel: 'app' as AdminChannel,
    priority: 'baixa' as AdminPriority,
    status: 'novo' as TicketStatus,
    category: 'Comercial / Vendas',
    waitMins: 1,
    openedMinsAgo: 4,
    reason: 'Dúvida sobre upgrade de ramais (Claro Fone)',
    serviceHealth: { internet: 'ok', tv: 'ok', telefonia: 'ok' },
    claraHistory: [
      { role: 'clara' as const, text: 'Olá! Como posso ajudar a Sanches Jr. hoje?' },
      { role: 'user'  as const, text: 'quero adicionar mais ramais no claro fone' },
      { role: 'clara' as const, text: 'O plano Claro Fone Empresarial (R$ 199,90) oferece ramais ilimitados + integração CRM. Quer falar com um consultor para migração sem perda de numeração?' },
      { role: 'user'  as const, text: 'sim, quero falar com um consultor' },
    ],
  },
];

/* Tickets já resolvidos — alimentam histórico e métricas de SLA do dashboard */
export const mockResolvedTickets = [
  {
    id: 'R-1', ticketId: 'INC-2026-0479', name: 'Carla Menezes', initials: 'CM',
    cpf: '***.***.114-92', contractSince: '2020-02-10',
    channel: 'whatsapp' as AdminChannel, priority: 'alta' as AdminPriority,
    status: 'resolvido' as TicketStatus, category: 'Incidente de Rede',
    waitMins: 0, openedMinsAgo: 95, resolvedInMins: 11,
    firstResponseMins: 3, resolvedDaysAgo: 2, csat: 5,
    reason: 'TV+ sem sinal após queda de energia',
    serviceHealth: { internet: 'ok', tv: 'ok', telefonia: 'ok' } as Record<string, 'ok' | 'degradado' | 'offline'>,
    claraHistory: [
      { role: 'clara' as const, text: 'Olá, Carla! Como posso ajudar?' },
      { role: 'user'  as const, text: 'minha tv não liga depois que faltou luz' },
      { role: 'clara' as const, text: 'Enviei um sinal de re-sincronização para o seu box. Pode levar até 2 minutos. Se não voltar, falo com um técnico.' },
      { role: 'user'  as const, text: 'continua na mesma' },
      { role: 'clara' as const, text: 'Transferindo para suporte técnico com o histórico.' },
    ],
  },
  {
    id: 'R-2', ticketId: 'REQ-2026-1189', name: 'Eduardo Pinto', initials: 'EP',
    cpf: '***.***.701-33', contractSince: '2023-06-01',
    channel: 'portal' as AdminChannel, priority: 'media' as AdminPriority,
    status: 'resolvido' as TicketStatus, category: 'Faturamento',
    waitMins: 0, openedMinsAgo: 140, resolvedInMins: 41,
    firstResponseMins: 9, resolvedDaysAgo: 9, csat: 4,
    reason: '2ª via de boleto não chegou por e-mail',
    serviceHealth: { internet: 'ok', tv: 'ok', telefonia: 'ok' },
    claraHistory: [
      { role: 'clara' as const, text: 'Oi, Eduardo! Como posso ajudar?' },
      { role: 'user'  as const, text: 'pedi a segunda via e não recebi' },
      { role: 'clara' as const, text: 'Reenviei o boleto para o e-mail cadastrado. Caso não chegue em 5 min, posso acionar um atendente.' },
      { role: 'user'  as const, text: 'não chegou, quero falar com atendente' },
    ],
  },
  {
    id: 'R-3', ticketId: 'INC-2026-0476', name: 'Juliana Reis', initials: 'JR',
    cpf: '***.***.558-04', contractSince: '2018-09-22',
    channel: 'app' as AdminChannel, priority: 'baixa' as AdminPriority,
    status: 'resolvido' as TicketStatus, category: 'Conta e Acesso',
    waitMins: 0, openedMinsAgo: 220, resolvedInMins: 78,
    firstResponseMins: 14, resolvedDaysAgo: 35, csat: 3,
    reason: 'Não consegue redefinir senha do app',
    serviceHealth: { internet: 'ok', tv: 'ok', telefonia: 'ok' },
    claraHistory: [
      { role: 'clara' as const, text: 'Olá, Juliana! Como posso ajudar?' },
      { role: 'user'  as const, text: 'não consigo trocar minha senha no app' },
      { role: 'clara' as const, text: 'Enviei um link de redefinição para o seu e-mail e SMS. Conseguiu acessar?' },
      { role: 'user'  as const, text: 'o link diz que expirou' },
    ],
  },
];

/* ─── RBAC · papéis do One Hub Admin ──────────────────────────────────────
 * atendente → console ITSM (fila, conversa, CRM)
 * gerente   → dashboard gerencial (gráficos, métricas, config de SLA) + console */
export type AdminRole = 'atendente' | 'gerente';

export const ADMIN_USERS: { email: string; password: string; role: AdminRole; name: string }[] = [
  { email: 'atendente@claro.com.br', password: 'admin',   role: 'atendente', name: 'Atendente Claro' },
  { email: 'gerente@claro.com.br',   password: 'gerente', role: 'gerente',   name: 'Gerência Claro'  },
];

/* compat: credencial demo do atendente */
export const ADMIN_DEMO = { email: 'atendente@claro.com.br', password: 'admin' };

/* Permissões por papel (RBAC) */
export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  atendente: ['ver_fila', 'atender_ticket', 'resolver_ticket', 'ver_crm'],
  gerente: [
    'ver_fila', 'atender_ticket', 'resolver_ticket', 'ver_crm',
    'ver_dashboard', 'config_sla', 'ver_metricas', 'exportar_relatorio', 'gerir_equipe',
  ],
};

/* Série temporal (últimos 7 dias) — alimenta gráficos do dashboard gerencial */
export const mockTicketTrend = [
  { dia: 'Seg', abertos: 42, resolvidos: 38, slaPct: 88 },
  { dia: 'Ter', abertos: 51, resolvidos: 47, slaPct: 84 },
  { dia: 'Qua', abertos: 38, resolvidos: 40, slaPct: 92 },
  { dia: 'Qui', abertos: 60, resolvidos: 55, slaPct: 79 },
  { dia: 'Sex', abertos: 72, resolvidos: 64, slaPct: 81 },
  { dia: 'Sáb', abertos: 33, resolvidos: 35, slaPct: 95 },
  { dia: 'Dom', abertos: 21, resolvidos: 22, slaPct: 97 },
];

/* ─── Períodos de análise (até 1 ano) ─────────────────────────────────────── */
export const ANALYSIS_PERIODS = [
  { id: '7d',  label: 'Últimos 7 dias',  days: 7   },
  { id: '30d', label: 'Últimos 30 dias', days: 30  },
  { id: '90d', label: 'Último trimestre', days: 90 },
  { id: '180d', label: 'Últimos 6 meses', days: 180 },
  { id: '365d', label: 'Últimos 12 meses', days: 365 },
] as const;
export type PeriodId = typeof ANALYSIS_PERIODS[number]['id'];

/* PRNG determinístico (mesmo período → mesmos números, sem flicker) */
function seeded(n: number) { const x = Math.sin(n) * 10000; return x - Math.floor(x); }

const MONTHS_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const WEEKDAYS_PT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

/* Gera métricas agregadas + série temporal para o período escolhido.
 * Granularidade: dia (≤14d), semana (≤90d), mês (>90d). */
export function genPeriodMetrics(days: number) {
  const now = new Date('2026-05-17');
  let buckets: { label: string; key: number }[] = [];

  if (days <= 14) {
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      buckets.push({ label: WEEKDAYS_PT[d.getDay()], key: i });
    }
  } else if (days <= 90) {
    const weeks = Math.round(days / 7);
    for (let i = weeks - 1; i >= 0; i--) buckets.push({ label: `S${weeks - i}`, key: i });
  } else {
    const months = Math.round(days / 30);
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now); d.setMonth(d.getMonth() - i);
      buckets.push({ label: MONTHS_PT[d.getMonth()], key: i });
    }
  }

  const scale = days <= 14 ? 1 : days <= 90 ? 6 : 26; // volume por bucket cresce com a janela
  const series = buckets.map((b, i) => {
    const r1 = seeded(b.key + days + 1);
    const r2 = seeded(b.key * 3 + days + 7);
    const abertos = Math.round((28 + r1 * 55) * scale);
    const resolvidos = Math.round(abertos * (0.84 + r2 * 0.16));
    const slaPct = Math.round(76 + seeded(b.key + days + 13) * 22);
    return { label: b.label, abertos, resolvidos, slaPct, idx: i };
  });

  const total = series.reduce((s, x) => s + x.abertos, 0);
  const resolvidos = series.reduce((s, x) => s + x.resolvidos, 0);
  const slaPct = Math.round(series.reduce((s, x) => s + x.slaPct, 0) / series.length);
  const avgResolutionMin = Math.round(18 + seeded(days) * 26);     // tempo médio de resolução
  const firstResponseMin = Math.round(2 + seeded(days + 5) * 7);   // tempo de 1ª resposta
  const csat = +(3.9 + seeded(days + 9) * 1.05).toFixed(1);        // satisfação (1-5)
  const reopenRate = +(2 + seeded(days + 11) * 6).toFixed(1);      // taxa de reabertura %
  const claraAutoPct = Math.round(58 + seeded(days + 17) * 30);    // % resolvido pela Clara

  const byChannel = [
    { key: 'whatsapp', label: 'WhatsApp',   value: Math.round(total * (0.40 + seeded(days + 2) * 0.1)) },
    { key: 'portal',   label: 'Portal Web', value: Math.round(total * (0.32 + seeded(days + 3) * 0.08)) },
    { key: 'app',      label: 'App',        value: Math.round(total * (0.20 + seeded(days + 4) * 0.06)) },
  ];
  const byCategory = TICKET_CATEGORIES.map((c, i) => ({
    key: c, label: c, value: Math.round(total * (0.30 - i * 0.045) + seeded(days + i) * 12),
  }));

  return {
    series, total, resolvidos, slaPct, avgResolutionMin, firstResponseMin,
    csat, reopenRate, claraAutoPct, byChannel, byCategory,
  };
}
export type PeriodMetrics = ReturnType<typeof genPeriodMetrics>;

/* ─── Compliance · ISO/IEC 27001 + LGPD ───────────────────────────────────── */
export const COMPLIANCE = {
  iso27001: 'ISO/IEC 27001 · A.12.4 · A.9',
  lgpd: 'LGPD Lei 13.709/2018 · dados pessoais mascarados',
  retentionDays: 365,
};

export const serviceDetails = {
  mobile: {
    label: 'Claro Celular', icon: 'Smartphone' as const, tagline: 'Sem fronteiras, sem limites',
    pitch: '5G+ em mais de 720 cidades, roaming América do Sul e Apple Music incluso.',
    plans: [
      { name: 'Controle 50',   price: 59.9,  popular: false, features: ['50 GB de internet', 'WhatsApp ilimitado', 'Apps de música ilimitados'] },
      { name: 'Pós Max 200',   price: 119.9, popular: true,  features: ['200 GB de internet', 'Roaming América do Sul', 'Apple Music + HBO Max'] },
      { name: 'Pós Ultra 500', price: 189.9, popular: false, features: ['500 GB + franquia dobrada fins de semana', '5G+ prioritário', 'Netflix Premium incluso'] },
    ],
  },
  internet: {
    label: 'Claro Internet', icon: 'Wifi' as const, tagline: 'Fibra óptica de verdade',
    pitch: 'Velocidades de até 1 Giga via fibra 100% óptica, Wi-Fi 6 e instalação em 24h.',
    plans: [
      { name: '300 Mega', price: 99.9,  popular: false, features: ['Download 300 Mbps', 'Upload 150 Mbps', 'Wi-Fi 5 grátis'] },
      { name: '600 Mega', price: 119.9, popular: true,  features: ['Download 600 Mbps', 'Upload 300 Mbps', 'Wi-Fi 6 + 1 extensor'] },
      { name: '1 Giga',   price: 149.9, popular: false, features: ['Download 1 Gbps', 'Upload 500 Mbps', '2 extensores + McAfee'] },
    ],
  },
  tv: {
    label: 'Claro TV+', icon: 'Tv' as const, tagline: 'TV ao vivo + streaming integrado',
    pitch: 'Box Android TV com Netflix, Globoplay, Prime Video e canais ao vivo na mesma tela.',
    plans: [
      { name: 'Essencial', price: 79.9,  popular: false, features: ['80 canais ao vivo', 'Box Android TV', 'Disney+ 3 meses'] },
      { name: 'Premium',   price: 139.9, popular: false, features: ['180 canais', 'Netflix Standard', 'HBO Max + Paramount+'] },
      { name: 'Total HD',  price: 199.9, popular: true,  features: ['250+ canais 4K', 'Netflix Premium', 'Apple TV+ + Globoplay'] },
    ],
  },
  voice: {
    label: 'Claro Fixo', icon: 'Phone' as const, tagline: 'Telefone residencial digital',
    pitch: 'Linha fixa com chamadas ilimitadas para fixo Brasil e identificador grátis.',
    plans: [
      { name: 'Essencial', price: 39.9, popular: false, features: ['400 min para fixos', 'Identificador', 'Caixa postal'] },
      { name: 'Ilimitado', price: 49.9, popular: true,  features: ['Ilimitado para fixo Brasil', '200 min para celular', 'Siga-me + conferência'] },
    ],
  },
} as const;

export type User             = typeof mockUser;
export type Account          = typeof mockAccounts[number];
export type Service          = typeof mockServices[number];
export type Invoice          = typeof mockInvoices[number];
export type DataPoint        = typeof mockDataHistory[number];
export type ClubeData        = typeof mockClube;
export type ClubeReward      = typeof mockClube.rewards[number];
export type Activity         = typeof mockActivity[number];
export type Notification     = typeof mockNotifications[number];
export type Recommendation   = typeof mockRecommendations[number];
export type SupportChannel   = typeof mockSupportChannels[number];
export type ServiceDetailKey = keyof typeof serviceDetails;
export type AvailablePlan     = typeof availablePlans[number];
export type Faq               = typeof faqs[number];
export type AccountId         = keyof typeof accountProfiles;
export type QueueItem         = typeof mockAttendanceQueue[number] & {
  resolvedInMins?: number;
  firstResponseMins?: number;
  resolvedDaysAgo?: number;
  csat?: number;
};
export type ResolvedTicket    = typeof mockResolvedTickets[number];
export type TicketTrendPoint  = typeof mockTicketTrend[number];
