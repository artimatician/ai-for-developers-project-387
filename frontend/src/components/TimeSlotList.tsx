'use client';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Group, Button } from '@mantine/core';
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

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        {dayLabel ? `Available times — ${dayLabel}` : 'Select a date'}
      </div>
      <div style={styles.slotList}>
        {daySlots.length === 0 && selectedDate && (
          <div style={styles.empty}>No time slots available for this date.</div>
        )}
        {daySlots.map((slot) => {
          const timeLabel = `${dayjs(slot.startTime).tz(timezone).format('h:mm A')} – ${dayjs(slot.endTime).tz(timezone).format('h:mm A')}`;
          const isSelected = selectedSlot === slot.startTime;
          return (
            <div
              key={slot.startTime}
              onClick={() => {
                if (slot.available) onSlotSelect(slot.startTime);
              }}
              style={{
                ...styles.slotItem,
                backgroundColor: isSelected ? '#FFF7ED' : '#FFFFFF',
                borderColor: isSelected ? '#FDBA74' : '#E5E7EB',
                cursor: slot.available ? 'pointer' : 'not-allowed',
                opacity: slot.available ? 1 : 0.5,
              }}
            >
              <span style={{ fontSize: 14, color: isSelected ? '#C2410C' : '#111827' }}>
                {timeLabel}
              </span>
              <span style={{ fontSize: 12, color: slot.available ? '#16A34A' : '#9CA3AF' }}>
                {slot.available ? 'Free' : 'Busy'}
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        <Group justify="space-between">
          <Button variant="outline" onClick={onBack} style={{ borderRadius: 8, borderColor: '#E5E7EB', color: '#111827' }}>
            Back
          </Button>
          <Button
            onClick={onContinue}
            disabled={!selectedSlot}
            style={{
              backgroundColor: '#F97316', color: '#FFFFFF', borderRadius: 8,
              opacity: selectedSlot ? 1 : 0.5,
            }}
          >
            Continue
          </Button>
        </Group>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    fontSize: 16,
    fontWeight: 600,
    color: '#111827',
    marginBottom: 16,
  },
  slotList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    overflowY: 'auto',
    flex: 1,
  },
  slotItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    transition: 'background 0.15s, border-color 0.15s',
  },
  empty: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    padding: 24,
  },
};
