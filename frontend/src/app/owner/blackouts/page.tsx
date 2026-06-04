'use client';

import { useEffect, useState } from 'react';
import { Container, Title } from '@mantine/core';
import { listBlackouts } from '@/lib/api';
import { OwnerBlackoutsClient } from './OwnerBlackoutsClient';
import type { components } from '@/lib/api-types';
import { ErrorAlert } from '@/components/ErrorAlert';

type Blackout = components['schemas']['Blackout'];

export default function OwnerBlackoutsPage() {
  const [blackouts, setBlackouts] = useState<Blackout[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    listBlackouts()
      .then(setBlackouts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <Container><p>Loading...</p></Container>;
  if (error) return <Container><ErrorAlert message={error} onRetry={fetchData} /></Container>;

  return (
    <Container>
      <Title order={2} mb="lg">Blackouts</Title>
      <OwnerBlackoutsClient blackouts={blackouts} />
    </Container>
  );
}
