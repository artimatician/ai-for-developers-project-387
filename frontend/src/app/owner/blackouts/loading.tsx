'use client';

import { Skeleton, Table, Group } from '@mantine/core';

export default function Loading() {
  return (
    <div>
      <Skeleton height={28} width={120} mb="lg" />
      <Group justify="flex-end" mb="md">
        <Skeleton height={36} width={150} />
      </Group>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 10, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Start</Table.Th>
              <Table.Th>End</Table.Th>
              <Table.Th>Reason</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {[1, 2].map((i) => (
              <Table.Tr key={i}>
                <Table.Td><Skeleton height={20} width={140} /></Table.Td>
                <Table.Td><Skeleton height={20} width={140} /></Table.Td>
                <Table.Td><Skeleton height={20} /></Table.Td>
                <Table.Td><Skeleton height={20} width={60} /></Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>
    </div>
  );
}
