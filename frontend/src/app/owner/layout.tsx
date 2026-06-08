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
      <div style={{ display: 'flex' }}>
        <OwnerSidebar />
        <main
          style={{
            flex: 1,
            padding: '48px 32px',
            maxWidth: 1120,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
