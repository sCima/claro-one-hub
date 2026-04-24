'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Instagram, Youtube, Twitter, Linkedin } from 'lucide-react';
import { servicesCatalog } from '../../data/servicesCatalog';

const SOCIAL = [
  { icon: Instagram, label: 'Instagram' },
  { icon: Facebook,  label: 'Facebook'  },
  { icon: Youtube,   label: 'YouTube'   },
  { icon: Twitter,   label: 'X'         },
  { icon: Linkedin,  label: 'LinkedIn'  },
];

export function SiteFooter() {
  const byCategory: Record<string, typeof servicesCatalog> = {};
  servicesCatalog.forEach((s) => {
    byCategory[s.category] = byCategory[s.category] ?? [];
    byCategory[s.category].push(s);
  });

  return (
    <footer className="bg-[#0A0A0A] text-white/70 text-sm">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 lg:grid-cols-5 gap-10">
        <div className="col-span-2 lg:col-span-1">
          <Image src="/logo-texto-branco.png" alt="Claro" width={90} height={36} className="h-9 w-auto mb-6" />
          <p className="text-xs leading-relaxed text-white/50 mb-4">
            Operadora com a maior cobertura 5G do Brasil e melhor fibra óptica do país, segundo Anatel 2025.
          </p>
          <div className="flex gap-2">
            {SOCIAL.map(({ icon: Icon, label }) => (
              <a
                key={label} aria-label={label} href="#"
                className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Icon className="w-4 h-4" strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>

        {Object.entries(byCategory).map(([cat, list]) => (
          <div key={cat}>
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">{cat}</h4>
            <ul className="space-y-2.5">
              {list.map((s) => (
                <li key={s.slug}>
                  <Link className="hover:text-white transition-colors" href={`/servicos/${s.slug}`}>
                    {s.brand}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">Atendimento</h4>
          <ul className="space-y-2.5">
            <li><a href="#" className="hover:text-white transition-colors">*1052 (celular)</a></li>
            <li><a href="#" className="hover:text-white transition-colors">106 36 (residencial)</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Chat WhatsApp</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Central de ajuda</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Encontre uma loja</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-white/40">
          <p>© 2026 Claro S.A. · CNPJ 40.432.544/0001-47 · Todos os direitos reservados.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white">Privacidade</a>
            <a href="#" className="hover:text-white">Termos de uso</a>
            <a href="#" className="hover:text-white">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
