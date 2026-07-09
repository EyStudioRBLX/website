'use client'

import { useEffect, useRef } from 'react'
import { Palette, Code2, Building2, Smartphone, DollarSign, MessageCircle, Wrench } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const services: { Icon: LucideIcon; title: string; desc: string; color: string }[] = [
  { Icon: Palette,       title: 'Game Design',        desc: 'Von der Idee bis zum Spielkonzept. Gameplay-Loops, die süchtig machen und Spieler stundenlang fesseln.',   color: '#8b5cf6' },
  { Icon: Code2,         title: 'Lua Scripting',      desc: 'Sauberer, performanter Luau-Code. Moderne Server-Client-Architektur für maximale Stabilität.',                color: '#22d3ee' },
  { Icon: Building2,     title: '3D Building',        desc: 'Atemberaubende Roblox-Maps mit detailreichem Worldbuilding. Jede Map erzählt ihre eigene Geschichte.',      color: '#e879f9' },
  { Icon: Smartphone,    title: 'UI/UX Design',       desc: 'Intuitive Interfaces, die den Spielfluss stärken. Pixel-perfect für alle Geräte und Auflösungen.',          color: '#34d399' },
  { Icon: DollarSign,    title: 'Monetarisierung',    desc: 'Faire Strategien, die Spieler nicht vergraulen. Ethische GamePass- & DevProduct-Integration.',               color: '#f59e0b' },
  { Icon: MessageCircle, title: 'Community Setup',    desc: 'Discord-Server, Social Media & Community-Management für nachhaltiges Spielerwachstum.',                      color: '#5865F2' },
]

export default function Services() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.08 }
    )
    ref.current?.querySelectorAll('.reveal').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section id="services" ref={ref} className="py-28 px-6 relative">
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.25), transparent)' }} />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[900px] h-[300px] rounded-full blur-[160px]"
          style={{ background: 'radial-gradient(ellipse, rgba(109,40,217,0.07) 0%, transparent 70%)' }} />
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="reveal mb-12 text-center">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg text-xs font-bold tracking-widest uppercase"
            style={{ background: 'rgba(232,121,249,0.1)', border: '1px solid rgba(232,121,249,0.25)', color: '#e879f9' }}>
            <Wrench size={12} /> Was wir tun
          </div>
          <h2 className="text-5xl md:text-6xl text-white" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
            Unsere <span className="gradient-text">Services</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s, i) => (
            <div key={s.title} className="reveal rb-panel p-5 group"
              style={{ transitionDelay: `${i * 60}ms` }}>
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                style={{
                  background: `${s.color}12`,
                  border: `2px solid ${s.color}30`,
                  borderTopColor: `${s.color}50`,
                  boxShadow: `0 3px 0 ${s.color}15`,
                }}>
                <s.Icon size={28} style={{ color: s.color }} />
              </div>
              <h3 className="text-lg text-white font-bold mb-2" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
                {s.title}
              </h3>
              <p className="text-rb-light/50 text-sm leading-relaxed">{s.desc}</p>
              {/* Bottom accent line */}
              <div className="mt-4 h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-full"
                style={{ background: `linear-gradient(90deg, ${s.color}, transparent)` }} />
            </div>
          ))}
        </div>

        {/* CTA row */}
        <div className="reveal mt-10 text-center">
          <p className="text-rb-light/30 text-sm mb-4">Kein passender Service dabei?</p>
          <a href="#contact" className="rb-btn inline-flex text-sm px-6 py-2.5">
            Individuelles Angebot anfragen →
          </a>
        </div>
      </div>
    </section>
  )
}
