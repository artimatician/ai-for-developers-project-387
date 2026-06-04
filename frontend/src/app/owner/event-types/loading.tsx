import { Container, Skeleton, Table, Group } from '@mantine/core';

export default function Loading() {
  return (
    <Container>
      <Group justify="space-between" mb="lg">
        <Skeleton height={36} width={250} />
        <Skeleton height={36} width={130} />
      </Group>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Timezone</Table.Th>
            <Table.Th>Active</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {[1, 2, 3].map((i) => (
            <Table.Tr key={i}>
              <Table.Td><Skeleton height={20} /></Table.Td>
              <Table.Td><Skeleton height={20} width={100} /></Table.Td>
              <Table.Td><Skeleton height={20} width={50} /></Table.Td>
              <Table.Td><Skeleton height={20} width={80} /></Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Container>
  );
}
