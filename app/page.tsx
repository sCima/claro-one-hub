'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { LandingPage } from '@/src/components/LandingPage';
import { LoadingScreen } from '@/src/components/ui/LoadingScreen';
import { useClaroContext } from '@/src/context/ClaroContext';

export default function Home() {
  const router = useRouter();
  const { login } = useClaroContext();
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    // garantia mínima de exibição (caso onAnimationComplete falhe em algum browser)
    const t = setTimeout(() => setBooting(false), 2400);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = async () => {
    await login();
    router.push('/hub');
  };

  return (
    <>
      <AnimatePresence>
        {booting && <LoadingScreen onComplete={() => setBooting(false)} />}
      </AnimatePresence>
      <LandingPage onLogin={handleLogin} />
    </>
  );
}
