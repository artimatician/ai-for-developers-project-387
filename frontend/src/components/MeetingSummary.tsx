'use client';

import { IconClock, IconWorld } from '@tabler/icons-react';

interface MeetingSummaryProps {
  eventType: { name: string; description: string; timezone: string; duration?: number };
  duration?: number;
}

export function MeetingSummary({ eventType, duration }: MeetingSummaryProps) {
  const displayDuration = duration ?? eventType.duration ?? 30;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', backgroundColor: '#F3F4F6',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 600, color: '#6B7280',
        }}>T</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Tota</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>Meeting host</div>
        </div>
      </div>

      <div style={{ height: 1, backgroundColor: '#E5E7EB', marginBottom: 24 }} />

      <div style={{ fontSize: 24, fontWeight: 600, color: '#111827', marginBottom: 8 }}>
        {eventType.name}
      </div>
      <p style={{ fontSize: 14, color: '#6B7280', margin: 0, lineHeight: 1.5, marginBottom: 24 }}>
        {eventType.description}
      </p>

      <div style={{ height: 1, backgroundColor: '#E5E7EB', marginBottom: 24 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <IconClock size={16} color="#9CA3AF" />
          <span style={{ fontSize: 14, color: '#6B7280' }}>{displayDuration} min</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <IconWorld size={16} color="#9CA3AF" />
          <span style={{ fontSize: 14, color: '#6B7280' }}>{eventType.timezone}</span>
        </div>
      </div>
    </div>
  );
}
