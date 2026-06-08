'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  IconLayoutDashboard,
  IconCalendarEvent,
  IconCalendarCheck,
  IconCalendarOff,
} from '@tabler/icons-react';

const items = [
  { label: 'Dashboard', href: '/owner', icon: IconLayoutDashboard },
  { label: 'Event Types', href: '/owner/event-types', icon: IconCalendarEvent },
  { label: 'Bookings', href: '/owner/bookings', icon: IconCalendarCheck },
  { label: 'Blackouts', href: '/owner/blackouts', icon: IconCalendarOff },
];

export function OwnerSidebar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        width: 220,
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E5E7EB',
        padding: '24px 0',
        flexShrink: 0,
        height: '100%',
      }}
    >
      {items.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{ textDecoration: 'none', display: 'block' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 20px',
                borderLeft: isActive ? '3px solid #F97316' : '3px solid transparent',
                backgroundColor: isActive ? '#FFF7ED' : 'transparent',
                color: isActive ? '#111827' : '#6B7280',
                fontWeight: isActive ? 600 : 500,
                fontSize: 14,
                transition: 'background-color 0.1s, color 0.1s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#F9FAFB';
                  e.currentTarget.style.color = '#111827';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#6B7280';
                }
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
