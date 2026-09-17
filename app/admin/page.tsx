'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminPanel } from '@/src/components/admin/AdminPanel';
import { useClaroContext } from '@/src/context/ClaroContext';

export default function AdminPage() {
  const router = useRouter();
  const { isLoggedIn, adminRole, adminAuthResolved } = useClaroContext();

  /* Sem sessão de admin (nunca logou ou acabou de deslogar): manda para a
   * tela de login nova/unificada (/login), a mesma usada pelo cliente. */
  useEffect(() => {
    if (adminAuthResolved && !adminRole) router.replace('/login');
  }, [adminAuthResolved, adminRole, router]);

  if (!adminAuthResolved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50 dark:bg-warm-900">
        <div className="w-10 h-10 rounded-full border-4 border-warm-200 border-t-claro animate-spin" />
      </div>
    );
  }
  if (!adminRole) return null;
  return <AdminPanel onExit={() => router.push(isLoggedIn ? '/hub' : '/login')} />;
}
