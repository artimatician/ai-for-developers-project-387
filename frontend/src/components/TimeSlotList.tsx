'use client';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import type { components } from '@/lib/api-types';

dayjs.extend(utc);
dayjs.extend(timezone);

type TimeSlot = components['schemas']['TimeSlot'];

interface TimeSlotListProps {
  eventTypeId: string;
  eventTypeName: string;
  timezone: string;
  selectedDate: string | null;
  slots: TimeSlot[];
  selectedSlot: string | null;
  onSlotSelect: (startTime: string) => void;
  onBack: () => void;
  onContinue: () => void;
  timeFormat: '12h' | '24h';
  onTimeFormatChange: (fmt: '12h' | '24h') => void;
}

export function TimeSlotList({
  eventTypeId,
  eventTypeName,
  timezone,
  selectedDate,
  slots,
  selectedSlot,
  onSlotSelect,
  onBack,
  onContinue,
  timeFormat,
  onTimeFormatChange,
}: TimeSlotListProps) {
  const daySlots = selectedDate
    ? slots.filter((s) => {
        const key = dayjs(s.startTime).tz(timezone).format('YYYY-MM-DD');
        return key === selectedDate;
      })
    : [];

  const dayLabel = selectedDate
    ? dayjs.tz(selectedDate, timezone).format('dddd, MMMM D')
    : null;

  const fmt = timeFormat === '12h' ? 'h:mm A' : 'HH:mm';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>
          {dayLabel || 'Select a date'}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => onTimeFormatChange('12h')}
            style={{
              fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 999,
              backgroundColor: timeFormat === '12h' ? '#111827' : 'transparent',
              color: timeFormat === '12h' ? '#FFFFFF' : '#9CA3AF',
              border: `1px solid ${timeFormat === '12h' ? '#111827' : '#E5E7EB'}`,
              cursor: 'pointer', lineHeight: '18px',
            }}
          >12h</button>
          <button
            onClick={() => onTimeFormatChange('24h')}
            style={{
              fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 999,
              backgroundColor: timeFormat === '24h' ? '#111827' : 'transparent',
              color: timeFormat === '24h' ? '#FFFFFF' : '#9CA3AF',
              border: `1px solid ${timeFormat === '24h' ? '#111827' : '#E5E7EB'}`,
              cursor: 'pointer', lineHeight: '18px',
            }}
          >24h</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', flex: 1, maxHeight: 424 }}>
        {daySlots.length === 0 && selectedDate && (
          <div style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center', padding: 24 }}>
            No time slots available for this date.
          </div>
        )}
        {daySlots.map((slot) => {
          const isSelected = selectedSlot === slot.startTime;
          const label = dayjs(slot.startTime).tz(timezone).format(fmt);
          return (
            <div
              key={slot.startTime}
              onClick={() => slot.available && onSlotSelect(slot.startTime)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '10px 14px', borderRadius: 10,
                border: `1px solid ${isSelected ? '#111827' : '#E5E7EB'}`,
                backgroundColor: isSelected ? '#F3F4F6' : 'transparent',
                cursor: slot.available ? 'pointer' : 'not-allowed',
                opacity: slot.available ? 1 : 0.35,
                color: '#111827',
                fontWeight: isSelected ? 500 : 400,
                fontSize: 14,
                transition: 'border-color 0.15s, background-color 0.15s',
              }}
            >{label}</div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        <button onClick={onBack} style={{
          padding: '8px 16px', borderRadius: 8, border: '1px solid #E5E7EB',
          backgroundColor: 'transparent', color: '#6B7280', fontSize: 14, fontWeight: 500, cursor: 'pointer',
        }}>Back</button>
        <button
          onClick={onContinue}
          disabled={!selectedSlot}
          style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            backgroundColor: '#111827', color: '#FFFFFF', fontSize: 14, fontWeight: 500,
            cursor: selectedSlot ? 'pointer' : 'not-allowed',
            opacity: selectedSlot ? 1 : 0.4,
          }}
        >Continue</button>
      </div>
    </div>
  );
}
