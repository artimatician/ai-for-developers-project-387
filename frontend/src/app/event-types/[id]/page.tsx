'use client';

import { useEffect, useState } from 'react';
import { Container, Title, Badge, Group } from '@mantine/core';
import { use } from 'react';
import { getActiveEventType, getSlots } from '@/lib/api';
import { SlotPicker } from '@/components/SlotPicker';
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
      <Container size="lg" py="xl">
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

  if (!eventType) return null;

  return (
    <Container size="lg" py="xl">
      <Group mb="xl">
        <Title order={1}>{eventType.name}</Title>
        <Badge variant="light" size="lg">
          {eventType.timezone}
        </Badge>
      </Group>
      <SlotPicker
        eventTypeId={eventType.id}
        eventTypeName={eventType.name}
        timezone={eventType.timezone}
        slots={slots}
      />
    </Container>
  );
}
