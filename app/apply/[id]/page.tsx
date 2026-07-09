'use client'

import { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Briefcase, Gamepad2, CheckCircle2, ArrowLeft, Send } from 'lucide-react'

interface Position {
  _id: string
  title: string
  description: string
  requirements: string
  gameName: string
  status: 'open' | 'closed'
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(109,40,217,0.1)',
  border: '1px solid rgba(109,40,217,0.3)',
  borderRadius: '8px',
  padding: '0.6rem 0.75rem',
  color: '#c4b5fd',
  outline: 'none',
  width: '100%',
  fontFamily: 'Nunito, sans-serif',
  fontSize: '0.875rem',
}

function ApplyInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      {...props}
      style={{
        ...inputStyle,
        borderColor: focused ? '#8b5cf6' : 'rgba(109,40,217,0.3)',
        ...(props.style ?? {}),
      }}
      onFocus={(e) => { setFocused(true); props.onFocus?.(e) }}
      onBlur={(e) => { setFocused(false); props.onBlur?.(e) }}
    />
  )
}

function ApplyTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const [focused, setFocused] = useState(false)
  return (
    <textarea
      {...props}
      style={{
        ...inputStyle,
        borderColor: focused ? '#8b5cf6' : 'rgba(109,40,217,0.3)',
        resize: 'vertical',
        minHeight: '140px',
        ...(props.style ?? {}),
      }}
      onFocus={(e) => { setFocused(true); props.onFocus?.(e) }}
      onBlur={(e) => { setFocused(false); props.onBlur?.(e) }}
    />
  )
}

