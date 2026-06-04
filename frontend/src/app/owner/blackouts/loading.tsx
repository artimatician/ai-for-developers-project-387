import { Container, Skeleton, Table, Group } from '@mantine/core';

export default function Loading() {
  return (
    <Container>
      <Group justify="space-between" mb="lg">
        <Skeleton height={36} width={200} />
        <Skeleton height={36} width={130} />
      </Group>
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
    </Container>
  );
}
