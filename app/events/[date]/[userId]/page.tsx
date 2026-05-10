// 10秒間キャッシュしてナビゲーションを高速化
export const revalidate = 10

import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Participant } from '@/types/database'
import { ZapIcon, StarIcon, CloudIcon, ChatIcon, ArrowLeftIcon } from '@/components/Icons'

async function getParticipant(userId: string): Promise<Participant | null> {
  const { data } = await supabase.from('participants').select('*').eq('id', userId).single()
  return data
}

const INFO_SECTIONS = [
  { key: 'activity' as const, label: '活動・やっていること', Icon: ZapIcon },
  { key: 'dream' as const, label: '夢', Icon: StarIcon },
  { key: 'concern' as const, label: '今の悩み', Icon: CloudIcon },
  { key: 'want_to_talk' as const, label: '話したいこと・話したい人', Icon: ChatIcon },
]

// 5/10 よいしょ徳島 テーマ判定
const YOISHO_DATE = '2026-05-10'

export default async function ParticipantDetailPage({
  params,
}: {
  params: Promise<{ date: string; userId: string }>
}) {
  const { date, userId } = await params
  const participant = await getParticipant(userId)
  if (!participant) notFound()

  const isYoisho = date === YOISHO_DATE

  // テーマカラー
  const c = isYoisho
    ? {
        bodyBg: 'linear-gradient(180deg, #F4E4C4 0%, #ECDCBC 100%)',
        text: '#3D2817',
        textMuted: '#8B6F47',
        accent: '#C97A3A',
        cardBg: 'rgba(255,248,235,0.7)',
        cardBorder: 'rgba(92,61,32,0.18)',
        photoBg: 'rgba(92,61,32,0.06)',
        photoIconStroke: 'rgba(92,61,32,0.35)',
        starsHidden: true,
      }
    : {
        bodyBg: '',
        text: 'white',
        textMuted: 'var(--text-muted)',
        accent: 'var(--gold)',
        cardBg: 'rgba(255,255,255,0.06)',
        cardBorder: 'rgba(255,255,255,0.1)',
        photoBg: 'rgba(255,255,255,0.05)',
        photoIconStroke: 'rgba(255,255,255,0.2)',
        starsHidden: false,
      }

  return (
    <div className="min-h-screen pb-36">
      {/* テーマごとのグローバルスタイル上書き */}
      {isYoisho && (
        <style
          dangerouslySetInnerHTML={{
            __html: `body { background: ${c.bodyBg} !important; } .star-field, .shooting-star { display: none !important; }`,
          }}
        />
      )}

      {/* 戻る */}
      <div className="px-5 pt-6">
        <Link
          href={`/events/${date}`}
          className="inline-flex items-center gap-1.5 text-sm font-bold"
          style={{ color: c.accent }}
        >
          <ArrowLeftIcon size={16} />
          一覧に戻る
        </Link>
      </div>

      {/* 写真 */}
      <div className="mt-4 px-5">
        <div
          className="relative w-full rounded-2xl overflow-hidden"
          style={{ paddingBottom: '115%', background: c.cardBg }}
        >
          {participant.outfit_photo_url ? (
            <Image
              src={participant.outfit_photo_url}
              alt={`${participant.name}の服装`}
              fill
              style={{ objectFit: 'cover' }}
              sizes="430px"
              priority
            />
          ) : (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              style={{ background: c.photoBg }}
            >
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={c.photoIconStroke} strokeWidth="1">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
              <span className="text-sm" style={{ color: c.textMuted }}>写真なし</span>
            </div>
          )}
        </div>
      </div>

      {/* 名前 */}
      <div className="px-5 mt-5">
        <div className="flex items-baseline gap-3">
          <h1
            className="text-3xl font-black"
            style={{ color: c.text, fontFamily: 'var(--font-space-mono)' }}
          >
            {participant.name}
          </h1>
          {participant.age != null && (
            <span className="text-lg font-bold" style={{ color: c.textMuted }}>
              {participant.age}歳
            </span>
          )}
        </div>
        <p className="text-xs mt-1" style={{ color: c.textMuted }}>
          {new Date(participant.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} 登録
        </p>
      </div>

      {/* 情報セクション */}
      <div className="px-5 mt-5 space-y-3">
        {INFO_SECTIONS.map(({ key, label, Icon }) => (
          <div
            key={key}
            className="p-4"
            style={{
              background: c.cardBg,
              border: `1px solid ${c.cardBorder}`,
              borderRadius: 16,
              backdropFilter: 'blur(8px)',
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span style={{ color: c.accent }}><Icon size={14} /></span>
              <p className="text-xs font-bold tracking-wide" style={{ color: c.accent }}>{label}</p>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: c.text }}>
              {participant[key]}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
