import { Navbar } from '@/components/Navbar';
import { IconClipboardText, IconCalendarEvent, IconCircleCheck } from '@tabler/icons-react';
import Link from 'next/link';

const steps = [
  {
    icon: IconClipboardText,
    number: 1,
    title: 'Pick an event type',
    description: 'Browse the available meeting types and choose the one that fits your needs. Each type has a duration and description to help you decide.',
  },
  {
    icon: IconCalendarEvent,
    number: 2,
    title: 'Choose a date & time',
    description: 'Select a date from the calendar and pick an available time slot. You\'ll see only the times that work for both you and the host.',
  },
  {
    icon: IconCircleCheck,
    number: 3,
    title: 'Confirm your booking',
    description: 'Fill in your details and confirm. You\'ll receive an instant confirmation — no back-and-forth emails, no waiting for approval.',
  },
];

export default function HowItWorksPage() {
  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <Navbar variant="landing" />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h1 style={{ fontSize: 48, fontWeight: 600, color: '#111827', letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0, marginBottom: 16 }}>
            How it works
          </h1>
          <p style={{ fontSize: 16, color: '#6B7280', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
            Booking a meeting takes just three simple steps. No account required.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 80 }}>
          {steps.map((step) => (
            <div
              key={step.number}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 14,
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
                padding: 28,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
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
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0, marginBottom: 8 }}>
                {step.title}
              </h3>
              <p style={{ fontSize: 14, color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link
            href="/book"
            style={{
              display: 'inline-block',
              backgroundColor: '#111827',
              color: '#FFFFFF',
              borderRadius: 8,
              padding: '12px 24px',
              fontSize: 15,
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Start booking →
          </Link>
        </div>
      </div>
    </div>
  );
}
