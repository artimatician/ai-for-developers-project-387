'use client';

import { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useRouter } from 'next/navigation';
import type { components } from '@/lib/api-types';
import { Navbar } from './Navbar';
import { MeetingSummary } from './MeetingSummary';
import { CalendarGrid } from './CalendarGrid';
import { TimeSlotList } from './TimeSlotList';
import { DurationPicker } from './DurationPicker';
import { getSlots } from '@/lib/api';

dayjs.extend(utc);
dayjs.extend(timezone);

type EventType = components['schemas']['EventType'];
type TimeSlot = components['schemas']['TimeSlot'];

interface SchedulingPageProps {
  eventType: EventType;
  slots: TimeSlot[];
  initialDate?: string | null;
}

export function SchedulingPage({ eventType, slots: initialSlots, initialDate }: SchedulingPageProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string | null>(initialDate || null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');
  const [duration, setDuration] = useState<number>(eventType.duration ?? 30);
  const [slots, setSlots] = useState<TimeSlot[]>(initialSlots);

  const fetchSlots = useCallback(async (d: number) => {
    const s = await getSlots(eventType.id, d);
    setSlots(s);
  }, [eventType.id]);

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

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    setSelectedSlot(null);
    fetchSlots(newDuration);
  };

  const handleContinue = () => {
    if (!selectedSlot) return;
    router.push(`/book/${eventType.id}/confirm?startTime=${encodeURIComponent(selectedSlot)}&duration=${duration}&eventTypeName=${encodeURIComponent(eventType.name)}`);
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <Navbar variant="inner" />
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px' }}>
        <div className="scheduling-panel" style={{
          backgroundColor: '#FFFFFF', borderRadius: 16, border: '1px solid #E5E7EB',
          display: 'flex', overflow: 'hidden',
        }}>
        <div style={{ flex: '0 0 280px', padding: 32, borderRight: '1px solid #E5E7EB' }}>
          <MeetingSummary eventType={eventType} duration={duration} />
        </div>
        <div style={{ flex: '0 0 auto', minWidth: 320, padding: 32, borderRight: '1px solid #E5E7EB' }}>
          <CalendarGrid
            timezone={eventType.timezone}
            slots={slots}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </div>
        <div style={{ flex: 1, minWidth: 240, padding: 32, display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 20 }}>
            <DurationPicker
              value={duration}
              maxDuration={eventType.duration ?? 30}
              onChange={handleDurationChange}
            />
          </div>
          <TimeSlotList
            eventTypeId={eventType.id}
            eventTypeName={eventType.name}
            timezone={eventType.timezone}
            selectedDate={selectedDate}
            slots={slots}
            selectedSlot={selectedSlot}
            onSlotSelect={handleSlotSelect}
            onBack={() => window.history.back()}
            onContinue={handleContinue}
            timeFormat={timeFormat}
            onTimeFormatChange={setTimeFormat}
          />
        </div>
      </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .scheduling-panel { flex-direction: column !important; }
          .scheduling-panel > div { border-right: none !important; }
        }
      `}</style>
    </div>
  );
}
