export const dynamic = 'force-dynamic'

import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import AdminClient from './AdminClient'
import type { Participant, TalkRequest } from '@/types/database'

const ADMIN_KEY = process.env.ADMIN_KEY ?? 'shinnya2024'

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string; date?: string }>
}) {
  const { key, date } = await searchParams

  if (key !== ADMIN_KEY) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
        <div style={{ color: 'var(--gold)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h1 className="mt-4 text-xl font-black" style={{ color: 'white' }}>管理者専用ページ</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          URLに <code style={{ color: 'var(--gold)' }}>?key=パスワード</code> を追加してアクセスしてください
        </p>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]
  const targetDate = date ?? today

  const [{ data: participants }, { data: requests }, { data: allDates }] = await Promise.all([
    supabase.from('participants').select('*').eq('event_date', targetDate).order('created_at'),
    supabase.from('talk_requests').select('*').eq('event_date', targetDate),
    supabase.from('participants').select('event_date'),
  ])

  const dates = [...new Set((allDates ?? []).map((r) => r.event_date))].sort((a, b) => b.localeCompare(a))
  const allRequests = requests ?? []
  const matchCount = allRequests.filter((r) =>
    allRequests.some(
      (r2) => r2.from_participant_id === r.to_participant_id && r2.to_participant_id === r.from_participant_id
    )
  ).length / 2

  return (
    <AdminClient
      participants={participants ?? []}
      requests={allRequests as TalkRequest[]}
      dates={dates}
      currentDate={targetDate}
      adminKey={ADMIN_KEY}
      matchCount={Math.floor(matchCount)}
    />
  )
}
