'use client';

import { useState } from 'react';
import {
  Table,
  Select,
  Group,
  Text,
  Pagination,
  Stack,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import type { components } from '@/lib/api-types';

dayjs.extend(utc);

type Booking = components['schemas']['Booking'];
type EventType = components['schemas']['EventType'];

interface OwnerBookingsClientProps {
  bookings: Booking[];
  eventTypes: EventType[];
  currentPage: number;
  filters: {
    eventTypeId?: string;
    from?: string;
    to?: string;
  };
}

export function OwnerBookingsClient({
  bookings,
  eventTypes,
  currentPage,
  filters,
}: OwnerBookingsClientProps) {
  const router = useRouter();
  const [eventTypeId, setEventTypeId] = useState<string | null>(filters.eventTypeId || null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    filters.from ? new Date(filters.from) : null,
    filters.to ? new Date(filters.to) : null,
  ]);

  const updateFilters = (etId: string | null, range: [Date | null, Date | null]) => {
    const params = new URLSearchParams();
    if (etId) params.set('eventTypeId', etId);
    if (range[0]) params.set('from', range[0].toISOString());
    if (range[1]) params.set('to', range[1].toISOString());
    const qs = params.toString();
    router.push(`/owner/bookings${qs ? `?${qs}` : ''}`);
  };

  return (
    <Stack>
      <Group>
        <Select
          label="Event Type"
          placeholder="All"
          data={eventTypes.map((et) => ({ value: et.id, label: et.name }))}
          value={eventTypeId}
          onChange={(v) => {
            setEventTypeId(v);
            updateFilters(v, dateRange);
          }}
          clearable
          style={{ minWidth: 200 }}
        />
        <DatePickerInput
          label="Date Range"
          type="range"
          placeholder="Pick dates"
          value={dateRange}
          onChange={(v) => {
            setDateRange(v);
            updateFilters(eventTypeId, v);
          }}
          clearable
          style={{ minWidth: 250 }}
        />
      </Group>

      {bookings.length === 0 ? (
        <div style={{ padding: '40px 24px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, border: '1px solid #E5E7EB' }}>
          <Text size="sm" c="#6B7280">No bookings found. Bookings will appear here once guests start scheduling.</Text>
        </div>
      ) : (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 10, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ color: '#6B7280', fontWeight: 600, fontSize: 12 }}>Event Type</Table.Th>
                <Table.Th style={{ color: '#6B7280', fontWeight: 600, fontSize: 12 }}>Guest</Table.Th>
                <Table.Th style={{ color: '#6B7280', fontWeight: 600, fontSize: 12 }}>Start</Table.Th>
                <Table.Th style={{ color: '#6B7280', fontWeight: 600, fontSize: 12 }}>End</Table.Th>
                <Table.Th style={{ color: '#6B7280', fontWeight: 600, fontSize: 12 }}>Notes</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {bookings.map((b) => (
                <Table.Tr key={b.id}>
                  <Table.Td style={{ color: '#111827', fontWeight: 500 }}>{b.eventTypeName}</Table.Td>
                  <Table.Td style={{ color: '#111827' }}>{b.guestName}</Table.Td>
                  <Table.Td style={{ color: '#6B7280' }}>
                    {dayjs(b.startTime).format('MMM D, YYYY h:mm A')}
                  </Table.Td>
                  <Table.Td style={{ color: '#6B7280' }}>
                    {dayjs(b.endTime).format('MMM D, YYYY h:mm A')}
                  </Table.Td>
                  <Table.Td style={{ color: '#6B7280' }}>{b.notes || '—'}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      )}

      <Pagination
        total={currentPage + 1}
        value={currentPage}
        onChange={(p) => {
          const params = new URLSearchParams();
          if (filters.eventTypeId) params.set('eventTypeId', filters.eventTypeId);
          if (filters.from) params.set('from', filters.from);
          if (filters.to) params.set('to', filters.to);
          if (p > 1) params.set('page', String(p));
          const qs = params.toString();
          router.push(`/owner/bookings${qs ? `?${qs}` : ''}`);
        }}
      />
    </Stack>
  );
}
