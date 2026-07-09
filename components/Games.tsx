'use client'

import { useEffect, useRef } from 'react'

const games = [
  {
    emoji: '🌌',
    title: 'Void Conquest',
    genre: 'Strategy · PvP',
    description: 'Baue Imperien, forme Allianzen und dominiere das Vakuum zwischen den Sternen. Echtzeit-Strategie auf höchstem Niveau.',
    status: 'In Entwicklung',
    statusColor: '#22d3ee',
    visits: '—',
    favorites: '—',
    progress: 35,
    accent: '#22d3ee',
  },
  {
    emoji: '⚡',
    title: 'Neon Maze Rush',
    genre: 'Racing · Arcade',
    description: 'Rase durch prozedural generierte Neon-Labyrinthe. Jede Runde ein neues Level, jede Sekunde Adrenalin.',
    status: 'Live',
    statusColor: '#22c55e',
    visits: '48.2K',
    favorites: '1.1K',
    progress: 100,
    accent: '#e879f9',
  },
  {
    emoji: '⚔️',
    title: 'Shadow Dungeon',
    genre: 'RPG · Adventure',
    description: 'Erkunde uralte Dungeons, sammle mächtige Artefakte und enthülle die Geheimnisse einer vergessenen Zivilisation.',
    status: 'Beta',
    statusColor: '#f59e0b',
    visits: '8.4K',
    favorites: '340',
    progress: 75,
    accent: '#8b5cf6',
  },
]

export default function Games() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    )
    ref.current?.querySelectorAll('.reveal').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

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
              🕹️ Portfolio
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {games.map((g, i) => (
            <div key={g.title} className="reveal rb-panel p-0 overflow-hidden group"
              style={{ transitionDelay: `${i * 80}ms` }}>
              {/* Top banner */}
              <div className="relative h-44 flex items-center justify-center overflow-hidden"
                style={{ background: `radial-gradient(ellipse at 50% 50%, ${g.accent}18 0%, rgba(13,1,24,0.9) 70%)` }}>
                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }} />
                <span className="text-7xl group-hover:scale-110 transition-transform duration-300 relative z-10">
                  {g.emoji}
                </span>
                {/* Status */}
                <div className="absolute top-3 right-3 rb-badge font-bold"
                  style={{ background: `${g.statusColor}15`, color: g.statusColor, border: `1px solid ${g.statusColor}35` }}>
                  {g.status === 'Live' && <span className="w-1.5 h-1.5 rounded-full inline-block mr-1 animate-pulse" style={{ background: g.statusColor }} />}
                  {g.status}
                </div>
                {/* Progress bar at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <div style={{
                    height: '100%',
                    width: `${g.progress}%`,
                    background: `linear-gradient(90deg, ${g.accent}80, ${g.accent})`,
                    boxShadow: `0 0 8px ${g.accent}80`,
                  }} />
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: g.accent, opacity: 0.7 }}>
                  {g.genre}
                </p>
                <h3 className="text-xl text-white mb-2" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
                  {g.title}
                </h3>
                <p className="text-rb-light/50 text-sm leading-relaxed mb-4">{g.description}</p>

                <div className="flex items-center justify-between pt-3"
                  style={{ borderTop: '1px solid rgba(109,40,217,0.2)' }}>
                  <div className="flex gap-3 text-xs text-rb-light/40">
                    <span>👁 <span className="text-rb-light/70 font-semibold">{g.visits}</span></span>
                    <span>❤️ <span className="text-rb-light/70 font-semibold">{g.favorites}</span></span>
                    <span>🔧 <span style={{ color: g.accent }}>{g.progress}%</span></span>
                  </div>
                  <button className="rb-btn text-xs py-1.5 px-3" style={{
                    fontSize: '0.72rem',
                    background: `linear-gradient(180deg, ${g.accent}30, ${g.accent}15)`,
                    boxShadow: `0 3px 0 ${g.accent}20`,
                    border: `1px solid ${g.accent}40`,
                  }}>
                    Mehr →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
