'use client';

import { useEffect, useState } from 'react';
import { Container, Title } from '@mantine/core';
import { listActiveEventTypes } from '@/lib/api';
import type { components } from '@/lib/api-types';
import { ErrorAlert } from '@/components/ErrorAlert';
import { EventTypeList } from '@/components/EventTypeList';

type PublicEventType = components['schemas']['PublicEventType'];

export default function HomePage() {
  const [eventTypes, setEventTypes] = useState<PublicEventType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    listActiveEventTypes()
      .then(setEventTypes)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Title order={1} mb="lg">Available Event Types</Title>
        <p>Loading...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="lg" py="xl">
        <ErrorAlert message={error} onRetry={fetchData} />
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="lg" style={{ color: '#1A1A1A' }}>
        Available Event Types
      </Title>
      <EventTypeList eventTypes={eventTypes} />
    </Container>
  );
}