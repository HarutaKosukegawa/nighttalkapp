'use client'

import { useState } from 'react'
import { SparkleIcon } from '@/components/Icons'
import type { Participant } from '@/types/database'

type MatchResult = { rank: number; name: string; reason: string }

function parseResult(text: string): MatchResult[] {
  const results: MatchResult[] = []
  const blocks = text.split(/\n(?=\d+\.)/).filter(Boolean)
  for (const block of blocks) {
    const lines = block.trim().split('\n').filter(Boolean)
    if (lines.length < 2) continue
    const headerMatch = lines[0].match(/^(\d+)\.\s*(.+)/)
    if (!headerMatch) continue
    const rank = parseInt(headerMatch[1])
    const name = headerMatch[2].trim().replace(/[\[\]]/g, '')
    const reason = lines.slice(1).join(' ').trim()
    results.push({ rank, name, reason })
  }
  return results
}

export default function AIMatchButton({
  participants,
  eventDate,
}: {
  participants: Participant[]
  eventDate: string
}) {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<MatchResult[] | null>(null)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)

  async function handleMatch() {
    const myId = localStorage.getItem(`my_id_${eventDate}`)
    if (!myId) {
      setError('まず自己紹介を登録してください')
      setOpen(true)
      return
    }

    const myProfile = participants.find((p) => p.id === myId)
    if (!myProfile) {
      setError('あなたのプロフィールが見つかりません')
      setOpen(true)
      return
    }

    const others = participants.filter((p) => p.id !== myId)
    if (others.length === 0) {
      setError('他の参加者がまだいません')
      setOpen(true)
      return
    }

    setLoading(true)
    setOpen(true)
    setResults(null)
    setError('')

    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ myProfile, others }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResults(parseResult(data.result))
    } catch {
      setError('AIマッチングに失敗しました。APIキーを確認してください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* トリガーボタン */}
      <button
        onClick={handleMatch}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all disabled:opacity-50"
        style={{
          background: 'linear-gradient(135deg, rgba(201,169,110,0.15), rgba(75,159,232,0.15))',
          border: '1px solid rgba(201,169,110,0.4)',
          color: 'var(--gold)',
        }}
      >
        <SparkleIcon size={16} />
        {loading ? 'AI分析中...' : 'AIおすすめの3人を見る'}
      </button>

      {/* 結果モーダル */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-[430px] rounded-t-3xl pb-8"
            style={{ background: '#0d1730', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ハンドル */}
            <div className="flex justify-center pt-3 pb-4">
              <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
            </div>

            <div className="px-5">
              <div className="flex items-center gap-2 mb-5">
                <SparkleIcon size={18} />
                <h2 className="text-lg font-black" style={{ color: 'var(--gold)', fontFamily: 'var(--font-space-mono)' }}>
                  AIおすすめの3人
                </h2>
              </div>

              {loading && (
                <div className="py-10 text-center">
                  <div
                    className="inline-block w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }}
                  />
                  <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>プロフィールを分析中...</p>
                </div>
              )}

              {error && (
                <p className="py-6 text-center text-sm" style={{ color: '#f87171' }}>{error}</p>
              )}

              {results && results.length > 0 && (
                <div className="space-y-3">
                  {results.map((r) => (
                    <div
                      key={r.rank}
                      className="glass-card p-4"
                      style={{ border: '1px solid rgba(201,169,110,0.2)' }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="text-xs font-black w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: 'var(--gold)', color: '#060c1a' }}
                        >
                          {r.rank}
                        </span>
                        <p className="font-bold text-base" style={{ color: 'white' }}>{r.name}</p>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)', paddingLeft: 28 }}>
                        {r.reason}
                      </p>
                    </div>
                  ))}
                  <p className="text-xs text-center pt-2 pb-1" style={{ color: 'var(--text-muted)' }}>
                    タップして閉じる
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
