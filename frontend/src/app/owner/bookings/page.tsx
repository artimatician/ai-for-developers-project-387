'use client';

import { useEffect, useState } from 'react';
import { Title } from '@mantine/core';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { listBookings, listEventTypes } from '@/lib/api';
import { OwnerBookingsClient } from './OwnerBookingsClient';
import type { components } from '@/lib/api-types';
import { ErrorAlert } from '@/components/ErrorAlert';

type Booking = components['schemas']['Booking'];
type EventType = components['schemas']['EventType'];

function BookingsContent() {
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  const fetchData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      listBookings({
        eventTypeId: searchParams.get('eventTypeId') || undefined,
        from: searchParams.get('from') || undefined,
        to: searchParams.get('to') || undefined,
        limit,
        offset,
      }),
      listEventTypes(),
    ])
      .then(([b, et]) => {
        setBookings(b);
        setEventTypes(et);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [searchParams.toString()]);

  if (loading) return <p>Loading...</p>;
  if (error) return <ErrorAlert message={error} onRetry={fetchData} />;

  return (
    <>
      <Title order={2} mb="lg">Bookings</Title>
      <OwnerBookingsClient
        bookings={bookings}
        eventTypes={eventTypes}
        currentPage={page}
        filters={{
          eventTypeId: searchParams.get('eventTypeId') || undefined,
          from: searchParams.get('from') || undefined,
          to: searchParams.get('to') || undefined,
        }}
      />
    </>
  );
}

export default function OwnerBookingsPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <BookingsContent />
    </Suspense>
  );
}
