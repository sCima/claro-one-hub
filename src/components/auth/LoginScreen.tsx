'use client';

/* ─────────────────────────────────────────────────────────────────────────────
 * One Hub · Tela de login (Documento §7 — controle de acesso: cliente /
 * atendente / administrador). Alterna entre o login do CLIENTE (portal) e o
 * login do ADMINISTRADOR (One Hub Admin) na própria tela.
 * ───────────────────────────────────────────────────────────────────────────── */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  User as UserIcon, ShieldCheck, Lock, Mail, ArrowRight, ArrowLeft,
  AlertTriangle, Headset, LayoutDashboard, Loader2,
} from 'lucide-react';
import { useClaroContext } from '../../context/ClaroContext';
import { mockUser, ADMIN_USERS } from '../../data/mockData';

const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');
type Mode = 'cliente' | 'admin';

export function LoginScreen() {
  const router = useRouter();
  const { login, adminLogin } = useClaroContext();
  const [mode, setMode] = useState<Mode>('cliente');

  /* cliente */
  const [cId, setCId] = useState(mockUser.email);
  const [cPwd, setCPwd] = useState('claro2026');
  const [busy, setBusy] = useState(false);

  /* admin */
  const [aEmail, setAEmail] = useState('');
  const [aPwd, setAPwd] = useState('');
  const [aErr, setAErr] = useState(false);

  const submitCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !cId.trim() || !cPwd.trim()) return;
    setBusy(true);
    await login();               // protótipo: aceita qualquer credencial
    router.push('/hub');
  };

  const submitAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const role = adminLogin(aEmail, aPwd);
    if (role) router.push('/admin');
    else setAErr(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-warm-900 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-[32rem] h-[32rem] rounded-full bg-claro/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-[28rem] h-[28rem] rounded-full bg-claro/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <Image src="/logo-texto-branco.png" alt="Claro" width={90} height={32} className="h-7 w-auto object-contain" />
          <span className="text-white/30 text-xl font-thin">×</span>
          <span className="text-sm font-black uppercase tracking-[0.18em] bg-white/10 text-white rounded-full px-3 py-1.5">
            One Hub
          </span>
        </div>

        <div className="bg-white dark:bg-warm-800 rounded-3xl shadow-2xl p-8">
          {/* Alternador Cliente / Administrador */}
          <div className="flex bg-warm-100 dark:bg-warm-700 rounded-full p-1 text-[12px] font-bold mb-6">
            <button
              onClick={() => setMode('cliente')}
              className={cx('flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-full transition-colors',
                mode === 'cliente' ? 'bg-white dark:bg-warm-800 text-warm-900 dark:text-warm-50 shadow-sm' : 'text-warm-500')}
            >
              <UserIcon size={13} /> Cliente
            </button>
            <button
              onClick={() => setMode('admin')}
              className={cx('flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-full transition-colors',
                mode === 'admin' ? 'bg-white dark:bg-warm-800 text-warm-900 dark:text-warm-50 shadow-sm' : 'text-warm-500')}
            >
              <ShieldCheck size={13} /> Administrador
            </button>
          </div>

          {mode === 'cliente' ? (
            <>
              <div className="w-12 h-12 rounded-2xl bg-claro-soft dark:bg-claro/15 flex items-center justify-center mb-5">
                <UserIcon size={20} className="text-claro" />
              </div>
              <h1 className="text-2xl font-black tracking-tight">Acessar meu One Hub</h1>
              <p className="text-sm text-warm-500 mt-1 mb-6">
                Entre com seu CPF ou e-mail para ver faturas, serviços e falar com a Clara.
              </p>
              <form onSubmit={submitCliente} className="space-y-3">
                <Field icon={Mail} type="text" value={cId} onChange={setCId} placeholder="CPF ou e-mail" autoComplete="username" />
                <Field icon={Lock} type="password" value={cPwd} onChange={setCPwd} placeholder="Senha" autoComplete="current-password" />
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-claro text-white font-bold rounded-xl py-3 text-sm hover:bg-claro-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {busy ? <><Loader2 size={15} className="animate-spin" /> Entrando…</> : <>Entrar <ArrowRight size={15} /></>}
                </button>
              </form>
              <p className="mt-4 text-[11px] text-warm-400 bg-warm-50 dark:bg-warm-700/40 rounded-xl px-3 py-2">
                Protótipo · qualquer credencial é aceita. Sugerido: <span className="font-mono">{mockUser.email}</span>
              </p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-claro-soft dark:bg-claro/15 flex items-center justify-center mb-5">
                <Lock size={20} className="text-claro" />
              </div>
              <h1 className="text-2xl font-black tracking-tight">One Hub Admin · RBAC</h1>
              <p className="text-sm text-warm-500 mt-1 mb-6">
                Console de atendimento com controle de acesso por papel.
              </p>
              <form onSubmit={submitAdmin} className="space-y-3">
                <Field icon={Mail} type="email" value={aEmail} onChange={(v) => { setAEmail(v); setAErr(false); }} placeholder="E-mail corporativo" autoComplete="username" />
                <Field icon={Lock} type="password" value={aPwd} onChange={(v) => { setAPwd(v); setAErr(false); }} placeholder="Senha" autoComplete="current-password" />
                {aErr && (
                  <p className="text-[12px] text-claro font-bold flex items-center gap-1.5">
                    <AlertTriangle size={13} /> Credenciais inválidas ou sem permissão.
                  </p>
                )}
                <button type="submit" className="w-full bg-claro text-white font-bold rounded-xl py-3 text-sm hover:bg-claro-dark transition-colors">
                  Entrar no console
                </button>
              </form>
              <div className="mt-5 grid grid-cols-2 gap-2 text-[11px]">
                {ADMIN_USERS.map((u) => (
                  <button
                    key={u.email}
                    type="button"
                    onClick={() => { setAEmail(u.email); setAPwd(u.password); setAErr(false); }}
                    className="p-3 rounded-xl bg-warm-50 dark:bg-warm-700/40 text-left hover:ring-2 hover:ring-claro/30 transition-shadow"
                  >
                    <p className="font-bold text-warm-600 dark:text-warm-300 flex items-center gap-1.5 mb-1">
                      {u.role === 'gerente' ? <LayoutDashboard size={12} /> : <Headset size={12} />}
                      {u.role === 'gerente' ? 'Gerente' : 'Atendente'}
                    </p>
                    <p className="text-warm-500 leading-tight break-all">{u.email}</p>
                    <p className="text-warm-500">senha <span className="font-mono font-bold">{u.password}</span></p>
                  </button>
                ))}
              </div>
            </>
          )}

          <Link
            href="/"
            className="w-full mt-6 text-xs font-bold text-warm-500 hover:text-warm-900 dark:hover:text-warm-50 flex items-center justify-center gap-1.5"
          >
            <ArrowLeft size={13} /> Voltar ao site
          </Link>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon, type, value, onChange, placeholder, autoComplete,
}: {
  icon: typeof Mail; type: string; value: string;
  onChange: (v: string) => void; placeholder: string; autoComplete?: string;
}) {
  return (
    <div className="flex items-center gap-2 bg-warm-100 dark:bg-warm-700 rounded-xl px-3.5 focus-within:ring-2 focus-within:ring-claro/40">
      <Icon size={15} className="text-warm-400 shrink-0" />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-warm-400"
      />
    </div>
  );
}
