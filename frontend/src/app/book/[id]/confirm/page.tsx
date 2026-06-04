'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { getActiveEventType } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { BookingForm } from '@/components/BookingForm';
import { ErrorAlert } from '@/components/ErrorAlert';
import type { components } from '@/lib/api-types';

dayjs.extend(utc);
dayjs.extend(timezone);

type EventType = components['schemas']['EventType'];

export default function ConfirmBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const startTime = searchParams.get('startTime');
  const eventTypeName = searchParams.get('eventTypeName') || 'Event';

  const [eventType, setEventType] = useState<EventType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveEventType(id)
      .then(setEventType)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (!startTime) {
    return (
      <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
        <Navbar variant="inner" />
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px' }}>
          <ErrorAlert message="Missing booking details. Please go back and select a time slot." />
        </div>
      </div>
    );
  }

  const tz = eventType?.timezone || 'UTC';
  const dateLabel = dayjs(startTime).tz(tz).format('dddd, MMMM D, YYYY');
  const timeLabel = `${dayjs(startTime).tz(tz).format('h:mm A')} – ${dayjs(startTime).tz(tz).add(30, 'minute').format('h:mm A')}`;

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <Navbar variant="inner" />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px' }}>
        <Link
          href={`/book/${id}`}
          style={{ fontSize: 14, color: '#6B7280', textDecoration: 'none', display: 'inline-block', marginBottom: 24 }}
        >
          ← Back
        </Link>

        {loading && (
          <div style={{ height: 300, backgroundColor: '#E5E5E5', borderRadius: 14 }} />
        )}

        {error && (
          <ErrorAlert message={error} onRetry={() => window.location.reload()} />
        )}

        {!loading && !error && (
          <>
            <div style={{
              backgroundColor: '#FFFFFF', borderRadius: 14, border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(16,24,40,0.04)', padding: 24, marginBottom: 20,
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827', margin: 0, marginBottom: 16 }}>
                {eventTypeName}
              </h2>
              <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
                <div style={{ backgroundColor: '#F0F4FF', border: '1px solid #DDE6F5', borderRadius: 8, padding: '12px 16px' }}>
                  <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Date</div>
                  <div style={{ fontSize: 14, color: '#111827' }}>{dateLabel}</div>
                </div>
                <div style={{ backgroundColor: '#F0F4FF', border: '1px solid #DDE6F5', borderRadius: 8, padding: '12px 16px' }}>
                  <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Time</div>
                  <div style={{ fontSize: 14, color: '#111827' }}>{timeLabel}</div>
                </div>
                <div style={{ backgroundColor: '#F0F4FF', border: '1px solid #DDE6F5', borderRadius: 8, padding: '12px 16px' }}>
                  <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Timezone</div>
                  <div style={{ fontSize: 14, color: '#111827' }}>{tz}</div>
                </div>
              </div>
            </div>

            <BookingForm
              eventTypeId={id}
              eventTypeName={eventTypeName}
              startTime={startTime}
            />
          </>
        )}
      </div>
    </div>
  );
}
