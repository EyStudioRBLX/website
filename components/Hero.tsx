'use client'

import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { Gamepad2, LayoutDashboard } from 'lucide-react'

export default function Hero() {
  const { data: session } = useSession()
  const eyeRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (!eyeRef.current) return
      const r = eyeRef.current.getBoundingClientRect()
      const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth
      const dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight
      const p = eyeRef.current.querySelector('.hero-pupil') as SVGElement | null
      if (p) p.style.transform = `translate(${dx * 16}px, ${dy * 11}px)`
    }
    window.addEventListener('mousemove', fn)
    return () => window.removeEventListener('mousemove', fn)
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-20 hex-bg">
      {/* Grid lines */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(109,40,217,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(109,40,217,0.07) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Glow blobs */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[500px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(ellipse, rgba(109,40,217,0.18) 0%, transparent 70%)' }} />
      </div>
      <div className="absolute top-1/3 left-1/5 w-72 h-72 rounded-full blur-[100px] pointer-events-none"
        style={{ background: 'rgba(34,211,238,0.04)' }} />

      {/* Floating pixel blocks */}
      {[
        { size: 14, top: '15%', left: '8%', delay: '0s', color: 'rgba(109,40,217,0.5)' },
        { size: 10, top: '25%', right: '10%', delay: '1s', color: 'rgba(34,211,238,0.5)' },
        { size: 8,  bottom: '20%', left: '15%', delay: '1.5s', color: 'rgba(232,121,249,0.5)' },
        { size: 12, bottom: '30%', right: '8%', delay: '0.7s', color: 'rgba(245,158,11,0.4)' },
        { size: 6,  top: '45%', left: '5%', delay: '2s', color: 'rgba(109,40,217,0.3)' },
      ].map((b, i) => (
        <div key={i}
          className="absolute rounded-md animate-float"
          style={{
            width: b.size, height: b.size,
            top: b.top, left: (b as any).left, right: (b as any).right, bottom: (b as any).bottom,
            background: b.color,
            animationDelay: b.delay,
            boxShadow: `0 0 ${b.size * 2}px ${b.color}`,
          }} />
      ))}

      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl">
        {/* Eye logo */}
        <div className="mb-7 animate-float relative">
          <svg ref={eyeRef} viewBox="0 0 220 130" fill="none"
            xmlns="http://www.w3.org/2000/svg" className="w-52 h-32 md:w-72 md:h-44 drop-shadow-2xl">
            <defs>
              <radialGradient id="hIris" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#4c1d95" />
                <stop offset="70%" stopColor="#6d28d9" />
                <stop offset="100%" stopColor="#1a0035" />
              </radialGradient>
              <linearGradient id="hOutline" x1="0" y1="0" x2="220" y2="130" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="50%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#e879f9" />
              </linearGradient>
              <filter id="hGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {/* Outer glow ring */}
            <path d="M4 65 Q55 8 110 8 Q165 8 216 65 Q165 122 110 122 Q55 122 4 65Z"
              stroke="#6d28d9" strokeWidth="1" fill="none" opacity="0.3" />
            {/* Main eye shape */}
            <path d="M4 65 Q55 8 110 8 Q165 8 216 65 Q165 122 110 122 Q55 122 4 65Z"
              stroke="url(#hOutline)" strokeWidth="2.5" fill="rgba(20,0,37,0.6)" filter="url(#hGlow)" />
            {/* Iris */}
            <circle cx="110" cy="65" r="38" fill="url(#hIris)" />
            <circle cx="110" cy="65" r="38" stroke="rgba(139,92,246,0.4)" strokeWidth="1.5" fill="none" />
            {/* Rings */}
            <circle cx="110" cy="65" r="28" stroke="rgba(34,211,238,0.15)" strokeWidth="1" fill="none" />
            {/* Pupil — mouse tracking */}
            <g className="hero-pupil" style={{ transition: 'transform 0.12s ease-out' }}>
              <circle cx="110" cy="65" r="17" fill="#06010f" />
              <circle cx="110" cy="65" r="11" fill="#22d3ee" opacity="0.95" />
              <circle cx="110" cy="65" r="6" fill="#0a0014" />
              <circle cx="114" cy="61" r="3.5" fill="white" opacity="0.85" />
              <circle cx="108" cy="68" r="1.5" fill="white" opacity="0.3" />
            </g>
            {/* Shine on lid */}
            <path d="M40 38 Q110 15 180 38" stroke="rgba(167,139,250,0.2)" strokeWidth="1" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        {/* Studio badge */}
        <div className="mb-5 flex items-center gap-2 px-4 py-2 rounded-xl"
          style={{ background: 'rgba(109,40,217,0.15)', border: '1px solid rgba(109,40,217,0.4)', borderTopColor: 'rgba(167,139,250,0.2)' }}>
          <span className="w-2 h-2 rounded-full bg-rb-cyan" style={{ boxShadow: '0 0 6px #22d3ee' }} />
          <span className="text-rb-light/70 text-xs font-semibold tracking-widest uppercase">Roblox Development Studio</span>
        </div>

        {/* Headline */}
        <h1 className="mb-3 leading-none" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
          <span className="block text-7xl md:text-9xl text-white" style={{
            textShadow: '0 4px 0 rgba(0,0,0,0.5), 0 0 40px rgba(109,40,217,0.3)',
          }}>
            Ey<span className="gradient-text">Studio</span>
          </span>
        </h1>

        <p className="text-rb-light/60 text-base md:text-lg max-w-xl mb-2 leading-relaxed">
          Wir bauen <span className="text-white font-semibold">Roblox-Erlebnisse</span>, die Spieler begeistern und Welten erschaffen, die man nicht vergisst.
        </p>
        <p className="text-rb-light/30 text-xs tracking-widest uppercase mb-9">
          Design · Scripting · Building · UI/UX
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <a href="#games" className="rb-btn rb-btn-gold w-full sm:w-auto text-sm px-7 py-3 inline-flex items-center gap-2">
            <Gamepad2 size={16} /> Spiele entdecken
          </a>
          {session ? (
            <Link href="/dashboard" className="rb-btn w-full sm:w-auto text-sm px-7 py-3 inline-flex items-center gap-2">
              <LayoutDashboard size={16} /> Zum Dashboard
            </Link>
          ) : (
            <button onClick={() => signIn('discord')}
              className="rb-btn rb-btn-outline w-full sm:w-auto flex items-center gap-2 text-sm px-7 py-3">
              <DiscordIcon className="w-4 h-4 text-[#5865F2]" />
              Mit Discord einloggen
            </button>
          )}
        </div>

        {/* Scroll */}
        <div className="mt-14 flex flex-col items-center gap-2">
          <div className="w-6 h-10 rounded-full flex items-start justify-center pt-1.5"
            style={{ border: '2px solid rgba(109,40,217,0.4)' }}>
            <div className="w-1 h-2.5 rounded-full bg-rb-purple animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  )
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
    </svg>
  )
}
