import { Container, Skeleton, Table } from '@mantine/core';

export default function Loading() {
  return (
    <Container>
      <Skeleton height={36} width={200} mb="lg" />
      <Skeleton height={40} mb="md" />
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
              <Table.Td><Skeleton height={20} width={120} /></Table.Td>
              <Table.Td><Skeleton height={20} width={120} /></Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Container>
  );
}
