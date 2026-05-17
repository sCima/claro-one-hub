'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminPanel } from '@/src/components/admin/AdminPanel';
import { useClaroContext } from '@/src/context/ClaroContext';

export default function AdminPage() {
  const router = useRouter();
  const { isLoggedIn } = useClaroContext();

  useEffect(() => {
    if (!isLoggedIn) router.replace('/');
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;
  return <AdminPanel onExit={() => router.push('/hub')} />;
}
