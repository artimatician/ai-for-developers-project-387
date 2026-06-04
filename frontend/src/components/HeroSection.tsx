'use client';

import { Paper, Button, Text } from '@mantine/core';
import { IconClipboardText, IconCalendarEvent, IconCircleCheck, IconSparkles } from '@tabler/icons-react';
import Link from 'next/link';

const steps = [
  {
    icon: IconClipboardText,
    number: 1,
    title: 'Pick an event type',
    description:
      'Browse the available meeting types and choose the one that fits your needs. Each type has a duration and description to help you decide.',
  },
  {
    icon: IconCalendarEvent,
    number: 2,
    title: 'Choose a date & time',
    description:
      "Select a date from the calendar and pick an available time slot. You'll see only the times that work for both you and the host.",
  },
  {
    icon: IconCircleCheck,
    number: 3,
    title: 'Confirm your booking',
    description:
      "Fill in your details and confirm. You'll receive an instant confirmation — no back-and-forth emails, no waiting for approval.",
  },
];

export function HeroSection() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
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

        <h1
          style={{
            fontSize: 56,
            fontWeight: 600,
            color: '#111827',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            margin: 0,
            marginBottom: 20,
            maxWidth: 720,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Effortless meeting scheduling
        </h1>

        <Text
          style={{
            fontSize: 16,
            color: '#6B7280',
            maxWidth: 480,
            lineHeight: 1.6,
            marginBottom: 32,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Book meetings without the back-and-forth. Share your availability and let others pick a time that works.
        </Text>

        <Button
          component={Link}
          href="/book"
          style={{ backgroundColor: '#111827', color: '#FFFFFF', borderRadius: 8 }}
        >
          Start booking →
        </Button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h2
          style={{
            fontSize: 36,
            fontWeight: 600,
            color: '#111827',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            margin: 0,
            marginBottom: 12,
          }}
        >
          How it works
        </h2>
        <Text style={{ fontSize: 16, color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
          Booking a meeting takes just three simple steps. No account required.
        </Text>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {steps.map((step) => (
          <div
            key={step.number}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 14,
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
              padding: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 20,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <step.icon size={24} color="#111827" />
              <span
                style={{
                  backgroundColor: '#F3F4F6',
                  color: '#4B5563',
                  fontSize: 12,
                  fontWeight: 500,
                  padding: '4px 10px',
                  borderRadius: 999,
                }}
              >
                Step {step.number}
              </span>
            </div>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0, marginBottom: 4 }}>
                {step.title}
              </h3>
              <p style={{ fontSize: 14, color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
