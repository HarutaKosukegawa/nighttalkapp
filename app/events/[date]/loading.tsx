'use client'

import { useParams } from 'next/navigation'

// /events/[date] 遷移中に即時表示されるローディング画面。
// loading.tsx があると Next.js App Router は Link クリックの瞬間にこれを表示し、
// サーバーコンポーネントのレンダリングをバックグラウンドで待つため、
// ダシュボード動作がオフラインうトよりも "何も反応していない" に見える時間がゼロに近づく。
export default function Loading() {
  const params = useParams<{ date: string }>()
  const isYoisho = params?.date === '2026-05-10'

  // テーマごとのスケルトン色
  const skeletonBg = isYoisho ? 'rgba(160,96,48,0.15)' : 'rgba(255,255,255,0.08)'
  const bodyBg = isYoisho
    ? 'linear-gradient(180deg, #F4E4C4 0%, #ECDCBC 100%)'
    : undefined

  return (
    <div className="min-h-screen pb-28">
      {/* テーマ色と2個の上書き（夜空背景や星をクリーム色にさせる） */}
      {isYoisho && (
        <style
          dangerouslySetInnerHTML={{
            __html: `body { background: ${bodyBg} !important; } .star-field, .shooting-star { display: none !important; }`,
          }}
        />
      )}

      <div className="px-5 pt-8 pb-4">
        <div
          className="h-3 w-40 mb-3 rounded animate-pulse"
          style={{ background: skeletonBg }}
        />
        <div
          className="h-9 w-48 rounded animate-pulse"
          style={{ background: skeletonBg }}
        />
      </div>
      <div className="px-5 py-3 flex gap-2">
        <div className="h-9 w-16 rounded-full animate-pulse" style={{ background: skeletonBg }} />
        <div className="h-9 w-16 rounded-full animate-pulse" style={{ background: skeletonBg }} />
      </div>
      <div className="px-5 pt-6">
        <p className="text-sm font-bold opacity-50" style={{ color: isYoisho ? '#3D2817' : '#FFFFFF' }}>
          読み込み中...
        </p>
      </div>
    </div>
  )
}
