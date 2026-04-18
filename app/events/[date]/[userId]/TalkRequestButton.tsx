'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { HeartIcon } from '@/components/Icons'

type Status = 'loading' | 'self' | 'matched' | 'sent' | 'idle'

export default function TalkRequestButton({ participantId, participantName, eventDate }: {
  participantId: string; participantName: string; eventDate: string
}) {
  const [myId, setMyId] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const id = localStorage.getItem(`my_id_${eventDate}`)
    setMyId(id)
    if (!id) { setStatus('idle'); return }
    if (id === participantId) { setStatus('self'); return }
    checkStatus(id)
  }, [participantId, eventDate])

  async function checkStatus(fromId: string) {
    const [{ data: iSent }, { data: theySent }] = await Promise.all([
      supabase.from('talk_requests').select('id').eq('from_participant_id', fromId).eq('to_participant_id', participantId).maybeSingle(),
      supabase.from('talk_requests').select('id').eq('from_participant_id', participantId).eq('to_participant_id', fromId).maybeSingle(),
    ])
    if (iSent && theySent) setStatus('matched')
    else if (iSent) setStatus('sent')
    else setStatus('idle')
  }

  async function handleSend() {
    if (!myId || sending) return
    const fromId = myId
    setSending(true)
    try {
      await supabase.from('talk_requests').insert({
        from_participant_id: fromId,
        to_participant_id: participantId,
        event_date: eventDate,
      })
      await checkStatus(fromId)
    } finally {
      setSending(false)
    }
  }

  if (status === 'loading') return null

  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 pb-8 pt-6"
      style={{ background: 'linear-gradient(to top, #060c1a 60%, transparent)', zIndex: 10 }}
    >
      {status === 'self' ? (
        <div className="glass-card w-full py-4 text-center text-sm font-bold" style={{ color: 'var(--text-muted)' }}>
          これはあなたのプロフィールです
        </div>
      ) : status === 'matched' ? (
        <div className="w-full py-4 rounded-2xl text-center font-bold text-base pulse-glow"
          style={{ background: 'linear-gradient(135deg, #3A9E6F, #2A8FB0)', color: 'white' }}>
          マッチング成立！ぜひ話しかけてみよう
        </div>
      ) : status === 'sent' ? (
        <div className="w-full py-4 rounded-2xl text-center text-sm font-bold"
          style={{ background: 'transparent', color: 'var(--gold)', border: '1.5px solid var(--gold)' }}>
          <HeartIcon size={14} filled /> リクエスト送信済み
        </div>
      ) : (
        <button onClick={handleSend} disabled={sending} className="btn-primary w-full text-base" style={{ borderRadius: 16 }}>
          {sending ? '送信中...' : `${participantName}さんと話したい！`}
        </button>
      )}
      {!myId && status === 'idle' && (
        <p className="text-center text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
          ※ 登録すると「話したい！」が使えます
        </p>
      )}
    </div>
  )
}
