import { Container, Skeleton, Table, Group, TableThead, TableTbody, TableTr, TableTh, TableTd } from '@mantine/core';

export default function Loading() {
  return (
    <Container>
      <Group justify="space-between" mb="lg">
        <Skeleton height={36} width={250} />
        <Skeleton height={36} width={130} />
      </Group>
      <Table>
        <TableThead>
          <TableTr>
            <TableTh>Name</TableTh>
            <TableTh>Timezone</TableTh>
            <TableTh>Active</TableTh>
            <TableTh>Actions</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>
          {[1, 2, 3].map((i) => (
            <TableTr key={i}>
              <TableTd><Skeleton height={20} /></TableTd>
              <TableTd><Skeleton height={20} width={100} /></TableTd>
              <TableTd><Skeleton height={20} width={50} /></TableTd>
              <TableTd><Skeleton height={20} width={80} /></TableTd>
            </TableTr>
          ))}
        </TableTbody>
      </Table>
    </Container>
  );
}
