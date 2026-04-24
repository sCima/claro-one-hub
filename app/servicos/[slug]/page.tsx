'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { ServicePage } from '@/src/components/ServicePage';
import { getServiceBySlug } from '@/src/data/servicesCatalog';
import { useClaroContext } from '@/src/context/ClaroContext';

export default function ServiceDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { login } = useClaroContext();

  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const handleAccessHub = async () => {
    await login();
    router.push('/hub');
  };

  return <ServicePage service={service} onAccessHub={handleAccessHub} />;
}
