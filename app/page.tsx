'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LandingPage } from '@/src/components/LandingPage';
import { LoadingScreen } from '@/src/components/ui/LoadingScreen';
import { useClaroContext } from '@/src/context/ClaroContext';

export default function Home() {
  const router = useRouter();
  const { login } = useClaroContext();
  const [booting, setBooting] = useState(true);

  const handleLogin = async () => {
    await login();
    router.push('/hub');
  };

  return (
    <>
      {booting && <LoadingScreen onComplete={() => setBooting(false)} />}
      <LandingPage onLogin={handleLogin} />
    </>
  );
}
