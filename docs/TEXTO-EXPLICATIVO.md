# One Hub · Texto Explicativo da Solução (Challenge Claro — Sprint 3)

## 1. O que é o One Hub

O **One Hub** é a plataforma de **integração e centralização dos canais de comunicação**
da Claro. O cliente tem hoje vários pontos de contato — portal web, aplicativo, WhatsApp,
telefone 106 — e cada um funciona como uma ilha: a sessão de atendimento nasce e morre
dentro do canal. Resultado prático: o cliente **repete o mesmo problema** toda vez que muda
de canal, e o atendente humano recebe o chamado sem contexto.

A proposta do One Hub inverte isso. A sessão de atendimento passa a ser **vinculada ao
cliente autenticado (o `usuario_id` / CPF), não ao canal**. Um único `session_id` carrega
todo o histórico da conversa e o "contexto atual" (última intenção reconhecida, entidades,
resumo). Ao trocar de canal, o backend reconhece o cliente, **recupera a sessão ativa** e
faz a assistente virtual **retomar o assunto** antes da primeira resposta — sem
reidentificação e sem repetição.

O foco do produto é **usabilidade**: uma interface única (versão 1) onde o cliente resolve
fatura, plano, consumo, Clube e atendimento sem sair do lugar; e uma assistente (a **Clara**)
que não apenas informa, mas **conduz** o cliente até a ação ou até um humano, levando o
contexto junto.

---

## 2. Arquitetura

### 2.1 Camadas (conforme o Documento de Arquitetura, §3.1)

```
┌─────────────────────────────────────────────────────────────────────┐
│  CANAIS                                                              │
│  Web Chat (/hub)      App (/app)      WhatsApp (/whatsapp)      106   │
└───────────┬───────────────┬────────────────┬────────────────────────┘
            │               │                │
┌───────────▼───────────────▼────────────────▼────────────────────────┐
│  APRESENTAÇÃO — Next.js 16 (App Router) + React 19 + Tailwind v4     │
│  Componentes de canal compartilham a MESMA lógica de conversa       │
│  (hook useClaraChannel / serviço claraReply) → resposta idêntica    │
│  em qualquer canal                                                  │
└───────────┬────────────────────────────────────────────────────────┘
            │  (src/services/* — caminho REST + fallback para mock)
┌───────────▼────────────────────────────────────────────────────────┐
│  ORQUESTRAÇÃO — Node.js / Express                                   │
│  Roteamento de intenções, agregação de dados da conta,             │
│  regras de handover, disparo de notificações                        │
└───┬───────────────┬───────────────┬───────────────┬────────────────┘
    │               │               │               │
┌───▼────┐   ┌──────▼──────┐   ┌────▼──────┐   ┌────▼──────────────┐
│ AUTEN- │   │ SESSÃO E    │   │  NLU      │   │ INTEGRAÇÕES        │
│ TICAÇÃO│   │ CONTEXTO    │   │ Dialogflow│   │ Incidentes (RF006) │
│ JWT    │   │ Redis       │   │ (pt-BR)   │   │ LGPD (§7)          │
│ 30 min │   │ session_id  │   │ via proxy │   │ Service Desk/ITSM  │
│ RNF005 │   │ §4 / RF005  │   │ §8        │   │ Auditoria (ISO)    │
└────────┘   └─────────────┘   └───────────┘   └────────────────────┘
```

### 2.2 Objeto de sessão (§4.1)

O coração da solução. Gerado no login (ou no reconhecimento por telefone), persistido no
Redis (cache com TTL de 30 min) e recuperável por `usuario_id` **ou por telefone**:

```ts
interface Session {
  sessionId: string;          // vinculado ao CLIENTE, não ao canal
  usuarioId: string;
  canalOrigem: 'web' | 'app' | 'whatsapp';
  historico: { role; text; ts; canal }[];   // cada mensagem sabe de que canal veio
  contextoAtual: {
    lastIntent: string | null;              // última intenção da Clara
    entities: Record<string, string>;       // ex.: { mes: 'abril' }
    summary: string | null;                 // usado para "retomar" em outro canal
  };
  telefone: string | null;                  // reconhecimento em canais externos
  status: 'ativa' | 'handover' | 'encerrada';
}
```

### 2.3 Modo de execução

