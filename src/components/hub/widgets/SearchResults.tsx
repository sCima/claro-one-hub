'use client';

import { useMemo } from 'react';
import {
  Search, FileText, Smartphone, Wifi, Tv, Phone, Gift, HelpCircle, ArrowRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Service, Invoice, ClubeData } from '../../../data/mockData';
import { faqs } from '../../../data/mockData';
import type { SectionId } from '../HubSidebar';

const fmtBRL = (n: number) => n.toFixed(2).replace('.', ',');

interface SearchHit {
  id: string;
  group: 'Serviços' | 'Faturas' | 'Clube' | 'FAQ';
  icon: LucideIcon;
  title: string;
  subtitle: string;
  action: () => void;
}

interface Props {
  query: string;
  services: Service[];
  invoices: Invoice[];
  clube: ClubeData | null;
  onNavigate: (page: SectionId) => void;
  onClose: () => void;
  onAskClara?: (q: string) => void;
}

const SERVICE_TYPE_ICON = { mobile: Smartphone, broadband: Wifi, tv: Tv, fixo: Phone } as const;
const SERVICE_TYPE_PAGE: Record<string, SectionId> = {
  mobile: 'mobile', broadband: 'internet', tv: 'tv', fixo: 'voice',
};

export function SearchResults({ query, services, invoices, clube, onNavigate, onClose, onAskClara }: Props) {
  const q = query.trim().toLowerCase();

  const hits = useMemo<SearchHit[]>(() => {
    if (q.length < 2) return [];
    const out: SearchHit[] = [];

    /* Serviços */
    for (const s of services) {
      if (
        s.label.toLowerCase().includes(q) ||
        s.plan.toLowerCase().includes(q) ||
        s.type.includes(q)
      ) {
        out.push({
          id: 's-' + s.id,
          group: 'Serviços',
          icon: SERVICE_TYPE_ICON[s.type as keyof typeof SERVICE_TYPE_ICON] ?? Smartphone,
          title: s.label,
          subtitle: `${s.plan} · R$ ${fmtBRL(s.amount)}/mês`,
          action: () => { onNavigate(SERVICE_TYPE_PAGE[s.type] ?? 'overview'); onClose(); },
        });
      }
    }

    /* Faturas */
    for (const i of invoices) {
      if (
        i.month.toLowerCase().includes(q) ||
        i.status.toLowerCase().includes(q) ||
        ('fatura'.includes(q))
      ) {
        out.push({
          id: 'i-' + i.id,
          group: 'Faturas',
          icon: FileText,
          title: `Fatura ${i.month}`,
          subtitle: `R$ ${fmtBRL(i.amount)} · ${i.status === 'paid' ? 'Paga' : 'Em aberto'}`,
          action: () => { onNavigate('invoices'); onClose(); },
        });
      }
    }

    /* Clube / recompensas */
    if (clube) {
      for (const r of clube.rewards) {
        if (r.label.toLowerCase().includes(q) || r.category.toLowerCase().includes(q) || 'clube'.includes(q) || 'pontos'.includes(q)) {
          out.push({
            id: 'r-' + r.id,
            group: 'Clube',
            icon: Gift,
            title: r.label,
            subtitle: `${r.cost.toLocaleString('pt-BR')} pts · ${r.category}`,
            action: () => { onNavigate('clube'); onClose(); },
          });
        }
      }
    }

    /* FAQ */
    for (const f of faqs) {
      if (f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)) {
        out.push({
          id: 'f-' + f.id,
          group: 'FAQ',
          icon: HelpCircle,
          title: f.q,
          subtitle: f.a.length > 80 ? f.a.slice(0, 80) + '…' : f.a,
          action: () => { onNavigate('support'); onClose(); },
        });
      }
    }

    return out.slice(0, 12);
  }, [q, services, invoices, clube, onNavigate, onClose]);

  if (q.length < 2) return null;

  /* Agrupar por categoria */
  const grouped = hits.reduce((acc, hit) => {
    (acc[hit.group] ??= []).push(hit);
    return acc;
  }, {} as Record<string, SearchHit[]>);

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-warm-800 border border-warm-200/70 dark:border-warm-700 rounded-2xl shadow-2xl overflow-hidden anim-in z-50 max-h-[70vh] overflow-y-auto">
      {hits.length === 0 ? (
        <div className="p-6 text-center">
          <Search size={20} className="mx-auto text-warm-400 mb-2" />
          <p className="text-sm font-bold text-warm-600 dark:text-warm-200">
            Nada encontrado para “{query}”
          </p>
          <p className="text-[11px] text-warm-400 mt-1">
            Tente buscar por “fatura”, “internet”, “pontos” ou “5G”.
          </p>
          {onAskClara && (
            <button
              onClick={() => { onAskClara(query); onClose(); }}
              className="mt-4 inline-flex items-center gap-2 text-xs font-bold rounded-full px-4 py-2 bg-claro text-white hover:bg-claro-dark transition-colors"
            >
              Perguntar à Clara <ArrowRight size={12} />
            </button>
          )}
        </div>
      ) : (
        <>
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-warm-400">
                {group}
              </p>
              <ul>
                {items.map((hit) => {
                  const Icon = hit.icon;
                  return (
                    <li key={hit.id}>
                      <button
                        onClick={hit.action}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-warm-50 dark:hover:bg-warm-700/60 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-warm-100 dark:bg-warm-700 flex items-center justify-center text-warm-600 dark:text-warm-200 shrink-0">
                          <Icon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-warm-900 dark:text-warm-50 truncate">{hit.title}</p>
                          <p className="text-[11px] text-warm-500 truncate">{hit.subtitle}</p>
                        </div>
                        <ArrowRight size={12} className="text-warm-400 shrink-0" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          {onAskClara && (
            <div className="border-t border-warm-100 dark:border-warm-700 p-2">
              <button
                onClick={() => { onAskClara(query); onClose(); }}
                className="w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-xl text-claro hover:bg-claro-soft dark:hover:bg-claro/10 transition-colors"
              >
                Perguntar à Clara sobre “{query}”
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
