import { Container, Skeleton, Table, Group, TableThead, TableTbody, TableTr, TableTh, TableTd } from '@mantine/core';

export default function Loading() {
  return (
    <Container>
      <Group justify="space-between" mb="lg">
        <Skeleton height={36} width={200} />
        <Skeleton height={36} width={130} />
      </Group>
      <Table>
        <TableThead>
          <TableTr>
            <TableTh>Start</TableTh>
            <TableTh>End</TableTh>
            <TableTh>Reason</TableTh>
            <TableTh>Actions</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>
          {[1, 2].map((i) => (
            <TableTr key={i}>
              <TableTd><Skeleton height={20} width={140} /></TableTd>
              <TableTd><Skeleton height={20} width={140} /></TableTd>
              <TableTd><Skeleton height={20} /></TableTd>
              <TableTd><Skeleton height={20} width={60} /></TableTd>
            </TableTr>
          ))}
        </TableTbody>
      </Table>
    </Container>
  );
}
