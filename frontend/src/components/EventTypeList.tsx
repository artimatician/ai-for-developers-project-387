'use client';

import { SimpleGrid, Paper, Title, Text, Badge, Button } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import type { components } from '@/lib/api-types';

type PublicEventType = components['schemas']['PublicEventType'];

interface EventTypeListProps {
  eventTypes: PublicEventType[];
}

export function EventTypeList({ eventTypes }: EventTypeListProps) {
  const router = useRouter();

  if (eventTypes.length === 0) {
    return (
      <Text c="#8C8C8C" ta="center" py="xl">
        No event types available yet.
      </Text>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
      {eventTypes.map((et) => (
        <Paper
          key={et.id}
          withBorder
          radius="md"
          p="lg"
          style={{
            cursor: 'pointer',
            transition: 'box-shadow 0.15s, border-color 0.15s',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
          onClick={() => router.push(`/event-types/${et.id}`)}
        >
          <Title order={3} style={{ color: '#1A1A1A', margin: 0 }}>
            {et.name}
          </Title>
          <Text
            size="sm"
            style={{
              color: '#5C5C5C',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.4,
            }}
          >
            {et.description}
          </Text>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
            <Badge variant="light" color="gray" size="sm">
              {et.timezone}
            </Badge>
            <Button
              variant="subtle"
              color="green"
              size="compact-sm"
              rightSection={<IconChevronRight size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/event-types/${et.id}`);
              }}
            >
              Book
            </Button>
          </div>
        </Paper>
      ))}
    </SimpleGrid>
  );
}
