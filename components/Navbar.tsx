'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { LayoutDashboard, Menu, X } from 'lucide-react'

export default function Navbar() {
  const { data: session } = useSession()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const links = ['Games', 'Services', 'Team', 'Kontakt']

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'py-2 border-b border-rb-border/40 backdrop-blur-xl' : 'py-4'
    }`} style={scrolled ? { background: 'rgba(8,1,15,0.92)' } : {}}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
            style={{ background: 'rgba(109,40,217,0.25)', border: '2px solid rgba(109,40,217,0.5)', borderTopColor: 'rgba(167,139,250,0.3)' }}>
            <EyeIcon />
          </div>
          <span className="text-2xl text-white" style={{ fontFamily: 'Fredoka One, sans-serif', letterSpacing: '0.04em' }}>
            Ey<span style={{ color: '#8b5cf6' }}>Studio</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a key={l} href={l === 'Kontakt' ? '#contact' : `#${l.toLowerCase()}`}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-rb-light/60 hover:text-white hover:bg-rb-purple/10 transition-all">
              {l}
            </a>
          ))}
        </div>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <>
              <Link href="/dashboard" className="rb-btn text-sm py-2 px-4 inline-flex items-center gap-1.5">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{ background: 'rgba(109,40,217,0.12)', border: '1px solid rgba(109,40,217,0.3)' }}>
                {session.user?.image && (
                  <Image src={session.user.image} alt="Avatar" width={28} height={28}
                    className="rounded-lg ring-1 ring-rb-purple/40" />
                )}
                <span className="text-sm text-rb-light font-semibold">{session.user?.name}</span>
                <button onClick={() => signOut()} className="text-xs text-rb-light/30 hover:text-red-400 transition-colors ml-1"><X size={12} /></button>
              </div>
            </>
          ) : (
            <button onClick={() => signIn('discord')}
              className="rb-btn flex items-center gap-2 text-sm">
              <DiscordIcon className="w-4 h-4 text-[#5865F2]" />
              Mit Discord einloggen
            </button>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg"
          style={{ background: 'rgba(109,40,217,0.15)', border: '1px solid rgba(109,40,217,0.3)' }}
          onClick={() => setMenuOpen(!menuOpen)}>
          <span className="text-rb-light">{menuOpen ? <X size={18} /> : <Menu size={18} />}</span>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden px-6 py-4 space-y-2 border-t border-rb-border/30"
          style={{ background: 'rgba(13,1,24,0.98)' }}>
          {links.map((l) => (
            <a key={l} href={l === 'Kontakt' ? '#contact' : `#${l.toLowerCase()}`}
              className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-rb-light/70 hover:text-white"
              style={{ background: 'rgba(109,40,217,0.08)' }}
              onClick={() => setMenuOpen(false)}>{l}</a>
          ))}
          {session ? (
            <div className="pt-2 space-y-2">
              <Link href="/dashboard" className="rb-btn w-full justify-center text-sm inline-flex items-center gap-1.5" onClick={() => setMenuOpen(false)}>
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <button onClick={() => signOut()} className="w-full text-center text-sm text-red-400/70 py-2">Logout</button>
            </div>
          ) : (
            <button onClick={() => signIn('discord')} className="rb-btn w-full justify-center text-sm mt-2">
              <DiscordIcon className="w-4 h-4 text-[#5865F2]" />
              Mit Discord einloggen
            </button>
          )}
        </div>
      )}
    </nav>
  )
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
      <ellipse cx="10" cy="10" rx="9" ry="6" stroke="#a78bfa" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="4" fill="#6d28d9" />
      <circle cx="10" cy="10" r="2" fill="#22d3ee" />
      <circle cx="11" cy="9" r="0.8" fill="white" opacity="0.8" />
    </svg>
  )
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
    </svg>
  )
}
