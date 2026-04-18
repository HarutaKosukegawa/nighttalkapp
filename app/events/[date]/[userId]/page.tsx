export const dynamic = 'force-dynamic'

import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import TalkRequestButton from './TalkRequestButton'
import type { Participant } from '@/types/database'
import { ZapIcon, StarIcon, CloudIcon, ChatIcon, ArrowLeftIcon } from '@/components/Icons'

async function getParticipant(userId: string): Promise<Participant | null> {
  const { data } = await supabase.from('participants').select('*').eq('id', userId).single()
  return data
}

async function getRequestCount(toId: string): Promise<number> {
  const { count } = await supabase
    .from('talk_requests').select('*', { count: 'exact', head: true }).eq('to_participant_id', toId)
  return count ?? 0
}

const INFO_SECTIONS = [
  { key: 'activity' as const,    label: '活動・やっていること', Icon: ZapIcon },
  { key: 'dream' as const,       label: '夢',                  Icon: StarIcon },
  { key: 'concern' as const,     label: '今の悩み',            Icon: CloudIcon },
  { key: 'want_to_talk' as const, label: '話したいこと・話したい人', Icon: ChatIcon },
]

export default async function ParticipantDetailPage({
  params,
}: {
  params: Promise<{ date: string; userId: string }>
}) {
  const { date, userId } = await params
  const [participant, requestCount] = await Promise.all([getParticipant(userId), getRequestCount(userId)])
  if (!participant) notFound()

  return (
    <div className="min-h-screen pb-36">
      {/* 戻る */}
      <div className="px-5 pt-6">
        <Link href={`/events/${date}`} className="inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: 'var(--gold)' }}>
          <ArrowLeftIcon size={16} />
          一覧に戻る
        </Link>
      </div>

      {/* 写真 */}
      <div className="mt-4 px-5">
        <div className="relative w-full rounded-2xl overflow-hidden" style={{ paddingBottom: '115%' }}>
          {participant.outfit_photo_url ? (
            <Image src={participant.outfit_photo_url} alt={`${participant.name}の服装`} fill style={{ objectFit: 'cover' }} sizes="430px" priority />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 glass-card" style={{ borderRadius: 0 }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>写真なし</span>
            </div>
          )}
          {requestCount > 0 && (
            <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-sm font-bold pulse-glow"
              style={{ background: 'var(--gold)', color: '#060c1a' }}>
              {requestCount}人が話したい
            </div>
          )}
        </div>
      </div>

      {/* 名前 */}
      <div className="px-5 mt-5">
        <h1 className="text-3xl font-black" style={{ color: 'white', fontFamily: 'var(--font-space-mono)' }}>
          {participant.name}
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          {new Date(participant.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} 登録
        </p>
      </div>

      {/* 情報セクション */}
      <div className="px-5 mt-5 space-y-3">
        {INFO_SECTIONS.map(({ key, label, Icon }) => (
          <div key={key} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span style={{ color: 'var(--gold)' }}><Icon size={14} /></span>
              <p className="text-xs font-bold tracking-wide" style={{ color: 'var(--gold)' }}>{label}</p>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {participant[key]}
            </p>
          </div>
        ))}
      </div>

      <TalkRequestButton participantId={participant.id} participantName={participant.name} eventDate={date} />
    </div>
  )
}
