'use client';

import { Alert, Button, Group } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

interface ErrorAlertProps {
  code?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorAlert({ code, message, onRetry }: ErrorAlertProps) {
  return (
    <Alert
      icon={<IconAlertCircle size={16} />}
      title={code || 'Error'}
      color="red"
      variant="filled"
    >
      <Group>
        <span style={{ flex: 1 }}>{message}</span>
        {onRetry && (
          <Button variant="white" size="xs" onClick={onRetry}>
            Retry
          </Button>
        )}
      </Group>
    </Alert>
  );
}
