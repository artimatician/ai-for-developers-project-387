export default function Loading() {
  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', backgroundColor: '#E5E5E5',
            margin: '0 auto 16px',
          }} />
          <div style={{ height: 22, width: 120, backgroundColor: '#E5E5E5', borderRadius: 4, margin: '0 auto 8px' }} />
          <div style={{ height: 15, width: 240, backgroundColor: '#E5E5E5', borderRadius: 4, margin: '0 auto' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ height: 80, backgroundColor: '#E5E5E5', borderRadius: 10 }} />
          <div style={{ height: 80, backgroundColor: '#E5E5E5', borderRadius: 10 }} />
          <div style={{ height: 80, backgroundColor: '#E5E5E5', borderRadius: 10 }} />
        </div>
      </div>
    </div>
  );
}
