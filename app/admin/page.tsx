'use client';

import { useRouter } from 'next/navigation';
import { AdminPanel } from '@/src/components/admin/AdminPanel';
import { useClaroContext } from '@/src/context/ClaroContext';

export default function AdminPage() {
  const router = useRouter();
  const { isLoggedIn } = useClaroContext();

  /* Sem guarda de isLoggedIn: o acesso é controlado pelo AdminGate (RBAC)
   * dentro do AdminPanel. Um administrador pode entrar direto por /login. */
  return <AdminPanel onExit={() => router.push(isLoggedIn ? '/hub' : '/login')} />;
}
