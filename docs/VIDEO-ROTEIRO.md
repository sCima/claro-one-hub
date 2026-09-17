# One Hub · Roteiro do Vídeo de Demonstração (Sprint 3)

**Formato:** demonstração da solução rodando (não é pitch). Duração-alvo **7min00–7min30**
(dentro da faixa de 6 a 8 min). Gravação em tela cheia, 1920×1080, navegador limpo.

---

## Pré-produção (antes de gravar)

| Item | Valor |
|---|---|
| Rodar | `npm run dev` → `http://localhost:3000` |
| Limpar estado | DevTools › Application › Local Storage › apagar chaves `onehub.*` (ou aba anônima) |
| Cliente sugerido | `rodolfo.sanches@claro.com.br` · qualquer senha |
| Telefone do titular (WhatsApp) | `(11) 98765-4321` |
| Admin atendente | `atendente@claro.com.br` / `admin` |
| Admin gerente | `gerente@claro.com.br` / `gerente` |
| Abas preparadas | 1) `/` · 2) deixar `/whatsapp` e `/admin` prontas para abrir |
| Tema | claro (deixar o dark mode para uma passada rápida no fim, se sobrar tempo) |

> Dica de gravação: fale enquanto clica. Cada bloco abaixo traz **[AÇÃO]** (o que fazer na
> tela) e **[NARRAÇÃO]** (o texto, que pode ser lido quase literal).

---

## BLOCO 1 — Abertura e visão da arquitetura · `0:00 – 0:50`

**[AÇÃO]** Tela inicial `/` (landing institucional Claro). Rolar devagar até a seção "Claro One Hub".

**[NARRAÇÃO]**
> "Este é o **One Hub**, a plataforma de integração de canais de comunicação da Claro.
> O problema que ela resolve: hoje o cliente repete o mesmo problema no chat, no WhatsApp
> e no telefone, porque cada canal tem a sua própria sessão. No One Hub a sessão é
> **vinculada ao cliente, não ao canal** — a conversa continua de onde parou, em qualquer canal.
> A stack é **Next.js 16 com App Router e React 19**, **TypeScript**, **Tailwind CSS v4**,
> **Framer Motion** e **Recharts**. A arquitetura segue o documento entregue: camada de
> apresentação em Next.js; orquestração em **Node.js/Express**; **Redis** para sessão e
> contexto; **JWT** para autenticação; e **Dialogflow** para a NLU da assistente Clara.
> Nesta demonstração o app roda em **modo mock** — sessão, token e NLU simulados no
> cliente — mas cada serviço já tem o caminho REST implementado: basta preencher o
> `.env.local` e trocar `NEXT_PUBLIC_BACKEND_MODE` para `api`."

---

## BLOCO 2 — Login, RBAC e token de sessão · `0:50 – 1:35`

**[AÇÃO]** Clicar em "Acessar One Hub" → vai para `/login`. Mostrar o alternador
**Cliente / Administrador**. Ficar em **Cliente**, entrar com o e-mail sugerido e qualquer senha.

**[NARRAÇÃO]**
> "O controle de acesso é por papel — requisito da seção 7 do documento. A mesma tela
> atende **cliente**, **atendente** e **gerente**. Ao entrar como cliente, o backend emite
> um **token JWT com expiração de 30 minutos** (RNF005) e abre a sessão no canal web."

**[AÇÃO]** Entra no `/hub`. Aparece "Olá, Rodolfo". Apertar **F5** para provar a persistência.

**[NARRAÇÃO]**
> "Recarregando a página, o cliente **continua logado** — o token JWT válido é reidratado
> do armazenamento local, junto com a sessão de conversa, faturas pagas e pontos.
> Sem flicker de volta para a tela de login."

---

## BLOCO 3 — Portal do cliente: centralização · `1:35 – 2:35`

**[AÇÃO]** Na Visão Geral: apontar o **Hero da fatura**, as **ações rápidas** e o card escuro
**Central de Atendimento**. Clicar em **Pagar** na fatura → PayModal → confirmar. Toast
"Pagamento confirmado · pontos creditados".

**[NARRAÇÃO]**
> "O portal centraliza todo o relacionamento: fatura em aberto, consumo, serviços do combo,
> Claro Clube e atendimento — numa tela só. Pagar a fatura é **um toque**, e os pontos do
> Clube são creditados na hora."

**[AÇÃO]** Abrir o seletor de contas no topo → trocar para uma **conta dependente** (ex.: Bianca) →
mostrar que serviços, valor da fatura e pontos mudam → voltar para o titular.

