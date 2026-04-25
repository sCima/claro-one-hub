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

export const mockServices = [
  { id: 'SVC-001', type: 'mobile' as const,    label: 'Claro Móvel',    plan: 'Pós Max 200 GB',  identifier: '(11) 9 8765-4321',        status: 'active' as const, dataUsed: 28.4, dataLimit: 50   as number|null, unit: 'GB' as string|null, dueDate: '2026-05-05', amount: 119.9, streaming: null as string[]|null, channels: null as number|null },
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

export const mockSupportChannels = [
  { id: 'SUP-001', label: 'Chat Online',  icon: 'MessageCircle', available: true, wait: '2 min',    number: null    },
  { id: 'SUP-002', label: 'WhatsApp',     icon: 'MessageSquare', available: true, wait: 'Imediato', number: null    },
  { id: 'SUP-003', label: 'Ligar 106',    icon: 'Phone',         available: true, wait: null,       number: '106'   },
  { id: 'SUP-004', label: 'Loja Virtual', icon: 'ShoppingBag',   available: true, wait: null,       number: null    },
];

export const serviceDetails = {
  mobile: {
    label: 'Claro Móvel', icon: 'Smartphone' as const, tagline: 'Sem fronteiras, sem limites',
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
