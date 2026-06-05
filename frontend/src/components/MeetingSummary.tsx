'use client';

import { IconClock, IconWorld } from '@tabler/icons-react';

interface MeetingSummaryProps {
  eventType: { name: string; description: string; timezone: string };
}

export function MeetingSummary({ eventType }: MeetingSummaryProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', backgroundColor: '#27272A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 600, color: '#FAFAFA',
        }}>T</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#A1A1AA' }}>Tota</div>
          <div style={{ fontSize: 12, color: '#71717A' }}>Meeting host</div>
        </div>
      </div>

      <div style={{ height: 1, backgroundColor: '#27272A', marginBottom: 24 }} />

      <div style={{ fontSize: 24, fontWeight: 600, color: '#FAFAFA', marginBottom: 8 }}>
        {eventType.name}
      </div>
      <p style={{ fontSize: 14, color: '#A1A1AA', margin: 0, lineHeight: 1.5, marginBottom: 24 }}>
        {eventType.description}
      </p>

      <div style={{ height: 1, backgroundColor: '#27272A', marginBottom: 24 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <IconClock size={16} color="#71717A" />
          <span style={{ fontSize: 14, color: '#A1A1AA' }}>30 min</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <IconWorld size={16} color="#71717A" />
          <span style={{ fontSize: 14, color: '#A1A1AA' }}>{eventType.timezone}</span>
        </div>
      </div>
    </div>
  );
}
