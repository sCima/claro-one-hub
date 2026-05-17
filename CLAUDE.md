@AGENTS.md

# Projeto One Hub — Claro Challenge 2026 (Grupo SIMPLI / 4SIS FIAP)

> **Este arquivo é a referência mestre do projeto.** Todo chat que continuar o
> trabalho deve lê-lo primeiro. **Mantenha-o atualizado** sempre que adicionar,
> remover ou alterar funcionalidades, arquivos ou convenções.

---

## 1. O que é o One Hub

Portal digital unificado da Claro que centraliza canais de atendimento e
autoatendimento, eliminando a fragmentação da jornada do cliente. O coração da
experiência é a **Clara**, assistente virtual conversacional.

Stack real (este protótipo simula tudo no frontend):

- **Next.js 16.2.4** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind v4** — tema via `@theme` em `app/globals.css` (NÃO há `tailwind.config.js`)
- **lucide-react 0.469** — ícones importados individualmente
- Sem `framer-motion` dentro do hub — animações via CSS (`.anim-in`, `.chat-slide-in`, etc.)
- Charts custom em SVG (sem recharts)

> ⚠️ Ver `AGENTS.md`: esta versão do Next tem breaking changes — consultar
> `node_modules/next/dist/docs/` antes de mexer em roteamento/config.

## 2. Arquitetura (Sprint 2 — 4 camadas)

| Camada | Real | Simulação no protótipo |
|---|---|---|
| Apresentação (Frontend) | React + TS, HTTPS/REST | `src/components/**` |
| Lógica/Orquestração (Backend) | Node.js + Express | `src/services/claroApi.ts` (mock async) + `ClaroContext` |
| Inteligência Conversacional (NLU/IA) | Solução gerenciada + LLM fallback | `ClaraChat.tsx` → classificador de intents por regex |
| Infraestrutura | Docker + Compose | n/a (protótipo) |

### Mapa de requisitos (Sprint 1 → arquitetura)

RF001 integração de canais · RF002 integração de funcionalidades · RF003
dinamicidade de interfaces · RF004 unificação de canal · RNF001 UX · RNF002
simplicidade · RNF003 acessibilidade (WCAG 2.1) · RNF004 desempenho · RNF005
segurança.

## 3. Convenções de código

- Paleta **warm** (`warm-50`…`warm-900`) + marca (`claro`, `claro-dark`, `claro-soft`). Definidas em `app/globals.css` `@theme`.
- **Dark mode** via classe `.dark` no `<html>` (toggle no `ClaroContext`, persistência via `document.documentElement`).
- Helper `cx(...)` local em cada componente para classes condicionais.
- `'use client'` em todo componente interativo.
- Todo botão tem `cursor-pointer` (regra global no globals.css).
- Marcas Claro: usar **apenas serviços reais** do Manual (Celular, Internet, TV+, Fixo, Fone, Vídeo, hdtv, tv Livre, hdtv Livre, Clube, Canal Claro, MinhaClaro). NÃO inventar (nada de "Claro Cloud/Saúde/Segura/Música").

## 4. Estrutura de arquivos relevante

```
app/
  page.tsx              landing (+ LoadingScreen parceria One Hub × Claro)
  hub/page.tsx          portal cliente (Dashboard)
  admin/page.tsx        One Hub Admin (painel omnichannel — Sprint 2 §4.4)
  servicos/[slug]/      páginas de serviço
src/
  context/ClaroContext.tsx   estado global (auth, contas, dark, métricas Clara, fila handover)
  data/mockData.ts           dados mock + accountProfiles + availablePlans + faqs + claraIntents + attendanceQueue
  services/claroApi.ts       "backend" simulado (async)
  components/
    Dashboard.tsx
    hub/HubTopBar · HubSidebar
    hub/widgets/*              HeroBill, ServicesPanel, SearchResults, etc.
    hub/pages/*                Invoices, Clube, Support, Settings, ServiceDetail
    hub/overlays/*             PayModal, BillDetailsModal, AddPlanModal, TourOverlay, ClaraChat
    admin/*                    AdminPanel (3 blocos: Fila, Conversa, Contexto/CRM)
    ui/LoadingScreen.tsx
```

## 5. Clara — intents reconhecidos (Sprint 2 §3.4)

Implementados em `src/data/mockData.ts` (`claraIntents`) + classificador em `ClaraChat.tsx`:

| Intent | Resolve sozinha? | Ação |
|---|---|---|
| `consultar_fatura` | ✅ auto | valor, vencimento, link pagamento |
| `segunda_via_fatura` | ✅ auto | gera URL boleto, oferece e-mail/WhatsApp |
| `consultar_plano` | ✅ auto | detalhes do plano vigente |
| `alterar_plano` | ✅ auto | lista ofertas, abre AddPlanModal |
| `status_servico` | ✅ auto | status de rede + banner incidente |
| `solicitar_atendente` | ↪ handover | inicia transição suave p/ humano |
| `saudacao`/`despedida` | ✅ auto | resposta padrão + sugestões |
| (fora de escopo) | ↪ handover | fallback → oferece atendente |

**Handover suave (§4.2):** ao pedir humano ou intent fora de escopo, a sessão NÃO
encerra — mostra card de transferência (Chat Online, WhatsApp, 106) e adiciona o
cliente à fila do Admin com TODO o histórico da conversa.

**Métricas (§4.1):** cada interação registra `{ intent, resolvedAuto }` no
contexto → exibido no Admin como taxa de autoatendimento.

