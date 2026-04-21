import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nature House Maker',
  description: '木の温もりを感じるアースカラー基調で、自然に囲まれた温かみのある家をご提供します。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
