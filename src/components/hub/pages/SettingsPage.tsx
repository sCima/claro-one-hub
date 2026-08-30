'use client';

import { useState } from 'react';
import {
  Sun, Moon, ChevronDown, KeyRound, RefreshCw, MessageSquare,
  Lock, ShieldCheck, Bell, CreditCard, Users, Download, Trash2, FileText,
  Smartphone, Mail, Fingerprint, Plus, Check,
} from 'lucide-react';
import Link from 'next/link';
import { useClaroContext } from '../../../context/ClaroContext';
import { channelsUsed, CANAL_LABEL } from '../../../services/session';
import { intentLabel } from '../../../services/claraNlu';

const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');
const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <span
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={cx('w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer shrink-0', on ? 'bg-claro' : 'bg-warm-200 dark:bg-warm-600')}
    >
      <span className={cx('block w-5 h-5 rounded-full bg-white transition-transform', on && 'translate-x-4')} />
    </span>
  );
}

export function SettingsPage() {
  const {
    user, activeUser, accounts, switchAccount, dark, toggleDark,
    session, sessionTokenPayload, sessionSecondsLeft,
    claraConsent, revokeClaraConsent, exportMyData, deleteMyConversations,
  } = useClaroContext();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const [openRow, setOpenRow] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [biometria, setBiometria] = useState(true);
  const [twoFA, setTwoFA] = useState({ sms: true, email: true, app: false });
  const [notif, setNotif] = useState({ faturas: true, consumo: true, promocoes: false, incidentes: true });

  if (!user) return null;

  const display = activeUser ?? user;
  const canais = session ? channelsUsed(session) : [];

  const flashSaved = (row: string) => { setSaved(row); setTimeout(() => setSaved((s) => (s === row ? null : s)), 2200); };
  const toggleRow = (id: string) => setOpenRow((r) => (r === id ? null : id));

  const downloadData = () => {
    const blob = new Blob([exportMyData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onehub-meus-dados-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doDelete = () => {
    deleteMyConversations();
    setConfirmDelete(false);
    setDeleted(true);
    setTimeout(() => setDeleted(false), 3000);
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] font-bold text-claro uppercase tracking-[0.22em] mb-2">Sua conta</p>
        <h1 className="text-4xl font-black tracking-tight">Configurações</h1>
      </header>

      <div className="bg-white dark:bg-warm-800 border border-warm-200/70 dark:border-warm-700 rounded-3xl p-7">
        <div className="flex items-center gap-5 flex-wrap">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-claro to-claro-dark text-white flex items-center justify-center text-xl font-black">
            {display.initials}
          </div>
          <div className="flex-1 min-w-[200px]">
            <p className="text-xl font-black">{display.name}</p>
            <p className="text-sm text-warm-500">{display.email}</p>
            <p className="text-[11px] text-warm-400 mt-1">
              CPF {user.cpf} · {display.phone} · Cliente desde {user.since.split('-')[0]}
            </p>
          </div>
          <button
            onClick={() => toggleRow('perfil')}
            className="text-xs font-bold rounded-full bg-warm-900 text-white dark:bg-warm-50 dark:text-warm-900 px-5 py-2.5"
          >
            {openRow === 'perfil' ? 'Fechar' : 'Editar perfil'}
          </button>
        </div>
        {openRow === 'perfil' && (
          <div className="mt-5 pt-5 border-t border-warm-100 dark:border-warm-700 grid sm:grid-cols-2 gap-3 anim-in">
            <label className="text-[11px] font-bold text-warm-500">Nome
              <input defaultValue={display.name} className="mt-1 w-full bg-warm-100 dark:bg-warm-700 rounded-xl px-3 py-2.5 text-sm font-normal text-warm-900 dark:text-warm-50 outline-none focus:ring-2 focus:ring-claro/40" />
            </label>
            <label className="text-[11px] font-bold text-warm-500">E-mail
              <input defaultValue={display.email} className="mt-1 w-full bg-warm-100 dark:bg-warm-700 rounded-xl px-3 py-2.5 text-sm font-normal text-warm-900 dark:text-warm-50 outline-none focus:ring-2 focus:ring-claro/40" />
            </label>
            <label className="text-[11px] font-bold text-warm-500">Telefone
              <input defaultValue={display.phone} className="mt-1 w-full bg-warm-100 dark:bg-warm-700 rounded-xl px-3 py-2.5 text-sm font-normal text-warm-900 dark:text-warm-50 outline-none focus:ring-2 focus:ring-claro/40" />
            </label>
            <div className="flex items-end">
              <button
                onClick={() => { flashSaved('perfil'); setOpenRow(null); }}
                className="text-xs font-bold rounded-full bg-claro text-white px-5 py-2.5 hover:bg-claro-dark transition-colors"
              >
                Salvar alterações
              </button>
            </div>
          </div>
        )}
        {saved === 'perfil' && (
          <p className="mt-3 text-[12px] font-bold text-green-600 dark:text-green-400 flex items-center gap-1.5"><Check size={13} /> Perfil atualizado</p>
        )}
      </div>

      {/* ─── Sprint 3 §4 · Sessão e contexto entre canais (RF005) ─────────── */}
      <div className="bg-white dark:bg-warm-800 border border-warm-200/70 dark:border-warm-700 rounded-3xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-claro-soft dark:bg-claro/15 flex items-center justify-center">
            <KeyRound size={17} className="text-claro" />
          </div>
          <div>
            <p className="text-sm font-black">Sessão e segurança</p>
            <p className="text-[11px] text-warm-500">
              Token JWT · continuidade de contexto vinculada ao cliente, não ao canal
            </p>
          </div>
        </div>

        {session ? (
          <>
            <div className="grid sm:grid-cols-2 gap-3 text-[12px]">
              <div className="bg-warm-50 dark:bg-warm-700/40 rounded-xl p-3">
                <p className="text-warm-400 text-[10px] uppercase tracking-wider font-bold">session_id</p>
                <p className="font-mono font-bold break-all">{session.sessionId}</p>
              </div>
              <div className="bg-warm-50 dark:bg-warm-700/40 rounded-xl p-3">
                <p className="text-warm-400 text-[10px] uppercase tracking-wider font-bold">canal de origem</p>
                <p className="font-bold">{CANAL_LABEL[session.canalOrigem]}</p>
              </div>
              <div className="bg-warm-50 dark:bg-warm-700/40 rounded-xl p-3">
                <p className="text-warm-400 text-[10px] uppercase tracking-wider font-bold">contexto atual</p>
                <p className="font-bold">
                  {session.contextoAtual.lastIntent ? intentLabel(session.contextoAtual.lastIntent) : '—'}
                </p>
              </div>
              <div className="bg-warm-50 dark:bg-warm-700/40 rounded-xl p-3">
                <p className="text-warm-400 text-[10px] uppercase tracking-wider font-bold">token expira em</p>
                <p className={cx('font-bold tabular-nums', sessionSecondsLeft < 300 && 'text-claro')}>
                  {mmss(sessionSecondsLeft)} {sessionTokenPayload && `· canal ${sessionTokenPayload.canal}`}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 flex-wrap text-[11px]">
              <span className="text-warm-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <RefreshCw size={11} /> canais desta sessão:
              </span>
              {canais.map((c) => (
                <span key={c} className="rounded-full bg-warm-100 dark:bg-warm-700 px-2.5 py-1 font-bold">
                  {CANAL_LABEL[c]}
                </span>
              ))}
              <span className="rounded-full bg-warm-100 dark:bg-warm-700 px-2.5 py-1 font-bold">
                {session.historico.length} mensagem(ns)
              </span>
            </div>

            <Link
              href="/whatsapp"
              className="mt-4 inline-flex items-center gap-2 text-xs font-bold rounded-full bg-[#25D366] text-white px-4 py-2.5 hover:bg-[#1fb457] transition-colors"
            >
              <MessageSquare size={14} /> Continuar esta conversa no WhatsApp
            </Link>
          </>
        ) : (
          <p className="text-[12px] text-warm-500">
            Nenhuma sessão de conversa ativa. Fale com a Clara para iniciar uma —
            o histórico fica disponível em qualquer canal.
          </p>
        )}
      </div>

      {/* ─── §7 · Privacidade e dados (LGPD) ──────────────────────────────── */}
      <div className="bg-white dark:bg-warm-800 border border-warm-200/70 dark:border-warm-700 rounded-3xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-claro-soft dark:bg-claro/15 flex items-center justify-center">
            <ShieldCheck size={17} className="text-claro" />
          </div>
          <div>
            <p className="text-sm font-black">Privacidade e dados</p>
            <p className="text-[11px] text-warm-500">LGPD · Lei 13.709/2018 — consentimento, portabilidade e exclusão</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 bg-warm-50 dark:bg-warm-700/40 rounded-xl px-4 py-3 mb-3">
          <div className="text-[12px]">
            <p className="font-bold">Registro da conversa com a Clara</p>
            <p className="text-warm-500">
              {claraConsent
                ? `Consentido em ${new Date(claraConsent.ts).toLocaleString('pt-BR')}`
                : 'Ainda não consentido — será solicitado ao abrir o chat'}
            </p>
          </div>
          {claraConsent && (
            <button onClick={revokeClaraConsent} className="text-[11px] font-bold text-claro hover:underline shrink-0">
              Revogar
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-2">
          <button
            onClick={downloadData}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-warm-200/70 dark:border-warm-600 hover:border-claro hover:bg-claro-soft dark:hover:bg-claro/10 transition-colors text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-warm-100 dark:bg-warm-700 flex items-center justify-center shrink-0"><Download size={14} className="text-claro" /></div>
            <span className="text-[12px] font-bold flex-1">Baixar meus dados (JSON)</span>
          </button>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-warm-200/70 dark:border-warm-600 hover:border-claro hover:bg-claro-soft dark:hover:bg-claro/10 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-warm-100 dark:bg-warm-700 flex items-center justify-center shrink-0"><Trash2 size={14} className="text-claro" /></div>
              <span className="text-[12px] font-bold flex-1">Excluir histórico de conversas</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-2 rounded-xl border border-claro/40 bg-claro-soft dark:bg-claro/10">
              <span className="text-[11px] font-bold flex-1 px-1">Confirmar exclusão?</span>
              <button onClick={doDelete} className="text-[11px] font-bold bg-claro text-white rounded-lg px-2.5 py-1.5">Excluir</button>
              <button onClick={() => setConfirmDelete(false)} className="text-[11px] font-bold text-warm-500 px-2 py-1.5">Cancelar</button>
            </div>
          )}
        </div>

        {deleted && (
          <p className="text-[12px] font-bold text-green-600 dark:text-green-400 flex items-center gap-1.5 mt-3">
            <FileText size={13} /> Histórico de conversas excluído a pedido do titular (art. 18, LGPD).
          </p>
        )}
        <p className="text-[10px] text-warm-400 mt-3">
          Retenção padrão do histórico: 365 dias · dados sensíveis (CPF) criptografados em repouso.
        </p>
      </div>

      <div className="bg-white dark:bg-warm-800 border border-warm-200/70 dark:border-warm-700 rounded-3xl divide-y divide-warm-100 dark:divide-warm-700">
        <button
          onClick={toggleDark}
          className="w-full flex items-center gap-4 p-5 text-left hover:bg-warm-50 dark:hover:bg-warm-700 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-warm-100 dark:bg-warm-700 flex items-center justify-center">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">Aparência</p>
            <p className="text-[11px] text-warm-500">Modo {dark ? 'escuro' : 'claro'} · Toque para alternar</p>
          </div>
          <span className={cx('w-10 h-6 rounded-full p-0.5 transition-colors', dark ? 'bg-claro' : 'bg-warm-200')}>
            <span className={cx('block w-5 h-5 rounded-full bg-white transition-transform', dark ? 'translate-x-4' : '')} />
          </span>
        </button>

        {/* Senha e biometria */}
        <SettingRow id="senha" icon={Lock} label="Senha e biometria" desc="Última troca há 2 meses · Face ID ativo" open={openRow === 'senha'} onToggle={() => toggleRow('senha')}>
          <div className="grid sm:grid-cols-2 gap-3">
            <input type="password" placeholder="Senha atual" className="bg-warm-100 dark:bg-warm-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-claro/40" />
            <input type="password" placeholder="Nova senha" className="bg-warm-100 dark:bg-warm-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-claro/40" />
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-[12px] font-bold flex items-center gap-2"><Fingerprint size={15} className="text-claro" /> Login por biometria (Face ID)</span>
            <Toggle on={biometria} onClick={() => setBiometria((v) => !v)} />
          </div>
          <button onClick={() => flashSaved('senha')} className="mt-3 text-xs font-bold rounded-full bg-claro text-white px-4 py-2 hover:bg-claro-dark transition-colors">Salvar</button>
          {saved === 'senha' && <SavedTag />}
        </SettingRow>

        {/* 2FA */}
        <SettingRow id="2fa" icon={ShieldCheck} label="Autenticação em 2 fatores" desc={`${[twoFA.sms && 'SMS', twoFA.email && 'E-mail', twoFA.app && 'App'].filter(Boolean).join(' + ') || 'Desativado'}`} open={openRow === '2fa'} onToggle={() => toggleRow('2fa')}>
          {([['sms', Smartphone, 'Código por SMS'], ['email', Mail, 'Código por e-mail'], ['app', KeyRound, 'App autenticador (TOTP)']] as const).map(([k, Ic, txt]) => (
            <div key={k} className="flex items-center justify-between py-2">
              <span className="text-[12px] font-bold flex items-center gap-2"><Ic size={15} className="text-warm-500" /> {txt}</span>
              <Toggle on={twoFA[k]} onClick={() => { setTwoFA((s) => ({ ...s, [k]: !s[k] })); flashSaved('2fa'); }} />
            </div>
          ))}
          {saved === '2fa' && <SavedTag />}
        </SettingRow>

        {/* Notificações */}
        <SettingRow id="notif" icon={Bell} label="Notificações" desc="Faturas, consumo, promoções, incidentes" open={openRow === 'notif'} onToggle={() => toggleRow('notif')}>
          {([['faturas', 'Faturas e pagamentos'], ['consumo', 'Alertas de consumo de dados'], ['promocoes', 'Promoções e ofertas'], ['incidentes', 'Incidentes técnicos na minha região']] as const).map(([k, txt]) => (
            <div key={k} className="flex items-center justify-between py-2">
              <span className="text-[12px] font-bold">{txt}</span>
              <Toggle on={notif[k]} onClick={() => { setNotif((s) => ({ ...s, [k]: !s[k] })); flashSaved('notif'); }} />
            </div>
          ))}
          {saved === 'notif' && <SavedTag />}
        </SettingRow>

        {/* Métodos de pagamento */}
        <SettingRow id="pgto" icon={CreditCard} label="Métodos de pagamento" desc="2 cartões + Pix configurados" open={openRow === 'pgto'} onToggle={() => toggleRow('pgto')}>
          <ul className="space-y-2">
            {[
              { t: 'Visa •••• 4821', s: 'Vence 08/28 · principal' },
              { t: 'Mastercard •••• 9037', s: 'Vence 02/27' },
              { t: 'Pix', s: 'Chave: CPF do titular' },
            ].map((p) => (
              <li key={p.t} className="flex items-center gap-3 bg-warm-50 dark:bg-warm-700/40 rounded-xl px-3 py-2.5">
                <CreditCard size={15} className="text-warm-500 shrink-0" />
                <div className="flex-1 min-w-0"><p className="text-[12px] font-bold truncate">{p.t}</p><p className="text-[10px] text-warm-500">{p.s}</p></div>
              </li>
            ))}
          </ul>
          <button onClick={() => flashSaved('pgto')} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold rounded-full border border-warm-200/70 dark:border-warm-600 px-4 py-2 hover:border-claro hover:text-claro transition-colors"><Plus size={13} /> Adicionar cartão</button>
          {saved === 'pgto' && <SavedTag />}
        </SettingRow>

        {/* Dependentes e PJ — contas reais do contexto */}
        <SettingRow id="deps" icon={Users} label="Dependentes e PJ" desc={`${accounts.length} contas vinculadas no combo`} open={openRow === 'deps'} onToggle={() => toggleRow('deps')}>
          <ul className="space-y-2">
            {accounts.map((a) => (
              <li key={a.id} className="flex items-center gap-3 bg-warm-50 dark:bg-warm-700/40 rounded-xl px-3 py-2.5">
                <div className="w-8 h-8 rounded-full bg-warm-200 dark:bg-warm-600 text-warm-700 dark:text-warm-100 flex items-center justify-center text-[10px] font-black shrink-0">{a.initials}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold truncate">{a.name} <span className="text-warm-400 font-normal">· {a.kind}</span></p>
                  <p className="text-[10px] text-warm-500 truncate">{a.plan}</p>
                </div>
                {a.active
                  ? <span className="text-[9px] font-bold uppercase tracking-wider bg-claro text-white rounded-full px-2 py-0.5 shrink-0">Ativa</span>
                  : <button onClick={() => switchAccount(a.id)} className="text-[10px] font-bold text-claro hover:underline shrink-0">Alternar</button>}
              </li>
            ))}
          </ul>
        </SettingRow>
      </div>
    </div>
  );
}

function SavedTag() {
  return <p className="mt-3 text-[12px] font-bold text-green-600 dark:text-green-400 flex items-center gap-1.5"><Check size={13} /> Alterações salvas</p>;
}

function SettingRow({
  id, icon: Icon, label, desc, open, onToggle, children,
}: {
  id: string; icon: typeof Lock; label: string; desc: string;
  open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div>
      <button
        aria-expanded={open}
        aria-controls={`row-${id}`}
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-warm-50 dark:hover:bg-warm-700 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-warm-100 dark:bg-warm-700 flex items-center justify-center shrink-0">
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold">{label}</p>
          <p className="text-[11px] text-warm-500 truncate">{desc}</p>
        </div>
        <ChevronDown size={16} className={cx('text-warm-400 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div id={`row-${id}`} className="px-5 pb-5 -mt-1 anim-in">
          {children}
        </div>
      )}
    </div>
  );
}