**[NARRAÇÃO]**
> "Uma conta pode ter **titular, dependentes e conta PJ**. A interface é dinâmica por perfil
> (RF003): ao trocar de conta, serviços, faturas e pontos são re-derivados."

**[AÇÃO]** Passar rápido pelo gráfico de **consumo semanal** (Recharts) e pelo **Claro Clube**
(resgatar uma recompensa barata, ex.: iFood R$50 → animação de resgate).

---

## BLOCO 4 — Clara no Web Chat: autoatendimento + LGPD · `2:35 – 3:45`

**[AÇÃO]** Clicar no botão flutuante da **Clara**. Aparece o **aceite de LGPD**. Clicar em
"Aceito e quero continuar".

**[NARRAÇÃO]**
> "No primeiro acesso ao chat, **consentimento explícito** — base legal Lei 13.709, a LGPD.
> A conversa é registrada e o titular pode exportar ou excluir esse histórico depois."

**[AÇÃO]** Digitar: **"qual o valor da minha fatura?"**

**[NARRAÇÃO]**
> "A NLU classifica a intenção — aqui, `consultar_fatura` — e a Clara responde com os
> **dados reais da conta**: fatura de Abril 2026, R$ 519,70, vencimento em 10/05.
> Junto da resposta vêm **botões de ação** (RNF002 — navegação guiada): 'Ver faturas',
> 'Pagar agora'. A Clara não só informa, ela leva o cliente até a ação."

**[AÇÃO]** Digitar: **"minha internet caiu"**.

**[NARRAÇÃO]**
> "Na intenção `status_servico`, a Clara cruza com os **incidentes técnicos ativos** da
> região do cliente e cita o protocolo — vou mostrar de onde vem esse incidente no painel
> administrativo daqui a pouco."

**[AÇÃO]** Digitar: **"quero falar com um atendente"**. Aparece o card de **handover** com os
canais (Chat / WhatsApp / 106).

**[NARRAÇÃO]**
> "Quando a Clara não resolve sozinha, ela faz o **handover suave**: abre um chamado real
> na fila do time de atendimento, **levando todo o histórico** e herdando a categoria e a
> prioridade da conversa. O cliente não repete nada."

---

## BLOCO 5 — Continuidade de contexto entre canais (o núcleo) · `3:45 – 5:00`

**[AÇÃO]** Abrir uma **nova aba** em `/whatsapp`. Aparece a tela de identificação. O campo já
sugere o telefone do titular `(11) 98765-4321`. Marcar o checkbox de LGPD (se aparecer) e
clicar em "Iniciar conversa".

**[NARRAÇÃO]**
> "Agora o cliente troca de canal. No WhatsApp ele **não faz login** — o backend reconhece
> pelo **número cadastrado** e recupera a sessão ativa."

**[AÇÃO]** Mostrar a faixa verde: **"Sessão SESS-… recuperada · continuada de Web Chat"**.
A primeira mensagem da Clara já é a **retomada**: "Oi de novo, Rodolfo! Estávamos falando
sobre o problema no seu serviço no portal. Não precisa repetir nada."

**[NARRAÇÃO]**
> "Mesmo `session_id`. Todo o histórico do Web Chat está aqui, marcado com o canal de
> origem de cada mensagem. A Clara **resume o contexto** antes da primeira resposta — é a
> materialização da seção 4 do documento: `session_id` ligado ao cliente, não ao canal."

**[AÇÃO]** Digitar algo curto no WhatsApp, ex.: **"e quanto ao meu plano?"** → resposta com os
serviços reais. Depois voltar para a aba do `/hub`, abrir **Configurações › Sessão e segurança**.

**[NARRAÇÃO]**
> "Em Configurações, a transparência da sessão: o `session_id`, o **canal de origem**, o
> **contexto atual** (última intenção reconhecida), e o **token JWT expirando** em contagem
> regressiva — fica vermelho abaixo de 5 minutos. Os canais já usados nesta sessão aparecem
> como 'Web Chat → WhatsApp'."

---

## BLOCO 6 — Meu Atendimento: a jornada unificada · `5:00 – 5:40`

**[AÇÃO]** Sidebar → **Meu Atendimento**.

**[NARRAÇÃO]**
> "Do lado do cliente, 'Meu Atendimento' junta tudo: os **canais de contato**, a **conversa
> contínua** com a linha do tempo — Web Chat, depois WhatsApp — e o **status do chamado**
> em quatro etapas: Clara, fila, atendente humano, resolvido."

**[AÇÃO]** Apontar a timeline dos canais e o passo atual do chamado ("Aguardando atendente").

---

## BLOCO 7 — One Hub Admin: o outro lado do balcão · `5:40 – 6:55`

