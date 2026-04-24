'use client';

import { motion } from 'framer-motion';
import { LayoutDashboard, Smartphone, Wifi, Tv, FileText, Headphones, Settings } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

type SectionId = 'dashboard' | 'mobile' | 'broadband' | 'tv' | 'invoices' | 'support' | 'settings';

const NAV_ITEMS: { id: SectionId; icon: LucideIcon; label: string }[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'mobile',    icon: Smartphone,      label: 'Móvel'     },
  { id: 'broadband', icon: Wifi,            label: 'Fixo'      },
  { id: 'tv',        icon: Tv,              label: 'TV+'       },
  { id: 'invoices',  icon: FileText,        label: 'Faturas'   },
  { id: 'support',   icon: Headphones,      label: 'Suporte'   },
  { id: 'settings',  icon: Settings,        label: 'Config.'   },
];

interface Props {
  activeSection: SectionId;
  onSectionChange: (id: SectionId) => void;
}

export function Sidebar({ activeSection, onSectionChange }: Props) {
  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed left-0 top-16 bottom-0 w-16 sm:w-56 bg-white border-r border-gray-100 flex flex-col py-6 z-40"
    >
      <nav className="flex flex-col gap-1 px-2 sm:px-3">
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
          const active = activeSection === id;
          return (
            <button
              key={id}
              onClick={() => onSectionChange(id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium
                ${active
                  ? 'bg-[#D52B1E] text-white'
                  : 'text-[#ADAFAF] hover:bg-gray-50 hover:text-gray-800'
                }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
              <span className="hidden sm:block">{label}</span>
            </button>
          );
        })}
      </nav>
    </motion.aside>
  );
}

export type { SectionId };
