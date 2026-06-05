'use client';

import { useMemo, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import type { components } from '@/lib/api-types';

dayjs.extend(utc);
dayjs.extend(timezone);

type TimeSlot = components['schemas']['TimeSlot'];

interface CalendarGridProps {
  timezone: string;
  slots: TimeSlot[];
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}

export function CalendarGrid({ timezone, slots, selectedDate, onDateSelect }: CalendarGridProps) {
  const today = dayjs.utc().startOf('day');
  const windowEnd = today.add(13, 'day').endOf('day');
  const now = dayjs.utc();

  const [currentMonth, setCurrentMonth] = useState(dayjs.utc().month());
  const [currentYear, setCurrentYear] = useState(dayjs.utc().year());

  const handlePrevMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }, [currentMonth]);

  const handleNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }, [currentMonth]);

  const availableDates = useMemo(() => computeAvailableDates(slots, timezone), [slots, timezone]);

  const firstOfMonth = dayjs.tz(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`, timezone);
  const startDayOfWeek = firstOfMonth.day();
  const daysInMonth = firstOfMonth.daysInMonth();
  const daysInPrevMonth = firstOfMonth.subtract(1, 'month').daysInMonth();

  const todayStr = today.format('YYYY-MM-DD');

  const cells: { day: number; dateKey: string | null }[] = [];
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, dateKey: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = dayjs.tz(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, timezone).format('YYYY-MM-DD');
    cells.push({ day: d, dateKey });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, dateKey: null });
  }

  function isInWindow(dateKey: string): boolean {
    const d = dayjs.tz(dateKey, timezone);
    return d.isAfter(now.subtract(1, 'day')) && d.isBefore(windowEnd.add(1, 'day'));
  }

  function isPast(dateKey: string): boolean {
    return dayjs.tz(dateKey, timezone).isBefore(now, 'day');
  }

  function getCellClass(dateKey: string | null): string {
    if (!dateKey) return 'cal-outside';
    if (isPast(dateKey)) return 'cal-past';
    if (!isInWindow(dateKey)) return 'cal-outside-window';
    if (availableDates.has(dateKey)) return 'cal-available';
    return 'cal-unavailable-in-window';
  }

  function canSelect(dateKey: string | null): boolean {
    if (!dateKey) return false;
    if (isPast(dateKey)) return false;
    if (!isInWindow(dateKey)) return false;
    return availableDates.has(dateKey);
  }

  return (
    <div>
      <style>{calendarGridStyles}</style>
      <div className="cal-header">
        <span className="cal-month-label">
          {firstOfMonth.format('MMMM YYYY')}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="cal-nav-btn" onClick={handlePrevMonth}><IconChevronLeft size={14} /></button>
          <button className="cal-nav-btn" onClick={handleNextMonth}><IconChevronRight size={14} /></button>
        </div>
      </div>
      <div className="cal-weekdays">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="cal-weekday">{d}</div>
        ))}
      </div>
      <div className="cal-grid">
        {cells.map((cell, i) => {
          const cls = getCellClass(cell.dateKey);
          const selectable = canSelect(cell.dateKey);
          const isSelected = cell.dateKey === selectedDate;
          const isToday = cell.dateKey === todayStr;
          return (
            <div
              key={i}
              className={`cal-cell ${cls}${isSelected ? ' cal-selected' : ''}`}
              onClick={() => selectable && cell.dateKey && onDateSelect(cell.dateKey)}
              role={selectable ? 'button' : undefined}
              tabIndex={selectable ? 0 : undefined}
              onKeyDown={(e) => {
                if (selectable && cell.dateKey && (e.key === 'Enter' || e.key === ' ')) {
                  onDateSelect(cell.dateKey);
                }
              }}
            >
              {cell.day}
              {isToday && !isSelected && <span className="cal-today-dot" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function computeAvailableDates(slots: TimeSlot[], tz: string): Set<string> {
  const available = new Set<string>();
  for (const slot of slots) {
    const key = dayjs(slot.startTime).tz(tz).format('YYYY-MM-DD');
    if (slot.available) {
      available.add(key);
    }
  }
  return available;
}

const calendarGridStyles = `
.cal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.cal-nav-btn {
  background: #27272A; border: 1px solid #3F3F46; border-radius: 6px;
  width: 28px; height: 28px; cursor: pointer; color: #A1A1AA;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s; padding: 0;
}
.cal-nav-btn:hover { background: #3F3F46; }
.cal-month-label { font-size: 16px; font-weight: 600; color: #FAFAFA; }
.cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 4px; }
.cal-weekday {
  text-align: center; font-size: 11px; color: #71717A; font-weight: 500;
  height: 28px; display: flex; align-items: center; justify-content: center;
}
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
.cal-cell {
  width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
  font-size: 13px; border-radius: 8px; cursor: default; transition: background 0.15s;
  flex-direction: column; gap: 0;
}
.cal-outside { color: #3F3F46; }
.cal-past { color: #52525B; }
.cal-outside-window { color: #52525B; }
.cal-available { color: #FAFAFA; cursor: pointer; background: #27272A; }
.cal-available:hover { background: #3F3F46; }
.cal-unavailable { color: #52525B; }
.cal-unavailable-in-window { color: #52525B; background: transparent; }
.cal-selected { background: #FAFAFA !important; color: #0A0A0B !important; font-weight: 600; }
.cal-today-dot {
  width: 4px; height: 4px; border-radius: 50%; background: #FAFAFA;
  margin-top: 1px;
}
`;
