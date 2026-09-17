'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  MessageSquare, Globe, Smartphone, Send, ArrowLeft, Sparkles,
  FileText, CalendarClock, TrendingUp, CheckCircle2, ShieldCheck,
  Wifi, Tv, Phone, Activity as ActivityIcon, Bot, User as UserIcon,
  Sun, Moon, LogOut, Search, Clock, AlertTriangle, Inbox, Timer,
  LayoutDashboard, Headset, SlidersHorizontal, Save, BarChart3,
  Star, ScrollText, ShieldAlert, EyeOff, Zap, RotateCcw,
} from 'lucide-react';
import { useClaroContext } from '../../context/ClaroContext';
import {
  ANALYSIS_PERIODS, genPeriodMetrics, COMPLIANCE,
  INCIDENT_SEVERITY, INCIDENT_SERVICO_LABEL,
  type PeriodId, type QueueItem, type AdminPriority, type AdminChannel, type TicketStatus,
  type IncidentServico, type IncidentSeverity,
} from '../../data/mockData';
import { AlertOctagon, Radio, MapPin, Plus } from 'lucide-react';

const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');

const CHANNEL = {
  whatsapp: { label: 'WhatsApp',   icon: MessageSquare, cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  portal:   { label: 'Portal Web', icon: Globe,         cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  app:      { label: 'App',        icon: Smartphone,    cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
} as const;

const PRIORITY = {
  alta:  { label: 'Alta',  cls: 'bg-claro text-white' },
  media: { label: 'Média', cls: 'bg-amber-500 text-white' },
  baixa: { label: 'Baixa', cls: 'bg-warm-300 text-warm-800 dark:bg-warm-600 dark:text-warm-100' },
} as const;

const STATUS = {
  novo:           { label: 'Novo',           cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  em_atendimento: { label: 'Em atendimento', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  resolvido:      { label: 'Resolvido',      cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
} as const;

const HEALTH = {
  ok:        { label: 'Operacional', cls: 'text-green-600 dark:text-green-400', dot: 'bg-green-500' },
  degradado: { label: 'Degradado',   cls: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  offline:   { label: 'Offline',     cls: 'text-claro',                          dot: 'bg-claro' },
} as const;

const SERVICE_ICON = { internet: Wifi, tv: Tv, telefonia: Phone } as const;
type SlaCfg = Record<AdminPriority, number>;

function slaInfo(t: QueueItem, cfg: SlaCfg, extraMins = 0) {
  const target = cfg[t.priority];
  if (t.status === 'resolvido') {
    const took = t.resolvedInMins ?? target;
    const ok = took <= target;
    return { label: ok ? `Cumprido · ${took}min` : `Violado · ${took}min`, cls: ok ? 'text-green-600 dark:text-green-400' : 'text-claro', bad: !ok };
  }
  const openedFor = t.openedMinsAgo + extraMins;
  const ratio = openedFor / target;
  if (ratio < 0.7) return { label: `No prazo · ${Math.max(Math.round(target - openedFor), 0)}min`, cls: 'text-green-600 dark:text-green-400', bad: false };
  if (ratio < 1)   return { label: `Em risco · ${Math.max(Math.round(target - openedFor), 0)}min`, cls: 'text-amber-600 dark:text-amber-400', bad: false };
  return { label: `Violado · +${Math.round(openedFor - target)}min`, cls: 'text-claro', bad: true };
}

/* Respostas rápidas do atendente (canned responses) */
const CANNED_RESPONSES = [
  'Olá! Sou da equipe Claro e já estou com todo o histórico da sua conversa — não precisa repetir nada.',
  'Já localizei sua conta. Pode me confirmar qual serviço está com problema?',
  'Abri um chamado técnico para a sua região. A previsão de normalização é para hoje.',
  'Reenviei a 2ª via da sua fatura para o e-mail e o WhatsApp cadastrados.',
  'Consegui resolver por aqui. Vou encerrar o chamado — qualquer coisa, é só chamar de novo.',
];

const fmtDur = (totalSec: number) => {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m >= 60 ? `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}` : `${m}min ${String(s).padStart(2, '0')}s`;
};

interface Props { onExit: () => void; }

type AdminTab = 'dashboard' | 'console' | 'incidentes';

export function AdminPanel({ onExit }: Props) {
  const { adminRole } = useClaroContext();
  /* Sem papel de admin (ex.: acabou de deslogar): a rota /admin já redireciona
   * para /login — aqui só evita renderizar o console sem permissão. */
  if (!adminRole) return null;
  return <AuthenticatedAdminPanel key={adminRole} onExit={onExit} adminRole={adminRole} />;
}

// O estado do console pertence ao login atual. Sair ou trocar o papel desmonta
// esta instância, incluindo aba selecionada, filtros e rascunhos do atendente.
function AuthenticatedAdminPanel({ onExit, adminRole }: Props & { adminRole: 'atendente' | 'gerente' }) {
  const [tab, setTab] = useState<AdminTab>(adminRole === 'gerente' ? 'dashboard' : 'console');
  return (
    <div className="h-screen flex flex-col bg-warm-100 dark:bg-warm-900 text-warm-900 dark:text-warm-50">
      <AdminTopBar onExit={onExit} tab={tab} onTab={(t) => setTab(t as AdminTab)} role={adminRole} />
      {tab === 'dashboard' && adminRole === 'gerente' && <ManagerDashboard />}
      {tab === 'console' && <AdminConsole onExit={onExit} embedded />}
      {tab === 'incidentes' && <IncidentsPanel />}
    </div>
  );
}

/* ─── Top bar branded ────────────────────────────────────────────────────── */
function AdminTopBar({ onExit, tab, onTab, role }: Props & { tab?: string; onTab?: (t: string) => void; role?: 'atendente' | 'gerente' }) {
  const { dark, toggleDark, adminLogout, adminRole, adminName, activeIncidents } = useClaroContext();
  const tabs = [
    ...(role === 'gerente' ? [{ id: 'dashboard', label: 'Visão Gerencial', icon: LayoutDashboard }] : []),
    { id: 'console', label: 'Console', icon: Headset },
    { id: 'incidentes', label: 'Incidentes', icon: AlertOctagon },
  ];
  return (
    <header className="h-14 shrink-0 bg-warm-900 text-white flex items-center px-5 gap-4">
      <Image src="/logo-texto-branco.png" alt="Claro" width={70} height={26} className="h-6 w-auto object-contain" />
      <span className="text-white/25 font-thin">×</span>
      <span className="text-[11px] font-black uppercase tracking-[0.16em] bg-white/10 rounded-full px-2.5 py-1">One Hub Admin</span>
      {onTab && (
        <div className="hidden md:flex bg-white/10 rounded-full p-1 text-[11px] font-bold ml-2">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => onTab(t.id)} className={cx('px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors', tab === t.id ? 'bg-white text-warm-900' : 'text-white/60')}>
                <Icon size={12} /> {t.label}
                {t.id === 'incidentes' && activeIncidents.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-claro text-white text-[9px] font-black flex items-center justify-center">{activeIncidents.length}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
      <div className="ml-auto flex items-center gap-2">
        <button onClick={toggleDark} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" title={dark ? 'Modo claro' : 'Modo escuro'}>{dark ? <Sun size={15} /> : <Moon size={15} />}</button>
        <div className="flex items-center gap-2 bg-white/10 rounded-full pl-1 pr-3 py-1">
          <span className="w-7 h-7 rounded-full bg-claro flex items-center justify-center text-[10px] font-black">{adminRole === 'gerente' ? 'GE' : 'AT'}</span>
          <div className="hidden sm:block leading-none"><p className="text-[11px] font-bold">{adminName}</p><p className="text-[9px] text-white/50 uppercase tracking-wider">{adminRole}</p></div>
        </div>
        <button onClick={adminLogout} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" title="Sair do console"><LogOut size={15} /></button>
        <button onClick={onExit} className="text-[11px] font-bold text-white/60 hover:text-white flex items-center gap-1.5 ml-1"><ArrowLeft size={13} /> Hub</button>
      </div>
    </header>
  );
}

/* ─── DASHBOARD GERENCIAL ────────────────────────────────────────────────── */
function ManagerDashboard() {
  const { attendanceQueue, slaConfig, updateSlaConfig, auditLog } = useClaroContext();
  const [period, setPeriod] = useState<PeriodId>('30d');
  const [draftSla, setDraftSla] = useState<SlaCfg>({ ...slaConfig });
  const [saved, setSaved] = useState(false);

  const days = ANALYSIS_PERIODS.find((p) => p.id === period)!.days;
  const pm = useMemo(() => genPeriodMetrics(days), [days]);

  /* Operação em tempo real (reflete resoluções imediatamente) */
  const live = useMemo(() => {
    const novo = attendanceQueue.filter((q) => q.status === 'novo').length;
    const wip = attendanceQueue.filter((q) => q.status === 'em_atendimento').length;
    const done = attendanceQueue.filter((q) => q.status === 'resolvido').length;
    return { novo, wip, done, total: attendanceQueue.length };
  }, [attendanceQueue]);

  const byStatus = [
    { key: 'novo', label: 'Novos', value: live.novo, color: '#3B82F6' },
    { key: 'wip', label: 'Em atendimento', value: live.wip, color: '#F59E0B' },
    { key: 'done', label: 'Resolvidos', value: live.done, color: '#22C55E' },
  ];
  const claraSplit = [
    { key: 'auto', label: 'Resolvido pela Clara', value: pm.claraAutoPct, color: '#D52B1E' },
    { key: 'hand', label: 'Handover humano', value: 100 - pm.claraAutoPct, color: '#A8A299' },
  ];

  const saveSla = () => {
    (['alta', 'media', 'baixa'] as AdminPriority[]).forEach((p) => updateSlaConfig(p, draftSla[p]));
    setSaved(true); setTimeout(() => setSaved(false), 2400);
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 lg:p-6 space-y-6">
      {/* Cabeçalho + seletor de período */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-black tracking-tight">Visão Gerencial</h1>
          <p className="text-[12px] text-warm-500">Métricas, SLA e governança · {ANALYSIS_PERIODS.find((p) => p.id === period)!.label}</p>
        </div>
        <div className="flex bg-white dark:bg-warm-800 border border-warm-200/70 dark:border-warm-700 rounded-full p-1 text-[11px] font-bold">
          {ANALYSIS_PERIODS.map((p) => (
            <button key={p.id} onClick={() => setPeriod(p.id)} className={cx('px-3 py-1.5 rounded-full transition-colors', period === p.id ? 'bg-claro text-white' : 'text-warm-500 hover:text-warm-900 dark:hover:text-warm-50')}>
              {p.id === '7d' ? '7d' : p.id === '30d' ? '30d' : p.id === '90d' ? '3m' : p.id === '180d' ? '6m' : '1 ano'}
            </button>
          ))}
        </div>
      </div>

      {/* Tempo real */}
      <div className="bg-white dark:bg-warm-800 border border-warm-200/70 dark:border-warm-700 rounded-2xl px-5 py-3 flex items-center gap-6 flex-wrap">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-warm-400 flex items-center gap-1.5"><Zap size={12} className="text-claro" /> Tempo real</span>
        <LiveStat label="Fila total" value={live.total} />
        <LiveStat label="Novos" value={live.novo} dot="#3B82F6" />
        <LiveStat label="Em atendimento" value={live.wip} dot="#F59E0B" />
        <LiveStat label="Resolvidos" value={live.done} dot="#22C55E" />
      </div>

      {/* KPIs do período */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <BigKpi icon={Inbox}        label="Tickets no período" value={pm.total.toLocaleString('pt-BR')} tone="warm" />
        <BigKpi icon={CheckCircle2} label="Resolvidos"          value={pm.resolvidos.toLocaleString('pt-BR')} tone="green" />
        <BigKpi icon={ShieldCheck}  label="SLA cumprido"        value={`${pm.slaPct}%`} tone={pm.slaPct >= 80 ? 'green' : 'claro'} />
        <BigKpi icon={Timer}        label="Tempo médio resol."  value={`${pm.avgResolutionMin}min`} tone="blue" />
        <BigKpi icon={Clock}        label="1ª resposta"         value={`${pm.firstResponseMin}min`} tone="amber" />
        <BigKpi icon={Star}         label="CSAT"                value={`${pm.csat}/5`} tone="claro" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card title={`Tendência · ${ANALYSIS_PERIODS.find((p) => p.id === period)!.label}`} icon={TrendingUp} className="lg:col-span-2"
          right={<span className="text-[11px] font-bold text-warm-400">Σ {pm.total.toLocaleString('pt-BR')} abertos · {pm.resolvidos.toLocaleString('pt-BR')} resolvidos</span>}>
          <TrendChart data={pm.series} />
          <div className="flex items-center gap-5 mt-3 text-[11px] font-bold"><Legend color="#D52B1E" label="Abertos" /><Legend color="#22C55E" label="Resolvidos" /></div>
        </Card>

        <Card title="SLA cumprido por bucket" icon={ShieldCheck} right={<span className="text-[11px] font-bold text-warm-400">Méd. {pm.slaPct}%</span>}>
          <div className="space-y-2 pt-1 max-h-[210px] overflow-y-auto">
            {pm.series.map((d) => (
              <div key={d.label + d.idx} className="flex items-center gap-2 group" title={`${d.label}: ${d.slaPct}% dentro do SLA`}>
                <span className="text-[11px] font-bold text-warm-400 w-9 shrink-0">{d.label}</span>
                <div className="flex-1 h-2.5 rounded-full bg-warm-100 dark:bg-warm-700 overflow-hidden">
                  <div className={cx('h-full rounded-full transition-all group-hover:brightness-110', d.slaPct >= 85 ? 'bg-green-500' : d.slaPct >= 75 ? 'bg-amber-500' : 'bg-claro')} style={{ width: `${d.slaPct}%` }} />
                </div>
                <span className="text-[11px] font-black tabular-nums w-9 text-right">{d.slaPct}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Volume por canal" icon={BarChart3} right={<span className="text-[11px] font-bold text-warm-400">Σ {pm.byChannel.reduce((s, c) => s + c.value, 0).toLocaleString('pt-BR')}</span>}>
          <BarList data={pm.byChannel.map((c) => ({ label: c.label, value: c.value }))} />
        </Card>

        <Card title="Tickets por status" icon={LayoutDashboard} right={<span className="text-[11px] font-bold text-warm-400">Σ {live.total}</span>}>
          <Donut data={byStatus} centerLabel={String(live.total)} centerSub="total" />
        </Card>

        <Card title="Volume por categoria" icon={ScrollText} right={<span className="text-[11px] font-bold text-warm-400">Σ {pm.byCategory.reduce((s, c) => s + c.value, 0).toLocaleString('pt-BR')}</span>}>
          <BarList data={pm.byCategory.map((c) => ({ label: c.label, value: c.value }))} />
        </Card>

        <Card title="Clara · resolução automática" icon={Bot} right={<span className="text-[11px] font-bold text-warm-400">reabertura {pm.reopenRate}%</span>}>
          <Donut data={claraSplit} centerLabel={`${pm.claraAutoPct}%`} centerSub="auto" suffix="%" />
        </Card>
      </div>

      {/* Configuração de SLA */}
      <Card title="Configuração de SLA (min) por prioridade" icon={SlidersHorizontal}>
        <p className="text-[12px] text-warm-500 mb-4">Define o tempo-alvo de resolução. Aplica em tempo real aos badges e ao cálculo de cumprimento no console. Alterações são registradas na trilha de auditoria.</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {(['alta', 'media', 'baixa'] as AdminPriority[]).map((p) => (
            <div key={p} className="bg-warm-50 dark:bg-warm-700/40 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className={cx('text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5', PRIORITY[p].cls)}>{PRIORITY[p].label}</span>
                <span className="text-[10px] text-warm-400">atual: {slaConfig[p]}min</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" min={1} value={draftSla[p]} onChange={(e) => setDraftSla((s) => ({ ...s, [p]: +e.target.value }))} className="w-full bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-600 rounded-xl px-3 py-2 text-lg font-black tabular-nums outline-none focus:ring-2 focus:ring-claro/40" />
                <span className="text-[12px] font-bold text-warm-400">min</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button onClick={saveSla} className="inline-flex items-center gap-2 text-sm font-bold rounded-full px-5 py-2.5 bg-claro text-white hover:bg-claro-dark transition-colors"><Save size={15} /> Salvar configuração</button>
          {saved && <span className="text-[12px] font-bold text-green-600 dark:text-green-400 flex items-center gap-1.5"><CheckCircle2 size={14} /> SLA atualizado · auditado</span>}
        </div>
      </Card>

      {/* Governança: Trilha de auditoria (ISO 27001) + LGPD */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card title="Trilha de auditoria · ISO/IEC 27001 A.12.4" icon={ScrollText} className="lg:col-span-2">
          {auditLog.length === 0 ? (
            <p className="text-[12px] text-warm-500 py-6 text-center">Nenhum evento registrado nesta sessão. Resolva um ticket ou altere o SLA para gerar logs.</p>
          ) : (
            <ul className="divide-y divide-warm-100 dark:divide-warm-700 max-h-64 overflow-y-auto">
              {auditLog.map((a) => (
                <li key={a.id} className="py-2.5 flex items-start gap-3 text-[12px]">
                  <span className="font-mono text-[10px] text-warm-400 shrink-0 mt-0.5">{new Date(a.ts).toLocaleTimeString('pt-BR')}</span>
                  <span className="inline-flex items-center text-[9px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 bg-warm-100 dark:bg-warm-700 text-warm-500 shrink-0">{a.action}</span>
                  <span className="flex-1 text-warm-700 dark:text-warm-200">{a.detail}</span>
                  <span className="text-[10px] text-warm-400 shrink-0">{a.actor}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Privacidade · LGPD" icon={ShieldAlert}>
          <div className="space-y-3 text-[12px]">
            <div className="flex items-start gap-2.5">
              <EyeOff size={15} className="text-claro shrink-0 mt-0.5" />
              <p className="text-warm-600 dark:text-warm-300">Dados pessoais (CPF/CNPJ) <b>mascarados</b> por padrão. Anonimização disponível no console (direito ao esquecimento).</p>
            </div>
            <div className="flex items-start gap-2.5">
              <ScrollText size={15} className="text-claro shrink-0 mt-0.5" />
              <p className="text-warm-600 dark:text-warm-300">Retenção de histórico: <b>{COMPLIANCE.retentionDays} dias</b></p>
            </div>
            <div className="bg-warm-50 dark:bg-warm-700/40 rounded-xl p-3 text-[11px] text-warm-500 leading-relaxed">{COMPLIANCE.lgpd}</div>
          </div>
        </Card>
      </div>

      {/* Selo de compliance */}
      <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-warm-400">
        <span className="inline-flex items-center gap-1.5 bg-white dark:bg-warm-800 border border-warm-200/70 dark:border-warm-700 rounded-full px-3 py-1.5"><ShieldCheck size={12} className="text-green-600" /> {COMPLIANCE.iso27001}</span>
        <span className="inline-flex items-center gap-1.5 bg-white dark:bg-warm-800 border border-warm-200/70 dark:border-warm-700 rounded-full px-3 py-1.5"><ShieldAlert size={12} className="text-claro" /> {COMPLIANCE.lgpd}</span>
      </div>
    </div>
  );
}

/* ─── CONSOLE ITSM ───────────────────────────────────────────────────────── */
function AdminConsole({ onExit, embedded }: Props & { embedded?: boolean }) {
  const { attendanceQueue, resolveQueueItem, updateTicketStatus, claraMetrics, slaConfig, anonymizeTicket, deanonymizeTicket } = useClaroContext();
  const [statusFilter, setStatusFilter] = useState<'todos' | TicketStatus>('todos');
  const [prioFilter, setPrioFilter] = useState<'todas' | AdminPriority>('todas');
  const [chanFilter, setChanFilter] = useState<'todos' | AdminChannel>('todos');
  const [search, setSearch] = useState('');
  const [mineOnly, setMineOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [agentMsgs, setAgentMsgs] = useState<Record<string, { role: 'agent'; text: string }[]>>({});
  const [draft, setDraft] = useState('');
  const [justResolved, setJustResolved] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* contador de espera ao vivo — segundos desde que o console abriu */
  const [elapsedSec, setElapsedSec] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const extraMins = elapsedSec / 60;

  const filtered = useMemo(() => attendanceQueue.filter((q) => {
    if (statusFilter !== 'todos' && q.status !== statusFilter) return false;
    if (prioFilter !== 'todas' && q.priority !== prioFilter) return false;
    if (chanFilter !== 'todos' && q.channel !== chanFilter) return false;
    if (mineOnly && !(agentMsgs[q.id]?.length || q.status === 'em_atendimento')) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      if (!q.name.toLowerCase().includes(s) && !q.ticketId.toLowerCase().includes(s) && !q.reason.toLowerCase().includes(s)) return false;
    }
    return true;
  }), [attendanceQueue, statusFilter, prioFilter, chanFilter, mineOnly, agentMsgs, search]);

  const selected = useMemo<QueueItem | null>(
    () => attendanceQueue.find((q) => q.id === selectedId) ?? filtered[0] ?? null,
    [attendanceQueue, selectedId, filtered]
  );

  const kpi = useMemo(() => {
    const open = attendanceQueue.filter((q) => q.status === 'novo').length;
    const wip = attendanceQueue.filter((q) => q.status === 'em_atendimento').length;
    const done = attendanceQueue.filter((q) => q.status === 'resolvido');
    const slaOk = done.filter((q) => (q.resolvedInMins ?? 999) <= slaConfig[q.priority]).length;
    const slaPct = done.length ? Math.round((slaOk / done.length) * 100) : 100;
    const avg = done.length ? Math.round(done.reduce((s, q) => s + (q.resolvedInMins ?? 0), 0) / done.length) : 0;
    const cm = claraMetrics.length;
    const auto = cm ? Math.round((claraMetrics.filter((x) => x.resolvedAuto).length / cm) * 100) : 0;
    return { open, wip, done: done.length, slaPct, avg, auto };
  }, [attendanceQueue, claraMetrics, slaConfig]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [selectedId, agentMsgs]);

  const sendAgent = () => {
    if (!draft.trim() || !selected) return;
    if (selected.status === 'novo') updateTicketStatus(selected.id, 'em_atendimento');
    setAgentMsgs((p) => ({ ...p, [selected.id]: [...(p[selected.id] ?? []), { role: 'agent', text: draft.trim() }] }));
    setDraft('');
  };
  const doResolve = () => {
    if (!selected) return;
    resolveQueueItem(selected.id);
    setJustResolved(true); setTimeout(() => setJustResolved(false), 2600);
  };

  return (
    <div className={cx('flex flex-col', embedded ? 'flex-1 overflow-hidden' : 'h-screen bg-warm-100 dark:bg-warm-900 text-warm-900 dark:text-warm-50')}>
      {!embedded && <AdminTopBar onExit={onExit} />}

      <div className="shrink-0 bg-white dark:bg-warm-800 border-b border-warm-200/70 dark:border-warm-700 px-5 py-3 grid grid-cols-3 lg:grid-cols-6 gap-3">
        <Kpi icon={Inbox} label="Novos" value={kpi.open} tone="blue" />
        <Kpi icon={Clock} label="Em atendimento" value={kpi.wip} tone="amber" />
        <Kpi icon={CheckCircle2} label="Resolvidos" value={kpi.done} tone="green" pulse={justResolved} />
        <Kpi icon={ShieldCheck} label="SLA cumprido" value={`${kpi.slaPct}%`} tone={kpi.slaPct >= 80 ? 'green' : 'claro'} />
        <Kpi icon={Timer} label="Tempo médio" value={`${kpi.avg}min`} tone="warm" />
        <Kpi icon={Bot} label="Autoatend. Clara" value={`${kpi.auto}%`} tone="claro" />
      </div>

      <div className="shrink-0 bg-white dark:bg-warm-800 border-b border-warm-200/70 dark:border-warm-700 px-5 py-3 flex items-center gap-2 flex-wrap">
        <div className="flex bg-warm-100 dark:bg-warm-700 rounded-full p-1 text-[11px] font-bold">
          {(['todos', 'novo', 'em_atendimento', 'resolvido'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={cx('px-3 py-1.5 rounded-full transition-colors', statusFilter === s ? 'bg-warm-900 text-white dark:bg-warm-50 dark:text-warm-900' : 'text-warm-500')}>
              {s === 'todos' ? 'Todos' : s === 'em_atendimento' ? 'Em atend.' : s === 'novo' ? 'Novos' : 'Resolvidos'}
            </button>
          ))}
        </div>
        <select value={prioFilter} onChange={(e) => setPrioFilter(e.target.value as typeof prioFilter)} className="text-[12px] font-bold bg-warm-100 dark:bg-warm-700 rounded-full px-3 py-2 outline-none cursor-pointer">
          <option value="todas">Prioridade: todas</option><option value="alta">Alta</option><option value="media">Média</option><option value="baixa">Baixa</option>
        </select>
        <select value={chanFilter} onChange={(e) => setChanFilter(e.target.value as typeof chanFilter)} className="text-[12px] font-bold bg-warm-100 dark:bg-warm-700 rounded-full px-3 py-2 outline-none cursor-pointer">
          <option value="todos">Canal: todos</option><option value="whatsapp">WhatsApp</option><option value="portal">Portal Web</option><option value="app">App</option>
        </select>
        <button
          onClick={() => setMineOnly((v) => !v)}
          className={cx('text-[12px] font-bold rounded-full px-3 py-2 inline-flex items-center gap-1.5 transition-colors',
            mineOnly ? 'bg-claro text-white' : 'bg-warm-100 dark:bg-warm-700 text-warm-500')}
        >
          <Headset size={12} /> Meus tickets
        </button>
        <div className="flex items-center gap-2 bg-warm-100 dark:bg-warm-700 rounded-full px-3 py-2 flex-1 min-w-[180px] max-w-xs">
          <Search size={13} className="text-warm-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar ticket, cliente, assunto…" className="bg-transparent text-[12px] outline-none flex-1 placeholder:text-warm-400" />
        </div>
        <span className="text-[11px] text-warm-400 font-bold ml-auto">{filtered.length} ticket(s)</span>
      </div>

      <div className="flex-1 grid lg:grid-cols-12 overflow-hidden">
        <div className="lg:col-span-4 border-r border-warm-200/70 dark:border-warm-700 bg-white dark:bg-warm-800 overflow-y-auto">
          {filtered.length === 0 && <div className="p-10 text-center text-sm text-warm-500"><Inbox size={22} className="mx-auto mb-2 text-warm-400" /> Nenhum ticket com esses filtros.</div>}
          {filtered.map((q) => {
            const ch = CHANNEL[q.channel]; const ChIcon = ch.icon;
            const sla = slaInfo(q, slaConfig, extraMins);
            const active = selected?.id === q.id;
            return (
              <button key={q.id} onClick={() => setSelectedId(q.id)} className={cx('w-full text-left px-4 py-3.5 border-b border-warm-100 dark:border-warm-700 transition-colors', active ? 'bg-claro-soft dark:bg-claro/10' : 'hover:bg-warm-50 dark:hover:bg-warm-700/50')}>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-mono font-bold text-warm-400">{q.ticketId}</span>
                  <span className={cx('text-[9px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5', STATUS[q.status].cls)}>{STATUS[q.status].label}</span>
                </div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-full bg-warm-200 dark:bg-warm-600 text-warm-700 dark:text-warm-100 flex items-center justify-center text-[10px] font-black shrink-0">{q.initials}</div>
                  <div className="flex-1 min-w-0"><p className="text-[13px] font-bold truncate">{q.name}</p><p className="text-[11px] text-warm-500 truncate">{q.reason}</p></div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={cx('inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5', ch.cls)}><ChIcon size={9} /> {ch.label}</span>
                  <span className={cx('text-[9px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5', PRIORITY[q.priority].cls)}>{PRIORITY[q.priority].label}</span>
                  <span className={cx('text-[10px] font-bold ml-auto flex items-center gap-1', sla.cls)}>{sla.bad && <AlertTriangle size={10} />} {sla.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {selected ? (
          <div className="lg:col-span-8 grid lg:grid-cols-8 overflow-hidden">
            <div className="lg:col-span-5 flex flex-col overflow-hidden bg-warm-50 dark:bg-warm-900">
              <div className="px-5 py-3 bg-white dark:bg-warm-800 border-b border-warm-200/70 dark:border-warm-700 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-claro to-claro-dark text-white flex items-center justify-center text-[11px] font-black">{selected.initials}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-black truncate">{selected.name} <span className="text-warm-400 font-mono font-normal">· {selected.ticketId}</span></p>
                  <p className="text-[11px] text-warm-500">{selected.category} · {CHANNEL[selected.channel].label}</p>
                </div>
                {selected.status !== 'resolvido' ? (
                  <button onClick={doResolve} className="inline-flex items-center gap-1.5 text-[11px] font-bold rounded-full px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 transition-colors"><CheckCircle2 size={13} /> Resolver</button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold rounded-full px-3 py-1.5 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"><CheckCircle2 size={13} /> Resolvido</span>
                )}
              </div>
              {justResolved && (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-[12px] font-bold px-5 py-2 flex items-center gap-2 border-b border-green-200 dark:border-green-900">
                  <CheckCircle2 size={14} /> Ticket resolvido · métricas e auditoria atualizadas
                </div>
              )}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-warm-400"><Sparkles size={12} className="text-claro" /> Diagnóstico automático · Clara<span className="flex-1 h-px bg-warm-200 dark:bg-warm-700" /></div>
                {selected.claraHistory.map((msg, i) => (
                  <div key={'cl-' + i} className={cx('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div className={cx('max-w-[80%] px-3.5 py-2.5 text-[13px] leading-relaxed rounded-2xl', msg.role === 'user' ? 'bg-warm-200 dark:bg-warm-700 rounded-br-sm' : 'bg-claro-soft dark:bg-claro/10 border border-claro/20 rounded-bl-sm')}>
                      {msg.role === 'clara' && <span className="flex items-center gap-1 text-[10px] font-bold text-claro mb-1"><Sparkles size={10} /> Clara</span>}
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-green-600 dark:text-green-400 pt-1"><UserIcon size={12} /> Atendimento humano<span className="flex-1 h-px bg-green-200 dark:bg-green-900" /></div>
                {(agentMsgs[selected.id] ?? []).map((msg, i) => (
                  <div key={'ag-' + i} className="flex justify-end"><div className="max-w-[80%] px-3.5 py-2.5 text-[13px] leading-relaxed rounded-2xl bg-warm-900 text-white dark:bg-warm-50 dark:text-warm-900 rounded-br-sm">{msg.text}</div></div>
                ))}
              </div>
              {selected.status !== 'resolvido' && (
                <div className="px-3 pt-2 bg-white dark:bg-warm-800 flex gap-1.5 overflow-x-auto border-t border-warm-100 dark:border-warm-700">
                  {CANNED_RESPONSES.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => setDraft(c)}
                      title={c}
                      className="shrink-0 text-[11px] font-bold rounded-full px-3 py-1.5 bg-warm-100 dark:bg-warm-700 text-warm-500 hover:bg-claro-soft hover:text-claro dark:hover:bg-claro/15 transition-colors max-w-[220px] truncate"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
              <form onSubmit={(e) => { e.preventDefault(); sendAgent(); }} className="border-t border-warm-200/70 dark:border-warm-700 bg-white dark:bg-warm-800 p-3 flex items-center gap-2">
                <input value={draft} onChange={(e) => setDraft(e.target.value)} disabled={selected.status === 'resolvido'} placeholder={selected.status === 'resolvido' ? 'Ticket resolvido' : `Responder ${selected.name.split(' ')[0]}…`} className="flex-1 bg-warm-100 dark:bg-warm-700 rounded-full px-4 py-2.5 text-[13px] outline-none placeholder:text-warm-400 focus:ring-2 focus:ring-claro/40 disabled:opacity-50" />
                <button type="submit" disabled={!draft.trim() || selected.status === 'resolvido'} className="w-10 h-10 rounded-full bg-claro text-white flex items-center justify-center hover:bg-claro-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><Send size={15} /></button>
              </form>
            </div>

            <aside className="lg:col-span-3 border-l border-warm-200/70 dark:border-warm-700 bg-white dark:bg-warm-800 overflow-y-auto p-4 space-y-5">
              <div className="rounded-2xl border border-warm-200/70 dark:border-warm-700 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-warm-400 mb-2">SLA do ticket</p>
                <p className={cx('text-sm font-black flex items-center gap-1.5', slaInfo(selected, slaConfig, extraMins).cls)}>{slaInfo(selected, slaConfig, extraMins).bad && <AlertTriangle size={14} />}{slaInfo(selected, slaConfig, extraMins).label}</p>
                <p className="text-[11px] text-warm-500 mt-1">Meta {slaConfig[selected.priority]}min · prioridade {PRIORITY[selected.priority].label.toLowerCase()}</p>
                {selected.status === 'resolvido' && selected.csat != null && (
                  <p className="text-[11px] text-warm-500 mt-2 flex items-center gap-1">CSAT: {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={11} className={i < (selected.csat ?? 0) ? 'text-amber-500 fill-amber-500' : 'text-warm-300'} />)}</p>
                )}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-warm-400 mb-3">Perfil do cliente</p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-claro to-claro-dark text-white flex items-center justify-center text-sm font-black">{selected.initials}</div>
                  <div className="min-w-0"><p className="text-[13px] font-black truncate">{selected.name}</p><p className="text-[11px] text-warm-500">{selected.cpf}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-warm-50 dark:bg-warm-700/40 rounded-xl p-2.5"><p className="text-warm-400">Cliente desde</p><p className="font-bold">{selected.contractSince.split('-')[0]}</p></div>
                  <div className="bg-warm-50 dark:bg-warm-700/40 rounded-xl p-2.5"><p className="text-warm-400">Aberto há</p><p className="font-bold tabular-nums">{selected.status === 'resolvido' ? `${selected.openedMinsAgo}min` : fmtDur(Math.round(selected.openedMinsAgo * 60 + elapsedSec))}</p></div>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-warm-400 mb-3">Saúde dos serviços</p>
                <ul className="space-y-1.5">
                  {Object.entries(selected.serviceHealth).map(([svc, st]) => {
                    const Icon = SERVICE_ICON[svc as keyof typeof SERVICE_ICON] ?? ActivityIcon;
                    const h = HEALTH[st as keyof typeof HEALTH] ?? HEALTH.ok;
                    return (
                      <li key={svc} className="flex items-center gap-2.5 bg-warm-50 dark:bg-warm-700/40 rounded-xl px-3 py-2">
                        <Icon size={14} className="text-warm-500 shrink-0" /><span className="text-[12px] font-bold capitalize flex-1">{svc}</span>
                        <span className={cx('flex items-center gap-1.5 text-[11px] font-bold', h.cls)}><span className={cx('w-1.5 h-1.5 rounded-full', h.dot)} /> {h.label}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-warm-400 mb-3">Ações rápidas</p>
                <div className="space-y-2">
                  <QuickAction icon={FileText} label="Enviar 2ª via de fatura" />
                  <QuickAction icon={CalendarClock} label="Agendar visita técnica" />
                  <QuickAction icon={TrendingUp} label="Oferecer upgrade de plano" />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-warm-400 mb-2 flex items-center gap-1.5"><ShieldAlert size={12} className="text-claro" /> LGPD</p>
                {selected.anonymized ? (
                  <>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-claro mb-2">
                      <EyeOff size={13} /> Dados anonimizados
                    </div>
                    <button
                      onClick={() => deanonymizeTicket(selected.id)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-warm-200/70 dark:border-warm-600 hover:border-claro hover:bg-claro-soft dark:hover:bg-claro/10 transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-warm-100 dark:bg-warm-700 flex items-center justify-center shrink-0"><RotateCcw size={14} className="text-claro" /></div>
                      <span className="text-[12px] font-bold flex-1">Reverter anonimização (demonstração)</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => anonymizeTicket(selected.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-warm-200/70 dark:border-warm-600 hover:border-claro hover:bg-claro-soft dark:hover:bg-claro/10 transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded-lg bg-warm-100 dark:bg-warm-700 flex items-center justify-center shrink-0"><EyeOff size={14} className="text-claro" /></div>
                    <span className="text-[12px] font-bold flex-1">Anonimizar dados (direito ao esquecimento)</span>
                  </button>
                )}
              </div>
            </aside>
          </div>
        ) : (
          <div className="lg:col-span-8 flex flex-col items-center justify-center text-center p-8">
            <Inbox size={40} className="text-warm-400 mb-3" /><p className="text-lg font-black">Selecione um ticket</p><p className="text-sm text-warm-500 mt-1">Escolha um item da fila para ver o contexto completo.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── INCIDENTES · registro pela equipe técnica (RF006) ──────────────────── */
const SERVICOS: IncidentServico[] = ['internet', 'tv', 'telefonia', 'movel'];
const SEVERIDADES: IncidentSeverity[] = ['critico', 'alto', 'moderado', 'informativo'];

function IncidentsPanel() {
  const { incidents, activeIncidents, registerIncident, resolveIncident, adminName } = useClaroContext();
  const [form, setForm] = useState({
    titulo: '', descricao: '', regiao: '', previsao: '',
    servicos: ['internet'] as IncidentServico[], severidade: 'alto' as IncidentSeverity,
  });
  const [okId, setOkId] = useState(false);

  const toggleServ = (s: IncidentServico) =>
    setForm((f) => ({
      ...f,
      servicos: f.servicos.includes(s) ? f.servicos.filter((x) => x !== s) : [...f.servicos, s],
    }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.regiao.trim() || form.servicos.length === 0) return;
    registerIncident({
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim() || 'Sem descrição adicional.',
      regiao: form.regiao.trim(),
      previsao: form.previsao.trim() || 'Previsão de normalização em apuração',
      servicos: form.servicos,
      severidade: form.severidade,
      abertoPor: adminName ?? 'Equipe técnica',
    });
    setForm({ titulo: '', descricao: '', regiao: '', previsao: '', servicos: ['internet'], severidade: 'alto' });
    setOkId(true);
    setTimeout(() => setOkId(false), 2600);
  };

  const resolved = incidents.filter((i) => i.status === 'resolvido');

  return (
    <div className="flex-1 overflow-y-auto p-5 lg:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-black tracking-tight flex items-center gap-2"><AlertOctagon size={18} className="text-claro" /> Incidentes técnicos</h1>
        <p className="text-[12px] text-warm-500">Registro pela equipe técnica · notificação automática aos clientes afetados (RF006)</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Formulário */}
        <Card title="Registrar incidente" icon={Plus}>
          <form onSubmit={submit} className="space-y-3">
            <input value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} placeholder="Título (ex.: Instabilidade na fibra — SP Zona Sul)" className="w-full bg-warm-100 dark:bg-warm-700 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-claro/40" />
            <div className="flex items-center gap-2 bg-warm-100 dark:bg-warm-700 rounded-xl px-3">
              <MapPin size={14} className="text-warm-400 shrink-0" />
              <input value={form.regiao} onChange={(e) => setForm((f) => ({ ...f, regiao: e.target.value }))} placeholder="Região afetada" className="flex-1 bg-transparent py-2.5 text-[13px] outline-none" />
            </div>
            <textarea value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} placeholder="Descrição / diagnóstico" rows={2} className="w-full bg-warm-100 dark:bg-warm-700 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-claro/40 resize-none" />
            <input value={form.previsao} onChange={(e) => setForm((f) => ({ ...f, previsao: e.target.value }))} placeholder="Previsão de normalização (ex.: hoje até 18h)" className="w-full bg-warm-100 dark:bg-warm-700 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-claro/40" />

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-warm-400 mb-1.5">Serviços afetados</p>
              <div className="flex flex-wrap gap-1.5">
                {SERVICOS.map((s) => (
                  <button type="button" key={s} onClick={() => toggleServ(s)} className={cx('text-[11px] font-bold rounded-full px-3 py-1.5 transition-colors', form.servicos.includes(s) ? 'bg-claro text-white' : 'bg-warm-100 dark:bg-warm-700 text-warm-500')}>
                    {INCIDENT_SERVICO_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-warm-400 mb-1.5">Severidade</p>
              <div className="flex flex-wrap gap-1.5">
                {SEVERIDADES.map((s) => (
                  <button type="button" key={s} onClick={() => setForm((f) => ({ ...f, severidade: s }))} className={cx('text-[11px] font-bold rounded-full px-3 py-1.5 transition-all', form.severidade === s ? INCIDENT_SEVERITY[s].badge + ' ring-2 ring-offset-1 ring-warm-300 dark:ring-warm-600' : 'bg-warm-100 dark:bg-warm-700 text-warm-500')}>
                    {INCIDENT_SEVERITY[s].label}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full bg-claro text-white font-bold rounded-xl py-2.5 text-sm hover:bg-claro-dark transition-colors flex items-center justify-center gap-2">
              <Radio size={15} /> Publicar e notificar clientes
            </button>
            {okId && <p className="text-[12px] font-bold text-green-600 dark:text-green-400 flex items-center gap-1.5"><CheckCircle2 size={14} /> Incidente publicado · clientes notificados · auditado</p>}
          </form>
        </Card>

        {/* Ativos */}
        <Card title={`Incidentes ativos · ${activeIncidents.length}`} icon={Radio}>
          {activeIncidents.length === 0 ? (
            <p className="text-[12px] text-warm-500 py-6 text-center">Nenhum incidente ativo. A rede está operando normalmente.</p>
          ) : (
            <ul className="space-y-2.5">
              {activeIncidents.map((i) => (
                <li key={i.id} className="border border-warm-200/70 dark:border-warm-700 rounded-xl p-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-[10px] text-warm-400">{i.id}</span>
                    <span className={cx('text-[9px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5', INCIDENT_SEVERITY[i.severidade].badge)}>{INCIDENT_SEVERITY[i.severidade].label}</span>
                  </div>
                  <p className="text-[13px] font-bold">{i.titulo}</p>
                  <p className="text-[11px] text-warm-500 mt-0.5">{i.regiao} · {i.servicos.map((s) => INCIDENT_SERVICO_LABEL[s]).join(', ')} · {i.previsao}</p>
                  <button onClick={() => resolveIncident(i.id)} className="mt-2 text-[11px] font-bold rounded-full px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 transition-colors inline-flex items-center gap-1.5">
                    <CheckCircle2 size={12} /> Marcar como normalizado
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {resolved.length > 0 && (
        <Card title={`Histórico · ${resolved.length} resolvido(s)`} icon={ScrollText}>
          <ul className="divide-y divide-warm-100 dark:divide-warm-700">
            {resolved.map((i) => (
              <li key={i.id} className="py-2 flex items-center gap-3 text-[12px]">
                <span className="font-mono text-[10px] text-warm-400 shrink-0">{i.id}</span>
                <span className="flex-1 truncate">{i.titulo}</span>
                <span className="text-warm-400 text-[10px] shrink-0">{i.regiao}</span>
                <span className="text-green-600 dark:text-green-400 text-[10px] font-bold shrink-0">normalizado</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

/* ─── Helpers visuais ────────────────────────────────────────────────────── */
const TONE = { blue: 'text-blue-600 dark:text-blue-400', amber: 'text-amber-600 dark:text-amber-400', green: 'text-green-600 dark:text-green-400', claro: 'text-claro', warm: 'text-warm-700 dark:text-warm-200' } as const;

function Kpi({ icon: Icon, label, value, tone, pulse }: { icon: typeof Inbox; label: string; value: string | number; tone: keyof typeof TONE; pulse?: boolean }) {
  return (
    <div className={cx('flex items-center gap-2.5 rounded-xl transition-colors', pulse && 'bg-green-50 dark:bg-green-900/20 -mx-1 px-1')}>
      <div className={cx('w-9 h-9 rounded-xl bg-warm-100 dark:bg-warm-700 flex items-center justify-center shrink-0', TONE[tone])}><Icon size={16} /></div>
      <div className="min-w-0 leading-none"><p className="text-[10px] uppercase tracking-wider text-warm-400 font-bold truncate">{label}</p><p className="text-lg font-black tabular-nums">{value}</p></div>
    </div>
  );
}

function LiveStat({ label, value, dot }: { label: string; value: number; dot?: string }) {
  return (
    <div className="flex items-center gap-2">
      {dot && <span className="w-2 h-2 rounded-full" style={{ background: dot }} />}
      <span className="text-[11px] text-warm-500 font-medium">{label}</span>
      <span className="text-sm font-black tabular-nums">{value}</span>
    </div>
  );
}

function BigKpi({ icon: Icon, label, value, tone }: { icon: typeof Inbox; label: string; value: string | number; tone: keyof typeof TONE }) {
  return (
    <div className="bg-white dark:bg-warm-800 border border-warm-200/70 dark:border-warm-700 rounded-2xl p-4">
      <div className={cx('w-9 h-9 rounded-xl bg-warm-100 dark:bg-warm-700 flex items-center justify-center mb-3', TONE[tone])}><Icon size={16} /></div>
      <p className="text-2xl font-black tabular-nums leading-none">{value}</p>
      <p className="text-[11px] text-warm-400 font-bold mt-1.5">{label}</p>
    </div>
  );
}

function Card({ title, icon: Icon, children, className, right }: { title: string; icon: typeof Inbox; children: React.ReactNode; className?: string; right?: React.ReactNode }) {
  return (
    <div className={cx('bg-white dark:bg-warm-800 border border-warm-200/70 dark:border-warm-700 rounded-2xl p-5', className)}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-warm-400 flex items-center gap-2"><Icon size={13} className="text-claro" /> {title}</p>
        {right}
      </div>
      {children}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="flex items-center gap-1.5 text-warm-500"><span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} /> {label}</span>;
}

/* Lista de barras com tooltip de valor + % no hover */
function BarList({ data }: { data: { label: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const max = Math.max(...data.map((d) => d.value), 1);
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="space-y-3 pt-1">
      {data.map((d, i) => (
        <div key={d.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} className="relative">
          <div className="flex justify-between text-[12px] font-bold mb-1">
            <span className="truncate pr-2">{d.label}</span>
            <span className="tabular-nums shrink-0">{d.value.toLocaleString('pt-BR')} · {Math.round((d.value / total) * 100)}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-warm-100 dark:bg-warm-700 overflow-hidden">
            <div className={cx('h-full rounded-full bg-claro transition-all', hover === i && 'brightness-110')} style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
          {hover === i && (
            <div className="absolute -top-8 right-0 z-10 bg-warm-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-lg whitespace-nowrap">
              {d.label}: {d.value.toLocaleString('pt-BR')} ({Math.round((d.value / total) * 100)}%)
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TrendChart({ data }: { data: { label: string; abertos: number; resolvidos: number; idx: number }[] }) {
  const W = 520, H = 150, pad = 8;
  const max = Math.max(...data.flatMap((d) => [d.abertos, d.resolvidos]), 1) * 1.1;
  const x = (i: number) => pad + (i * (W - pad * 2)) / Math.max(data.length - 1, 1);
  const y = (v: number) => H - pad - (v / max) * (H - pad * 2);
  const path = (key: 'abertos' | 'resolvidos') => data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d[key])}`).join(' ');
  const area = (key: 'abertos' | 'resolvidos') => `${path(key)} L ${x(data.length - 1)} ${H - pad} L ${x(0)} ${H - pad} Z`;
  const [hi, setHi] = useState<number | null>(null);
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none"
        onMouseMove={(e) => {
          const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const px = ((e.clientX - r.left) / r.width) * W;
          const idx = Math.round(((px - pad) / (W - pad * 2)) * (data.length - 1));
          setHi(Math.max(0, Math.min(data.length - 1, idx)));
        }}
        onMouseLeave={() => setHi(null)}
      >
        <defs><linearGradient id="g-ab" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#D52B1E" stopOpacity="0.25" /><stop offset="100%" stopColor="#D52B1E" stopOpacity="0" /></linearGradient></defs>
        <path d={area('abertos')} fill="url(#g-ab)" />
        <path d={path('abertos')} fill="none" stroke="#D52B1E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={path('resolvidos')} fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {hi != null && <line x1={x(hi)} y1={pad} x2={x(hi)} y2={H - pad} stroke="currentColor" className="text-warm-300 dark:text-warm-600" strokeWidth="1" strokeDasharray="3 3" />}
        {hi != null && <><circle cx={x(hi)} cy={y(data[hi].abertos)} r="3.5" fill="#D52B1E" /><circle cx={x(hi)} cy={y(data[hi].resolvidos)} r="3.5" fill="#22C55E" /></>}
        {data.map((d, i) => (data.length <= 14 || i % Math.ceil(data.length / 12) === 0) && (
          <text key={d.label + i} x={x(i)} y={H - 1} textAnchor="middle" className="fill-warm-400" style={{ fontSize: 9, fontWeight: 700 }}>{d.label}</text>
        ))}
      </svg>
      {hi != null && (
        <div className="absolute top-0 bg-warm-900 text-white text-[11px] rounded-lg shadow-xl px-3 py-2 pointer-events-none -translate-x-1/2"
          style={{ left: `${(x(hi) / W) * 100}%` }}>
          <p className="font-black mb-1">{data[hi].label}</p>
          <p className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-claro" /> Abertos: <b>{data[hi].abertos}</b></p>
          <p className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Resolvidos: <b>{data[hi].resolvidos}</b></p>
        </div>
      )}
    </div>
  );
}

function Donut({ data, centerLabel, centerSub, suffix }: { data: { key: string; label: string; value: number; color: string }[]; centerLabel?: string; centerSub?: string; suffix?: string }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const R = 52, C = 2 * Math.PI * R;
  const [hi, setHi] = useState<string | null>(null);
  let offset = 0;
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 140 140" className="w-32 h-32 shrink-0 -rotate-90">
        <circle cx="70" cy="70" r={R} fill="none" stroke="currentColor" className="text-warm-100 dark:text-warm-700" strokeWidth="16" />
        {data.map((d) => {
          const frac = d.value / total;
          const seg = <circle key={d.key} cx="70" cy="70" r={R} fill="none" stroke={d.color} strokeWidth={hi === d.key ? 20 : 16} strokeDasharray={`${frac * C} ${C}`} strokeDashoffset={-offset * C} onMouseEnter={() => setHi(d.key)} onMouseLeave={() => setHi(null)} style={{ cursor: 'pointer', transition: 'stroke-width .15s' }} />;
          offset += frac;
          return seg;
        })}
      </svg>
      <div className="flex-1 min-w-0">
        {centerLabel && <p className="text-2xl font-black leading-none mb-2">{centerLabel}<span className="text-[11px] text-warm-400 font-bold ml-1">{centerSub}</span></p>}
        <ul className="space-y-1.5">
          {data.map((d) => (
            <li key={d.key} onMouseEnter={() => setHi(d.key)} onMouseLeave={() => setHi(null)} className={cx('flex items-center gap-2 text-[12px] rounded-lg px-1 -mx-1 transition-colors cursor-default', hi === d.key && 'bg-warm-50 dark:bg-warm-700/40')}>
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
              <span className="font-bold flex-1 truncate">{d.label}</span>
              <span className="tabular-nums font-black">{d.value}{suffix ?? ''}</span>
              <span className="tabular-nums text-warm-400 text-[10px] w-9 text-right">{Math.round((d.value / total) * 100)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label }: { icon: typeof FileText; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button onClick={() => { setDone(true); setTimeout(() => setDone(false), 2200); }} className={cx('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-colors', done ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-warm-200/70 dark:border-warm-600 hover:border-claro hover:bg-claro-soft dark:hover:bg-claro/10')}>
      <div className="w-7 h-7 rounded-lg bg-warm-100 dark:bg-warm-700 flex items-center justify-center shrink-0">{done ? <CheckCircle2 size={14} className="text-green-600" /> : <Icon size={14} className="text-claro" />}</div>
      <span className="text-[12px] font-bold flex-1">{done ? 'Ação executada!' : label}</span>
    </button>
  );
}
