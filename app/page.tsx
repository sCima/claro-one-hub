'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LandingPage } from '@/src/components/LandingPage';
import { LoadingScreen } from '@/src/components/ui/LoadingScreen';

export default function Home() {
  const router = useRouter();
  const [booting, setBooting] = useState(true);

  return (
    <>
      {booting && <LoadingScreen onComplete={() => setBooting(false)} />}
      <LandingPage onLogin={() => router.push('/login')} />
    </>
  );
}
