'use client';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

interface MeetingSummaryProps {
  eventType: { id: string; name: string; description: string; timezone: string };
  selectedDate: string | null;
  selectedSlot: string | null;
  timezone: string;
}

export function MeetingSummary({ eventType, selectedDate, selectedSlot, timezone }: MeetingSummaryProps) {
  const dateLabel = selectedDate
    ? dayjs.tz(selectedDate, timezone).format('dddd, MMMM D, YYYY')
    : null;

  const timeLabel = selectedSlot
    ? `${dayjs(selectedSlot).tz(timezone).format('h:mm A')} – ${dayjs(selectedSlot).tz(timezone).add(30, 'minute').format('h:mm A')}`
    : null;

  return (
    <div style={{
      backgroundColor: '#FFFFFF', borderRadius: 14, border: '1px solid #E5E7EB',
      boxShadow: '0 1px 2px rgba(16,24,40,0.04)', padding: 24,
      display: 'flex', flexDirection: 'column', gap: 20, height: '100%',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', backgroundColor: '#F3F4F6',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 600, color: '#4B5563',
        }}>
          T
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Tota</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>Meeting host</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>{eventType.name}</span>
        <span style={{
          backgroundColor: '#F3F4F6', color: '#4B5563', fontSize: 12, fontWeight: 500,
          padding: '4px 10px', borderRadius: 999,
        }}>
          30 min
        </span>
      </div>

      <p style={{ fontSize: 14, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
        {eventType.description}
      </p>

      <div style={{ backgroundColor: '#F0F4FF', border: '1px solid #DDE6F5', borderRadius: 8, padding: '12px 16px' }}>
        <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Date</div>
        <div style={{ fontSize: 14, color: dateLabel ? '#111827' : '#9CA3AF' }}>
          {dateLabel || 'Select a date'}
        </div>
      </div>

      <div style={{ backgroundColor: '#F0F4FF', border: '1px solid #DDE6F5', borderRadius: 8, padding: '12px 16px' }}>
        <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Time</div>
        <div style={{ fontSize: 14, color: timeLabel ? '#111827' : '#9CA3AF' }}>
          {timeLabel || 'No time selected'}
        </div>
      </div>
    </div>
  );
}
