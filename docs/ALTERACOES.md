# One Hub · Registro de Alterações (Sprint 3)

Consolidação de tudo que foi implementado/alterado no projeto para a Sprint 3 —
camada de sessão e continuidade de contexto entre canais, LGPD, incidentes,
acessibilidade e o reforço da comunicação como hub de canais de suporte.

Modo padrão: **`mock`** (sessão, token, incidentes e estado do cliente em
`localStorage`). Backend real: preencher `.env.local` e `NEXT_PUBLIC_BACKEND_MODE=api`.

---

## 1. Cobertura do Documento de Arquitetura

| Item | Status | Onde |
|---|---|---|
| RF001 · Integração de canais | ✅ | Web Chat + `/whatsapp` + `/app` (mesma sessão) |
| RF002 · Integração de funcionalidades via API | ✅ (mock) | `src/services/*` com caminho REST + fallback |
| RF003 · Interfaces dinâmicas por perfil | ✅ | `accountProfiles`, troca de conta |
| RF004 · Unificação de canal | ✅ | Portal único + Central de Atendimento |
| **RF005 · Persistência de contexto entre canais** | ✅ | `src/services/session.ts` (`session_id` ligado ao cliente) |
| **RF006 · Notificação de incidentes técnicos** | ✅ | `src/services/incidents.ts` + aba Incidentes no Admin + banner dinâmico + notificação só ao afetado |
| **RF007 · Acessibilidade / vLibras** | ✅ | `src/components/a11y/VLibrasWidget.tsx` |
| RNF002 · Navegação guiada pela Clara | ✅ | `replyActions` (botões de ação nas respostas) |
| RNF003 · Acessibilidade WCAG 2.1 AA | 🟡 parcial | skip-link, `:focus-visible`, `aria-live`, `prefers-reduced-motion` |
| RNF005 · JWT (expiração 30 min) | ✅ | `src/services/authToken.ts` + contador em Configurações |
| §7 · Consentimento LGPD no 1º chat | ✅ | gate na Clara + checkbox no WhatsApp |
| §7 · Direito de exclusão / portabilidade | ✅ | Configurações › Privacidade (export JSON, excluir) — remove também o chamado no Admin |
| §7 · Controle de acesso (cliente/atendente/admin) | ✅ | `/login` com alternador + RBAC |
| §4.1 · Objeto de sessão | ✅ | `Session` = `sessionId`, `usuarioId`, `canalOrigem`, `historico[]`, `contextoAtual`, `telefone`, `status` |
| §2 · Handover suave com histórico | ✅ | `requestHandover` — ticket herda categoria/prioridade do intent |

---

## 2. Rotas

| Rota | Descrição |
|---|---|
| `/` | Landing institucional |
| `/login` | Login **Cliente / Administrador** (alternador na mesma tela) |
| `/hub` | Portal do cliente |
| `/hub` › *Meu Atendimento* | Central de Atendimento (conversa contínua + status do chamado + CSAT) |
| `/whatsapp` | Canal WhatsApp (simulação, reconhece por telefone) |
| `/app` | Canal App (simulação, cliente já logado) |
| `/admin` | One Hub Admin — abas **Visão Gerencial · Console · Incidentes** |

---

## 3. Chaves de `localStorage`

| Chave | Conteúdo | Limpa em |
|---|---|---|
| `onehub.token` | JWT de sessão (válido = continua logado no F5) | logout |
| `onehub.session` | objeto `Session` (histórico, contexto) | logout / excluir dados |
| `onehub.clientState` | pontos por conta, faturas pagas, serviços add, conta ativa, tema, atividade | logout |
| `onehub.lgpd.consent` | consentimento LGPD | revogar / excluir dados |
| `onehub.incidents` | incidentes técnicos (RF006) | — |
| `onehub.admin` | papel do admin logado (RBAC) | logout do admin |

---

## 4. Arquivos criados

