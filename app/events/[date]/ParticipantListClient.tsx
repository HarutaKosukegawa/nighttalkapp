'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Participant } from '@/types/database'

type ColumnCount = 1 | 2 | 3 | 4

const COL_OPTIONS: ColumnCount[] = [1, 2, 3, 4]
const COLS_KEY = 'participant_cols_v1'

export default function ParticipantListClient({
  participants,
  eventDate,
  isYoisho = false,
}: {
  participants: Participant[]
  eventDate: string
  isYoisho?: boolean
}) {
  const [myId, setMyId] = useState<string | null>(null)
  const [cols, setCols] = useState<ColumnCount>(2)

  useEffect(() => {
    try {
      setMyId(localStorage.getItem(`my_id_${eventDate}`))
      const saved = localStorage.getItem(COLS_KEY)
      if (saved === '1' || saved === '2' || saved === '3' || saved === '4') {
        setCols(Number(saved) as ColumnCount)
      }
    } catch {
      // localStorage アクセス不可能ときはデフォルトの2列のまま
    }
  }, [eventDate])

  const handleColsChange = (n: ColumnCount) => {
    setCols(n)
    try {
      localStorage.setItem(COLS_KEY, String(n))
    } catch {}
  }

  // テーマカラー
  const c = isYoisho
    ? {
        name: '#3D2817',
        detail: 'rgba(61,40,23,0.78)',
        label: '#A06030',
        muted: '#8B6F47',
        cardBg: 'rgba(255,248,235,0.7)',
        cardBorder: 'rgba(92,61,32,0.18)',
        accent: '#C97A3A',
        accentText: '#FFF8E7',
        photoEmptyBg: 'rgba(92,61,32,0.06)',
        photoEmptyIconStroke: 'rgba(92,61,32,0.35)',
        controlBg: 'rgba(255,248,235,0.55)',
        controlBorder: 'rgba(92,61,32,0.18)',
        controlInactiveText: 'rgba(92,61,32,0.55)',
      }
    : {
        name: 'white',
        detail: 'rgba(255,255,255,0.8)',
        label: 'var(--gold)',
        muted: 'var(--text-muted)',
        cardBg: 'rgba(255,255,255,0.06)',
        cardBorder: 'rgba(255,255,255,0.1)',
        accent: 'var(--gold)',
        accentText: '#060c1a',
        photoEmptyBg: 'rgba(255,255,255,0.05)',
        photoEmptyIconStroke: 'rgba(255,255,255,0.3)',
        controlBg: 'rgba(255,255,255,0.05)',
        controlBorder: 'rgba(255,255,255,0.1)',
        controlInactiveText: 'rgba(255,255,255,0.55)',
      }

  // 列数ごとのグリッドクラス（Tailwind の JIT 検出のため静的マッピング）
  const gridClass = ({
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  } as const)[cols]

  // 写真アスペクト比（1列だけ横長、他は縦長・正方）
  const photoPadding = cols === 1 ? '62%' : cols === 2 ? '125%' : '100%'

  // 表示する情報量とリーダブル性を列数で調整
  const showAge = cols <= 2
  const showWantToTalk = cols === 1
  const showDream = true // どの列数でも「夢」は見せる（ユーザー希望）
  const showActivity = true // どの列数でも「活動」は見せる（どんな人か判定用）

  // 文字サイズ・行数・パディング
  const nameSize = cols === 1 ? 'text-lg' : cols === 2 ? 'text-base' : cols === 3 ? 'text-sm' : 'text-xs'
  const bodySize = cols <= 2 ? 'text-xs' : 'text-[11px]'
  const labelSize = cols <= 2 ? 'text-[11px]' : 'text-[10px]'
  const cardPadding = cols >= 3 ? 'px-2 py-2' : 'px-3 py-3'
  const detailLineClamp = cols === 1 ? 3 : cols === 2 ? 2 : 1
  const gap = cols >= 3 ? 'gap-2' : 'gap-3'
  const borderRadius = cols >= 3 ? 10 : 14

  return (
    <div>
      {/* 列数切り替えコントロール */}
      <div className="px-4 mb-3 flex items-center justify-between">
        <span className="text-xs" style={{ color: c.muted }}>表示</span>
        <div
          className="flex gap-1 rounded-full p-1"
          style={{ background: c.controlBg, border: `1px solid ${c.controlBorder}` }}
        >
          {COL_OPTIONS.map((n) => {
            const active = n === cols
            return (
              <button
                key={n}
                type="button"
                onClick={() => handleColsChange(n)}
                className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                style={{
                  background: active ? c.accent : 'transparent',
                  color: active ? c.accentText : c.controlInactiveText,
                  minWidth: 36,
                }}
                aria-label={`${n}列で表示`}
                aria-pressed={active}
              >
                {n}列
              </button>
            )
          })}
        </div>
      </div>

      <div className={`px-4 grid ${gridClass} ${gap}`}>
        {participants.map((p, i) => {
          const isMe = p.id === myId
          return (
            <Link
              key={p.id}
              href={`/events/${eventDate}/${p.id}`}
              className="overflow-hidden animate-fade-in-up block transition-all"
              style={{
                animationDelay: `${i * 20}ms`,
                background: c.cardBg,
                border: `1px solid ${c.cardBorder}`,
                borderRadius,
                backdropFilter: 'blur(8px)',
              }}
            >
              {/* 写真 */}
              <div className="relative w-full" style={{ paddingBottom: photoPadding }}>
                {p.outfit_photo_url ? (
                  <Image
                    src={p.outfit_photo_url}
                    alt={`${p.name}の写真`}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes={cols === 1 ? '100vw' : cols === 2 ? '50vw' : cols === 3 ? '33vw' : '25vw'}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: c.photoEmptyBg }}>
                    <svg width={cols >= 3 ? 24 : 32} height={cols >= 3 ? 24 : 32} viewBox="0 0 24 24" fill="none" stroke={c.photoEmptyIconStroke} strokeWidth="1.5">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  </div>
                )}
                {isMe && (
                  <div
                    className="absolute top-1.5 left-1.5 font-bold px-2 py-0.5 rounded-md"
                    style={{ background: c.accent, color: c.accentText, fontSize: cols === 4 ? 9 : 11 }}
                  >
                    自分
                  </div>
                )}
              </div>

              {/* テキスト */}
              <div className={cardPadding}>
                <div className="flex items-baseline gap-1.5 min-w-0">
                  <p className={`font-bold leading-tight truncate ${nameSize}`} style={{ color: c.name }}>
                    {p.name}
                  </p>
                  {showAge && p.age != null && (
                    <span className={`flex-shrink-0 ${bodySize}`} style={{ color: c.muted }}>
                      {p.age}歳
                    </span>
                  )}
                </div>

                {showActivity && (
                  <div className={cols >= 3 ? 'mt-1.5' : 'mt-2'}>
                    <p className={`font-bold mb-0.5 ${labelSize}`} style={{ color: c.label }}>活動</p>
                    <p
                      className={`leading-snug ${bodySize}`}
                      style={{
                        color: c.detail,
                        display: '-webkit-box',
                        WebkitLineClamp: detailLineClamp,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {p.activity}
                    </p>
                  </div>
                )}

                {showDream && (
                  <div className="mt-1.5">
                    <p className={`font-bold mb-0.5 ${labelSize}`} style={{ color: c.label }}>夢</p>
                    <p
                      className={`leading-snug ${bodySize}`}
                      style={{
                        color: c.detail,
                        display: '-webkit-box',
                        WebkitLineClamp: detailLineClamp,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {p.dream}
                    </p>
                  </div>
                )}

                {showWantToTalk && (
                  <div className="mt-1.5">
                    <p className={`font-bold mb-0.5 ${labelSize}`} style={{ color: c.label }}>話したい人</p>
                    <p
                      className={`leading-snug ${bodySize}`}
                      style={{
                        color: c.detail,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {p.want_to_talk}
                    </p>
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
