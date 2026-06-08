'use client';

import { Navbar } from '@/components/Navbar';
import { OwnerSidebar } from '@/components/OwnerSidebar';

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <Navbar variant="inner" />
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', padding: '0 24px' }}>
        <OwnerSidebar />
        <main
          style={{
            flex: 1,
            padding: '48px 32px',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
