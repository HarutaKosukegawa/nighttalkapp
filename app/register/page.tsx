'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { CameraIcon } from '@/components/Icons'

// 日付ごとのテーマ
type EventTheme = {
  bodyBg: string
  text: string
  textMuted: string
  brand: string
  accent: string
  accentText: string
  inputBg: string
  inputBorder: string
  inputText: string
  inputPlaceholder: string
  errorBg: string
  errorBorder: string
  errorText: string
  photoEmptyBg: string
  galleryBtnBg: string
  cameraBtnBg: string
  starsHidden: boolean
}

const EVENT_THEMES: Record<string, EventTheme> = {
  '2026-05-10': {
    bodyBg: 'linear-gradient(180deg, #F4E4C4 0%, #ECDCBC 100%)',
    text: '#3D2817',
    textMuted: '#8B6F47',
    brand: '#A06030',
    accent: '#C97A3A',
    accentText: '#FFF8E7',
    inputBg: 'rgba(255,248,235,0.7)',
    inputBorder: 'rgba(92,61,32,0.22)',
    inputText: '#3D2817',
    inputPlaceholder: 'rgba(92,61,32,0.35)',
    errorBg: 'rgba(180,40,40,0.10)',
    errorBorder: 'rgba(180,40,40,0.30)',
    errorText: '#A52A2A',
    photoEmptyBg: 'rgba(255,248,235,0.5)',
    galleryBtnBg: 'rgba(255,248,235,0.6)',
    cameraBtnBg: 'rgba(201,122,58,0.12)',
    starsHidden: true,
  },
}

const EVENT_TITLES: Record<string, string> = {
  '2026-05-10': 'よいしょ徳島！',
  '2026-05-16': '深夜の語り場',
  '2026-06-07': '深夜の語り場',
}

