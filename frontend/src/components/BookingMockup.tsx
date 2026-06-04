'use client';

import { useEffect, useState, useMemo } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { listActiveEventTypes, getActiveEventType, getSlots } from '@/lib/api';
import type { components } from '@/lib/api-types';
import { useRouter } from 'next/navigation';

dayjs.extend(utc);
dayjs.extend(timezone);

type PublicEventType = components['schemas']['PublicEventType'];
type EventType = components['schemas']['EventType'];
type TimeSlot = components['schemas']['TimeSlot'];

export function BookingMockup() {
  const router = useRouter();
  const [eventTypes, setEventTypes] = useState<PublicEventType[]>([]);
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(dayjs.utc().month());
  const [currentYear, setCurrentYear] = useState(dayjs.utc().year());

  useEffect(() => {
    listActiveEventTypes()
      .then(async (types) => {
        setEventTypes(types);
        if (types.length > 0) {
          const et = await getActiveEventType(types[0].id);
          setEventType(et);
          const sl = await getSlots(types[0].id);
          setSlots(sl);
          const firstAvail = sl.find(s => s.available);
          if (firstAvail) {
            setSelectedDate(dayjs(firstAvail.startTime).tz(et.timezone).format('YYYY-MM-DD'));
          }
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const tz = eventType?.timezone || 'UTC';

  const availableDates = useMemo(() => {
    const avail = new Set<string>();
    for (const slot of slots) {
      if (slot.available) {
        avail.add(dayjs(slot.startTime).tz(tz).format('YYYY-MM-DD'));
      }
    }
    return avail;
  }, [slots, tz]);

  const daySlots = useMemo(() => {
    if (!selectedDate) return [];
    return slots.filter(s => {
      const key = dayjs(s.startTime).tz(tz).format('YYYY-MM-DD');
      return key === selectedDate && s.available;
    });
  }, [slots, selectedDate, tz]);

  const firstOfMonth = dayjs.tz(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`, tz);
  const startDayOfWeek = firstOfMonth.day();
  const daysInMonth = firstOfMonth.daysInMonth();

  const cells: { day: number; dateKey: string | null }[] = [];
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    cells.push({ day: firstOfMonth.subtract(1, 'month').daysInMonth() - i, dateKey: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = dayjs.tz(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, tz).format('YYYY-MM-DD');
    cells.push({ day: d, dateKey });
  }
  while (cells.length < 42) {
    const day = cells.length - startDayOfWeek - daysInMonth + 1;
    cells.push({ day, dateKey: null });
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(16,24,40,0.04)', padding: 24, height: 340 }} />
    );
  }

  if (error || eventTypes.length === 0) {
    return (
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(16,24,40,0.04)', padding: 24, textAlign: 'center', color: '#6B7280', fontSize: 14 }}>
        {error ? 'Unable to load availability' : 'No event types available yet'}
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#FFFFFF', borderRadius: 16, border: '1px solid #E5E7EB',
      boxShadow: '0 1px 2px rgba(16,24,40,0.04)', padding: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button
          style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); } else { setCurrentMonth(m => m - 1); } }}
        >
          &lt;
        </button>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{firstOfMonth.format('MMMM YYYY')}</span>
        <button
          style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); } else { setCurrentMonth(m => m + 1); } }}
        >
          &gt;
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, color: '#6B7280', fontWeight: 500, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 16 }}>
        {cells.map((cell, i) => {
          const isAvail = cell.dateKey && availableDates.has(cell.dateKey);
          const isSel = cell.dateKey === selectedDate;
          let bg = 'transparent';
          let color = '#D1D5DB';
          let cursor = 'default';
          if (cell.dateKey) {
            color = isAvail ? '#111827' : '#9CA3AF';
            cursor = isAvail ? 'pointer' : 'default';
          }
          if (isSel) {
            bg = '#FFF7ED';
            color = '#C2410C';
          }
          return (
            <div
              key={i}
              onClick={() => { if (isAvail && cell.dateKey) setSelectedDate(cell.dateKey); }}
              style={{
                width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, borderRadius: 8, cursor, backgroundColor: bg, color,
                border: isSel ? '1px solid #FDBA74' : '1px solid transparent',
              }}
            >
              {cell.day}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {daySlots.slice(0, 4).map(slot => (
          <button
            key={slot.startTime}
            onClick={() => router.push(`/book/${eventType!.id}?date=${selectedDate}&time=${dayjs(slot.startTime).tz(tz).format('HH:mm')}`)}
            style={{
              padding: '6px 12px', borderRadius: 8, border: '1px solid #E5E7EB',
              backgroundColor: '#FFFFFF', fontSize: 12, color: '#111827', cursor: 'pointer',
            }}
          >
            {dayjs(slot.startTime).tz(tz).format('h:mm A')}
          </button>
        ))}
      </div>
    </div>
  );
}
