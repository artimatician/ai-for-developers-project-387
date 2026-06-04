export default function Loading() {
  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ height: 160, backgroundColor: '#E5E5E5', borderRadius: 16, marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ height: 120, backgroundColor: '#E5E5E5', borderRadius: 14 }} />
          <div style={{ height: 120, backgroundColor: '#E5E5E5', borderRadius: 14 }} />
        </div>
      </div>
    </div>
  );
}
