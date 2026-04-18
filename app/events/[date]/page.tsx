export const dynamic = 'force-dynamic'

import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ParticipantListClient from './ParticipantListClient'
import type { Participant } from '@/types/database'
import { UsersIcon } from '@/components/Icons'

async function getEventDates(): Promise<string[]> {
  const { data } = await supabase
    .from('participants')
    .select('event_date')
    .order('event_date', { ascending: false })
  if (!data) return []
  return [...new Set(data.map((r) => r.event_date))].sort((a, b) => b.localeCompare(a))
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
    month: 'long', day: 'numeric', weekday: 'short',
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
  const allDates = dates.includes(date)
    ? dates
    : [...dates, date].sort((a, b) => b.localeCompare(a))

  return (
    <div className="min-h-screen pb-28">
      {/* ヘッダー */}
      <div className="px-5 pt-8 pb-4">
        <p className="text-xs font-bold tracking-widest mb-1" style={{ color: 'var(--gold)', fontFamily: 'var(--font-space-mono)' }}>
          DEEP NIGHT GATHERING
        </p>
        <h1 className="text-3xl" style={{ color: 'white', fontFamily: 'var(--font-brand)' }}>
          深夜の語り場
        </h1>
      </div>

      {/* 日付タブ */}
      <div
        className="sticky top-0 z-10 px-5 py-3 flex gap-2 overflow-x-auto"
        style={{ background: 'rgba(6,12,26,0.85)', backdropFilter: 'blur(12px)', scrollbarWidth: 'none' }}
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
                background: isActive ? 'var(--gold)' : 'rgba(255,255,255,0.08)',
                color: isActive ? '#060c1a' : 'rgba(255,255,255,0.7)',
                border: isActive ? 'none' : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {formatTab(d)}
              {isToday && (
                <span className="ml-1 text-xs" style={{ color: isActive ? '#060c1a' : 'var(--gold)' }}>
                  今日
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* 参加者数 + ボタン */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UsersIcon size={16} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            <span className="font-bold text-xl" style={{ color: 'white' }}>{participants.length}</span>
            {' '}人 — {formatHeader(date)}
          </p>
        </div>
        <Link href={`/register?event=${date}`} className="btn-primary text-sm py-2 px-4 inline-block">
          + 登録する
        </Link>
      </div>

      {/* 参加者一覧 */}
      {participants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-5 text-center">
          <div className="mb-4" style={{ color: 'var(--gold)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <p className="font-bold text-lg" style={{ color: 'white' }}>まだ参加者がいません</p>
          <p className="text-sm mt-1 mb-6" style={{ color: 'var(--text-muted)' }}>最初の星になりましょう</p>
          <Link href={`/register?event=${date}`} className="btn-primary">
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
