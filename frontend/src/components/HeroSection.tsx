'use client';

import { Paper, Group, Button, Text } from '@mantine/core';
import { IconSparkles, IconCheck } from '@tabler/icons-react';
import Link from 'next/link';
import { BookingMockup } from './BookingMockup';

export function HeroSection() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 64, alignItems: 'center' }}>
        <div>
          <Paper
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#F3F4F6',
              padding: '4px 12px',
              borderRadius: 999,
              marginBottom: 24,
            }}
          >
            <IconSparkles size={12} color="#6B7280" />
            <Text size="xs" fw={500} c="#6B7280">Scheduling made simple</Text>
          </Paper>

          <h1 style={{ fontSize: 56, fontWeight: 600, color: '#111827', letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0, marginBottom: 20 }}>
            The better way to schedule meetings
          </h1>

          <Text style={{ fontSize: 16, color: '#6B7280', maxWidth: 480, lineHeight: 1.6, marginBottom: 32 }}>
            Book meetings without the back-and-forth. Share your availability and let others pick a time that works.
          </Text>

          <Group gap={12} mb={40}>
            <Button
              component={Link}
              href="/book"
              style={{ backgroundColor: '#111827', color: '#FFFFFF', borderRadius: 8 }}
            >
              Start booking →
            </Button>
            <Button
              variant="outline"
              style={{ borderColor: '#E5E7EB', color: '#111827', borderRadius: 8 }}
            >
              Learn more
            </Button>
          </Group>

          <Group gap={24}>
            {['No sign-up required', 'Instant confirmation', 'Free to use'].map((item) => (
              <Group key={item} gap={6}>
                <IconCheck size={16} color="#16A34A" />
                <Text size="sm" c="#6B7280">{item}</Text>
              </Group>
            ))}
          </Group>
        </div>

        <div>
          <BookingMockup />
        </div>
      </div>
    </div>
  );
}
