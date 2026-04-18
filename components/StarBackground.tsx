'use client'

import { useMemo } from 'react'

function seeded(seed: number): number {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

export default function StarBackground() {
  const stars = useMemo(() =>
    Array.from({ length: 160 }, (_, i) => ({
      x: seeded(i * 3 + 1) * 100,
      y: seeded(i * 3 + 2) * 100,
      size: seeded(i * 3 + 3) * 1.8 + 0.4,
      opFrom: seeded(i * 7) * 0.5 + 0.1,
      opTo: seeded(i * 11) * 0.4 + 0.5,
      delay: seeded(i * 13) * 4,
      duration: seeded(i * 17) * 3 + 2,
    }))
  , [])

  return (
    <div className="star-field" aria-hidden="true">
      {stars.map((s, i) => (
        <div
          key={i}
          className="star"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            '--op-from': s.opFrom,
            '--op-to': s.opTo,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          } as React.CSSProperties}
        />
      ))}
      <div className="shooting-star" />
      <div className="shooting-star" />
      <div className="shooting-star" />
      <div className="shooting-star" />
      <div className="shooting-star" />
      <div className="shooting-star" />
    </div>
  )
}
