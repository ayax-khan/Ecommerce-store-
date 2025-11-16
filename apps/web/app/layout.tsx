import './globals.css';
import { ThemeScript } from '../components/ThemeScript';
import { RootShell } from '../components/RootShell';

export const metadata = {
  title: 'Buy2Enjoy',
  description: 'Stationery e-commerce',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <RootShell>{children}</RootShell>
      </body>
    </html>
  );
}
