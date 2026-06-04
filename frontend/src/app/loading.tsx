import { Container, Skeleton, Table } from '@mantine/core';

export default function Loading() {
  return (
    <Container size="lg" py="xl">
      <Skeleton height={40} width={300} mb="lg" />
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
          {[1, 2, 3].map((i) => (
            <Table.Tr key={i}>
              <Table.Td><Skeleton height={20} /></Table.Td>
              <Table.Td><Skeleton height={20} /></Table.Td>
              <Table.Td><Skeleton height={20} width={100} /></Table.Td>
              <Table.Td><Skeleton height={20} width={80} /></Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Container>
  );
}