**Serviços / configuração**
- `src/config/backend.ts` — chaves de ambiente (Node/Express, Redis, Dialogflow, incidentes, LGPD)
- `.env.example`
- `src/services/session.ts` — camada de sessão/contexto (§4)
- `src/services/authToken.ts` — JWT (RNF005)
- `src/services/claraNlu.ts` — `detectIntent` (regex local / Dialogflow via proxy)
- `src/services/claraReply.ts` — `buildReply`, `resumeLine`, `replyActions`
- `src/services/incidents.ts` — incidentes técnicos (RF006)
- `src/services/privacy.ts` — consentimento / portabilidade / exclusão (§7)

**Hooks**
- `src/hooks/useClaraChannel.ts` — lógica compartilhada de canal de conversa

**Componentes / páginas**
- `src/components/auth/LoginScreen.tsx` + `app/login/page.tsx`
- `src/components/whatsapp/WhatsAppChannel.tsx` + `app/whatsapp/page.tsx`
- `src/components/channels/AppChannel.tsx` + `app/app/page.tsx`
- `src/components/hub/pages/AtendimentoPage.tsx` — "Meu Atendimento"
- `src/components/hub/widgets/SupportHubCard.tsx` — card Central de Atendimento
- `src/components/hub/widgets/ActiveConversationBanner.tsx` — aviso persistente
- `src/components/a11y/VLibrasWidget.tsx` — VLibras (RF007)

**Documentação**
- `docs/SPRINT3-CONTINUIDADE.md` · `docs/PLANO-DE-TESTES.md` · `docs/ALTERACOES.md` (este)
- `.gitignore` (recriado, com segredos e artefatos de build)

---

## 5. Arquivos alterados (principais)

| Arquivo | Alteração |
|---|---|
| `src/context/ClaroContext.tsx` | estado de sessão/token/consent/incidentes; `startSession`, `appendSessionMessage`, `updateSessionContext`, `markSessionHandover`; **retomada de login no F5** (`authResolved`); `pointsByAccount` + `adjustPoints`; `myTicket`, `submitCsat`; `anonymize/deanonymizeTicket`; `registerIncident` só notifica afetado; `markNotification(s)Read`; persistência `onehub.clientState` |
| `src/data/mockData.ts` | `phone` no usuário/contas; `Incident` + `INCIDENT_SEVERITY`; `INTENT_TO_TICKET`; `anonymized?` no `QueueItem` |
| `src/components/Dashboard.tsx` | eventos `onehub:open-clara/open-store/pay/navigate`; Central de Atendimento na Visão Geral; banner de conversa; skip-link |
| `src/components/hub/HubSidebar.tsx` | item **Meu Atendimento** com badge |
| `src/components/hub/HubTopBar.tsx` | busca ocupa a largura toda; cluster de ícones; canais WhatsApp/App no menu; notificações com marcar-como-lida |
| `src/components/hub/overlays/ClaraChat.tsx` | consentimento LGPD; sessão compartilhada; `detectIntent` async; **botões de ação**; aviso de incidente na saudação; `aria-live` |
| `src/components/hub/pages/SettingsPage.tsx` | card **Sessão e segurança**; card **Privacidade (LGPD)**; opções agora são acordeões funcionais |
| `src/components/hub/pages/SupportPage.tsx` | botões dos canais ligados (Loja Virtual → loja interna) |
| `src/components/admin/AdminPanel.tsx` | aba **Incidentes**; RBAC nas abas; **reverter anonimização**; **respostas rápidas**; filtro **"Meus tickets"**; **contador de espera ao vivo**; CSAT do cliente visível |
| `src/components/site/NetworkStatusBanner.tsx` | passa a refletir os incidentes ativos (era texto fixo) |
| `app/layout.tsx` | monta o `VLibrasWidget` |
| `app/hub/page.tsx` · `app/admin/page.tsx` · `app/page.tsx` | fluxo via `/login`; espera `authResolved` |
| `app/globals.css` | acessibilidade: `skip-link`, `:focus-visible`, `prefers-reduced-motion`; reposição do botão VLibras |

---

## 6. Correções de bugs

