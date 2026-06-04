'use client';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import { createTheme, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

const theme = createTheme({
  primaryColor: 'dark',
  defaultRadius: 'md',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  headings: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    fontWeight: '600',
  },
  colors: {
    dark: [
      '#F5F5F5', '#E0E0E0', '#BDBDBD', '#9E9E9E',
      '#757575', '#616161', '#424242', '#212121',
      '#111827', '#0A0A0A',
    ],
    peach: [
      '#FFF7ED', '#FFEDD5', '#FED7AA', '#FDBA74',
      '#FB923C', '#F97316', '#EA580C', '#C2410C',
      '#9A3412', '#7C2D12',
    ],
    green: [
      '#F0FDF4', '#DCFCE7', '#BBF7D0', '#86EFAC',
      '#4ADE80', '#22C55E', '#16A34A', '#15803D',
      '#166534', '#14532D',
    ],
  },
  radius: {
    xs: '4px', sm: '6px', md: '8px', lg: '12px', xl: '14px',
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