// 画像を canvas で 4:5 ポートレートに切り取り、最大 1600px にリサイズ + JPEG（q=0.85）圧縮
async function compressToPortrait(file: File, maxDim = 1600, quality = 0.85): Promise<Blob> {
  const url = URL.createObjectURL(file)
  const image = new window.Image()
  image.src = url
  await new Promise((resolve, reject) => {
    image.onload = () => resolve(null)
    image.onerror = () => reject(new Error('image load failed'))
  })
  URL.revokeObjectURL(url)

  // 4:5 ポートレートにセンタークロップ
  const targetRatio = 4 / 5
  const srcRatio = image.width / image.height
  let cropX = 0, cropY = 0, cropW = image.width, cropH = image.height
  if (srcRatio > targetRatio) {
    cropW = image.height * targetRatio
    cropX = (image.width - cropW) / 2
  } else {
    cropH = image.width / targetRatio
    cropY = (image.height - cropH) / 2
  }

  // 出力サイズを最大辺 maxDim にスケール
  let outW = cropW, outH = cropH
  const longSide = Math.max(outW, outH)
  if (longSide > maxDim) {
    const scale = maxDim / longSide
    outW = Math.round(outW * scale)
    outH = Math.round(outH * scale)
  }

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(outW)
  canvas.height = Math.round(outH)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas ctx failed')
  ctx.drawImage(image, cropX, cropY, cropW, cropH, 0, 0, outW, outH)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('compress failed'))),
      'image/jpeg',
      quality,
    )
  })
}

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventDate = searchParams.get('event') ?? new Date().toISOString().split('T')[0]
  const theme = EVENT_THEMES[eventDate] ?? null
  const eventTitle = EVENT_TITLES[eventDate] ?? 'イベント'

  const textColor = theme?.text ?? 'white'
  const mutedColor = theme?.textMuted ?? 'var(--text-muted)'
  const brandColor = theme?.brand ?? 'var(--gold)'
  const accentColor = theme?.accent ?? 'var(--gold)'
  const labelColor = theme?.text ?? 'rgba(255,255,255,0.8)'
  const counterColor = theme?.textMuted ?? 'rgba(255,255,255,0.2)'

  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [activity, setActivity] = useState('')
  const [dream, setDream] = useState('')
  const [concern, setConcern] = useState('')
  const [wantToTalk, setWantToTalk] = useState('')
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setProcessing(true)
    setError('')
    try {
      const blob = await compressToPortrait(file)
      setPhotoBlob(blob)
      if (photoPreview) URL.revokeObjectURL(photoPreview)
      setPhotoPreview(URL.createObjectURL(blob))
    } catch {
      setError('写真の処理に失敗しました')
    } finally {
      setProcessing(false)
    }
  }

  const handleDeletePhoto = () => {
    setPhotoBlob(null)
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!photoBlob || !name || !activity || !dream || !concern || !wantToTalk) {
      setError('すべての項目を入力してください（写真も必須です）')
      return
    }
    setLoading(true)
    setError('')
    try {
      let outfitPhotoUrl: string | null = null
      if (photoBlob) {
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
        const { error: uploadError } = await supabase.storage
          .from('outfits')
          .upload(fileName, photoBlob, { contentType: 'image/jpeg', upsert: false })
        if (uploadError) throw new Error(`写真アップロード失敗: ${uploadError.message}`)
        const { data: urlData } = supabase.storage.from('outfits').getPublicUrl(fileName)
        outfitPhotoUrl = urlData.publicUrl
      }
      const { data, error: insertError } = await supabase
        .from('participants')
        .insert({ event_date: eventDate, name, age: age ? parseInt(age) : null, activity, dream, concern, want_to_talk: wantToTalk, outfit_photo_url: outfitPhotoUrl })
        .select('id')
        .single()
      if (insertError) throw new Error(`登録失敗: ${insertError.message}`)
      localStorage.setItem(`my_id_${eventDate}`, data.id)
      router.push(`/events/${eventDate}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const formattedDate = new Date(eventDate + 'T00:00:00').toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })

  const overlayInputStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
    zIndex: 2,
  }

  return (
    <div className="min-h-screen pb-12" data-theme={theme ? 'yoisho' : undefined}>
      {theme && (
        <style
          dangerouslySetInnerHTML={{
            __html: `body { background: ${theme.bodyBg} !important; } ${theme.starsHidden ? '.star-field, .shooting-star { display: none !important; }' : ''} [data-theme="yoisho"] .dark-input { background: ${theme.inputBg}; border-color: ${theme.inputBorder}; color: ${theme.inputText}; } [data-theme="yoisho"] .dark-input::placeholder { color: ${theme.inputPlaceholder}; } [data-theme="yoisho"] .dark-input:focus { border-color: ${theme.accent}; } [data-theme="yoisho"] .btn-primary { background: ${theme.accent}; color: ${theme.accentText}; }`,
          }}
        />
      )}

      <div className="px-5 pt-4 pb-1">
        <Link href={`/events/${eventDate}`} className="inline-flex items-center gap-1 text-sm font-bold py-2 -ml-1 px-1" style={{ color: brandColor }}>
          ← {eventTitle}に戻る
        </Link>
      </div>

      <div className="px-5 pt-2 pb-6">
        <p className="text-xs font-bold tracking-widest mb-1" style={{ color: brandColor, fontFamily: 'var(--font-space-mono)' }}>{formattedDate}</p>
        <h1 className="text-2xl font-black" style={{ color: textColor, fontFamily: 'var(--font-space-mono)' }}>自己紹介を登録</h1>
        <p className="text-sm mt-1" style={{ color: mutedColor }}>話したい人を見つけよう</p>
      </div>

      <form onSubmit={handleSubmit} className="px-5 space-y-5">
        <div>
          <label className="block text-sm font-bold mb-1" style={{ color: labelColor }}>写真<span className="ml-1" style={{ color: accentColor }}>*</span></label>
          <p className="text-xs mb-3" style={{ color: accentColor }}>服装か顔写真のどちらかでお願いします</p>

          {photoPreview ? (
            <>
              <div className="relative w-full rounded-2xl overflow-hidden mb-3" style={{ paddingBottom: '125%' }}>
                <Image src={photoPreview} alt="プレビュー" fill style={{ objectFit: 'cover' }} unoptimized />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input type="file" accept="image/*" onChange={handlePhotoChange} style={overlayInputStyle} aria-label="写真を差し替える" />
                  <div className="py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2" style={{ background: theme?.galleryBtnBg ?? 'rgba(255,255,255,0.07)', border: `1px solid ${theme?.inputBorder ?? 'rgba(255,255,255,0.15)'}`, color: theme?.text ?? 'white' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 12a9 9 0 1 1-3.5-7.13" />
                      <polyline points="21 4 21 10 15 10" />
                    </svg>
                    {processing ? '処理中...' : '差し替え'}
                  </div>
                </div>
                <button type="button" onClick={handleDeletePhoto} className="py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2" style={{ background: 'rgba(220,80,80,0.10)', border: '1px solid rgba(220,80,80,0.35)', color: '#C04040' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                  </svg>
                  削除
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-full rounded-2xl flex items-center justify-center mb-3" style={{ height: 100, background: theme?.photoEmptyBg ?? 'rgba(255,255,255,0.04)', border: `1.5px dashed ${theme?.inputBorder ?? 'rgba(255,255,255,0.15)'}` }}>
                <div className="flex flex-col items-center gap-1" style={{ color: theme?.textMuted ?? 'rgba(255,255,255,0.25)' }}>
                  <CameraIcon size={28} />
                  <span className="text-xs">{processing ? '処理中...' : '写真が選ばれていません'}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input type="file" accept="image/*" onChange={handlePhotoChange} style={overlayInputStyle} aria-label="フォルダーから写真を選ぶ" />
                  <div className="py-3 rounded-xl text-sm font-bold flex flex-col items-center gap-1.5" style={{ background: theme?.galleryBtnBg ?? 'rgba(255,255,255,0.07)', border: `1px solid ${theme?.inputBorder ?? 'rgba(255,255,255,0.15)'}`, color: theme?.text ?? 'white' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    フォルダーから選ぶ
                  </div>
                </div>
                <div className="relative">
                  <input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} style={overlayInputStyle} aria-label="カメラで写真を撮る" />
                  <div className="py-3 rounded-xl text-sm font-bold flex flex-col items-center gap-1.5" style={{ background: theme?.cameraBtnBg ?? 'rgba(201,169,110,0.12)', border: `1px solid ${theme ? 'rgba(201,122,58,0.35)' : 'rgba(201,169,110,0.35)'}`, color: accentColor }}>
                    <CameraIcon size={22} />
                    今すぐ撮影する
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <DarkField label="名前" required value={name} onChange={setName} placeholder="例: 山田 太郎" maxLength={30} labelColor={labelColor} accentColor={accentColor} counterColor={counterColor} />
          </div>
          <div style={{ width: 80 }}>
            <DarkField label="年齢" value={age} onChange={setAge} placeholder="25" maxLength={3} inputMode="numeric" labelColor={labelColor} accentColor={accentColor} counterColor={counterColor} />
          </div>
        </div>

        <DarkField label="活動・やっていること" required value={activity} onChange={setActivity} placeholder="例: AIスタートアップで開発してます" maxLength={100} multiline labelColor={labelColor} accentColor={accentColor} counterColor={counterColor} />
        <DarkField label="夢" required value={dream} onChange={setDream} placeholder="例: 日本の教育を変えること" maxLength={100} multiline labelColor={labelColor} accentColor={accentColor} counterColor={counterColor} />
        <DarkField label="今の悩み" required value={concern} onChange={setConcern} placeholder="例: 仲間の見つけ方がわからない" maxLength={150} multiline labelColor={labelColor} accentColor={accentColor} counterColor={counterColor} />
        <DarkField label="話したいこと・話したい人" required value={wantToTalk} onChange={setWantToTalk} placeholder="例: 起業経験のある人と資金調達について話したい" maxLength={200} multiline labelColor={labelColor} accentColor={accentColor} counterColor={counterColor} />

        {error && (
          <p className="text-sm p-3 rounded-xl" style={{ background: theme?.errorBg ?? 'rgba(220,38,38,0.15)', color: theme?.errorText ?? '#f87171', border: `1px solid ${theme?.errorBorder ?? 'rgba(220,38,38,0.3)'}` }}>{error}</p>
        )}

        <button type="submit" disabled={loading || processing} className="btn-primary w-full text-base" style={{ borderRadius: 14 }}>
          {loading ? '登録中...' : '登録して参加者を見る →'}
        </button>
      </form>
    </div>
  )
}

function DarkField({ label, required, value, onChange, placeholder, maxLength, multiline, inputMode, labelColor, accentColor, counterColor }: { label: string; required?: boolean; value: string; onChange: (v: string) => void; placeholder: string; maxLength?: number; multiline?: boolean; inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']; labelColor?: string; accentColor?: string; counterColor?: string }) {
  const lc = labelColor ?? 'rgba(255,255,255,0.8)'
  const ac = accentColor ?? 'var(--gold)'
  const cc = counterColor ?? 'rgba(255,255,255,0.2)'
  return (
    <div>
      <label className="block text-sm font-bold mb-2" style={{ color: lc }}>{label}{required && <span className="ml-1" style={{ color: ac }}>*</span>}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} rows={3} className="dark-input" style={{ resize: 'none' }} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} inputMode={inputMode} className="dark-input" />
      )}
      {maxLength && (
        <p className="text-right text-xs mt-1" style={{ color: cc }}>{value.length}/{maxLength}</p>
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
