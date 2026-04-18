'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Participant, TalkRequest } from '@/types/database'
import { TrashIcon, UsersIcon, HeartIcon, SparkleIcon } from '@/components/Icons'

export default function AdminClient({
  participants, requests, dates, currentDate, adminKey, matchCount,
}: {
  participants: Participant[]
  requests: TalkRequest[]
  dates: string[]
  currentDate: string
  adminKey: string
  matchCount: number
}) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  function formatTab(d: string) {
    const dt = new Date(d + 'T00:00:00')
    return `${dt.getMonth() + 1}/${dt.getDate()}`
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`「${name}」さんのデータを削除しますか？`)) return
    setDeleting(id)
    try {
      const res = await fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId: id, key: adminKey }),
      })
      if (!res.ok) throw new Error('削除失敗')
      router.refresh()
    } catch {
      alert('削除に失敗しました')
    } finally {
      setDeleting(null)
    }
  }

  async function handleAiMatch() {
    setAiLoading(true)
    setAiResult(null)
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participants }),
      })
      const data = await res.json()
      setAiResult(data.result)
    } catch {
      setAiResult('AIマッチングに失敗しました。APIキーを確認してください。')
    } finally {
      setAiLoading(false)
    }
  }

  const requestCountMap: Record<string, number> = {}
  for (const r of requests) {
    requestCountMap[r.to_participant_id] = (requestCountMap[r.to_participant_id] ?? 0) + 1
  }

  return (
    <div className="min-h-screen pb-12">
      {/* ヘッダー */}
      <div className="px-5 pt-8 pb-4">
        <p className="text-xs font-bold tracking-widest mb-1" style={{ color: 'var(--gold)', fontFamily: 'var(--font-space-mono)' }}>
          ADMIN PANEL
        </p>
        <h1 className="text-2xl font-black" style={{ color: 'white', fontFamily: 'var(--font-space-mono)' }}>
          管理者ダッシュボード
        </h1>
      </div>

      {/* 統計カード */}
      <div className="px-5 grid grid-cols-3 gap-2 mb-5">
        {[
          { label: '参加者', value: participants.length, Icon: UsersIcon },
          { label: 'リクエスト', value: requests.length, Icon: HeartIcon },
          { label: 'マッチング', value: matchCount, Icon: SparkleIcon },
        ].map(({ label, value, Icon }) => (
          <div key={label} className="glass-card p-3 text-center">
            <div className="flex justify-center mb-1" style={{ color: 'var(--gold)' }}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-black" style={{ color: 'white' }}>{value}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* AIマッチングボタン */}
      <div className="px-5 mb-5">
        <button
          onClick={handleAiMatch}
          disabled={aiLoading || participants.length < 2}
          className="btn-primary w-full flex items-center justify-center gap-2"
          style={{ borderRadius: 14 }}
        >
          <SparkleIcon size={16} />
          {aiLoading ? 'AI分析中...' : 'AIマッチングを実行'}
        </button>
        {participants.length < 2 && (
          <p className="text-xs text-center mt-1" style={{ color: 'var(--text-muted)' }}>※ 参加者が2人以上いると実行できます</p>
        )}
        {aiResult && (
          <div className="mt-3 glass-card p-4">
            <p className="text-xs font-bold mb-2" style={{ color: 'var(--gold)' }}>AIマッチング結果</p>
            <div className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {aiResult}
            </div>
          </div>
        )}
      </div>

      {/* 日付タブ */}
      <div className="px-5 flex gap-2 overflow-x-auto mb-4" style={{ scrollbarWidth: 'none' }}>
        {dates.map((d) => (
          <Link
            key={d}
            href={`/admin?key=${adminKey}&date=${d}`}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-bold"
            style={{
              background: d === currentDate ? 'var(--gold)' : 'rgba(255,255,255,0.08)',
              color: d === currentDate ? '#060c1a' : 'rgba(255,255,255,0.7)',
            }}
          >
            {formatTab(d)}
          </Link>
        ))}
      </div>

      {/* 参加者リスト */}
      <div className="px-5 space-y-3">
        {participants.map((p) => (
          <div key={p.id} className="glass-card flex gap-0 overflow-hidden">
            <div className="relative flex-shrink-0" style={{ width: 72, height: 90 }}>
              {p.outfit_photo_url ? (
                <Image src={p.outfit_photo_url} alt={p.name} fill style={{ objectFit: 'cover' }} sizes="72px" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 px-3 py-2 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate" style={{ color: 'white' }}>{p.name}</p>
                  <p className="text-xs truncate mt-0.5" style={{ color: 'var(--gold)' }}>{p.activity}</p>
                  <p className="text-xs mt-1 line-clamp-2 leading-snug" style={{ color: 'var(--text-muted)' }}>{p.want_to_talk}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      リクエスト: <span style={{ color: 'white', fontWeight: 700 }}>{requestCountMap[p.id] ?? 0}</span>
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(p.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(p.id, p.name)}
                  disabled={deleting === p.id}
                  className="flex-shrink-0 p-2 rounded-xl transition-all"
                  style={{ color: deleting === p.id ? 'var(--text-muted)' : '#f87171', background: 'rgba(248,113,113,0.1)' }}
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {participants.length === 0 && (
          <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>この日の参加者はまだいません</p>
        )}
      </div>
    </div>
  )
}