**[AÇÃO]** Abrir aba `/admin`. Login como **atendente** (`atendente@claro.com.br` / `admin`).

**[NARRAÇÃO]**
> "Este é o **One Hub Admin**, o console de atendimento — um Service Desk no estilo ITSM,
> com **RBAC**: o atendente vê a fila e os incidentes; o gerente vê também a visão gerencial."

**[AÇÃO]** No **Console**: abrir o ticket do próprio Rodolfo (o que a Clara acabou de criar).
Mostrar o **CRM do cliente**, o **histórico completo da Clara** com as mensagens dos dois
canais, o **contador de espera ao vivo** e as **respostas rápidas**. Clicar em **Resolver**.

**[NARRAÇÃO]**
> "O atendente recebe o chamado **com o contexto pronto** — categoria, prioridade,
> saúde dos serviços e a conversa inteira, de todos os canais. Ao resolver, o evento entra
> na **trilha de auditoria** — ISO/IEC 27001, A.12.4: quem fez o quê, quando."

**[AÇÃO]** Voltar para a aba do cliente → **Meu Atendimento** → agora aparece
**"Como foi seu atendimento?"** com estrelas → dar 5 estrelas.

**[NARRAÇÃO]**
> "O cliente avalia (CSAT), e a nota volta para o painel do gerente."

**[AÇÃO]** No Admin, trocar para **gerente** (logout / login `gerente@claro.com.br` / `gerente`).
Abrir **Visão Gerencial**: gráficos de tickets, **% resolvido pela Clara**, SLA por prioridade
(editar um valor de SLA para mostrar que é configurável e vira evento de auditoria).

**[AÇÃO]** Aba **Incidentes** → **registrar um incidente**: título "Instabilidade fibra — Zona Sul",
região, serviço **Internet**, severidade **Alto**, previsão "~45 min" → publicar.

**[NARRAÇÃO]**
> "Requisito RF006: a equipe técnica registra o incidente aqui, e o backend **notifica
> automaticamente só os clientes com o serviço afetado**."

**[AÇÃO]** Voltar para a aba do cliente → mostrar a **notificação nova** e o **banner amarelo**
na Visão Geral, agora com o texto do incidente que acabou de ser criado.

---

## BLOCO 8 — Fechamento: conformidade, acessibilidade e backend real · `6:55 – 7:25`

**[AÇÃO]** Clicar no botão do **VLibras** (canto da tela). Passar rápido em
**Configurações › Privacidade e dados** e mostrar **"Baixar meus dados (JSON)"** e
**"Excluir histórico de conversas"**.

**[NARRAÇÃO]**
> "Fechando: **acessibilidade** com o VLibras oficial no layout raiz, mais skip-link,
> foco visível e `aria-live` nos chats (WCAG 2.1 AA). **LGPD** completa: portabilidade e
> direito de exclusão pelo próprio titular. E tudo isto roda em modo mock hoje, mas a
> troca para o **backend real** — Node.js/Express, Redis e Dialogflow — é só configuração:
> a camada de apresentação não muda uma linha. Esse é o One Hub: **um cliente, uma sessão,
> todos os canais.**"

---

## Mapa de requisitos → cena (para conferência)

| Requisito | Onde aparece no vídeo |
|---|---|
| RF001 · Integração de canais | Bloco 4, 5 (Web Chat + WhatsApp + App) |
| RF003 · Interface dinâmica por perfil | Bloco 3 (troca de conta) |
| RF004 · Unificação de canal | Bloco 6 (Meu Atendimento) |
| RF005 · Persistência de contexto entre canais | Bloco 5 (sessão recuperada) |
| RF006 · Notificação proativa de incidentes | Bloco 7 (registrar incidente → banner) |
| RF007 · Acessibilidade / VLibras | Bloco 8 |
| RNF002 · Navegação guiada pela Clara | Bloco 4 (botões de ação) |
| RNF005 · JWT 30 min | Bloco 2 + Bloco 5 (contador) |
| §7 · LGPD (consentimento / exclusão / RBAC) | Bloco 2, 4, 8 |
| §4.1 · Objeto de sessão | Bloco 5 (Configurações › Sessão e segurança) |
| §4.2 · Handover suave com histórico | Bloco 4 + Bloco 7 |
| ISO/IEC 27001 · Auditoria + acesso | Bloco 7 |

---

## Se precisar cortar para caber em 6 min

Remover, nesta ordem: (1) o resgate no Claro Clube no Bloco 3; (2) a edição de SLA no
Bloco 7; (3) a passada no gráfico de consumo. Nunca cortar os Blocos 4, 5 e 7 — são o núcleo.
