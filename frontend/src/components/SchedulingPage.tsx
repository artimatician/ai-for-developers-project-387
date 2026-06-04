'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useRouter } from 'next/navigation';
import type { components } from '@/lib/api-types';
import { Navbar } from './Navbar';
import { MeetingSummary } from './MeetingSummary';
import { CalendarGrid } from './CalendarGrid';
import { TimeSlotList } from './TimeSlotList';

dayjs.extend(utc);
dayjs.extend(timezone);

type EventType = components['schemas']['EventType'];
type TimeSlot = components['schemas']['TimeSlot'];

interface SchedulingPageProps {
  eventType: EventType;
  slots: TimeSlot[];
  initialDate?: string | null;
}

export function SchedulingPage({ eventType, slots, initialDate }: SchedulingPageProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string | null>(initialDate || null);
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

  const handleContinue = () => {
    if (!selectedSlot) return;
    router.push(`/book/${eventType.id}/confirm?startTime=${encodeURIComponent(selectedSlot)}&eventTypeName=${encodeURIComponent(eventType.name)}`);
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <Navbar variant="inner" />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        <div className="scheduling-layout" style={{ display: 'flex', gap: 20, alignItems: 'stretch' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <MeetingSummary
              eventType={eventType}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              timezone={eventType.timezone}
            />
          </div>
          <div style={{ flex: '0 0 320px' }}>
            <div style={{
              backgroundColor: '#FFFFFF', borderRadius: 14, border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(16,24,40,0.04)', padding: 24,
            }}>
              <CalendarGrid
                timezone={eventType.timezone}
                slots={slots}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
              />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{
              backgroundColor: '#FFFFFF', borderRadius: 14, border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(16,24,40,0.04)', padding: 24,
              display: 'flex', flexDirection: 'column', height: '100%',
            }}>
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
              />
            </div>
          </div>
        </div>
        <style>{`
          @media (max-width: 900px) {
            .scheduling-layout { flex-direction: column !important; }
          }
        `}</style>
      </div>
    </div>
  );
}
