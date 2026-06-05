import { Container, Skeleton, Table, TableThead, TableTbody, TableTr, TableTh, TableTd } from '@mantine/core';

export default function Loading() {
  return (
    <Container>
      <Skeleton height={36} width={200} mb="lg" />
      <Skeleton height={40} mb="md" />
      <Table>
        <TableThead>
          <TableTr>
            <TableTh>Event Type</TableTh>
            <TableTh>Guest</TableTh>
            <TableTh>Start</TableTh>
            <TableTh>End</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>
          {[1, 2, 3].map((i) => (
            <TableTr key={i}>
              <TableTd><Skeleton height={20} /></TableTd>
              <TableTd><Skeleton height={20} /></TableTd>
              <TableTd><Skeleton height={20} width={120} /></TableTd>
              <TableTd><Skeleton height={20} width={120} /></TableTd>
            </TableTr>
          ))}
        </TableTbody>
      </Table>
    </Container>
  );
}
