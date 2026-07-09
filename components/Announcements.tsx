'use client'

import { useEffect, useRef, useState } from 'react'
import { Megaphone, Tag, Calendar } from 'lucide-react'

interface Announcement {
  _id: string
  title: string
  body: string
  tag: string
  tagColor: string
  date: string
}

export default function Announcements() {
  const ref = useRef<HTMLDivElement>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  useEffect(() => {
    fetch('/api/announcements')
      .then((r) => r.json())
      .then((d) => { if (d.announcements) setAnnouncements(d.announcements) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.08 }
    )
    ref.current?.querySelectorAll('.reveal').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [announcements])

  if (announcements.length === 0) return null

  return (
    <section id="announcements" ref={ref} className="py-20 px-6 relative">
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)' }} />
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[700px] h-[200px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(ellipse, rgba(109,40,217,0.06) 0%, transparent 70%)' }} />
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="reveal mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg text-xs font-bold tracking-widest uppercase"
              style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', color: '#8b5cf6' }}>
              <Megaphone size={12} /> Studio News
            </div>
            <h2 className="text-4xl md:text-5xl text-white" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
              Aktuelle <span className="gradient-text">Updates</span>
            </h2>
          </div>
          <p className="text-rb-light/40 text-sm max-w-xs leading-relaxed md:text-right">
            Was gerade bei EyStudio passiert.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {announcements.map((a, i) => (
            <div
              key={a._id}
              className="reveal rb-panel p-5 flex flex-col gap-3"
              style={{
                transitionDelay: `${i * 60}ms`,
                borderLeft: `3px solid ${a.tagColor}`,
                transition: 'none',
              }}
            >
              {/* Tag + Date row */}
              <div className="flex items-center justify-between gap-2">
                <span
                  className="rb-badge"
                  style={{
                    background: `${a.tagColor}15`,
                    color: a.tagColor,
                    border: `1px solid ${a.tagColor}35`,
                    fontSize: '0.65rem',
                  }}
                >
                  <Tag size={10} /> {a.tag}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-rb-light/30">
                  <Calendar size={11} />
                  {new Date(a.date).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1.5 leading-snug" style={{ fontFamily: 'Fredoka One, sans-serif', fontSize: '1.05rem' }}>
                  {a.title}
                </h3>
                <p className="text-rb-light/50 text-sm leading-relaxed line-clamp-3">{a.body}</p>
              </div>

              {/* Bottom accent */}
              <div
                className="h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-full"
                style={{ background: `linear-gradient(90deg, ${a.tagColor}, transparent)` }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
