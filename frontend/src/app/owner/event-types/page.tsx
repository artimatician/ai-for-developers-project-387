'use client';

import { useEffect, useState } from 'react';
import { Title } from '@mantine/core';
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

  if (loading) return <p>Loading...</p>;
  if (error) return <ErrorAlert message={error} onRetry={fetchData} />;

  return (
    <>
      <Title order={2} mb="lg">Event Types</Title>
      <OwnerEventTypesClient eventTypes={eventTypes} />
    </>
  );
}
