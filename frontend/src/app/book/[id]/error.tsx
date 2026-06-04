'use client';
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
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        <ErrorAlert message={error.message} onRetry={reset} />
      </div>
    </div>
  );
}
