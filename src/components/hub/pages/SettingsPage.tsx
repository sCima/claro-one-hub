'use client';

import { useState } from 'react';
import {
  Sun, Moon, ChevronRight, KeyRound, RefreshCw, MessageSquare,
  Lock, ShieldCheck, Bell, CreditCard, Users, Download, Trash2, FileText,
} from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { useClaroContext } from '../../../context/ClaroContext';
import { channelsUsed, CANAL_LABEL } from '../../../services/session';
import { intentLabel } from '../../../services/claraNlu';

const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');
const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const ICON_MAP: Record<string, LucideIcon> = { Lock, ShieldCheck, Bell, CreditCard, Users };

const settings = [
  { icon: 'Lock',        label: 'Senha e biometria',      desc: 'Última troca há 2 meses · Face ID ativo' },
  { icon: 'ShieldCheck', label: 'Autenticação 2 fatores', desc: 'SMS + e-mail · Ativo' },
  { icon: 'Bell',        label: 'Notificações',           desc: 'Faturas, consumo, promoções' },
  { icon: 'CreditCard',  label: 'Métodos de pagamento',   desc: '2 cartões + Pix configurados' },
  { icon: 'Users',       label: 'Dependentes e PJ',       desc: '4 contas vinculadas no combo' },
];

export function SettingsPage() {
  const {
    user, dark, toggleDark,
    session, sessionTokenPayload, sessionSecondsLeft,
    claraConsent, revokeClaraConsent, exportMyData, deleteMyConversations,
  } = useClaroContext();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleted, setDeleted] = useState(false);

  if (!user) return null;

  const canais = session ? channelsUsed(session) : [];

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

      <div className="bg-white dark:bg-warm-800 border border-warm-200/70 dark:border-warm-700 rounded-3xl p-7 flex items-center gap-5 flex-wrap">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-claro to-claro-dark text-white flex items-center justify-center text-xl font-black">
          {user.initials}
        </div>
        <div className="flex-1 min-w-[200px]">
          <p className="text-xl font-black">{user.name}</p>
          <p className="text-sm text-warm-500">{user.email}</p>
          <p className="text-[11px] text-warm-400 mt-1">
            CPF {user.cpf} · Cliente desde {user.since.split('-')[0]}
          </p>
        </div>
        <button className="text-xs font-bold rounded-full bg-warm-900 text-white dark:bg-warm-50 dark:text-warm-900 px-5 py-2.5">
          Editar perfil
        </button>
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

        {settings.map(s => {
          const Icon = ICON_MAP[s.icon];
          return (
            <button
              key={s.label}
              className="w-full flex items-center gap-4 p-5 text-left hover:bg-warm-50 dark:hover:bg-warm-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-warm-100 dark:bg-warm-700 flex items-center justify-center">
                {Icon && <Icon size={18} />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">{s.label}</p>
                <p className="text-[11px] text-warm-500">{s.desc}</p>
              </div>
              <ChevronRight size={16} className="text-warm-400" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
