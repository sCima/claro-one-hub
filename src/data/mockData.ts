export const mockUser = {
  id: 'U-001',
  name: 'Rodrigo Ferreira',
  cpf: '***.***.123-45',
  email: 'rodrigo.ferreira@claro.com.br',
  plan: 'Combo Multi 4 Serviços',
  tier: 'Ouro' as const,
  since: '2019-03-15',
  initials: 'RF',
};

export const mockServices = [
  {
    id: 'SVC-001',
    type: 'mobile' as const,
    label: 'Claro Móvel',
    plan: 'Pós Max 200 GB',
    identifier: '(11) 9 8765-4321',
    status: 'active' as const,
    dataUsed: 28.4,
    dataLimit: 50,
    unit: 'GB',
    dueDate: '2026-05-05',
    amount: 119.9,
    streaming: null as string[] | null,
    channels: null as number | null,
  },
  {
    id: 'SVC-002',
    type: 'broadband' as const,
    label: 'Claro Internet',
    plan: '1 Giga Fibra',
    identifier: 'R. das Flores, 120 — SP',
    status: 'active' as const,
    dataUsed: 312,
    dataLimit: null as number | null,
    unit: 'GB',
    dueDate: '2026-05-10',
    amount: 149.9,
    streaming: null,
    channels: null,
  },
  {
    id: 'SVC-003',
    type: 'tv' as const,
    label: 'Claro TV+',
    plan: 'Total HD',
    identifier: 'Box principal · Sala',
    status: 'active' as const,
    dataUsed: null,
    dataLimit: null,
    unit: null,
    channels: 220,
    streaming: ['Netflix', 'HBO Max', 'Globoplay'],
    dueDate: '2026-05-10',
    amount: 199.9,
  },
  {
    id: 'SVC-004',
    type: 'fixo' as const,
    label: 'Claro Fixo',
    plan: 'Ilimitado Brasil',
    identifier: '(11) 3344-5566',
    status: 'active' as const,
    dataUsed: null,
    dataLimit: null,
    unit: null,
    channels: null,
    streaming: null,
    dueDate: '2026-05-10',
    amount: 49.9,
  },
];

export const mockInvoices = [
  { id: 'INV-001', month: 'Abril 2026',     amount: 519.7, status: 'pending' as const, dueDate: '2026-05-10' },
  { id: 'INV-002', month: 'Março 2026',     amount: 519.7, status: 'paid' as const,    dueDate: '2026-04-10' },
  { id: 'INV-003', month: 'Fevereiro 2026', amount: 505.8, status: 'paid' as const,    dueDate: '2026-03-10' },
  { id: 'INV-004', month: 'Janeiro 2026',   amount: 519.7, status: 'paid' as const,    dueDate: '2026-02-10' },
  { id: 'INV-005', month: 'Dezembro 2025',  amount: 489.4, status: 'paid' as const,    dueDate: '2026-01-10' },
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

export const mockSupportChannels = [
  { id: 'SUP-001', label: 'Chat Online',  icon: 'MessageCircle',  available: true, wait: '2 min',     number: null    },
  { id: 'SUP-002', label: 'WhatsApp',     icon: 'MessageSquare',  available: true, wait: 'Imediato', number: null    },
  { id: 'SUP-003', label: 'Ligar 106',    icon: 'Phone',          available: true, wait: null,       number: '106'   },
  { id: 'SUP-004', label: 'Loja Virtual', icon: 'ShoppingBag',    available: true, wait: null,       number: null    },
];

export const mockClube = {
  tier: 'Ouro' as const,
  points: 12480,
  nextTierAt: 15000,
  expiringPoints: 320,
  expiringDate: '2026-06-30',
  multiplier: 2,
  rewards: [
    { id: 'RW-1', label: '20% off iPhone 16 Pro',  cost: 8000,  category: 'Aparelhos'   },
    { id: 'RW-2', label: '5.000 milhas Smiles',    cost: 6500,  category: 'Viagens'     },
    { id: 'RW-3', label: 'R$ 50 em iFood',         cost: 1200,  category: 'Parceiros'   },
    { id: 'RW-4', label: 'Show ao vivo · Allianz', cost: 18000, category: 'Experiências'},
  ],
};

export const mockActivity = [
  { id: 'AC-1', type: 'payment',  label: 'Pagamento Fatura Março',     amount: -519.7, date: '2026-04-08', icon: 'CreditCard'    },
  { id: 'AC-2', type: 'recharge', label: 'Recarga celular ·  +50 GB',  amount: -29.9,  date: '2026-04-05', icon: 'Smartphone'    },
  { id: 'AC-3', type: 'reward',   label: 'Resgate Clube · iFood R$50', amount: -1200,  date: '2026-04-02', icon: 'Gift', unit: 'pts' },
  { id: 'AC-4', type: 'earn',     label: 'Pontos da fatura',           amount: +519,   date: '2026-04-08', icon: 'TrendingUp', unit: 'pts' },
  { id: 'AC-5', type: 'payment',  label: 'Pagamento Fatura Fevereiro', amount: -505.8, date: '2026-03-08', icon: 'CreditCard'    },
];

export const mockNotifications = [
  { id: 'N1', title: 'Sua fatura de Abril está disponível',     time: 'há 2h',  unread: true,  level: 'info' as const  },
  { id: 'N2', title: 'Você usou 80% do seu plano de internet',  time: 'ontem',  unread: true,  level: 'warn' as const  },
  { id: 'N3', title: 'Promoção: Apple Music grátis por 3 meses',time: '2 dias', unread: false, level: 'promo' as const },
];

export const mockRecommendations = [
  { slug: 'claro-video',  reason: 'Seu pacote TV+ não inclui Claro Vídeo' },
  { slug: 'claro-fone',   reason: 'Empresas com Claro Internet têm 30% off' },
  { slug: 'claro-clube',  reason: 'Suba para Ouro e dobre seus pontos' },
];

export type Service        = typeof mockServices[number];
export type Invoice        = typeof mockInvoices[number];
export type SupportChannel = typeof mockSupportChannels[number];
export type DataPoint      = typeof mockDataHistory[number];
export type ClubeReward    = typeof mockClube.rewards[number];
export type Activity       = typeof mockActivity[number];
export type Notification   = typeof mockNotifications[number];
export type Recommendation = typeof mockRecommendations[number];
