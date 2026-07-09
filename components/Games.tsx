'use client'

import { useEffect, useRef, useState } from 'react'
import { Eye, Heart, Wrench, Joystick, Gamepad2 } from 'lucide-react'

interface Game {
  _id: string
  name: string
  status: 'Dev' | 'Beta' | 'Live'
  visits: string
  fav: string
  statusColor: string
  progress: number
  robloxUrl: string
}

export default function Games() {
  const ref = useRef<HTMLDivElement>(null)
  const [games, setGames] = useState<Game[]>([])

  useEffect(() => {
    fetch('/api/games')
      .then((r) => r.json())
      .then((d) => { if (d.games) setGames(d.games) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    )
    ref.current?.querySelectorAll('.reveal').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [games])

  return (
    <section id="games" ref={ref} className="py-28 px-6 relative">
      <div className="absolute inset-x-0 top-0 h-px" style={{
        background: 'linear-gradient(90deg, transparent, rgba(109,40,217,0.4), transparent)'
      }} />

      <div className="max-w-7xl mx-auto">
        <div className="reveal mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg text-xs font-bold tracking-widest uppercase"
              style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.25)', color: '#22d3ee' }}>
              <Joystick size={12} /> Portfolio
            </div>
            <h2 className="text-5xl md:text-6xl text-white leading-none"
              style={{ fontFamily: 'Fredoka One, sans-serif' }}>
              Unsere <span className="gradient-text">Spiele</span>
            </h2>
          </div>
          <p className="text-rb-light/40 text-sm max-w-xs leading-relaxed md:text-right">
            Handcrafted mit Passion — jedes Spiel ist ein eigenes Universum.
          </p>
        </div>

        {games.length === 0 ? (
          <div className="reveal text-center py-20 text-rb-light/30">
            Noch keine Spiele veröffentlicht.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {games.map((g, i) => (
              <div key={g._id} className="reveal rb-panel p-0 overflow-hidden group"
                style={{ transitionDelay: `${i * 80}ms` }}>
                {/* Top banner */}
                <div className="relative h-44 flex items-center justify-center overflow-hidden"
                  style={{ background: `radial-gradient(ellipse at 50% 50%, ${g.statusColor}18 0%, rgba(13,1,24,0.9) 70%)` }}>
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }} />
                  <Gamepad2
                    size={56}
                    style={{ color: g.statusColor }}
                    className="group-hover:scale-110 transition-transform duration-300 relative z-10"
                  />
                  {/* Status badge */}
                  <div className="absolute top-3 right-3 rb-badge font-bold"
                    style={{ background: `${g.statusColor}15`, color: g.statusColor, border: `1px solid ${g.statusColor}35` }}>
                    {g.status === 'Live' && (
                      <span className="w-1.5 h-1.5 rounded-full inline-block mr-1 animate-pulse"
                        style={{ background: g.statusColor }} />
                    )}
                    {g.status}
                  </div>
                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
                    <div style={{
                      height: '100%',
                      width: `${g.progress}%`,
                      background: `linear-gradient(90deg, ${g.statusColor}80, ${g.statusColor})`,
                      boxShadow: `0 0 8px ${g.statusColor}80`,
                    }} />
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-xl text-white mb-4" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
                    {g.name}
                  </h3>

                  <div className="flex items-center justify-between pt-3"
                    style={{ borderTop: '1px solid rgba(109,40,217,0.2)' }}>
                    <div className="flex gap-3 text-xs text-rb-light/40">
                      <span className="inline-flex items-center gap-1">
                        <Eye size={12} /> <span className="text-rb-light/70 font-semibold">{g.visits}</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Heart size={12} /> <span className="text-rb-light/70 font-semibold">{g.fav}</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Wrench size={12} /> <span style={{ color: g.statusColor }}>{g.progress}%</span>
                      </span>
                    </div>
                    {g.robloxUrl ? (
                      <a
                        href={g.robloxUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rb-btn text-xs py-1.5 px-3"
                        style={{
                          fontSize: '0.72rem',
                          background: `linear-gradient(180deg, ${g.statusColor}30, ${g.statusColor}15)`,
                          boxShadow: `0 3px 0 ${g.statusColor}20`,
                          border: `1px solid ${g.statusColor}40`,
                        }}
                      >
                        Spielen →
                      </a>
                    ) : (
                      <span className="text-xs text-rb-light/25 italic">Bald verfügbar</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
