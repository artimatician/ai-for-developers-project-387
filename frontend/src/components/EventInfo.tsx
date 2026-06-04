'use client';

import { IconClock, IconVideo, IconWorld } from '@tabler/icons-react';
import type { components } from '@/lib/api-types';

type EventType = components['schemas']['EventType'];

interface EventInfoProps {
  eventType: EventType;
}

export function EventInfo({ eventType }: EventInfoProps) {
  return (
    <div style={styles.container}>
      <div style={styles.avatar}>
        AM
      </div>
      <div style={styles.hostName}>Alex Morgan</div>
      <h1 style={styles.title}>{eventType.name}</h1>
      <div style={styles.divider} />
      <div style={styles.row}>
        <IconClock size={16} style={styles.icon} />
        <span style={styles.rowText}>30 min</span>
      </div>
      <div style={styles.row}>
        <IconVideo size={16} style={styles.icon} />
        <span style={styles.rowText}>Google Meet</span>
      </div>
      <div style={styles.row}>
        <IconWorld size={16} style={styles.icon} />
        <span style={styles.rowText}>{eventType.timezone}</span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    backgroundColor: '#F0F0F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: 16,
    color: '#5C5C5C',
    marginBottom: 4,
  },
  hostName: {
    fontSize: 14,
    color: '#8C8C8C',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1A1A1A',
    margin: 0,
    lineHeight: 1.2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    margin: '8px 0',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    color: '#5C5C5C',
  },
  icon: {
    flexShrink: 0,
    color: '#8C8C8C',
  },
  rowText: {
    lineHeight: 1,
  },
};
