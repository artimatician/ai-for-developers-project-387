'use client';

import { useEffect, useState, useMemo } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import type { components } from '@/lib/api-types';
import { EventInfo } from './EventInfo';
import { CalendarGrid } from './CalendarGrid';
import { TimeSlotList } from './TimeSlotList';

dayjs.extend(utc);
dayjs.extend(timezone);

type EventType = components['schemas']['EventType'];
type TimeSlot = components['schemas']['TimeSlot'];

interface SchedulingCardProps {
  eventType: EventType;
  slots: TimeSlot[];
}

export function SchedulingCard({ eventType, slots }: SchedulingCardProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  useEffect(() => {
    if (slots.length > 0 && !selectedDate) {
      const firstAvailable = slots.find((s) => s.available);
      if (firstAvailable) {
        const dateKey = dayjs(firstAvailable.startTime).tz(eventType.timezone).format('YYYY-MM-DD');
        setSelectedDate(dateKey);
      }
    }
  }, [slots, eventType.timezone]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (startTime: string) => {
    setSelectedSlot(startTime === selectedSlot ? null : startTime);
  };

  const handleBookingSuccess = () => {
    setSelectedSlot(null);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.columnLeft}>
          <EventInfo eventType={eventType} />
        </div>
        <div style={styles.columnCenter}>
          <CalendarGrid
            timezone={eventType.timezone}
            slots={slots}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </div>
        <div style={styles.columnRight}>
          <TimeSlotList
            eventTypeId={eventType.id}
            eventTypeName={eventType.name}
            timezone={eventType.timezone}
            selectedDate={selectedDate}
            slots={slots}
            selectedSlot={selectedSlot}
            onSlotSelect={handleSlotSelect}
            onBookingSuccess={handleBookingSuccess}
          />
        </div>
      </div>
      <div style={styles.brand}>Schedule a Call</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    maxWidth: 960,
    margin: '0 auto',
    padding: '40px 16px',
  },
  card: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    border: '1px solid #E5E5E5',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    overflow: 'hidden',
    minHeight: 480,
  },
  columnLeft: {
    width: 240,
    borderRight: '1px solid #E5E5E5',
    padding: 24,
    flexShrink: 0,
  },
  columnCenter: {
    width: 320,
    borderRight: '1px solid #E5E5E5',
    padding: 24,
    flexShrink: 0,
  },
  columnRight: {
    flex: 1,
    padding: 24,
    overflowY: 'auto',
    maxHeight: 560,
    minWidth: 0,
  },
  brand: {
    textAlign: 'center',
    color: '#8C8C8C',
    fontSize: 12,
    marginTop: 16,
  },
};
