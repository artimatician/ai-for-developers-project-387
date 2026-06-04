'use client';

import { useEffect, useState } from 'react';
import { Text } from '@mantine/core';
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ height: 80, backgroundColor: '#E5E5E5', borderRadius: 10 }} />
          <div style={{ height: 80, backgroundColor: '#E5E5E5', borderRadius: 10 }} />
          <div style={{ height: 80, backgroundColor: '#E5E5E5', borderRadius: 10 }} />
        </div>
      );
    }
    if (error) return <ErrorAlert message={error} onRetry={fetchData} />;
    if (eventTypes.length === 0) return <Text ta="center" c="#6B7280" py="xl">No event types available yet.</Text>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {eventTypes.map((et) => <EventTypeCard key={et.id} eventType={et} />)}
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <Navbar variant="inner" />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px' }}>
        <ProfileIntroCard />
        <div style={{ marginTop: 8 }}>{content()}</div>
      </div>
    </div>
  );
}
