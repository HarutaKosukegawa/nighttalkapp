'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Participant } from '@/types/database'
import { ChatIcon, ZapIcon } from '@/components/Icons'

const TAG_COLORS = [
  { bg: 'rgba(75,159,232,0.15)', text: '#4B9FE8', border: 'rgba(75,159,232,0.3)' },
  { bg: 'rgba(58,158,111,0.15)', text: '#3dd68c', border: 'rgba(58,158,111,0.3)' },
  { bg: 'rgba(155,108,196,0.15)', text: '#b07fd4', border: 'rgba(155,108,196,0.3)' },
  { bg: 'rgba(201,169,110,0.15)', text: '#C9A96E', border: 'rgba(201,169,110,0.3)' },
  { bg: 'rgba(212,98,42,0.15)', text: '#e8845a', border: 'rgba(212,98,42,0.3)' },
]

function getTagColor(index: number) {
  return TAG_COLORS[index % TAG_COLORS.length]
}

export default function ParticipantListClient({
  participants,
  eventDate,
}: {
  participants: Participant[]
  eventDate: string
}) {
  const [myId, setMyId] = useState<string | null>(null)

  useEffect(() => {
    setMyId(localStorage.getItem(`my_id_${eventDate}`))
  }, [eventDate])

  return (
    <div className="px-4 space-y-3">
      {participants.map((p, i) => {
        const isMe = p.id === myId
        const tag = getTagColor(i)
        return (
          <Link
            key={p.id}
            href={`/events/${eventDate}/${p.id}`}
            className="glass-card flex gap-0 overflow-hidden animate-fade-in-up block transition-all"
            style={{
              animationDelay: `${i * 50}ms`,
              opacity: 0,
            }}
          >
            {/* 写真エリア */}
            <div className="relative flex-shrink-0" style={{ width: 90, height: 110 }}>
              {p.outfit_photo_url ? (
                <Image
                  src={p.outfit_photo_url}
                  alt={`${p.name}の服装`}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="90px"
                />
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                </div>
              )}
              {isMe && (
                <div
                  className="absolute top-1.5 left-1.5 text-xs font-bold px-1.5 py-0.5 rounded-md"
                  style={{ background: 'var(--gold)', color: '#060c1a', fontSize: 10 }}
                >
                  自分
                </div>
              )}
            </div>

            {/* テキストエリア */}
            <div className="flex-1 px-3 py-3 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p
                  className="font-bold text-base leading-tight"
                  style={{ color: 'var(--text)', fontFamily: 'var(--font-space-mono)' }}
                >
                  {p.name}
                </p>
                <span style={{ color: 'var(--gold)', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </span>
              </div>

              {/* 活動（すぐ見える） */}
              <div className="flex items-center gap-1 mt-1">
                <ZapIcon size={11} />
                <p className="text-xs leading-tight truncate" style={{ color: 'var(--gold)' }}>
                  {p.activity}
                </p>
              </div>

              {/* 話したいこと */}
              <div className="flex items-start gap-1 mt-2">
                <span className="flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  <ChatIcon size={11} />
                </span>
                <p
                  className="text-xs leading-snug"
                  style={{
                    color: 'var(--text-muted)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {p.want_to_talk}
                </p>
              </div>

              {/* タグ */}
              <div className="mt-2">
                <span
                  className="text-xs px-2 py-0.5 rounded-full inline-block"
                  style={{
                    background: tag.bg,
                    color: tag.text,
                    border: `1px solid ${tag.border}`,
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                >
                  {p.dream.length > 18 ? p.dream.slice(0, 18) + '…' : p.dream}
                </span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
