'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import type { Lead } from '@/components/LeadMap';

const LeadMap = dynamic(() => import('@/components/LeadMap'), { ssr: false });

export default function Home() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'hair salons in Toronto' }),
    })
      .then((res) => res.json())
      .then((data) => setLeads(data.leads ?? []))
      .catch(() => setError('Could not reach the API'));
  }, []);

  return (
    <main style={{ height: '100vh' }}>
      {error && <p>{error}</p>}
      <LeadMap leads={leads} />
    </main>
  );
}