| Bug | Causa | Correção |
|---|---|---|
| Resgate de pontos não debitava | `clube.points` era sempre sobrescrito por `profile.clubePoints` | pontos vêm de `pointsByAccount` + `adjustPoints`; persiste no reload |
| Não dava para desanonimizar no Admin | ação inversa não existia | `anonymizeTicket` guarda os originais; `deanonymizeTicket` restaura; botão condicional |
| Sessão perdida ao recarregar (voltava p/ `/login`) | `isLoggedIn`/dados não eram persistidos | token JWT válido → retomada automática; `authResolved` evita flicker; `onehub.clientState` re-hidrata pontos/faturas/serviços/conta/tema |
| Botões de canal não funcionavam | sem handler | Suporte, handover da Clara e menu do perfil agora navegam de verdade |
| Opções de Configurações inertes | eram `<button>` sem ação | acordeões funcionais (perfil, senha, 2FA, notificações, pagamento, dependentes) |
| Top bar mal distribuída | busca com `max-width` + espaçador morto | busca ocupa a largura toda; ícones agrupados |

---

## 7. Melhorias por bloco (comunicação em destaque)

### Bloco 1 — Central de Atendimento unificada
- Card destacado na Visão Geral (conversa ativa + status do chamado + 4 canais).
- Tela **Meu Atendimento**: canais em destaque, status do chamado em etapas
  (Clara → Fila → Atendente → Resolvido), conversa contínua com a linha do tempo
  dos canais, CSAT ao resolver.
- Banner persistente "conversa/atendimento em andamento" com Retomar / Acompanhar.

### Bloco 2 — Contexto mais profundo
- Handover herda **categoria e prioridade** do intent (`INTENT_TO_TICKET`); prefixo
  do protocolo (`INC-`/`REQ-`) coerente.
- **CSAT do cliente** (`submitCsat`) grava no ticket e aparece no painel do Admin + auditoria.
- `myTicket` expõe o chamado do titular para a visão dele.

### Bloco 3 — Clara guiada (RNF002)
- Respostas com **botões de ação** ("Ver faturas", "Pagar agora", "Ver planos",
  "Acompanhar atendimento") — despacham `CustomEvent`s que o Dashboard executa.

### Bloco 4 — Notificação proativa precisa (RF006)
- Incidente só notifica o cliente **se ele tiver o serviço afetado**.
- Clara **avisa do incidente ativo na saudação** quando o serviço está fora.

### Bloco 5 — Canais canônicos completos
- **Canal App** (`/app`) — 3º canal do §4.1; mesma sessão, sem pedir telefone.
- `useClaraChannel` — hook compartilhado (WhatsApp e App).
- Entradas para App no menu do perfil e em Meu Atendimento.

### Bloco 6 — Admin operacional (§10)
- **Respostas rápidas** (canned responses) acima do input do atendente.
- Filtro **"Meus tickets"** (tickets que o atendente tocou / em atendimento).
- **Contador de espera ao vivo** (SLA e "aberto há" atualizam a cada segundo).

### Bloco 7 — LGPD / notificações / acessibilidade
- `excluir minhas conversas` também **remove o chamado do titular** no Service Desk
  (auditado como `dados.excluidos`).
- **Central de notificações**: marcar uma / todas como lidas; estado vazio.
- **Feed de atividade** persiste no reload (`onehub.clientState.extraActivity`).
- **WCAG**: link "pular para o conteúdo", `:focus-visible` global, `aria-live` nos
  chats, respeito a `prefers-reduced-motion`.

---

## 8. Verificação

- `npx tsc --noEmit` ✅
- `npm run build` ✅ — rotas: `/`, `/login`, `/hub`, `/whatsapp`, `/app`, `/admin`
- Smoke test dev: todas as rotas → 200, sem erros no console
- `npm run lint` continua com erros **pré-existentes** (regras `react-hooks` novas
  em `AdminPanel`/`PayModal`/`TourOverlay`/`HeroBill` etc.); nenhum erro novo nos
  arquivos criados nesta sprint. Efeitos de hidratação de `localStorage` no
  `ClaroContext` seguem o padrão já usado no restante do código.

O roteiro completo de testes está em `docs/PLANO-DE-TESTES.md`.
