'use client';

import { Container, Title, Text } from '@mantine/core';

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container>
      <Title order={3}>Owner Dashboard</Title>
      {children}
    </Container>
  );
}
