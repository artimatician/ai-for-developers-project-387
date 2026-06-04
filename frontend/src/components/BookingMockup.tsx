'use client';

import dayjs from 'dayjs';

const BUSY_OFFSETS = [1, 2, 4, 5, 7, 9, 10, 12];

export function BookingMockup() {
  const now = dayjs();
  const currentMonth = now.month();
  const currentYear = now.year();
  const today = now.date();

  const firstOfMonth = dayjs(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`);
  const startDayOfWeek = firstOfMonth.day();
  const daysInMonth = firstOfMonth.daysInMonth();

  const busyDays = new Set(BUSY_OFFSETS.map(offset => today + offset));

  const cells: { day: number; dateKey: number }[] = [];
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    cells.push({ day: firstOfMonth.subtract(1, 'month').daysInMonth() - i, dateKey: -1 });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, dateKey: d });
  }
  while (cells.length < 42) {
    const day = cells.length - startDayOfWeek - daysInMonth + 1;
    cells.push({ day, dateKey: -1 });
  }

  return (
    <div style={{
      backgroundColor: '#FFFFFF', borderRadius: 16, border: '1px solid #E5E7EB',
      boxShadow: '0 1px 2px rgba(16,24,40,0.04)', padding: 24,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{firstOfMonth.format('MMMM YYYY')}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, color: '#6B7280', fontWeight: 500, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((cell, i) => {
          const isCurrentMonth = cell.dateKey > 0;
          const isToday = cell.dateKey === today;
          const isBusy = isCurrentMonth && busyDays.has(cell.dateKey);
          const isPast = isCurrentMonth && cell.dateKey < today;

          let bg = 'transparent';
          let color = '#D1D5DB';
          let border = '1px solid transparent';

          if (isCurrentMonth) {
            color = isPast ? '#9CA3AF' : '#111827';
            if (isBusy) {
              bg = '#FED7AA';
              color = '#9A3412';
            }
            if (isToday) {
              border = '1px solid #111827';
            }
          }

          return (
            <div
              key={i}
              style={{
                width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, borderRadius: 8, backgroundColor: bg, color, border,
              }}
            >
              {cell.day}
            </div>
          );
        })}
      </div>
    </div>
  );
}