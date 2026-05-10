// 10秒間キャッシュしてナビゲーションを高速化。参加者追加は最大 10 秒遅れて反映される。
export const revalidate = 10

import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ParticipantListClient from './ParticipantListClient'
import type { Participant } from '@/types/database'
import { UsersIcon } from '@/components/Icons'

// 参加者がいなくても常にタブ表示する開催日（古い順 → 左から並ぶ）
const KNOWN_DATES = ['2026-05-10', '2026-05-16']

// 日付ごとのカスタムイベント名（無指定時はデフォルトを使用）
const EVENT_TITLES: Record<string, string> = {
  '2026-05-10': 'よいしょ徳島！',
}
const DEFAULT_TITLE = '深夜の語り場'

// 日付ごとのテーマ（背景とテキスト色の全体調整）
type EventTheme = {
  bodyBg: string         // body の背景（CSS 上書き）
  text: string           // メインテキスト色
  textMuted: string      // サブテキスト色
  brand: string          // "DEEP NIGHT GATHERING" ラベル色
  accent: string         // タブアクティブ・ボタン背景色
  accentText: string     // アクセント上のテキスト色
  panelBg: string        // 日付タブバー背景
  inactiveTabBg: string
  inactiveTabText: string
  tabBorder: string
  starsHidden: boolean
}

const EVENT_THEMES: Record<string, EventTheme> = {
  '2026-05-10': {
    bodyBg: 'linear-gradient(180deg, #F4E4C4 0%, #ECDCBC 100%)',
    text: '#3D2817',
    textMuted: '#8B6F47',
    brand: '#A06030',
    accent: '#C97A3A',
    accentText: '#FFF8E7',
    panelBg: 'rgba(244,228,196,0.85)',
    inactiveTabBg: 'rgba(92,61,32,0.06)',
    inactiveTabText: 'rgba(92,61,32,0.7)',
    tabBorder: 'rgba(92,61,32,0.18)',
    starsHidden: true,
  },
}

async function getEventDates(): Promise<string[]> {
  const { data } = await supabase
    .from('participants')
    .select('event_date')
    .order('event_date', { ascending: true })
  if (!data) return []
  return [...new Set(data.map((r) => r.event_date))]
}

async function getParticipants(date: string): Promise<Participant[]> {
  const { data } = await supabase
    .from('participants')
    .select('*')
    .eq('event_date', date)
    .order('created_at', { ascending: true })
  return data ?? []
}

function formatTab(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function formatHeader(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('ja-JP', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

export default async function EventDatePage({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  const { date } = await params
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound()
  const today = new Date().toISOString().split('T')[0]

  const [dates, participants] = await Promise.all([getEventDates(), getParticipants(date)])

  // KNOWN_DATES + DBの日付 + 現在表示中の日付 をマージし、昇順（古い順=左）でソート
  const allDates = [...new Set([...KNOWN_DATES, ...dates, date])].sort((a, b) =>
    a.localeCompare(b)
  )

  const eventTitle = EVENT_TITLES[date] ?? DEFAULT_TITLE
  const theme = EVENT_THEMES[date] ?? null

  // テーマ適用時のカラー、未適用時は既存の夜空テーマ
  const textColor = theme?.text ?? 'white'
  const mutedColor = theme?.textMuted ?? 'var(--text-muted)'
  const brandColor = theme?.brand ?? 'var(--gold)'
  const accentBg = theme?.accent ?? 'var(--gold)'
  const accentText = theme?.accentText ?? '#060c1a'
  const panelBg = theme?.panelBg ?? 'rgba(6,12,26,0.85)'
  const inactiveTabBg = theme?.inactiveTabBg ?? 'rgba(255,255,255,0.08)'
  const inactiveTabText = theme?.inactiveTabText ?? 'rgba(255,255,255,0.7)'
  const tabBorder = theme?.tabBorder ?? 'rgba(255,255,255,0.1)'

  return (
    <div className="min-h-screen pb-28">
      {/* テーマごとのグローバルスタイル上書き（body背景・星空を切り替え） */}
      {theme && (
        <style
          dangerouslySetInnerHTML={{
            __html: `body { background: ${theme.bodyBg} !important; } ${theme.starsHidden ? '.star-field, .shooting-star { display: none !important; }' : ''}`,
          }}
        />
      )}

      {/* ヘッダー */}
      <div className="px-5 pt-8 pb-4">
        <p
          className="text-xs font-bold tracking-widest mb-1"
          style={{ color: brandColor, fontFamily: 'var(--font-space-mono)' }}
        >
          DEEP NIGHT GATHERING
        </p>
        <h1
          className="text-3xl"
          style={{ color: textColor, fontFamily: 'var(--font-brand)' }}
        >
          {eventTitle}
        </h1>
      </div>

      {/* 日付タブ */}
      <div
        className="sticky top-0 z-10 px-5 py-3 flex gap-2 overflow-x-auto"
        style={{
          background: panelBg,
          backdropFilter: 'blur(12px)',
          scrollbarWidth: 'none',
        }}
      >
        {allDates.map((d) => {
          const isActive = d === date
          const isToday = d === today
          return (
            <Link
              key={d}
              href={`/events/${d}`}
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all"
              style={{
                background: isActive ? accentBg : inactiveTabBg,
                color: isActive ? accentText : inactiveTabText,
                border: isActive ? 'none' : `1px solid ${tabBorder}`,
              }}
            >
              {formatTab(d)}
              {isToday && (
                <span
                  className="ml-1 text-xs"
                  style={{ color: isActive ? accentText : accentBg }}
                >
                  今日
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* 参加者数 + ボタン */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2" style={{ color: mutedColor }}>
          <UsersIcon size={16} />
          <p className="text-sm">
            <span className="font-bold text-xl" style={{ color: textColor }}>
              {participants.length}
            </span>
            {' '}人 — {formatHeader(date)}
          </p>
        </div>
        <Link
          href={`/register?event=${date}`}
          className="btn-primary text-sm py-2 px-4 inline-block"
          style={theme ? { background: accentBg, color: accentText } : undefined}
        >
          + 登録する
        </Link>
      </div>

      {/* 参加者一覧 */}
      {participants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-5 text-center">
          <div className="mb-4" style={{ color: accentBg }}>
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <p className="font-bold text-lg" style={{ color: textColor }}>
            まだ参加者がいません
          </p>
          <p className="text-sm mt-1 mb-6" style={{ color: mutedColor }}>
            最初の星になりましょう
          </p>
          <Link
            href={`/register?event=${date}`}
            className="btn-primary"
            style={theme ? { background: accentBg, color: accentText } : undefined}
          >
            自己紹介を登録する
          </Link>
        </div>
      ) : (
        <>
          <ParticipantListClient participants={participants} eventDate={date} />
        </>
      )}
    </div>
  )
}
