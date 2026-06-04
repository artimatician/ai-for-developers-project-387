import { Container, Skeleton } from '@mantine/core';

export default function Loading() {
  return (
    <Container size="lg" py="xl">
      <Skeleton height={40} width={400} mb="md" />
      <Skeleton height={20} width={200} mb="xl" />
      <Skeleton height={200} />
    </Container>
  );
}
