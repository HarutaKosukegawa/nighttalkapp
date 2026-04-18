'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Participant } from '@/types/database'

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
        return (
          <Link
            key={p.id}
            href={`/events/${eventDate}/${p.id}`}
            className="glass-card flex gap-0 overflow-hidden animate-fade-in-up block transition-all"
            style={{ animationDelay: `${i * 50}ms`, opacity: 0 }}
          >
            {/* 写真エリア */}
            <div className="relative flex-shrink-0" style={{ width: 90, minHeight: 130 }}>
              {p.outfit_photo_url ? (
                <Image
                  src={p.outfit_photo_url}
                  alt={`${p.name}の写真`}
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
              {/* 名前・年齢 */}
              <div className="flex items-baseline gap-2 justify-between">
                <div className="flex items-baseline gap-2 min-w-0">
                  <p className="font-bold text-base leading-tight truncate" style={{ color: 'white' }}>
                    {p.name}
                  </p>
                  {p.age != null && (
                    <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                      {p.age}歳
                    </span>
                  )}
                </div>
                <span style={{ color: 'var(--gold)', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </span>
              </div>

              {/* 活動 */}
              <div className="mt-2">
                <p className="text-xs font-bold mb-0.5" style={{ color: 'var(--gold)' }}>活動</p>
                <p className="text-xs leading-snug truncate" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {p.activity}
                </p>
              </div>

              {/* 夢 */}
              <div className="mt-1.5">
                <p className="text-xs font-bold mb-0.5" style={{ color: 'var(--gold)' }}>夢</p>
                <p className="text-xs leading-snug truncate" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {p.dream}
                </p>
              </div>

              {/* 話したい人 */}
              <div className="mt-1.5">
                <p className="text-xs font-bold mb-0.5" style={{ color: 'var(--gold)' }}>話したい人</p>
                <p
                  className="text-xs leading-snug"
                  style={{
                    color: 'rgba(255,255,255,0.8)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {p.want_to_talk}
                </p>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
