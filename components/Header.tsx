'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const EVENT_DATE = '2026-05-16'

export default function Header() {
  const pathname = usePathname()
  const isHome = pathname.startsWith('/events') || pathname === '/'
  const isRegister = pathname.startsWith('/register')

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-5 py-3"
      style={{
        background: 'rgba(6,12,26,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* ロゴ */}
      <Link href={`/events/${EVENT_DATE}`}>
        <span
          className="text-base tracking-tight"
          style={{ color: 'var(--gold)', fontFamily: 'var(--font-brand)' }}
        >
          深夜の語り場
        </span>
      </Link>

      {/* ナビ */}
      <nav className="flex items-center gap-1">
        <Link
          href={`/events/${EVENT_DATE}`}
          className="px-4 py-2 rounded-full text-sm font-bold transition-all"
          style={{
            background: isHome ? 'var(--gold)' : 'transparent',
            color: isHome ? '#060c1a' : 'rgba(255,255,255,0.6)',
          }}
        >
          ホーム
        </Link>
        <Link
          href={`/register?event=${EVENT_DATE}`}
          className="px-4 py-2 rounded-full text-sm font-bold transition-all"
          style={{
            background: isRegister ? 'var(--gold)' : 'transparent',
            color: isRegister ? '#060c1a' : 'rgba(255,255,255,0.6)',
          }}
        >
          登録
        </Link>
      </nav>
    </header>
  )
}
