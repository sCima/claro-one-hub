'use client';

import {
  Sun, Moon, ChevronRight,
  Lock, ShieldCheck, Bell, CreditCard, Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useClaroContext } from '../../../context/ClaroContext';

const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');

const ICON_MAP: Record<string, LucideIcon> = { Lock, ShieldCheck, Bell, CreditCard, Users };

const settings = [
  { icon: 'Lock',        label: 'Senha e biometria',      desc: 'Última troca há 2 meses · Face ID ativo' },
  { icon: 'ShieldCheck', label: 'Autenticação 2 fatores', desc: 'SMS + e-mail · Ativo' },
  { icon: 'Bell',        label: 'Notificações',           desc: 'Faturas, consumo, promoções' },
  { icon: 'CreditCard',  label: 'Métodos de pagamento',   desc: '2 cartões + Pix configurados' },
  { icon: 'Users',       label: 'Dependentes e PJ',       desc: '4 contas vinculadas no combo' },
];

export function SettingsPage() {
  const { user, dark, toggleDark } = useClaroContext();

  if (!user) return null;

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
