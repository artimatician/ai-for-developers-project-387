'use client';

interface DurationPickerProps {
  value: number;
  maxDuration: number;
  onChange: (duration: number) => void;
}

export function DurationPicker({ value, maxDuration, onChange }: DurationPickerProps) {
  const options: number[] = [];
  for (let d = 15; d <= maxDuration; d += 15) {
    options.push(d);
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 14, color: '#6B7280', whiteSpace: 'nowrap' }}>
        Duration
      </span>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {options.map((d) => (
          <button
            key={d}
            onClick={() => onChange(d)}
            style={{
              padding: '4px 12px',
              borderRadius: 999,
              border: `1px solid ${value === d ? '#111827' : '#E5E7EB'}`,
              backgroundColor: value === d ? '#111827' : 'transparent',
              color: value === d ? '#FFFFFF' : '#111827',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              lineHeight: '20px',
              transition: 'all 0.15s',
            }}
          >
            {d} min
          </button>
        ))}
      </div>
    </div>
  );
}
