'use client';

import { Container } from '@mantine/core';
import { ErrorAlert } from '@/components/ErrorAlert';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container>
      <ErrorAlert message={error.message} onRetry={reset} />
    </Container>
  );
}
