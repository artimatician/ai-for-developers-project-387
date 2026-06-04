'use client';

import { Group, Button, Text, Box } from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';
import Link from 'next/link';

interface NavbarProps {
  variant: 'landing' | 'inner';
}

export function Navbar({ variant }: NavbarProps) {
  if (variant === 'landing') {
    return (
      <Box style={{ borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Group gap={8}>
            <IconCalendar size={18} color="#111827" />
            <Text size="sm" fw={600} c="#111827">Calendar</Text>
          </Group>
          <Group gap={12}>
            <Text component={Link} href="/how-it-works" size="sm" fw={500} c="#6B7280">
              How it works
            </Text>
            <Text component={Link} href="/owner/event-types" size="sm" fw={500} c="#6B7280">
              Log in
            </Text>
            <Button
              component={Link}
              href="/book"
              style={{ backgroundColor: '#111827', color: '#FFFFFF', borderRadius: 8 }}
            >
              Book a call
            </Button>
          </Group>
        </div>
      </Box>
    );
  }

  return (
    <Box style={{ borderBottom: '1px solid #E5E7EB' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Group gap={8}>
          <IconCalendar size={18} color="#111827" />
          <Text size="sm" fw={600} c="#111827">Calendar</Text>
        </Group>
        <Group gap={16}>
          <Text component={Link} href="/book" size="sm" fw={500} c="#6B7280">
            Book
          </Text>
          <Text component={Link} href="/owner/event-types" size="sm" fw={500} c="#6B7280">
            Owner
          </Text>
        </Group>
      </div>
    </Box>
  );
}
