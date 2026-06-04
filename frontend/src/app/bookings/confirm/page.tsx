'use client';

import { Container, Paper, Text, Title, ThemeIcon, Stack } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Suspense } from 'react';

dayjs.extend(utc);

function ConfirmContent() {
  const searchParams = useSearchParams();
  const startTime = searchParams.get('startTime');
  const endTime = searchParams.get('endTime');
  const eventTypeName = searchParams.get('eventTypeName');

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <Container size="sm" py="xl">
        <Paper withBorder p="xl" style={{ textAlign: 'center', borderRadius: 14, borderColor: '#E5E7EB' }}>
          <Stack align="center" gap="md">
            <ThemeIcon variant="filled" color="green" size={64} radius="xl" style={{ backgroundColor: '#16A34A' }}>
              <IconCheck size={32} />
            </ThemeIcon>
            <Title order={2} style={{ color: '#111827' }}>Booking Confirmed!</Title>
            <Text c="#6B7280">
              Your meeting has been scheduled successfully.
            </Text>
            <Paper withBorder p="md" w="100%" maw={400} style={{ borderColor: '#E5E7EB' }}>
              <Stack gap="xs">
                <Text fw={500} c="#111827">{eventTypeName || 'Event'}</Text>
                <Text size="sm" c="#6B7280">
                  {startTime
                    ? dayjs(startTime).format('MMM D, YYYY h:mm A')
                    : '—'}{' '}
                  –{' '}
                  {endTime
                    ? dayjs(endTime).format('h:mm A')
                    : '—'}{' '}
                  UTC
                </Text>
              </Stack>
            </Paper>
            <Link href="/book" style={{ textDecoration: 'underline', color: '#6B7280', fontSize: 14 }}>
              Book another slot
            </Link>
          </Stack>
        </Paper>
      </Container>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}><Container size="sm" py="xl"><p>Loading...</p></Container></div>}>
      <ConfirmContent />
    </Suspense>
  );
}
