'use client';

import { useEffect, useState } from 'react';
import { Container, Title } from '@mantine/core';
import { listEventTypes } from '@/lib/api';
import { OwnerEventTypesClient } from './OwnerEventTypesClient';
import type { components } from '@/lib/api-types';
import { ErrorAlert } from '@/components/ErrorAlert';

type EventType = components['schemas']['EventType'];

export default function OwnerEventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    listEventTypes()
      .then(setEventTypes)
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
      <Title order={2} mb="lg">Event Types</Title>
      <OwnerEventTypesClient eventTypes={eventTypes} />
    </Container>
  );
}
