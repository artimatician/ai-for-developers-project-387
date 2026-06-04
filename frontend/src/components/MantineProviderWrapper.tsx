'use client';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import { createTheme, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

const theme = createTheme({
  primaryColor: 'green',
  defaultRadius: 'md',
  fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  colors: {
    green: [
      '#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac',
      '#4ade80', '#22c55e', '#16a34a', '#15803d',
      '#166534', '#14532d',
    ],
  },
});

export function MantineProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider defaultColorScheme="light" theme={theme}>
      <Notifications />
      {children}
    </MantineProvider>
  );
}
