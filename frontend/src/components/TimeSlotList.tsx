'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import type { components } from '@/lib/api-types';
import { BookingForm } from './BookingForm';

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
  onBookingSuccess: () => void;
}

export function TimeSlotList({
  eventTypeId,
  eventTypeName,
  timezone,
  selectedDate,
  slots,
  selectedSlot,
  onSlotSelect,
  onBookingSuccess,
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
        {dayLabel || 'Select a date'}
      </div>
      <div style={styles.slotList}>
        {daySlots.length === 0 && selectedDate && (
          <div style={styles.empty}>No slots available for this date.</div>
        )}
        {daySlots.map((slot) => {
          const timeLabel = dayjs(slot.startTime).tz(timezone).format('h:mm A');
          const isSelected = selectedSlot === slot.startTime;
          return (
            <div key={slot.startTime}>
              <button
                style={getSlotStyle(slot.available, isSelected)}
                disabled={!slot.available}
                onClick={() => {
                  if (slot.available) {
                    onSlotSelect(slot.startTime);
                  }
                }}
              >
                {isSelected ? (
                  <span style={styles.slotTimeSelected}>{timeLabel}</span>
                ) : (
                  <>
                    <span style={{
                      ...styles.dot,
                      backgroundColor: slot.available ? '#16A34A' : '#D4D4D4',
                    }} />
                    <span style={{
                      ...styles.slotTime,
                      color: slot.available ? '#1A1A1A' : '#8C8C8C',
                    }}>
                      {timeLabel}
                    </span>
                  </>
                )}
              </button>
              {isSelected && (
                <div style={styles.bookingForm}>
                  <BookingForm
                    eventTypeId={eventTypeId}
                    eventTypeName={eventTypeName}
                    startTime={selectedSlot!}
                    onSuccess={onBookingSuccess}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getSlotStyle(available: boolean, selected: boolean): React.CSSProperties {
  if (selected) {
    return {
      ...styles.slotButton,
      backgroundColor: '#1A1A1A',
      color: '#FFFFFF',
      border: '1px solid #1A1A1A',
      cursor: 'default',
    };
  }
  return {
    ...styles.slotButton,
    backgroundColor: '#FFFFFF',
    color: '#1A1A1A',
    border: '1px solid #E5E5E5',
    cursor: available ? 'pointer' : 'not-allowed',
    opacity: available ? 1 : 0.5,
  };
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
    color: '#1A1A1A',
    marginBottom: 16,
  },
  slotList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    overflowY: 'auto',
    maxHeight: 400,
    flex: 1,
  },
  slotButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '8px 12px',
    borderRadius: 8,
    fontSize: 14,
    transition: 'border-color 0.15s',
    textAlign: 'left' as const,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  slotTime: {
    lineHeight: 1,
  },
  slotTimeSelected: {
    lineHeight: 1,
    fontWeight: 500,
  },
  empty: {
    color: '#8C8C8C',
    fontSize: 14,
    textAlign: 'center',
    padding: 24,
  },
  bookingForm: {
    marginTop: 4,
  },
};
