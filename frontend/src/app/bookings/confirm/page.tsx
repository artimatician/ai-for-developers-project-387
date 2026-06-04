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
    <Container size="sm" py="xl">
      <Paper withBorder p="xl" style={{ textAlign: 'center' }}>
        <Stack align="center" gap="md">
          <ThemeIcon variant="filled" color="green" size={64} radius="xl">
            <IconCheck size={32} />
          </ThemeIcon>
          <Title order={2}>Booking Confirmed!</Title>
          <Text c="dimmed">
            Your meeting has been scheduled successfully.
          </Text>
          <Paper withBorder p="md" w="100%" maw={400}>
            <Stack gap="xs">
              <Text fw={500}>{eventTypeName || 'Event'}</Text>
              <Text size="sm">
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
          <Link href="/" style={{ textDecoration: 'underline' }}>
            Book another slot
          </Link>
        </Stack>
      </Paper>
    </Container>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<Container size="sm" py="xl"><p>Loading...</p></Container>}>
      <ConfirmContent />
    </Suspense>
  );
}
