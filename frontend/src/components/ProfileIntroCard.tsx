'use client';

export function ProfileIntroCard() {
  return (
    <div style={{
      backgroundColor: '#FFFFFF', borderRadius: 16, border: '1px solid #E5E7EB',
      boxShadow: '0 1px 2px rgba(16,24,40,0.04)', padding: 28,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', backgroundColor: '#F3F4F6',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 600, color: '#4B5563',
        }}>
          T
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>Tota</div>
          <div style={{ fontSize: 13, color: '#6B7280' }}>Schedule a meeting</div>
        </div>
      </div>
      <h2 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0, marginBottom: 8 }}>Choose an event type</h2>
      <p style={{ fontSize: 14, color: '#6B7280', maxWidth: 560, margin: 0, lineHeight: 1.5 }}>
        Select a meeting type to open the booking page.
      </p>
    </div>
  );
}
