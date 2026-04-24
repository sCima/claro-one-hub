export interface Plan {
  id: string;
  name: string;
  highlight?: string;
  price: number;
  features: string[];
  popular?: boolean;
}

export interface ClaroService {
  slug: string;
  brand: string;
  category: 'Móvel' | 'Internet' | 'TV' | 'Voz' | 'Conteúdo' | 'Benefícios';
  icon: 'Smartphone' | 'Wifi' | 'Tv' | 'Phone' | 'PlayCircle' | 'Radio' | 'Antenna' | 'Gift' | 'Tv2' | 'MonitorPlay';
  tagline: string;
  pitch: string;
  hero: { eyebrow: string; headline: string; sub: string };
  badges: string[];
  plans: Plan[];
  highlights: { title: string; desc: string }[];
  faq: { q: string; a: string }[];
}

export const servicesCatalog: ClaroService[] = [
  {
    slug: 'claro-celular',
    brand: 'Claro Celular',
    category: 'Móvel',
    icon: 'Smartphone',
    tagline: 'Sem fronteiras, sem limites',
    pitch: 'A maior cobertura 5G do Brasil, com franquia para usar o app que você quiser sem descontar dos dados.',
    hero: {
      eyebrow: 'Pós-pago · 5G+',
      headline: 'Toda a internet do mundo cabe no seu plano.',
      sub: 'Apps ilimitados, roaming na América do Sul e Apple Music incluso a partir de R$ 89,90/mês.',
    },
    badges: ['5G nacional', 'Roaming América do Sul', 'Apps ilimitados'],
    plans: [
      { id: 'cel-pre', name: 'Pré 30',     price: 29.9,  features: ['15 GB de internet', 'WhatsApp ilimitado', 'Ligações ilimitadas para Claro'] },
      { id: 'cel-ctrl',name: 'Controle 50',price: 59.9,  features: ['50 GB de internet', '100 min para outras operadoras', 'Apps de música ilimitados'], popular: true, highlight: 'Mais escolhido' },
      { id: 'cel-pos', name: 'Pós Max',    price: 119.9, features: ['200 GB de internet', 'Roaming América do Sul', 'Apple Music + HBO Max inclusos'] },
    ],
    highlights: [
      { title: '5G+ disponível', desc: 'Cobertura 5G em mais de 720 cidades brasileiras.' },
      { title: 'Apps ilimitados', desc: 'WhatsApp, Instagram, TikTok e Waze sem descontar do plano.' },
      { title: 'eSIM em 60 segundos', desc: 'Ative sua linha pelo app Minha Claro, sem ir até a loja.' },
    ],
    faq: [
      { q: 'Posso migrar meu número?', a: 'Sim, a portabilidade é gratuita e leva até 3 dias úteis.' },
      { q: 'O 5G+ funciona com meu chip atual?', a: 'Sim, basta ter um aparelho compatível e estar em área coberta.' },
    ],
  },
  {
    slug: 'claro-internet',
    brand: 'Claro Internet',
    category: 'Internet',
    icon: 'Wifi',
    tagline: 'Fibra óptica de verdade na sua casa',
    pitch: 'Velocidades de até 1 Giga via fibra 100% óptica, com Wi-Fi 6 e instalação em até 24h.',
    hero: {
      eyebrow: 'Banda Larga · Fibra',
      headline: 'O Wi-Fi da sua casa, no ritmo da sua família.',
      sub: 'Plano 1 Giga com Wi-Fi 6 grátis, McAfee e suporte 24h por R$ 149,90/mês.',
    },
    badges: ['100% Fibra', 'Wi-Fi 6 incluso', 'Instalação 24h'],
    plans: [
      { id: 'net-300',  name: '300 Mega',  price: 99.9,  features: ['Download 300 Mbps', 'Upload 150 Mbps', 'Wi-Fi 5 grátis'] },
      { id: 'net-600',  name: '600 Mega',  price: 119.9, features: ['Download 600 Mbps', 'Upload 300 Mbps', 'Wi-Fi 6 + 1 extensor'], popular: true, highlight: 'Mais vendido' },
      { id: 'net-1000', name: '1 Giga',    price: 149.9, features: ['Download 1000 Mbps', 'Upload 500 Mbps', 'Wi-Fi 6 + 2 extensores + McAfee'] },
    ],
    highlights: [
      { title: '100% Fibra Óptica', desc: 'Sinal estável até a sua casa, sem cabo coaxial no meio do caminho.' },
      { title: 'Wi-Fi 6 grátis', desc: 'Roteador de última geração com cobertura otimizada por ambiente.' },
      { title: 'Instalação em 24h', desc: 'Agende online e receba o técnico no mesmo dia útil.' },
    ],
    faq: [
      { q: 'Tem fidelidade?', a: 'Sim, contrato de 12 meses com bônus na mensalidade.' },
      { q: 'A velocidade é garantida?', a: 'Garantimos 80% da velocidade contratada conforme regulamentação Anatel.' },
    ],
  },
  {
    slug: 'claro-tv',
    brand: 'Claro TV',
    category: 'TV',
    icon: 'Tv',
    tagline: 'O melhor da TV ao vivo',
    pitch: 'Mais de 250 canais via cabo e satélite, com SporTV, Premiere e Telecine inclusos no plano top.',
    hero: {
      eyebrow: 'TV por Assinatura',
      headline: 'A casa toda assistindo, cada um na sua tela.',
      sub: 'Pacote Família HD com 180 canais, Globoplay e gravador digital por R$ 129,90/mês.',
    },
    badges: ['250+ canais', 'Premiere & SporTV', 'Gravador DVR'],
    plans: [
      { id: 'tv-fam',   name: 'Família HD',     price: 129.9, features: ['180 canais', 'Globoplay incluso', 'Decodificador HD'] },
      { id: 'tv-mix',   name: 'Mix HD',         price: 169.9, features: ['220 canais', 'Premiere + SporTV', 'DVR 100h'], popular: true, highlight: 'Top vendas' },
      { id: 'tv-top',   name: 'Top Cinema',     price: 219.9, features: ['250+ canais', 'Telecine + HBO Max', 'DVR 300h'] },
    ],
    highlights: [
      { title: 'Premiere completo', desc: 'Todos os jogos dos campeonatos brasileiros e estaduais.' },
      { title: 'Globoplay sem custo', desc: 'Acesso ilimitado a novelas, séries e originais Globo.' },
      { title: 'Gravador DVR', desc: 'Pause, rebobine e grave até 300 horas dos seus programas favoritos.' },
    ],
    faq: [
      { q: 'Posso assistir em mais de uma TV?', a: 'Sim, contrate ponto adicional por R$ 24,90/mês cada.' },
      { q: 'Funciona com a minha antena atual?', a: 'O Claro TV usa antena própria via satélite ou cabo, instalada gratuitamente.' },
    ],
  },
  {
    slug: 'claro-tv-mais',
    brand: 'Claro TV+',
    category: 'TV',
    icon: 'Tv2',
    tagline: 'TV ao vivo + streaming, num só lugar',
    pitch: 'Box Claro TV+ com Android TV, integrando Netflix, Globoplay, Prime Video e canais ao vivo na mesma tela.',
    hero: {
      eyebrow: 'HDTV · Streaming',
      headline: 'O futuro da TV não tem antena.',
      sub: 'Receba canais ao vivo via internet e seus streamings favoritos no mesmo controle.',
    },
    badges: ['Android TV', 'Streaming integrado', 'Sem antena'],
    plans: [
      { id: 'tvm-ess', name: 'Essencial', price: 79.9,  features: ['80 canais ao vivo', 'Box Android TV', 'Disney+ por 3 meses'] },
      { id: 'tvm-pre', name: 'Premium',   price: 139.9, features: ['180 canais', 'Netflix Standard incluso', 'HBO Max + Paramount+'], popular: true, highlight: 'Recomendado' },
      { id: 'tvm-tot', name: 'Total HD',  price: 199.9, features: ['250+ canais 4K', 'Netflix Premium', 'Apple TV+ + Globoplay'] },
    ],
    highlights: [
      { title: 'Tudo num controle só', desc: 'Troque entre TV ao vivo e Netflix sem mudar de aparelho.' },
      { title: 'Android TV nativo', desc: 'Instale qualquer app da Play Store, comande por voz com Google Assistant.' },
      { title: '4K e HDR', desc: 'Conteúdo em ultra alta definição compatível com sua TV moderna.' },
    ],
    faq: [
      { q: 'Preciso de internet boa?', a: 'Recomendamos no mínimo 50 Mbps para 4K em 2 telas simultâneas.' },
      { q: 'Funciona em Smart TV?', a: 'Sim, instale o app Claro TV+ direto na sua Smart TV LG ou Samsung.' },
    ],
  },
  {
    slug: 'claro-tv-livre',
    brand: 'Claro TV Livre',
    category: 'TV',
    icon: 'Antenna',
    tagline: 'TV digital gratuita, para sempre',
    pitch: 'Antena parabólica banda Ku com mais de 30 canais abertos em HD, sem mensalidade.',
    hero: {
      eyebrow: 'Sem mensalidade',
      headline: 'Pague uma vez. Assista para sempre.',
      sub: 'Kit completo com receptor, antena e instalação. Sem fatura, sem fidelidade.',
    },
    badges: ['Zero mensalidade', '30+ canais HD', 'Cobertura nacional'],
    plans: [
      { id: 'liv-kit',  name: 'Kit Básico',     price: 0,    features: ['Receptor SD/HD', 'Antena 60cm', 'Controle remoto'], highlight: 'Investimento único: R$ 299' },
      { id: 'liv-pro',  name: 'Kit Premium',    price: 0,    features: ['Receptor 4K', 'Antena 90cm', 'Instalação inclusa'], highlight: 'Investimento único: R$ 549', popular: true },
    ],
    highlights: [
      { title: 'Sem fatura mensal', desc: 'Pagamento único do equipamento, nunca mais uma conta de TV.' },
      { title: 'Substitui o sinal analógico', desc: 'Solução oficial para áreas onde o sinal aberto foi desligado.' },
      { title: 'Cobertura em todo Brasil', desc: 'Funciona em qualquer região, inclusive zonas rurais.' },
    ],
    faq: [
      { q: 'Quais canais estão inclusos?', a: 'Globo, SBT, Record, Band, Cultura, Canal Saúde, TV Brasil e mais 25 canais regionais.' },
      { q: 'Preciso de internet?', a: 'Não, o sinal vem direto do satélite via antena parabólica.' },
    ],
  },
  {
    slug: 'claro-hdtv',
    brand: 'Claro HDTV',
    category: 'TV',
    icon: 'Tv',
    tagline: 'Alta definição em todos os canais',
    pitch: 'Pacote dedicado de canais 100% em HD, ideal para Smart TVs e home cinemas.',
    hero: {
      eyebrow: 'Premium · HD',
      headline: 'Cada cena, cada lance, em definição máxima.',
      sub: 'Pacote HDTV com 120 canais Full HD e som surround 5.1.',
    },
    badges: ['120 canais HD', 'Som 5.1', 'Bitrate elevado'],
    plans: [
      { id: 'hd-base', name: 'HD Base',    price: 89.9,  features: ['80 canais Full HD', 'Decodificador HD', 'Áudio estéreo'] },
      { id: 'hd-tot',  name: 'HD Total',   price: 139.9, features: ['120 canais HD', 'Som 5.1', 'Guia de programação 7 dias'], popular: true },
    ],
    highlights: [
      { title: 'Bitrate até 18 Mbps', desc: 'Transmissão sem compressão excessiva — qualidade Blu-ray.' },
      { title: 'Áudio multicanal', desc: 'Filmes e shows com som surround 5.1 nativo.' },
      { title: 'EPG semanal', desc: 'Veja a programação completa dos próximos 7 dias.' },
    ],
    faq: [
      { q: 'Funciona em qualquer TV?', a: 'Recomendamos TVs Full HD ou superior para aproveitar a qualidade.' },
      { q: 'Posso adicionar canais avulsos?', a: 'Sim, pacotes Premiere, Telecine e adultos disponíveis a partir de R$ 39,90.' },
    ],
  },
  {
    slug: 'claro-hdtv-livre',
    brand: 'Claro HDTV Livre',
    category: 'TV',
    icon: 'Antenna',
    tagline: 'HD aberto, sem mensalidade',
    pitch: 'Receba canais HD da TV aberta digital com nossa parabólica de banda Ku — qualidade superior à antena UHF.',
    hero: {
      eyebrow: 'Aberto · Free-to-Air',
      headline: 'TV aberta como deveria ser: nítida.',
      sub: 'Migração gratuita do sinal analógico. Sinal 100% digital em HD.',
    },
    badges: ['Aberto e gratuito', 'HD nativo', 'Migração analógica'],
    plans: [
      { id: 'hdl-pad', name: 'Padrão',  price: 0, features: ['Receptor HD digital', 'Antena Ku 60cm', 'Acesso a 25 canais HD'], highlight: 'Equipamento: R$ 199' },
    ],
    highlights: [
      { title: 'Substitui antena UHF', desc: 'Receba TV aberta em qualquer região sem depender de torre.' },
      { title: 'Programa do Governo', desc: 'Famílias do Cadastro Único podem solicitar kit gratuito.' },
      { title: 'Áudio em HD', desc: 'Qualidade de som muito superior à TV analógica.' },
    ],
    faq: [
      { q: 'Qualquer um pode contratar?', a: 'Sim, mas famílias inscritas no CadÚnico têm direito ao kit gratuito.' },
      { q: 'Funciona em chuva forte?', a: 'A banda Ku é mais resistente que parabólicas tradicionais a interferências climáticas.' },
    ],
  },
  {
    slug: 'claro-video',
    brand: 'Claro Vídeo',
    category: 'Conteúdo',
    icon: 'PlayCircle',
    tagline: 'Streaming sob demanda da Claro',
    pitch: 'Catálogo com filmes, séries e novelas latinas exclusivas, incluso em planos selecionados.',
    hero: {
      eyebrow: 'Streaming · VOD',
      headline: 'A maior videoteca latino-americana.',
      sub: 'Conteúdos exclusivos da Televisa, lançamentos do cinema e originais Claro.',
    },
    badges: ['Originais Claro', 'Conteúdo Televisa', 'Aluguel de lançamentos'],
    plans: [
      { id: 'vid-mes', name: 'Mensal',          price: 19.9,  features: ['Catálogo completo', '2 telas simultâneas', 'Download offline'] },
      { id: 'vid-anu', name: 'Anual',           price: 199.0, features: ['Catálogo completo', '4 telas simultâneas', 'Aluguel de 2 lançamentos/mês'], popular: true, highlight: '2 meses grátis' },
    ],
    highlights: [
      { title: 'Originais Claro', desc: 'Séries e documentários produzidos exclusivamente para o catálogo.' },
      { title: 'Lançamentos em casa', desc: 'Alugue filmes que ainda estão no cinema.' },
      { title: 'Sem anúncios', desc: 'Streaming limpo, sem comerciais interrompendo seu filme.' },
    ],
    faq: [
      { q: 'Posso assistir em qualquer dispositivo?', a: 'Sim — celular, tablet, Smart TV, web e consoles.' },
      { q: 'Tem teste grátis?', a: 'Sim, 14 dias para novos clientes Claro.' },
    ],
  },
  {
    slug: 'canal-claro',
    brand: 'Canal Claro',
    category: 'Conteúdo',
    icon: 'MonitorPlay',
    tagline: 'O canal oficial da Claro na sua TV',
    pitch: 'Programação 24h com filmes, esportes amadores, talk shows e conteúdo institucional Claro.',
    hero: {
      eyebrow: 'Canal aberto Claro',
      headline: 'Conteúdo Claro, do jeito Claro.',
      sub: 'Disponível em todos os pacotes Claro TV e Claro TV+, gratuitamente.',
    },
    badges: ['24h no ar', 'Incluso em todos pacotes', 'Em HD'],
    plans: [
      { id: 'can-incl', name: 'Incluso',  price: 0, features: ['Disponível canal 100', 'Em HD', 'Incluso na sua assinatura'] },
    ],
    highlights: [
      { title: 'Filmes nas madrugadas', desc: 'Sessões temáticas semanais com clássicos e estreias.' },
      { title: 'Talk shows exclusivos', desc: 'Entrevistas com artistas, atletas e personalidades.' },
      { title: 'Cobertura de eventos', desc: 'Transmissões especiais de festivais, prêmios e shows.' },
    ],
    faq: [
      { q: 'Em qual canal sintonizo?', a: 'Canal 100 em todos os pacotes Claro TV e Claro TV+.' },
      { q: 'Tem versão online?', a: 'Sim, transmissão ao vivo no app Minha Claro Residencial.' },
    ],
  },
  {
    slug: 'claro-fixo',
    brand: 'Claro Fixo',
    category: 'Voz',
    icon: 'Phone',
    tagline: 'Telefone residencial sem complicação',
    pitch: 'Linha fixa digital com chamadas ilimitadas para fixo Brasil e identificador de chamadas grátis.',
    hero: {
      eyebrow: 'Telefone Residencial',
      headline: 'O telefone de casa, agora digital.',
      sub: 'Plano com chamadas ilimitadas para todo Brasil por R$ 49,90/mês.',
    },
    badges: ['Ilimitado Brasil', 'Identificador grátis', 'Sem fidelidade'],
    plans: [
      { id: 'fix-ess', name: 'Essencial',  price: 39.9, features: ['400 min para fixos', 'Identificador de chamadas', 'Caixa postal'] },
      { id: 'fix-ili', name: 'Ilimitado',  price: 49.9, features: ['Ligações ilimitadas para fixo Brasil', '200 min para celular', 'Siga-me + conferência'], popular: true },
    ],
    highlights: [
      { title: 'Chamadas ilimitadas', desc: 'Fale o quanto quiser para fixos em todo Brasil.' },
      { title: 'Combo com Internet', desc: 'Adicione fibra e ganhe desconto de R$ 20 na mensalidade.' },
      { title: 'Sem fio extra', desc: 'Aparelho sem fio com até 30m de alcance por R$ 9,90/mês.' },
    ],
    faq: [
      { q: 'Mantém meu número?', a: 'Sim, portabilidade gratuita do seu número fixo atual.' },
      { q: 'Precisa de internet?', a: 'Não obrigatoriamente, mas combos com Claro Internet têm desconto.' },
    ],
  },
  {
    slug: 'claro-fone',
    brand: 'Claro Fone',
    category: 'Voz',
    icon: 'Phone',
    tagline: 'Voz sobre IP profissional',
    pitch: 'Solução de voz IP para pequenas empresas, com PABX em nuvem, ramais ilimitados e gravação.',
    hero: {
      eyebrow: 'Empresarial · VoIP',
      headline: 'A central telefônica do seu negócio, na nuvem.',
      sub: 'Ramais virtuais, app mobile e atendimento URA a partir de R$ 29,90/ramal.',
    },
    badges: ['PABX em nuvem', 'App mobile', 'URA inteligente'],
    plans: [
      { id: 'fon-bas', name: 'Básico',     price: 29.9, features: ['1 ramal', 'App mobile', '500 min para fixo'] },
      { id: 'fon-pro', name: 'Profissional',price: 79.9, features: ['Até 5 ramais', 'URA com até 5 níveis', 'Gravação ilimitada'], popular: true, highlight: 'Mais contratado' },
      { id: 'fon-emp', name: 'Empresarial',price: 199.9,features: ['Ramais ilimitados', 'Integração CRM', 'Relatórios avançados'] },
    ],
    highlights: [
      { title: 'PABX virtual', desc: 'Sem equipamento físico — gerencie tudo pelo painel web.' },
      { title: 'Trabalho remoto', desc: 'App iOS/Android transforma celular dos colaboradores em ramal.' },
      { title: 'Integração CRM', desc: 'Conecte com Salesforce, HubSpot, Pipedrive e RD Station.' },
    ],
    faq: [
      { q: 'Funciona com meu telefone IP atual?', a: 'Sim, suportamos qualquer aparelho SIP padrão.' },
      { q: 'Preciso de internet dedicada?', a: 'Recomendamos no mínimo 1 Mbps por ramal simultâneo.' },
    ],
  },
  {
    slug: 'claro-clube',
    brand: 'Claro Clube',
    category: 'Benefícios',
    icon: 'Gift',
    tagline: 'Pontos que viram tudo',
    pitch: 'Acumule pontos pagando suas faturas Claro e troque por bônus, descontos em parceiros e milhas aéreas.',
    hero: {
      eyebrow: 'Programa de Fidelidade',
      headline: 'Sua conta paga. Você ganha.',
      sub: 'A cada R$ 1,00 em fatura, 1 ponto Claro Clube. Troque por celulares, milhas e experiências.',
    },
    badges: ['1 ponto por R$ 1', 'Milhas Smiles', 'Lojas parceiras'],
    plans: [
      { id: 'clb-bro', name: 'Bronze',  price: 0, features: ['Acúmulo padrão', 'Catálogo de descontos', 'Ofertas exclusivas'], highlight: 'Automático para clientes' },
      { id: 'clb-pra', name: 'Prata',   price: 0, features: ['Acúmulo 1.5x', 'Atendimento prioritário', '5% off em recargas'] },
      { id: 'clb-our', name: 'Ouro',    price: 0, features: ['Acúmulo 2x', 'Sala VIP em eventos', 'Aparelhos com até 30% off'], popular: true, highlight: 'Top tier' },
    ],
    highlights: [
      { title: 'Troque por milhas', desc: 'Conversão direta para Smiles, LATAM Pass e TudoAzul.' },
      { title: 'Lojas parceiras', desc: 'Descontos em Magalu, Casas Bahia, Centauro e iFood.' },
      { title: 'Aparelhos com bônus', desc: 'Use seus pontos como entrada na compra de smartphones.' },
    ],
    faq: [
      { q: 'Como entro no clube?', a: 'Automático — todo cliente Claro pós-pago já participa.' },
      { q: 'Os pontos vencem?', a: 'Sim, em 24 meses. Acompanhe o saldo no app Minha Claro.' },
    ],
  },
];

export const getServiceBySlug = (slug: string) => servicesCatalog.find((s) => s.slug === slug);