O protótipo roda **100% em modo `mock`**: a sessão vive no `localStorage` (simulando o
Redis), o **JWT é um token real** (header.payload.signature em base64url, com expiração de
30 min) assinado localmente, e a NLU usa classificação por expressões regulares.

Cada serviço em `src/services/*` já tem o **caminho REST implementado** com _fallback_
automático para o mock. Para ligar o backend real basta preencher `.env.local` e definir
`NEXT_PUBLIC_BACKEND_MODE=api` — **nenhuma mudança na camada de apresentação**. Endpoints
esperados:

| Método | Rota | Uso |
|---|---|---|
| `POST` | `/auth/token` | emissão do JWT |
| `GET` | `/sessions?usuario=:id` · `/sessions/by-phone/:phone` | recuperação de sessão |
| `PUT` / `DELETE` | `/sessions/:id` | upsert / encerramento |
| `POST` | `/clara/detect-intent` | proxy do Dialogflow (credenciais nunca no client) |
| `GET` / `PUT` | `/incidents` | incidentes técnicos (RF006) |
| `POST` / `DELETE` | `/privacy/consent` · `POST /privacy/erasure` | LGPD (§7) |

---

## 3. Tecnologias

| Camada | Tecnologia | Papel |
|---|---|---|
| Front-end | **Next.js 16.2** (App Router, Turbopack) · **React 19.2** | Rotas, renderização, componentes de canal |
| Linguagem | **TypeScript 5** | Tipagem de ponta a ponta (`Session`, `TokenPayload`, intents…) |
| Estilo | **Tailwind CSS v4** | Design system, dark mode, tokens |
| Animação | **Framer Motion 12** | Transições da landing e dos overlays |
| Gráficos | **Recharts 3** | Consumo do cliente e dashboards gerenciais |
| Ícones | **lucide-react** | Iconografia |
| Orquestração (alvo) | **Node.js / Express** | Camada de aplicação |
| Sessão / contexto (alvo) | **Redis** | Cache de sessão com TTL |
| NLU (alvo) | **Dialogflow** (pt-BR) | Reconhecimento de intenção da Clara |
| Autenticação | **JWT** (HS256, exp. 30 min) | Sessão autenticada — RNF005 |

Build de produção verificado: `next build` compila sem erros; rotas geradas: `/`, `/login`,
`/hub`, `/app`, `/whatsapp`, `/admin`, `/servicos/[slug]`.

---

## 4. Funcionalidades demonstradas

### 4.1 Portal do cliente (`/hub`) — centralização
- Visão 360°: fatura em aberto, ações rápidas, serviços do combo, consumo semanal,
  Claro Clube, feed de atividade e recomendações — numa tela.
- **Pagamento em um toque** (credita pontos do Clube na hora).
- **Multi-conta**: titular, dependentes e conta PJ; ao trocar de conta, serviços, faturas e
  pontos são re-derivados (interface dinâmica por perfil — RF003).
- Busca global (⌘K), tema claro/escuro, persistência de estado no reload (F5).

### 4.2 Clara — assistente omnichannel
- **NLU** com intenções: consultar fatura, 2ª via, consultar/alterar plano, status de
  serviço, falar com atendente, saudação, despedida, fora de escopo. Cada intenção declara
  se a Clara **resolve sozinha** ou precisa de humano.
- Respostas com os **dados reais da conta** (a mesma função `buildReply` em todos os canais
  → resposta idêntica no Web Chat, no App e no WhatsApp).
- **Navegação guiada (RNF002)**: as respostas trazem botões de ação ("Ver faturas",
  "Pagar agora", "Ver planos disponíveis", "Acompanhar atendimento") que executam a ação
  no portal.

### 4.3 Continuidade de contexto entre canais (RF001 + RF005 — o núcleo)
- Web Chat → **WhatsApp**: reconhecimento pelo número cadastrado, **mesma sessão**
  recuperada, Clara retoma o assunto ("Estávamos falando sobre… não precisa repetir nada").
- Web Chat → **App**: cliente já logado, sessão compartilhada, sem reidentificação.
- Em **Configurações › Sessão e segurança**: `session_id`, canal de origem, contexto atual,
  contador regressivo do token JWT e lista de canais já usados na sessão.

### 4.4 Handover suave (§4.2)
Quando a Clara não resolve, abre um **chamado real** na fila do Service Desk, **herdando
categoria e prioridade** da conversa (não abre tudo como "Dúvida Geral") e **levando o
histórico completo de todos os canais**. A sessão passa a `status: 'handover'`.

