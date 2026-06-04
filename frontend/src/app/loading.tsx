import { Skeleton } from '@mantine/core';

export default function Loading() {
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 16px' }}>
      <Skeleton height={480} radius="md" mb="sm" />
      <div style={{ textAlign: 'center' }}>
        <Skeleton height={12} width={120} radius="md" style={{ margin: '0 auto' }} />
      </div>
    </div>
  );
}