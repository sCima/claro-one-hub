'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dashboard } from '@/src/components/Dashboard';
import { useClaroContext } from '@/src/context/ClaroContext';

export default function HubPage() {
  const router = useRouter();
  const { isLoggedIn, logout } = useClaroContext();

  useEffect(() => {
    if (!isLoggedIn) router.replace('/');
  }, [isLoggedIn, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isLoggedIn) return null;
  return <Dashboard onLogout={handleLogout} />;
}
