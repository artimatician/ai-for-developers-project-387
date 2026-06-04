import type { Metadata } from 'next';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import { MantineProviderWrapper } from '@/components/MantineProviderWrapper';

export const metadata: Metadata = {
  title: 'Schedule a Call',
  description: 'Book time slots with calendar owner',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body>
        <MantineProviderWrapper>{children}</MantineProviderWrapper>
      </body>
    </html>
  );
}
