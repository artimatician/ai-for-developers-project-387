'use client';

import { useEffect, useState } from 'react';
import { Container, Title, Table, Badge, Anchor } from '@mantine/core';
import Link from 'next/link';
import { listActiveEventTypes } from '@/lib/api';
import type { components } from '@/lib/api-types';
import { ErrorAlert } from '@/components/ErrorAlert';

type PublicEventType = components['schemas']['PublicEventType'];

export default function HomePage() {
  const [eventTypes, setEventTypes] = useState<PublicEventType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    listActiveEventTypes()
      .then(setEventTypes)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Title order={1} mb="lg">Available Event Types</Title>
        <p>Loading...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="lg" py="xl">
        <ErrorAlert message={error} onRetry={fetchData} />
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="lg">
        Available Event Types
      </Title>
      {eventTypes.length === 0 ? (
        <p>No event types available.</p>
      ) : (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th>Timezone</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {eventTypes.map((et) => (
              <Table.Tr key={et.id}>
                <Table.Td>{et.name}</Table.Td>
                <Table.Td>{et.description}</Table.Td>
                <Table.Td>
                  <Badge variant="light">{et.timezone}</Badge>
                </Table.Td>
                <Table.Td>
                  <Anchor component={Link} href={`/event-types/${et.id}`}>
                    Book
                  </Anchor>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Container>
  );
}
