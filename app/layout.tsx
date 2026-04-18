import type { Metadata, Viewport } from 'next'
import { Space_Mono } from 'next/font/google'
import StarBackground from '@/components/StarBackground'
import Header from '@/components/Header'
import './globals.css'

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '深夜の語り場',
  description: 'イベント参加者同士の交流を促進するアプリ',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={spaceMono.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700;900&family=Dela+Gothic+One&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen" style={{ background: 'var(--bg)' }}>
        <StarBackground />
        <div className="mx-auto max-w-[430px] min-h-screen relative" style={{ zIndex: 1 }}>
          <Header />
          {children}
        </div>
      </body>
    </html>
  )
}
