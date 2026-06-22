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
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 2 }}>
        Meeting length
      </div>
      <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 10 }}>
        Choose how long you'd like this meeting to be
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {options.map((d) => (
          <button
            key={d}
            onClick={() => onChange(d)}
            style={{
              padding: '6px 16px',
              borderRadius: 999,
              border: `1px solid ${value === d ? '#111827' : '#E5E7EB'}`,
              backgroundColor: value === d ? '#111827' : 'transparent',
              color: value === d ? '#FFFFFF' : '#111827',
              fontSize: 14,
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
