import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'App de Evacuação e Rotas Seguras',
  description: 'Informações e rotas seguras em eventos extremos.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" style={{ height: '100%' }}> {}
      <body 
        className={inter.className} 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh'
        }}
      >
        <Header />
        <main 
          style={{ 
            flexGrow: 1,
            paddingTop: '70px',
            width: '100%' 
          }}
        >
          {children}
        </main>
        <Footer /> {}
      </body>
    </html>
  );
}