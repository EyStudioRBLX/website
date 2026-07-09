'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Briefcase, ChevronRight, Gamepad2, FileText } from 'lucide-react'

interface Position {
  _id: string
  title: string
  description: string
  requirements: string
  gameName: string
  status: 'open' | 'closed'
}

export default function ApplyPage() {
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/positions')
      .then((r) => r.json())
      .then((d) => setPositions(d.positions ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen hex-bg" style={{ background: '#08010f' }}>
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'rgba(109,40,217,0.2)', border: '1px solid rgba(109,40,217,0.4)' }}
          >
            <Briefcase size={26} style={{ color: '#8b5cf6' }} />
          </div>
          <h1
            className="text-4xl md:text-5xl text-white mb-3"
            style={{ fontFamily: 'Fredoka One, sans-serif' }}
          >
            Offene <span style={{ color: '#8b5cf6' }}>Stellen</span>
          </h1>
          <p className="text-rb-light/50 text-lg max-w-xl mx-auto">
            Werde Teil des EyStudio-Teams. Bewirb dich jetzt für eine offene Position!
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rb-panel h-48 animate-pulse"
                style={{ transition: 'none' }}
              />
            ))}
          </div>
        ) : positions.length === 0 ? (
          <div
            className="rb-panel p-12 text-center"
            style={{ transition: 'none' }}
          >
            <FileText size={40} className="mx-auto mb-4" style={{ color: 'rgba(139,92,246,0.4)' }} />
            <p className="text-white text-lg font-display mb-2">Aktuell keine offenen Stellen</p>
            <p className="text-rb-light/40 text-sm">
              Schau später wieder vorbei oder tritt unserem Discord bei um immer auf dem neuesten Stand zu sein.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {positions.map((pos) => (
              <div
                key={pos._id}
                className="rb-panel p-5 flex flex-col"
                style={{ transition: 'none' }}
              >
                {/* Title row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h2 className="text-white font-display text-lg leading-tight">{pos.title}</h2>
                  <span
                    className="rb-badge shrink-0"
                    style={{
                      background: 'rgba(34,197,94,0.12)',
                      color: '#22c55e',
                      border: '1px solid rgba(34,197,94,0.3)',
                      fontSize: '0.6rem',
                    }}
                  >
                    OFFEN
                  </span>
                </div>

                {/* Game badge */}
                {pos.gameName && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <Gamepad2 size={13} style={{ color: '#8b5cf6' }} />
                    <span className="text-xs text-rb-light/60">{pos.gameName}</span>
                  </div>
                )}

                {/* Description */}
                <p className="text-sm text-rb-light/55 leading-relaxed line-clamp-3 flex-1 mb-4">
                  {pos.description}
                </p>

                {/* Requirements preview */}
                {pos.requirements && (
                  <p className="text-xs text-rb-light/35 line-clamp-2 mb-4 italic">
                    Anforderungen: {pos.requirements}
                  </p>
                )}

                {/* CTA */}
                <Link
                  href={`/apply/${pos._id}`}
                  className="rb-btn text-sm py-2.5 px-4 inline-flex items-center justify-center gap-2 w-full"
                >
                  Jetzt bewerben <ChevronRight size={15} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
