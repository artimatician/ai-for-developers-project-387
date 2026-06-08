'use client';

import { Skeleton, Table, Group } from '@mantine/core';

export default function Loading() {
  return (
    <div>
      <Skeleton height={28} width={120} mb="lg" />
      <Group mb="md" gap="md">
        <Skeleton height={36} width={200} />
        <Skeleton height={36} width={250} />
      </Group>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 10, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Event Type</Table.Th>
              <Table.Th>Guest</Table.Th>
              <Table.Th>Start</Table.Th>
              <Table.Th>End</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {[1, 2, 3].map((i) => (
              <Table.Tr key={i}>
                <Table.Td><Skeleton height={20} /></Table.Td>
                <Table.Td><Skeleton height={20} /></Table.Td>
                <Table.Td><Skeleton height={20} width={140} /></Table.Td>
                <Table.Td><Skeleton height={20} width={140} /></Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>
    </div>
  );
}
