'use client';

import { useState } from 'react';
import { Group, Button, Paper, Text, Badge, Stack, Collapse } from '@mantine/core';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import type { components } from '@/lib/api-types';
import { BookingForm } from './BookingForm';

dayjs.extend(utc);
dayjs.extend(timezone);

type TimeSlot = components['schemas']['TimeSlot'];

interface SlotPickerProps {
  eventTypeId: string;
  eventTypeName: string;
  timezone: string;
  slots: TimeSlot[];
}

interface DayGroup {
  date: string;
  label: string;
  slots: TimeSlot[];
  hasAvailable: boolean;
}

function groupSlotsByDay(slots: TimeSlot[], tz: string): DayGroup[] {
  const groups: Record<string, TimeSlot[]> = {};
  for (const slot of slots) {
    const key = dayjs(slot.startTime).tz(tz).format('YYYY-MM-DD');
    if (!groups[key]) groups[key] = [];
    groups[key].push(slot);
  }
  return Object.entries(groups).map(([date, daySlots]) => ({
    date,
    label: dayjs(date).tz(tz).format('ddd, MMM D'),
    slots: daySlots,
    hasAvailable: daySlots.some((s) => s.available),
  }));
}

export function SlotPicker({ eventTypeId, eventTypeName, timezone, slots }: SlotPickerProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const days = groupSlotsByDay(slots, timezone);

  const handleSlotSelect = (startTime: string) => {
    setSelectedSlot(startTime === selectedSlot ? null : startTime);
  };

  const handleBookingSuccess = () => {
    setSelectedSlot(null);
  };

  return (
    <Stack>
      <Group gap="xs" wrap="wrap">
        {days.map((day) => (
          <Button
            key={day.date}
            variant={selectedDay === day.date ? 'filled' : 'outline'}
            color={day.hasAvailable ? 'blue' : 'gray'}
            onClick={() => {
              setSelectedDay(day.date);
              setSelectedSlot(null);
            }}
          >
            {day.label}
          </Button>
        ))}
      </Group>

      {selectedDay && (
        <Paper withBorder p="md">
          <Text fw={500} mb="sm">
            {days.find((d) => d.date === selectedDay)?.label}
          </Text>
          <Group gap="xs" wrap="wrap">
            {days
              .find((d) => d.date === selectedDay)
              ?.slots.map((slot) => (
                <Button
                  key={slot.startTime}
                  variant={selectedSlot === slot.startTime ? 'filled' : 'light'}
                  color={slot.available ? 'blue' : 'gray'}
                  disabled={!slot.available}
                  size="sm"
                  onClick={() => handleSlotSelect(slot.startTime)}
                >
                  {dayjs(slot.startTime).tz(timezone).format('HH:mm')}
                </Button>
              ))}
          </Group>
        </Paper>
      )}

      <Collapse in={!!selectedSlot}>
        {selectedSlot && (
          <BookingForm
            eventTypeId={eventTypeId}
            eventTypeName={eventTypeName}
            startTime={selectedSlot}
            onSuccess={handleBookingSuccess}
          />
        )}
      </Collapse>
    </Stack>
  );
}
