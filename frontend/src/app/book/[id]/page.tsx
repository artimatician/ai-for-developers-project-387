'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import { getActiveEventType, getSlots } from '@/lib/api';
import { SchedulingPage } from '@/components/SchedulingPage';
import { ErrorAlert } from '@/components/ErrorAlert';
import type { components } from '@/lib/api-types';

type EventType = components['schemas']['EventType'];
type TimeSlot = components['schemas']['TimeSlot'];

export default function BookEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const initialDate = searchParams.get('date');

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

  useEffect(() => { fetchData(); }, [id]);

  if (loading) {
    return (
      <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ flex: 1, height: 400, backgroundColor: '#E5E5E5', borderRadius: 14 }} />
            <div style={{ flex: '0 0 320px', height: 400, backgroundColor: '#E5E5E5', borderRadius: 14 }} />
            <div style={{ flex: 1, height: 400, backgroundColor: '#E5E5E5', borderRadius: 14 }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
          <ErrorAlert message={error} onRetry={fetchData} />
        </div>
      </div>
    );
  }

  if (!eventType) return null;

  return <SchedulingPage eventType={eventType} slots={slots} initialDate={initialDate} />;
}
