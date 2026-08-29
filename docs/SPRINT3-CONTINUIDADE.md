# Sprint 3 — Camada de Sessão e Continuidade de Contexto entre Canais

Implementação do **núcleo de continuidade** descrito no Documento de Arquitetura
(§3.1, §4, §4.1) e dos requisitos **RF001**, **RF005** e da autenticação com
**token de sessão real (RNF005)**.

## O que foi adicionado

| Camada (documento) | Arquivo | Papel |
|---|---|---|
| Sessão e contexto (Redis) | [`src/services/session.ts`](../src/services/session.ts) | Objeto `Session` (§4.1), persistência (localStorage no mock / REST no `api`), recuperação por `usuario_id` e por telefone |
| Autenticação (JWT) | [`src/services/authToken.ts`](../src/services/authToken.ts) | Emissão/validação de token JWT, expiração 30 min, contador regressivo |
| NLU da Clara (Dialogflow) | [`src/services/claraNlu.ts`](../src/services/claraNlu.ts) | `detectIntent()` — regex local por padrão, Dialogflow via proxy quando habilitado, fallback automático |
| Resposta da Clara | [`src/services/claraReply.ts`](../src/services/claraReply.ts) | `buildReply()` + `resumeLine()` — respostas idênticas em qualquer canal |
| Config de backend | [`src/config/backend.ts`](../src/config/backend.ts) + [`.env.example`](../.env.example) | Chaves de ambiente para plugar Node/Express, Redis e Dialogflow reais |
| Canal WhatsApp (simulação) | [`src/components/whatsapp/WhatsAppChannel.tsx`](../src/components/whatsapp/WhatsAppChannel.tsx) · rota `/whatsapp` | Reconhece o cliente pelo número cadastrado e recupera a MESMA sessão |
| Orquestração no front | [`src/context/ClaroContext.tsx`](../src/context/ClaroContext.tsx) | Estado da sessão + token, `startSession`, `appendSessionMessage`, `updateSessionContext`, `markSessionHandover` |

## Objeto de sessão (§4.1)

```ts
interface Session {
  sessionId: string;      // session_id  — vinculado ao cliente, NÃO ao canal
  usuarioId: string;      // usuario_id
  canalOrigem: 'web' | 'app' | 'whatsapp';  // canal_origem
  historico: SessionMessage[];              // { role, text, ts, canal }
  contextoAtual: {                          // contexto_atual
    lastIntent: string | null;
    entities: Record<string, string>;
    summary: string | null;
  };
  telefone: string | null;
  status: 'ativa' | 'handover' | 'encerrada';
}
```

## Fluxo demonstrável

1. **Login** (`/`) → `startSession('web')` emite o token JWT e abre a sessão.
2. **Clara no portal** (`/hub`) → cada mensagem entra no `historico` com `canal: 'web'`;
   `contexto_atual` é atualizado a cada intent.
3. **Troca de canal** → menu do perfil › *Canal WhatsApp*, ou *Configurações › Sessão e
   segurança › Continuar no WhatsApp*.
4. **WhatsApp** (`/whatsapp`) → cliente é reconhecido pelo telefone, a sessão é
   recuperada com todo o histórico (incluindo o que veio do portal) e a Clara
   **retoma o contexto** (`resumeLine`) sem pedir reidentificação.
5. **Handover** em qualquer canal → o ticket no One Hub Admin nasce com o `channel`
   correto e o histórico completo; a sessão vai para `status: 'handover'`.

*Configurações › Sessão e segurança* exibe `session_id`, `canal_origem`,
`contexto_atual`, expiração do token e os canais já usados na sessão.

## Ligando o backend real

Preencher `.env.local` (ver `.env.example`) e definir `NEXT_PUBLIC_BACKEND_MODE=api`.
Nenhuma mudança na camada de apresentação é necessária — os serviços em
`src/services/*` já têm o caminho REST implementado e caem para o mock em caso de falha.

Endpoints esperados do backend:

| Método | Rota | Uso |
|---|---|---|
| `POST` | `/auth/token` | emite o JWT |
| `GET` | `/sessions?usuario=:id` | recupera sessão ativa |
| `GET` | `/sessions/by-phone/:phone` | recupera sessão por telefone (WhatsApp) |
| `PUT` | `/sessions/:sessionId` | upsert da sessão |
| `DELETE` | `/sessions/:sessionId` | encerra a sessão |
| `POST` | `/clara/detect-intent` | proxy do Dialogflow (pt-BR) |
| `GET` / `PUT` | `/incidents` | incidentes técnicos (RF006) |
| `POST` / `DELETE` | `/privacy/consent` | consentimento LGPD (§7) |
| `POST` | `/privacy/erasure` | direito de exclusão (§7) |

---

# Complemento — Login, LGPD, Incidentes e Acessibilidade

## Tela de login (§7 · controle de acesso)

- Rota `/login` ([`src/components/auth/LoginScreen.tsx`](../src/components/auth/LoginScreen.tsx))
  com alternador **Cliente / Administrador** na mesma tela.
- Cliente → `login()` (emite token + sessão) → `/hub`.
- Administrador → `adminLogin()` (RBAC: atendente / gerente) → `/admin`.
- Toda a landing agora encaminha para `/login`; `/hub` sem sessão redireciona para lá.

## LGPD — consentimento e direito de exclusão (§7)

- [`src/services/privacy.ts`](../src/services/privacy.ts): consentimento, portabilidade (export JSON) e exclusão.
- **Consentimento explícito no 1º acesso ao chat** — gate na Clara ([ClaraChat](../src/components/hub/overlays/ClaraChat.tsx)) e checkbox no canal WhatsApp. Persistido em `localStorage` (`onehub.lgpd.consent`) / `POST /privacy/consent` no modo `api`.
- **Configurações › Privacidade e dados**: status do consentimento, revogar, **baixar meus dados (JSON)** e **excluir histórico de conversas** (art. 18 LGPD).

## RF006 — Incidentes técnicos e notificação proativa

- [`src/services/incidents.ts`](../src/services/incidents.ts) + modelo `Incident` em [mockData](../src/data/mockData.ts).
- **One Hub Admin › aba Incidentes** ([IncidentsPanel](../src/components/admin/AdminPanel.tsx)): a equipe técnica registra título, região, serviços afetados, severidade e previsão.
- Ao publicar: o cliente afetado **recebe uma notificação automática** e o
  [`NetworkStatusBanner`](../src/components/site/NetworkStatusBanner.tsx) da Visão Geral passa a
  refletir o incidente (antes era texto fixo). Sem incidente ativo, o banner some.
- A Clara referencia o incidente ativo na intenção *status de serviço*.
- Persistência em `localStorage` (`onehub.incidents`) — admin e cliente no mesmo
  navegador já demonstram o fluxo ponta a ponta.

## RF007 — Acessibilidade assistida (VLibras)

- [`src/components/a11y/VLibrasWidget.tsx`](../src/components/a11y/VLibrasWidget.tsx) monta o plugin
  oficial `vlibras.gov.br` no layout raiz (`next/script`, `afterInteractive`).
- Botão de acesso reposicionado via CSS para não colidir com o FAB da Clara.
- Certificação completa da integração permanece como próximo passo (§10).
