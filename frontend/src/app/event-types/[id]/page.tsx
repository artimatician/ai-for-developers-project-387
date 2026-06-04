'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { getActiveEventType, getSlots } from '@/lib/api';
import { SchedulingCard } from '@/components/SchedulingCard';
import type { components } from '@/lib/api-types';
import { ErrorAlert } from '@/components/ErrorAlert';

type EventType = components['schemas']['EventType'];
type TimeSlot = components['schemas']['TimeSlot'];

export default function EventTypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    Promise.all([getActiveEventType(id), getSlots(id)])
      .then(([et, sl]) => {
        setEventType(et);
        setSlots(sl);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 16px' }}>
        <div style={{
          height: 480,
          borderRadius: 12,
          backgroundColor: '#E5E5E5',
          animation: 'pulse 1.5s infinite',
        }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 16px' }}>
        <ErrorAlert message={error} onRetry={fetchData} />
      </div>
    );
  }

  if (!eventType) return null;

  return <SchedulingCard eventType={eventType} slots={slots} />;
}