export default function ApplyDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { data: session, status } = useSession()

  const [position, setPosition] = useState<Position | null>(null)
  const [loadingPos, setLoadingPos] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [message, setMessage] = useState('')
  const [portfolio, setPortfolio] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/positions')
      .then((r) => r.json())
      .then((d) => {
        const positions: Position[] = d.positions ?? []
        const found = positions.find((p) => p._id === id)
        if (found) {
          setPosition(found)
        } else {
          setNotFound(true)
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoadingPos(false))
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) {
      setError('Bitte fülle deine Motivation aus.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positionId: id, message: message.trim(), portfolio: portfolio.trim() }),
      })
      if (res.ok) {
        setSuccess(true)
      } else {
        const d = await res.json()
        setError(d.error ?? 'Unbekannter Fehler')
      }
    } catch {
      setError('Netzwerkfehler. Bitte versuche es erneut.')
    } finally {
      setSubmitting(false)
    }
  }

  // Loading state
  if (status === 'loading' || loadingPos) {
    return (
      <div className="min-h-screen hex-bg" style={{ background: '#08010f' }}>
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 pt-28 pb-16 animate-pulse space-y-4">
          <div className="rb-panel h-40" />
          <div className="rb-panel h-64" />
        </div>
      </div>
    )
  }

  // Not found
  if (notFound) {
    return (
      <div className="min-h-screen hex-bg" style={{ background: '#08010f' }}>
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 pt-28 pb-16 text-center">
          <p className="text-rb-light/40 text-lg mb-4">Position nicht gefunden oder nicht mehr offen.</p>
          <Link href="/apply" className="rb-btn inline-flex items-center gap-2">
            <ArrowLeft size={15} /> Alle Stellen
          </Link>
        </div>
      </div>
    )
  }

  // Not logged in
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen hex-bg" style={{ background: '#08010f' }}>
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 pt-28 pb-16">
          <div
            className="rb-panel p-8 text-center"
            style={{ transition: 'none' }}
          >
            <Briefcase size={36} className="mx-auto mb-4" style={{ color: '#8b5cf6' }} />
            <h2 className="text-white text-xl font-display mb-2">Login erforderlich</h2>
            <p className="text-rb-light/50 text-sm mb-6">
              Du musst eingeloggt sein um dich zu bewerben.
            </p>
            <button
              onClick={() => signIn('discord')}
              className="rb-btn inline-flex items-center gap-2 px-6 py-3"
            >
              Mit Discord einloggen
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen hex-bg" style={{ background: '#08010f' }}>
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 pt-28 pb-16">
          <div
            className="rb-panel p-10 text-center"
            style={{
              transition: 'none',
              border: '1px solid rgba(34,197,94,0.35)',
              background: 'rgba(34,197,94,0.05)',
            }}
          >
            <CheckCircle2 size={48} className="mx-auto mb-4" style={{ color: '#22c55e' }} />
            <h2 className="text-white text-2xl font-display mb-2">Bewerbung eingereicht!</h2>
            <p className="text-rb-light/50 text-sm mb-2">
              Deine Bewerbung für <span className="text-white font-semibold">{position?.title}</span> wurde erfolgreich übermittelt.
            </p>
            <p className="text-rb-light/35 text-xs mb-8">
              Das Team wird sich bei dir melden. Vielen Dank für dein Interesse!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard" className="rb-btn inline-flex items-center gap-2">
                Zum Dashboard
              </Link>
              <Link href="/apply" className="rb-btn-outline inline-flex items-center gap-2"
                style={{ fontFamily: 'Fredoka One, sans-serif', cursor: 'pointer' }}>
                <ArrowLeft size={14} /> Alle Stellen
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen hex-bg" style={{ background: '#08010f' }}>
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 pt-28 pb-16 space-y-5">
        {/* Back link */}
        <Link
          href="/apply"
          className="inline-flex items-center gap-1.5 text-sm text-rb-light/40 hover:text-rb-light/70 transition-colors"
        >
          <ArrowLeft size={14} /> Alle Stellen
        </Link>

        {/* Position info panel */}
        <div className="rb-panel p-5" style={{ transition: 'none', borderTop: '3px solid #6d28d9' }}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <h1 className="text-white font-display text-xl">{position?.title}</h1>
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

          {position?.gameName && (
            <div className="flex items-center gap-1.5 mb-3">
              <Gamepad2 size={13} style={{ color: '#8b5cf6' }} />
              <span className="text-xs text-rb-light/60">{position.gameName}</span>
            </div>
          )}

          <p className="text-sm text-rb-light/60 leading-relaxed mb-4">{position?.description}</p>

          {position?.requirements && (
            <div
              className="rounded-lg p-3"
              style={{ background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.2)' }}
            >
              <p className="text-xs font-semibold text-rb-light/50 uppercase tracking-wider mb-1">
                Anforderungen
              </p>
              <p className="text-sm text-rb-light/55 leading-relaxed">{position.requirements}</p>
            </div>
          )}
        </div>

        {/* Application form */}
        <div className="rb-panel p-5" style={{ transition: 'none' }}>
          <h2 className="text-white font-display text-lg mb-4 flex items-center gap-2">
            <Send size={17} style={{ color: '#8b5cf6' }} /> Bewerbung einreichen
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-rb-light/60 text-sm mb-1.5">
                Deine Bewerbung / Motivation <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <ApplyTextarea
                placeholder="Erzähl uns von dir, deinen Fähigkeiten und warum du Teil von EyStudio werden möchtest…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                style={{ minHeight: '160px' }}
              />
            </div>

            <div>
              <label className="block text-rb-light/60 text-sm mb-1.5">
                Portfolio / Link <span className="text-rb-light/30">(optional)</span>
              </label>
              <ApplyInput
                type="url"
                placeholder="https://dein-portfolio.de"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
              />
            </div>

            {/* Applicant info */}
            <div
              className="rounded-lg p-3 flex items-center gap-3"
              style={{ background: 'rgba(109,40,217,0.07)', border: '1px solid rgba(109,40,217,0.18)' }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'rgba(109,40,217,0.3)', color: '#c4b5fd' }}>
                {session?.user?.name?.charAt(0).toUpperCase() ?? '?'}
              </div>
              <div>
                <p className="text-sm text-white font-semibold">{session?.user?.name}</p>
                <p className="text-xs text-rb-light/40">Bewerbung wird als dieser Account eingereicht</p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="rounded-lg p-3 text-sm"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#ef4444',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="rb-btn w-full py-3 text-base inline-flex items-center justify-center gap-2"
              style={{ opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  Wird eingereicht…
                </>
              ) : (
                <>
                  <Send size={16} /> Bewerbung absenden
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
