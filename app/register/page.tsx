'use client'

import { useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { CameraIcon } from '@/components/Icons'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventDate = searchParams.get('event') ?? new Date().toISOString().split('T')[0]

  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [activity, setActivity] = useState('')
  const [dream, setDream] = useState('')
  const [concern, setConcern] = useState('')
  const [wantToTalk, setWantToTalk] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const galleryInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!photoFile || !name || !activity || !dream || !concern || !wantToTalk) {
      setError('すべての項目を入力してください（写真も必須です）')
      return
    }
    setLoading(true)
    setError('')
    try {
      let outfitPhotoUrl: string | null = null
      if (photoFile) {
        const ext = photoFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('outfits')
          .upload(fileName, photoFile, { upsert: false })
        if (uploadError) throw new Error('写真のアップロードに失敗しました')
        const { data: urlData } = supabase.storage.from('outfits').getPublicUrl(fileName)
        outfitPhotoUrl = urlData.publicUrl
      }
      const { data, error: insertError } = await supabase
        .from('participants')
        .insert({ event_date: eventDate, name, age: age ? parseInt(age) : null, activity, dream, concern, want_to_talk: wantToTalk, outfit_photo_url: outfitPhotoUrl })
        .select('id')
        .single()
      if (insertError) throw new Error('登録に失敗しました')
      localStorage.setItem(`my_id_${eventDate}`, data.id)
      router.push(`/events/${eventDate}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const formattedDate = new Date(eventDate + 'T00:00:00').toLocaleDateString('ja-JP', {
    month: 'long', day: 'numeric', weekday: 'short',
  })

  return (
    <div className="min-h-screen pb-12">
      {/* ヘッダー */}
      <div className="px-5 pt-6 pb-6">
        <p className="text-xs font-bold tracking-widest mb-1" style={{ color: 'var(--gold)', fontFamily: 'var(--font-space-mono)' }}>
          {formattedDate}
        </p>
        <h1 className="text-2xl font-black" style={{ color: 'white', fontFamily: 'var(--font-space-mono)' }}>
          自己紹介を登録
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>話したい人を見つけよう</p>
      </div>

      <form onSubmit={handleSubmit} className="px-5 space-y-5">
        {/* 写真アップロード */}
        <div>
          <label className="block text-sm font-bold mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
            写真<span className="ml-1" style={{ color: 'var(--gold)' }}>*</span>
          </label>
          <p className="text-xs mb-3" style={{ color: 'var(--gold)' }}>
            服装か顔写真のどちらかでお願いします
          </p>

          {/* プレビュー */}
          {photoPreview ? (
            <div className="relative w-full rounded-2xl overflow-hidden mb-3" style={{ paddingBottom: '70%' }}>
              <Image src={photoPreview} alt="プレビュー" fill style={{ objectFit: 'cover' }} />
              <button
                type="button"
                onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}
                className="absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}
              >
                削除
              </button>
            </div>
          ) : (
            <div
              className="w-full rounded-2xl flex items-center justify-center mb-3"
              style={{ height: 100, background: 'rgba(255,255,255,0.04)', border: '1.5px dashed rgba(255,255,255,0.15)' }}
            >
              <div className="flex flex-col items-center gap-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                <CameraIcon size={28} />
                <span className="text-xs">写真が選ばれていません</span>
              </div>
            </div>
          )}

          {/* 2つのボタン */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="py-3 rounded-xl text-sm font-bold flex flex-col items-center gap-1.5 transition-all"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'white',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              フォルダーから選ぶ
            </button>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="py-3 rounded-xl text-sm font-bold flex flex-col items-center gap-1.5 transition-all"
              style={{
                background: 'rgba(201,169,110,0.12)',
                border: '1px solid rgba(201,169,110,0.35)',
                color: 'var(--gold)',
              }}
            >
              <CameraIcon size={22} />
              今すぐ撮影する
            </button>
          </div>

          {/* ファイル入力（2つ） */}
          <input ref={galleryInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} className="hidden" />
        </div>

        {/* 名前・年齢 */}
        <div className="flex gap-3">
          <div className="flex-1">
            <DarkField label="名前" required value={name} onChange={setName} placeholder="例: 山田 太郎" maxLength={30} />
          </div>
          <div style={{ width: 80 }}>
            <DarkField label="年齢" value={age} onChange={setAge} placeholder="25" maxLength={3} inputMode="numeric" />
          </div>
        </div>
        <DarkField label="活動・やっていること" required value={activity} onChange={setActivity} placeholder="例: AIスタートアップで開発してます" maxLength={100} multiline />
        <DarkField label="夢" required value={dream} onChange={setDream} placeholder="例: 日本の教育を変えること" maxLength={100} multiline />
        <DarkField label="今の悩み" required value={concern} onChange={setConcern} placeholder="例: 仲間の見つけ方がわからない" maxLength={150} multiline />
        <DarkField label="話したいこと・話したい人" required value={wantToTalk} onChange={setWantToTalk} placeholder="例: 起業経験のある人と資金調達について話したい" maxLength={200} multiline />

        {error && (
          <p className="text-sm p-3 rounded-xl" style={{ background: 'rgba(220,38,38,0.15)', color: '#f87171', border: '1px solid rgba(220,38,38,0.3)' }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full text-base" style={{ borderRadius: 14 }}>
          {loading ? '登録中...' : '登録して参加者を見る →'}
        </button>
      </form>
    </div>
  )
}

function DarkField({ label, required, value, onChange, placeholder, maxLength, multiline, inputMode }: {
  label: string; required?: boolean; value: string; onChange: (v: string) => void
  placeholder: string; maxLength?: number; multiline?: boolean; inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
}) {
  return (
    <div>
      <label className="block text-sm font-bold mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
        {label}
        {required && <span className="ml-1" style={{ color: 'var(--gold)' }}>*</span>}
      </label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} rows={3}
          className="dark-input" style={{ resize: 'none' }} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength}
          inputMode={inputMode} className="dark-input" />
      )}
      {maxLength && (
        <p className="text-right text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>{value.length}/{maxLength}</p>
      )}
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-sm" style={{ color: 'var(--text-muted)' }}>読み込み中...</div>}>
      <RegisterForm />
    </Suspense>
  )
}
