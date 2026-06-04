export default function Loading() {
  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ flex: 1, height: 400, backgroundColor: '#E5E5E5', borderRadius: 14 }} />
          <div style={{ flex: '0 0 320px', height: 400, backgroundColor: '#E5E5E5', borderRadius: 14 }} />
          <div style={{ flex: 1, height: 400, backgroundColor: '#E5E5E5', borderRadius: 14 }} />
        </div>
      </div>
    </div>
  );
}