## 6. One Hub Admin — Console ITSM + RBAC (Sprint 2 §4.4) — `/admin`

Console de Service Desk estilo ServiceNow com **RBAC** (controle de acesso por
papel). Gate único (`AdminGate`) autentica e roteia por papel:

| Papel | Demo | Vê |
|---|---|---|
| `atendente` | atendente@claro.com.br / `admin` | Console ITSM (fila, conversa, CRM) |
| `gerente` | gerente@claro.com.br / `gerente` | Dashboard gerencial (gráficos, métricas, **config SLA editável**) + abas p/ acessar o Console |

RBAC no `ClaroContext`: `adminRole` (`'atendente'|'gerente'|null`),
`adminName`, `adminLogin(email,pwd)→role`, `adminLogout`. Permissões mapeadas em
`ROLE_PERMISSIONS` (mockData). SLA configurável: `slaConfig` (init de
`SLA_TARGET`) + `updateSlaConfig(prio,min)` — o gerente edita e reflete em todos
os badges/cálculos do console em tempo real.

Dashboard gerencial (`ManagerDashboard`) — práticas ServiceNow/Zammad:
- **Seletor de período** até 1 ano (`ANALYSIS_PERIODS`: 7d/30d/3m/6m/1ano). `genPeriodMetrics(days)` gera série + agregados determinísticos (granularidade dia/semana/mês).
- **Tira tempo real:** fila/novos/em atend./resolvidos — reativo a `resolveQueueItem` (corrige o "indicador não atualizava").
- **KPIs do período:** total, resolvidos, SLA%, tempo médio resolução, 1ª resposta, CSAT.
- **Gráficos com tooltip/hover e totais (Σ):** `TrendChart` (linha-guia + tooltip por bucket), `BarList` (valor + % + tooltip), `Donut` (segmento destaca no hover, % por fatia, total no centro). Cards: tendência, SLA/bucket, volume por canal, tickets por status, volume por categoria, Clara auto×handover.
- **Config de SLA editável** (auditada).
- **Governança:** Trilha de auditoria (ISO/IEC 27001 A.12.4 — `auditLog`/`pushAudit` no contexto, registra resolução/alteração SLA/anonimização), card LGPD, selos de compliance (`COMPLIANCE`).

Console ITSM (`AdminConsole`): além do anterior, `resolveQueueItem` carimba
`resolvedInMins`/`firstResponseMins`/`csat` + audita; pulse visual no KPI
"Resolvidos" + banner de confirmação; ação **LGPD · Anonimizar dados**
(`anonymizeTicket` — direito ao esquecimento) e CSAT (estrelas) no painel CRM.

Estrutura (`src/components/admin/AdminPanel.tsx`):
- **Barra superior:** sempre escura, branding Claro × One Hub Admin, toggle dark, perfil atendente, logout.
- **Strip de KPIs:** Novos · Em atendimento · Resolvidos · SLA cumprido % · Tempo médio · Autoatendimento Clara %.
- **Toolbar de filtros:** tabs de status (Todos/Novos/Em atend./Resolvidos) + select prioridade + select canal + busca por ticket/cliente/assunto.
- **Lista de tickets:** ID ITSM (`INC-2026-xxxx`/`REQ-…`), status, canal, prioridade, badge de **SLA** (No prazo / Em risco / Violado), calculado por `SLA_TARGET` (alta 15min, média 30, baixa 60).
- **Detalhe:** conversa (histórico Clara em fundo diferenciado + atendimento humano) + painel CRM (SLA do ticket, perfil, Saúde dos Serviços, Ações Rápidas).
- **Workflow:** novo → em_atendimento (ao responder) → resolvido (mantém p/ histórico/SLA). `updateTicketStatus`, `resolveQueueItem`.

Dados: `mockAttendanceQueue` (abertos) + `mockResolvedTickets` (histórico p/
métricas SLA) — unidos no `attendanceQueue` do contexto. Handover da Clara abre
ticket `INC-2026-xxxx` com status `novo`.

Acesso: botão "One Hub Admin" no menu de perfil do HubTopBar → `/admin`.

## 7. Estado atual / o que está simulado

- ✅ Landing + Loading (parceria One Hub × Claro), dark mode, busca global, troca de contas/dependentes, detalhes de fatura, AddPlanModal, tour guiado.
- ✅ Clara: classificador de intents alinhado ao Sprint 2, handover suave, métricas de autoatendimento.
- ✅ One Hub Admin: **console ITSM + RBAC profissional** (ServiceNow/Zammad-like) — 2 papéis, dark mode, branding, filtros, workflow de status, conversa + CRM. Gerente: dashboard com período até 1 ano, gráficos com tooltip/totais, CSAT, 1ª resposta, config SLA editável, **trilha de auditoria ISO 27001** e **LGPD (mascaramento + anonimização)**.
- ⛔ Backend/DB/Docker/WhatsApp reais — fora de escopo do protótipo (apenas mock).

## 8. Próximos passos (Sprint 3, do documento)

Refino do diagrama incluindo bloco NLU/IA · protótipo funcional com Clara sobre
intents · painel admin com fila + ingestão de histórico · definição final de
DB/Docker · validação com usuários.

## 9. Comandos

```
npx tsc --noEmit      # type-check (rodar após mudanças)
npx next build        # build de produção
npx next dev          # dev server
```

---
_Última atualização: One Hub Admin profissional — período até 1 ano, gráficos
com tooltip/totais, CSAT/1ª resposta, ISO 27001 (auditoria) e LGPD
(mascaramento/anonimização); correção do indicador de resolução (tira tempo real)._
