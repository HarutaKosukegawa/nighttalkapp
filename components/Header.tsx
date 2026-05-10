'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

// デフォルトで表示するイベント日・登録を検出するテーマ対象日
const DEFAULT_EVENT_DATE = '2026-05-10'
const YOISHO_DATE = '2026-05-10'

function HeaderInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isHome = pathname.startsWith('/events') || pathname === '/'
  const isRegister = pathname.startsWith('/register')

  // よいしょ徳島テーマの適用判定
  // - /events/2026-05-10/...
  // - /register?event=2026-05-10
  const eventParam = searchParams.get('event')
  const isYoisho =
    pathname.startsWith(`/events/${YOISHO_DATE}`) ||
    (isRegister && eventParam === YOISHO_DATE)

  // ロゴテキスト（3人によって切り替え）
  const logoText = isYoisho ? 'よいしょ徳島！' : '深夜の語り場'

  // テーマカラー
  const headerBg = isYoisho ? 'rgba(244,228,196,0.92)' : 'rgba(6,12,26,0.85)'
  const borderColor = isYoisho ? 'rgba(92,61,32,0.18)' : 'rgba(255,255,255,0.07)'
  const logoColor = isYoisho ? '#5C3D20' : 'var(--gold)'
  const activeBg = isYoisho ? '#C97A3A' : 'var(--gold)'
  const activeText = isYoisho ? '#FFF8E7' : '#060c1a'
  const inactiveText = isYoisho ? 'rgba(92,61,32,0.75)' : 'rgba(255,255,255,0.6)'
  const inactiveBg = isYoisho ? 'rgba(92,61,32,0.06)' : 'transparent'

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-5 py-3"
      style={{
        background: headerBg,
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${borderColor}`,
      }}
    >
      {/* ロゴ */}
      <Link href={`/events/${DEFAULT_EVENT_DATE}`}>
        <span
          className="text-base tracking-tight"
          style={{ color: logoColor, fontFamily: 'var(--font-brand)' }}
        >
          {logoText}
        </span>
      </Link>

      {/* ナビ */}
      <nav className="flex items-center gap-1">
        <Link
          href={`/events/${DEFAULT_EVENT_DATE}`}
          className="px-4 py-2 rounded-full text-sm font-bold transition-all"
          style={{
            background: isHome ? activeBg : inactiveBg,
            color: isHome ? activeText : inactiveText,
          }}
        >
          ホーム
        </Link>
        <Link
          href={`/register?event=${DEFAULT_EVENT_DATE}`}
          className="px-4 py-2 rounded-full text-sm font-bold transition-all"
          style={{
            background: isRegister ? activeBg : inactiveBg,
            color: isRegister ? activeText : inactiveText,
          }}
        >
          登録
        </Link>
      </nav>
    </header>
  )
}

export default function Header() {
  // useSearchParams を使うために Suspense 境界を設ける
  return (
    <Suspense
      fallback={
        <header
          className="sticky top-0 z-50 h-12"
          style={{ background: 'rgba(6,12,26,0.85)' }}
        />
      }
    >
      <HeaderInner />
    </Suspense>
  )
}
