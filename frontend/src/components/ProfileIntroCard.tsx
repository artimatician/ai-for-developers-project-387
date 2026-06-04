'use client';

export function ProfileIntroCard() {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%', backgroundColor: '#F3F4F6',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, fontWeight: 600, color: '#4B5563', marginBottom: 16,
      }}>
        T
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0, marginBottom: 6 }}>
        Tota
      </h1>
      <p style={{ fontSize: 15, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
        Welcome! Pick a time that works.
      </p>
      <div style={{ width: 40, height: 1, backgroundColor: '#E5E7EB', margin: '24px auto' }} />
    </div>
  );
}
