'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  IconCalendarEvent,
  IconCalendarCheck,
  IconCalendarOff,
} from '@tabler/icons-react';
import { listEventTypes, listBookings, listBlackouts } from '@/lib/api';
import { ErrorAlert } from '@/components/ErrorAlert';
import type { components } from '@/lib/api-types';

type EventType = components['schemas']['EventType'];
type Booking = components['schemas']['Booking'];
type Blackout = components['schemas']['Blackout'];

interface DashboardData {
  eventTypesCount: number;
  bookingsCount: number;
  blackoutsCount: number;
}

function SkeletonCard() {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        border: '1px solid #E5E7EB',
        padding: '20px 24px',
        flex: 1,
        minWidth: 200,
      }}
    >
      <div
        style={{
          height: 16,
          width: '60%',
          backgroundColor: '#E5E7EB',
          borderRadius: 4,
          marginBottom: 12,
        }}
      />
      <div
        style={{
          height: 32,
          width: '40%',
          backgroundColor: '#E5E7EB',
          borderRadius: 4,
          marginBottom: 8,
        }}
      />
      <div
        style={{
          height: 12,
          width: '80%',
          backgroundColor: '#E5E7EB',
          borderRadius: 4,
        }}
      />
    </div>
  );
}

function DashboardCard({
  icon,
  label,
  count,
  href,
  cta,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  href: string;
  cta: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: 'none', flex: 1, minWidth: 200 }}>
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 10,
          border: '1px solid #E5E7EB',
          borderLeft: '3px solid #F97316',
          boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
          padding: '20px 24px',
          cursor: 'pointer',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#D1D5DB';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(16,24,40,0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#E5E7EB';
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(16,24,40,0.04)';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          {icon}
          <span style={{ fontSize: 14, fontWeight: 500, color: '#6B7280' }}>{label}</span>
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
          {count}
        </div>
        <div style={{ fontSize: 13, color: '#F97316', fontWeight: 500 }}>
          {cta} →
        </div>
      </div>
    </Link>
  );
}

export default function OwnerDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      listEventTypes(),
      listBookings({ limit: 1, offset: 0 }),
      listBlackouts(),
    ])
      .then(([eventTypes, bookings, blackouts]) => {
        setData({
          eventTypesCount: eventTypes.length,
          bookingsCount: bookings.length,
          blackoutsCount: blackouts.length,
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 24px' }}>
          Dashboard
        </h2>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 24px' }}>
          Dashboard
        </h2>
        <ErrorAlert message={error} onRetry={fetchData} />
      </div>
    );
  }

  const allZero = data && data.eventTypesCount === 0 && data.bookingsCount === 0 && data.blackoutsCount === 0;

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 24px' }}>
        Dashboard
      </h2>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <DashboardCard
          icon={<IconCalendarEvent size={20} color="#F97316" />}
          label="Event Types"
          count={data?.eventTypesCount ?? 0}
          href="/owner/event-types"
          cta={data?.eventTypesCount === 0 ? 'Create your first event type' : 'View event types'}
        />
        <DashboardCard
          icon={<IconCalendarCheck size={20} color="#F97316" />}
          label="Bookings"
          count={data?.bookingsCount ?? 0}
          href="/owner/bookings"
          cta={data?.bookingsCount === 0 ? 'No bookings yet' : 'View bookings'}
        />
        <DashboardCard
          icon={<IconCalendarOff size={20} color="#F97316" />}
          label="Blackouts"
          count={data?.blackoutsCount ?? 0}
          href="/owner/blackouts"
          cta={data?.blackoutsCount === 0 ? 'Set up blackout periods' : 'View blackouts'}
        />
      </div>
      {allZero && (
        <div
          style={{
            marginTop: 32,
            padding: '24px 32px',
            backgroundColor: '#FFFFFF',
            borderRadius: 10,
            border: '1px solid #E5E7EB',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>
            Welcome to your owner space!
          </p>
          <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>
            Get started by creating an event type, then share the booking link with your guests.
          </p>
        </div>
      )}
    </div>
  );
}
