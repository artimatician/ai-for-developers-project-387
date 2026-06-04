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
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <Container size={820} py={48}>
        <ErrorAlert message={error.message} onRetry={reset} />
      </Container>
    </div>
  );
}
