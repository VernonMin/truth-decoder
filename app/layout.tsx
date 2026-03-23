import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '职场黑话翻译站 | 撕碎职场假面，还你人间清醒',
  description: '用 AI 翻译职场黑话，揭露 PUA，提供情绪价值。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
