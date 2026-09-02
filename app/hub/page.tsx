'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dashboard } from '@/src/components/Dashboard';
import { useClaroContext } from '@/src/context/ClaroContext';

export default function HubPage() {
  const router = useRouter();
  const { isLoggedIn, authResolved, logout } = useClaroContext();

  useEffect(() => {
    if (authResolved && !isLoggedIn) router.replace('/login');
  }, [authResolved, isLoggedIn, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  /* Enquanto o app checa se há sessão salva, não pisca a tela de login */
  if (!authResolved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50 dark:bg-warm-900">
        <div className="w-10 h-10 rounded-full border-4 border-warm-200 border-t-claro animate-spin" />
      </div>
    );
  }
  if (!isLoggedIn) return null;
  return <Dashboard onLogout={handleLogout} />;
}
