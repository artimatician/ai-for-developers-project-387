'use client';
import { useEffect, useState } from 'react';
import { Container, SimpleGrid, Text } from '@mantine/core';
import { Navbar } from '@/components/Navbar';
import { ProfileIntroCard } from '@/components/ProfileIntroCard';
import { EventTypeCard } from '@/components/EventTypeCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { listActiveEventTypes } from '@/lib/api';
import type { components } from '@/lib/api-types';

type PublicEventType = components['schemas']['PublicEventType'];

export default function BookPage() {
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

  useEffect(() => { fetchData(); }, []);

  const content = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ height: 160, backgroundColor: '#E5E5E5', borderRadius: 16 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ height: 120, backgroundColor: '#E5E5E5', borderRadius: 14 }} />
            <div style={{ height: 120, backgroundColor: '#E5E5E5', borderRadius: 14 }} />
          </div>
        </div>
      );
    }
    if (error) return <ErrorAlert message={error} onRetry={fetchData} />;
    if (eventTypes.length === 0) return <Text ta="center" c="#6B7280" py="xl">No event types available yet.</Text>;
    return (
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={16}>
        {eventTypes.map((et) => <EventTypeCard key={et.id} eventType={et} />)}
      </SimpleGrid>
    );
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <Navbar variant="inner" />
      <Container size={820} py={48}>
        <ProfileIntroCard />
        <div style={{ marginTop: 24 }}>{content()}</div>
      </Container>
    </div>
  );
}
