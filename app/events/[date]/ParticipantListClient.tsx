'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Participant } from '@/types/database'

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
  useEffect(() => {
    setMyId(localStorage.getItem(`my_id_${eventDate}`))
  }, [eventDate])

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
      }

  return (
    <div className="px-4 grid grid-cols-2 gap-3">
      {participants.map((p, i) => {
        const isMe = p.id === myId
        return (
          <Link
            key={p.id}
            href={`/events/${eventDate}/${p.id}`}
            className="overflow-hidden animate-fade-in-up block transition-all"
            style={{
              animationDelay: `${i * 30}ms`,
              opacity: 0,
              background: c.cardBg,
              border: `1px solid ${c.cardBorder}`,
              borderRadius: 14,
              backdropFilter: 'blur(8px)',
            }}
          >
            {/* 写真（4:5 縦長） */}
            <div className="relative w-full" style={{ paddingBottom: '125%' }}>
              {p.outfit_photo_url ? (
                <Image
                  src={p.outfit_photo_url}
                  alt={`${p.name}の写真`}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="50vw"
                />
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: c.photoEmptyBg }}
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={c.photoEmptyIconStroke} strokeWidth="1.5">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                </div>
              )}
              {isMe && (
                <div
                  className="absolute top-1.5 left-1.5 text-xs font-bold px-2 py-0.5 rounded-md"
                  style={{ background: c.accent, color: c.accentText, fontSize: 11 }}
                >
                  自分
                </div>
              )}
            </div>

            {/* テキスト */}
            <div className="px-2.5 py-2.5">
              <div className="flex items-baseline gap-1.5">
                <p className="font-bold text-sm leading-tight truncate" style={{ color: c.name }}>
                  {p.name}
                </p>
                {p.age != null && (
                  <span className="text-xs flex-shrink-0" style={{ color: c.muted }}>
                    {p.age}歳
                  </span>
                )}
              </div>
              <p className="text-xs mt-1 leading-snug truncate" style={{ color: c.label, fontWeight: 700 }}>
                {p.activity}
              </p>
              <p
                className="text-xs mt-0.5 leading-snug"
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
          </Link>
        )
      })}
    </div>
  )
}
