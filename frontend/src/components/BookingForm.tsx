'use client';

import { useState } from 'react';
import { Box, TextInput, Textarea, Button, Stack, Text, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { createBooking } from '@/lib/api';
import { ApiError } from '@/lib/api-error';

interface BookingFormProps {
  eventTypeId: string;
  eventTypeName: string;
  startTime: string;
  onSuccess: () => void;
}

export function BookingForm({ eventTypeId, eventTypeName, startTime, onSuccess }: BookingFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm({
    initialValues: {
      guestName: '',
      notes: '',
    },
    validate: {
      guestName: (v) => (v.trim().length > 0 ? null : 'Guest name is required'),
      notes: (v) => (v.length <= 1000 ? null : 'Notes must be 1000 characters or less'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await createBooking({
        eventTypeId,
        startTime,
        guestName: values.guestName,
        notes: values.notes || undefined,
      });
      onSuccess();
      const params = new URLSearchParams({
        startTime: result.startTime,
        endTime: result.endTime,
        eventTypeName: result.eventTypeName,
      });
      router.push(`/bookings/confirm?${params.toString()}`);
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 409) {
          setError('This slot was just booked by someone else. Please choose another.');
          router.refresh();
        } else {
          setError(e.message);
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box mt="sm" p="sm" style={{ border: '1px solid #E5E5E5', borderRadius: 8 }}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Text fw={500}>Book this slot</Text>
          {error && (
            <Text c="red" size="sm">
              {error}
            </Text>
          )}
          <TextInput
            label="Your name"
            placeholder="Enter your name"
            required
            {...form.getInputProps('guestName')}
          />
          <Textarea
            label="Notes (optional)"
            placeholder="Any additional information"
            maxLength={1000}
            {...form.getInputProps('notes')}
          />
          <Group justify="flex-end">
            <Button type="submit" loading={submitting}>
              Confirm Booking
            </Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );
}