### 4.5 Meu Atendimento (RF004 — unificação)
Visão do cliente: canais de contato, **conversa contínua** com a linha do tempo dos canais
(Web Chat → WhatsApp → Atendente), **status do chamado** em 4 etapas (Clara → Fila →
Atendente → Resolvido) e **avaliação CSAT** ao final.

### 4.6 One Hub Admin (`/admin`) — Service Desk / ITSM
- **RBAC** (§7 / ISO 27001 A.9): *atendente* → Console + Incidentes; *gerente* → também a
  Visão Gerencial (gráficos, métricas até 12 meses, SLA configurável por prioridade).
- **Console**: fila priorizada, contador de espera ao vivo, CRM do cliente, histórico da
  Clara de todos os canais, respostas rápidas, filtro "Meus tickets", resolver → dispara CSAT.
- **Trilha de auditoria** (ISO/IEC 27001 A.12.4): quem fez o quê, quando —
  `ticket.resolvido`, `sla.alterado`, `dados.anonimizados`, `dados.excluidos`, `csat.enviado`,
  `incidente.registrado`.

### 4.7 Notificação proativa de incidentes (RF006)
A equipe técnica registra um incidente (título, região, serviços, severidade, previsão) na
aba **Incidentes**. O sistema **notifica automaticamente apenas os clientes com o serviço
afetado**, o banner de status na Visão Geral passa a refletir o incidente e a Clara passa a
citá-lo na saudação e na intenção "status de serviço".

### 4.8 LGPD (§7) e acessibilidade (RF007)
- **Consentimento explícito** no primeiro acesso ao chat (base legal Lei 13.709/2018).
- **Portabilidade**: "Baixar meus dados (JSON)". **Direito de exclusão**: "Excluir histórico
  de conversas" — remove a sessão e o chamado do titular no Service Desk, com registro na
  auditoria. **Anonimização/reversão** de tickets no Admin; CPF sempre mascarado.
- **VLibras** (plugin oficial vlibras.gov.br) montado no layout raiz; skip-link, foco
  visível, `aria-live` nos chats e respeito a `prefers-reduced-motion` (WCAG 2.1 AA parcial).

---

## 5. Cobertura de requisitos

| Requisito | Status | Implementação |
|---|---|---|
| RF001 · Integração de canais | ✅ | Web Chat + `/whatsapp` + `/app` na mesma sessão |
| RF002 · Integração de funcionalidades via API | ✅ (mock) | `src/services/*` com caminho REST + fallback |
| RF003 · Interfaces dinâmicas por perfil | ✅ | Troca de conta re-deriva serviços/faturas/pontos |
| RF004 · Unificação de canal | ✅ | Portal único + "Meu Atendimento" |
| RF005 · Persistência de contexto entre canais | ✅ | `session.ts` — `session_id` ligado ao cliente |
| RF006 · Notificação de incidentes técnicos | ✅ | `incidents.ts` + aba Incidentes + banner + notificação ao afetado |
| RF007 · Acessibilidade / VLibras | ✅ | `VLibrasWidget` no layout raiz |
| RNF002 · Navegação guiada pela Clara | ✅ | Botões de ação nas respostas |
| RNF005 · JWT (expiração 30 min) | ✅ | `authToken.ts` + contador em Configurações |
| §4.1 · Objeto de sessão | ✅ | `Session` completo (histórico + contexto + status) |
| §4.2 · Handover suave com histórico | ✅ | `requestHandover` — herda categoria/prioridade |
| §7 · LGPD (consentimento / exclusão / portabilidade) | ✅ | `privacy.ts` + telas de Privacidade |
| §7 · Controle de acesso (cliente / atendente / gerente) | ✅ | `/login` com alternador + RBAC |
| ISO/IEC 27001 · Auditoria (A.12.4) + acesso (A.9) | ✅ | `auditLog` + papéis |

---

## 6. Próximos passos

1. Substituir o modo mock pelo backend real (Node.js/Express + Redis + Dialogflow) — já
   contemplado por configuração de ambiente.
2. Certificação completa da integração VLibras e fechamento do checklist WCAG 2.1 AA.
3. Observabilidade da orquestração (logs estruturados, métricas de intenção, tracing entre
   canais).
