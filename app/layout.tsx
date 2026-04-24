import type { Metadata } from 'next';
import './globals.css';
import { ClaroProvider } from '@/src/context/ClaroContext';

export const metadata: Metadata = {
  title: 'Claro One Hub',
  description: 'Ecossistema unificado Claro · Challenge 2026',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full antialiased">
        <ClaroProvider>{children}</ClaroProvider>
      </body>
    </html>
  );
}
