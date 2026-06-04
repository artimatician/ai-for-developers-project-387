'use client';

import { useState } from 'react';
import { TextInput, Textarea, Button, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/navigation';
import { createBooking } from '@/lib/api';
import { ApiError } from '@/lib/api-error';

interface BookingFormProps {
  eventTypeId: string;
  eventTypeName: string;
  startTime: string;
}

export function BookingForm({ eventTypeId, eventTypeName, startTime }: BookingFormProps) {
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
    <div style={{
      backgroundColor: '#FFFFFF', borderRadius: 14, border: '1px solid #E5E7EB',
      boxShadow: '0 1px 2px rgba(16,24,40,0.04)', padding: 28,
    }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111827', margin: 0, marginBottom: 8 }}>
        Confirm your booking
      </h2>
      <p style={{ fontSize: 14, color: '#6B7280', margin: 0, marginBottom: 24, lineHeight: 1.5 }}>
        Enter your details to book {eventTypeName}.
      </p>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          {error && (
            <div style={{
              backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8,
              padding: '10px 14px', fontSize: 14, color: '#DC2626',
            }}>
              {error}
            </div>
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
          <Button
            type="submit"
            loading={submitting}
            fullWidth
            style={{ backgroundColor: '#F97316', color: '#FFFFFF', borderRadius: 8 }}
          >
            Confirm Booking
          </Button>
        </Stack>
      </form>
    </div>
  );
}
