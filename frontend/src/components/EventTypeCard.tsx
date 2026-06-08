'use client';

import { useRouter } from 'next/navigation';
import { IconCalendarEvent } from '@tabler/icons-react';
import type { components } from '@/lib/api-types';

type PublicEventType = components['schemas']['PublicEventType'];

interface EventTypeCardProps {
  eventType: PublicEventType;
}

export function EventTypeCard({ eventType }: EventTypeCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/book/${eventType.id}`)}
      style={{
        backgroundColor: '#FFFFFF', borderRadius: 10,
        border: '1px solid #E5E7EB',
        borderLeft: '3px solid #F97316',
        boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
        padding: '16px 20px',
        cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#D1D5DB';
        e.currentTarget.style.borderLeft = '3px solid #F97316';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(16,24,40,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#E5E7EB';
        e.currentTarget.style.borderLeft = '3px solid #F97316';
        e.currentTarget.style.boxShadow = '0 1px 2px rgba(16,24,40,0.04)';
      }}
    >
      <div style={{ display: 'flex', gap: 14 }}>
        <div style={{ flexShrink: 0, paddingTop: 2 }}>
          <IconCalendarEvent size={20} color="#F97316" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>{eventType.name}</h3>
            <span style={{
              backgroundColor: '#F3F4F6', color: '#4B5563', fontSize: 12, fontWeight: 500,
              padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap', marginLeft: 8,
            }}>
              {eventType.duration ?? 30} min
            </span>
          </div>
          <p style={{ fontSize: 14, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
            {eventType.description}
          </p>
        </div>
      </div>
    </div>
  );
}
