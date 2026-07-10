'use client'

import { useEffect, useRef, useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { Mail, MessageCircle, Info, Zap, Globe, Briefcase, MapPin, CheckCircle2, Loader2, Send } from 'lucide-react'
import type { ContactFormField } from '@/lib/models/ContactForm'

export default function Contact() {
  const { data: session } = useSession()
  const ref = useRef<HTMLDivElement>(null)
  const [fields, setFields] = useState<ContactFormField[]>([])
  const [values, setValues] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetch('/api/contact-form-config')
      .then((r) => r.json())
      .then((d) => {
        const sorted = [...(d.fields ?? [])].sort((a: ContactFormField, b: ContactFormField) => a.order - b.order)
        setFields(sorted)
        const init: Record<string, string> = {}
        sorted.forEach((f: ContactFormField) => { init[f.id] = '' })
        setValues(init)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.08 }
    )
    ref.current?.querySelectorAll('.reveal').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')
    try {
      const responses = fields.map((f) => ({ fieldId: f.id, label: f.label, value: values[f.id] ?? '' }))
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses }),
      })
      if (res.ok) {
        setStatus('sent')
        const reset: Record<string, string> = {}
        fields.forEach((f) => { reset[f.id] = '' })
        setValues(reset)
      } else {
        const d = await res.json()
        setErrorMsg(d.error ?? 'Fehler beim Senden.')
        setStatus('error')
      }
    } catch {
      setErrorMsg('Netzwerkfehler. Bitte versuche es erneut.')
      setStatus('error')
    }
  }

  const inputClass = "w-full bg-rb-panel/60 border-2 border-rb-border/50 rounded-xl px-4 py-3 text-sm text-white placeholder-rb-light/25 focus:outline-none focus:border-rb-purple/60 transition-colors"

  const infoItems: [React.ReactNode, string][] = [
    [<><Zap size={12} /> Antwortzeit</>, '< 24 Std.'],
    [<><Globe size={12} /> Sprachen</>, 'DE · EN'],
    [<><Briefcase size={12} /> Projekte</>, 'Alle Größen'],
    [<><MapPin size={12} /> Standort</>, 'Deutschland & EU'],
  ]

  function renderField(f: ContactFormField) {
    const val = values[f.id] ?? ''
    const set = (v: string) => setValues((prev) => ({ ...prev, [f.id]: v }))

    if (f.type === 'textarea') {
      return (
        <textarea
          rows={5}
          required={f.required}
          placeholder={f.placeholder}
          value={val}
          onChange={(e) => set(e.target.value)}
          className={`${inputClass} resize-none`}
        />
      )
    }

    if (f.type === 'select' && f.options.length > 0) {
      return (
        <select
          required={f.required}
          value={val}
          onChange={(e) => set(e.target.value)}
          className={inputClass}
          style={{ background: 'rgba(8,1,15,0.8)' }}
        >
          <option value="">{f.placeholder || 'Bitte wählen…'}</option>
          {f.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )
    }

    if (f.type === 'checkbox' && f.options.length > 0) {
      const checked = val ? val.split(',').map((s) => s.trim()) : []
      return (
        <div className="space-y-1.5">
          {f.options.map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-rb-light/70">
              <input
                type="checkbox"
                checked={checked.includes(opt)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...checked, opt]
                    : checked.filter((c) => c !== opt)
                  set(next.join(', '))
                }}
                style={{ accentColor: '#8b5cf6', width: '14px', height: '14px' }}
              />
              {opt}
            </label>
          ))}
        </div>
      )
    }

    return (
      <input
        type={f.type === 'email' ? 'email' : 'text'}
        required={f.required}
        placeholder={f.placeholder}
        value={val}
        onChange={(e) => set(e.target.value)}
        className={inputClass}
      />
    )
  }

  // Group the first two text/email fields side-by-side if they exist (e.g. Name + E-Mail)
  const pairedFirstTwo =
    fields.length >= 2 &&
    ['text', 'email'].includes(fields[0].type) &&
    ['text', 'email'].includes(fields[1].type)

  return (
    <section id="contact" ref={ref} className="py-28 px-6 relative">
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.25), transparent)' }} />

      <div className="max-w-5xl mx-auto">
        <div className="reveal mb-12 text-center">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg text-xs font-bold tracking-widest uppercase"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
            <Mail size={12} /> Schreib uns
          </div>
          <h2 className="text-5xl md:text-6xl text-white" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
            Kontakt <span className="gradient-text">aufnehmen</span>
          </h2>
          <p className="text-rb-light/40 text-sm mt-3 max-w-sm mx-auto leading-relaxed">
            Projekt-Anfragen, Kollaborationen oder einfach Hallo — wir freuen uns!
          </p>
        </div>

        <div className="reveal grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Info panel */}
          <div className="md:col-span-2 space-y-4">
            {/* Discord card */}
            <div className="rb-panel p-5">
              <h3 className="text-white font-bold mb-1 flex items-center gap-2"
                style={{ fontFamily: 'Fredoka One, sans-serif' }}>
                <MessageCircle size={16} style={{ color: '#5865F2' }} /> Discord
              </h3>
              <p className="text-rb-light/40 text-xs leading-relaxed mb-4">
                Der schnellste Weg — tritt unserem Server bei!
              </p>
              {session ? (
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-rb-green animate-pulse" />
                  <span className="text-rb-light/50">Eingeloggt als </span>
                  <span className="text-white font-semibold">{session.user?.name}</span>
                </div>
              ) : (
                <button onClick={() => signIn('discord')}
                  className="rb-btn w-full justify-center text-sm py-2.5"
                  style={{ background: 'linear-gradient(180deg, #5c68f0, #4752c4)', boxShadow: '0 4px 0 #2d3699' }}>
                  <DiscordIcon className="w-4 h-4" /> Mit Discord einloggen
                </button>
              )}
            </div>

            {/* Info list */}
            <div className="rb-panel p-5">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
                <Info size={16} /> Quick Info
              </h3>
              <div className="space-y-2.5">
                {infoItems.map(([k, v], idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="text-rb-light/40 flex items-center gap-1">{k}</span>
                    <span className="text-rb-light/80 font-semibold">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-3 rb-panel p-6">
            {status === 'sent' ? (
              <div className="h-full min-h-[280px] flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.3)', boxShadow: '0 4px 0 rgba(34,197,94,0.1)' }}>
                  <CheckCircle2 size={40} style={{ color: '#22c55e' }} />
                </div>
                <div>
                  <h3 className="text-xl text-white mb-1" style={{ fontFamily: 'Fredoka One, sans-serif' }}>Gesendet!</h3>
                  <p className="text-rb-light/40 text-sm">Wir melden uns bald. Versprochen!</p>
                </div>
                <button onClick={() => setStatus('idle')} className="rb-btn rb-btn-outline text-sm px-5 py-2">
                  Neue Nachricht
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {fields.length === 0 && (
                  <p className="text-rb-light/30 text-sm text-center py-4">Formular wird geladen…</p>
                )}

                {pairedFirstTwo && (
                  <div className="grid grid-cols-2 gap-4">
                    {[fields[0], fields[1]].map((f) => (
                      <div key={f.id}>
                        <label className="text-rb-light/40 text-xs font-semibold tracking-widest uppercase block mb-1.5">
                          {f.label}{f.required && <span className="text-red-400 ml-0.5">*</span>}
                        </label>
                        {renderField(f)}
                      </div>
                    ))}
                  </div>
                )}

                {(pairedFirstTwo ? fields.slice(2) : fields).map((f) => (
                  <div key={f.id}>
                    <label className="text-rb-light/40 text-xs font-semibold tracking-widest uppercase block mb-1.5">
                      {f.label}{f.required && <span className="text-red-400 ml-0.5">*</span>}
                    </label>
                    {renderField(f)}
                  </div>
                ))}

                {status === 'error' && (
                  <p className="text-red-400 text-xs">{errorMsg}</p>
                )}

                <button type="submit" disabled={status === 'sending' || fields.length === 0}
                  className="rb-btn w-full py-3.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2">
                  {status === 'sending'
                    ? <><Loader2 size={16} className="animate-spin" /> Wird gesendet...</>
                    : <><Send size={16} /> Nachricht senden</>}
                </button>
              </form>
            )}
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
