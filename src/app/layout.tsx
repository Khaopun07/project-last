// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import DynamicRootLayoutClient from './DynamicRootLayoutClient'; // ต้องชี้ path ให้ถูก

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = { 
  title: 'ระบบจัดการแนะแนว',
  description: 'ระบบจัดการแนะแนว',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className={inter.className}>
        <DynamicRootLayoutClient>{children}</DynamicRootLayoutClient>
      </body>
    </html>
  );
}
