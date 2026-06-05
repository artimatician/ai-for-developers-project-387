export default function Loading() {
  return (
    <div style={{ backgroundColor: '#0A0A0B', minHeight: '100vh', padding: '48px 24px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ flex: '0 0 280px', height: 400, backgroundColor: '#27272A', borderRadius: 14 }} />
          <div style={{ flex: '0 0 320px', height: 400, backgroundColor: '#27272A', borderRadius: 14 }} />
          <div style={{ flex: 1, height: 400, backgroundColor: '#27272A', borderRadius: 14 }} />
        </div>
      </div>
    </div>
  );
}
