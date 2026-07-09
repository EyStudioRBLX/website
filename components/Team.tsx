'use client'

import { useEffect, useRef, useState } from 'react'

interface TeamMember {
  _id: string
  initials: string
  name: string
  role: string
  bio: string
  color: string
  badge: string
  level: number
}

export default function Team() {
  const ref = useRef<HTMLDivElement>(null)
  const [members, setMembers] = useState<TeamMember[]>([])

  useEffect(() => {
    fetch('/api/team')
      .then((r) => r.json())
      .then((d) => { if (d.members) setMembers(d.members) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    )
    ref.current?.querySelectorAll('.reveal').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [members])

  return (
    <section id="team" ref={ref} className="py-28 px-6 relative">
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(109,40,217,0.3), transparent)' }} />
      <div className="absolute -right-40 top-10 w-96 h-96 rounded-full blur-[130px] pointer-events-none"
        style={{ background: 'rgba(232,121,249,0.04)' }} />

      <div className="max-w-7xl mx-auto">
        <div className="reveal mb-12 text-center">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg text-xs font-bold tracking-widest uppercase"
            style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', color: '#8b5cf6' }}>
            👥 Die Menschen dahinter
          </div>
          <h2 className="text-5xl md:text-6xl text-white" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
            Unser <span className="gradient-text">Team</span>
          </h2>
        </div>

        {members.length === 0 ? (
          <div className="reveal text-center text-rb-light/30 py-16">
            Noch keine Teammitglieder eingetragen.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {members.map((m, i) => (
              <div key={m._id} className="reveal rb-panel p-5 text-center group"
                style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="relative mx-auto mb-4 w-20 h-20">
                  <div className="w-full h-full rounded-2xl flex items-center justify-center text-2xl font-bold transition-all duration-300 group-hover:scale-105"
                    style={{
                      background: `radial-gradient(circle at 35% 30%, ${m.color}35, ${m.color}10)`,
                      border: `2px solid ${m.color}45`,
                      borderTopColor: `${m.color}70`,
                      boxShadow: `0 3px 0 ${m.color}20`,
                      color: m.color,
                      fontFamily: 'Fredoka One, sans-serif',
                      letterSpacing: '0.03em',
                    }}>
                    {m.initials}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: '#08010f', border: `1px solid ${m.color}50`, color: m.color, fontFamily: 'Fredoka One' }}>
                    Lv.{m.level}
                  </div>
                </div>

                <div className="rb-badge mx-auto mb-2 text-xs"
                  style={{ background: `${m.color}10`, color: m.color, border: `1px solid ${m.color}30` }}>
                  {m.badge}
                </div>

                <h3 className="text-lg text-white mb-0.5" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
                  {m.name}
                </h3>
                <p className="text-xs font-semibold mb-3 tracking-wide" style={{ color: m.color }}>
                  {m.role}
                </p>
                <p className="text-rb-light/45 text-xs leading-relaxed">{m.bio}</p>

                <div className="mt-4">
                  <div className="xp-bar-track">
                    <div className="xp-bar-fill" style={{
                      ['--xp-width' as any]: `${(m.level / 50) * 100}%`,
                      background: `linear-gradient(90deg, ${m.color}60, ${m.color})`,
                      boxShadow: `0 0 8px ${m.color}60`,
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="reveal mt-10 text-center">
          <p className="text-rb-light/30 text-sm mb-4">Wir wachsen — werde Teil von EyStudio!</p>
          <a href="#contact" className="rb-btn rb-btn-outline inline-flex text-sm px-6 py-2.5">
            Jetzt bewerben →
          </a>
        </div>
      </div>
    </section>
  )
}
