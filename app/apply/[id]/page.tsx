'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Briefcase, Gamepad2, CheckCircle2, ArrowLeft, Send, ImagePlus, X } from 'lucide-react'
import type { FormField } from '@/lib/models/Position'

interface Position {
  _id: string
  title: string
  description: string
  requirements: string
  gameName: string
  status: 'open' | 'closed'
  fields: FormField[]
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

function ApplyInput(props: React.InputHTMLAttributes<HTMLInputElement> & { focused?: boolean }) {
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

function ApplySelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const [focused, setFocused] = useState(false)
  return (
    <select
      {...props}
      style={{
        ...inputStyle,
        borderColor: focused ? '#8b5cf6' : 'rgba(109,40,217,0.3)',
        cursor: 'pointer',
        ...(props.style ?? {}),
      }}
      onFocus={(e) => { setFocused(true); props.onFocus?.(e) }}
      onBlur={(e) => { setFocused(false); props.onBlur?.(e) }}
    />
  )
}

function CheckboxGroupField({
  field,
  value,
  onChange,
}: {
  field: FormField
  value: string
  onChange: (val: string) => void
}) {
  const selected = value ? value.split(',').map((v) => v.trim()).filter(Boolean) : []

  function toggle(opt: string) {
    const next = selected.includes(opt)
      ? selected.filter((s) => s !== opt)
      : [...selected, opt]
    onChange(next.join(', '))
  }

  return (
    <div className="space-y-2">
      {field.options.map((opt) => {
        const checked = selected.includes(opt)
        return (
          <label
            key={opt}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer"
            style={{
              background: checked ? 'rgba(109,40,217,0.18)' : 'rgba(109,40,217,0.06)',
              border: `1px solid ${checked ? 'rgba(109,40,217,0.5)' : 'rgba(109,40,217,0.2)'}`,
              transition: 'all 0.15s',
            }}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(opt)}
              style={{ accentColor: '#8b5cf6', width: '15px', height: '15px', cursor: 'pointer' }}
            />
            <span className="text-sm" style={{ color: checked ? '#c4b5fd' : 'rgba(196,181,253,0.6)' }}>
              {opt}
            </span>
          </label>
        )
      })}
      {field.options.length === 0 && (
        <p className="text-xs text-rb-light/30 italic">Keine Optionen konfiguriert.</p>
      )}
    </div>
  )
}

function ImageUploadField({
  fieldId,
  label,
  required,
  value,
  onChange,
}: {
  fieldId: string
  label: string
  required: boolean
  value: string
  onChange: (url: string) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setUploadError(null)
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const d = await res.json()
      if (!res.ok) { setUploadError(d.error ?? 'Upload fehlgeschlagen'); return }
      onChange(d.url)
    } catch {
      setUploadError('Netzwerkfehler beim Upload')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
      {value ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={label}
            style={{
              maxWidth: '100%',
              maxHeight: '200px',
              objectFit: 'contain',
              borderRadius: '8px',
              border: '1px solid rgba(109,40,217,0.4)',
            }}
          />
          <button
            type="button"
            onClick={() => { onChange(''); if (fileRef.current) fileRef.current.value = '' }}
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              background: 'rgba(0,0,0,0.65)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '50%',
              width: '22px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
            }}
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{
            width: '100%',
            border: '2px dashed rgba(109,40,217,0.4)',
            borderRadius: '8px',
            padding: '1.5rem',
            background: 'rgba(109,40,217,0.06)',
            color: uploading ? 'rgba(196,181,253,0.4)' : '#8b5cf6',
            cursor: uploading ? 'not-allowed' : 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: 'Nunito, sans-serif',
            fontSize: '0.875rem',
            transition: 'border-color 0.15s',
          }}
        >
          {uploading ? (
            <span className="animate-spin inline-block w-5 h-5 border-2 border-rb-purple/30 border-t-rb-purple rounded-full" />
          ) : (
            <ImagePlus size={22} />
          )}
          {uploading ? 'Wird hochgeladen…' : 'Bild auswählen (JPG, PNG, WebP, GIF – max 5 MB)'}
        </button>
      )}
      {uploadError && (
        <p className="text-xs mt-1.5" style={{ color: '#ef4444' }}>{uploadError}</p>
      )}
      {required && !value && (
        <p className="text-xs mt-1 text-rb-light/30">Pflichtfeld — Bitte lade ein Bild hoch</p>
      )}
    </div>
  )
}

const DEFAULT_FIELDS: FormField[] = [
  {
    id: 'motivation',
    label: 'Deine Bewerbung / Motivation',
    type: 'textarea',
    placeholder: 'Erzähl uns von dir, deinen Fähigkeiten und warum du Teil von EyStudio werden möchtest…',
    required: true,
    options: [],
    order: 0,
  },
  {
    id: 'portfolio',
    label: 'Portfolio / Link',
    type: 'url',
    placeholder: 'https://dein-portfolio.de',
    required: false,
    options: [],
    order: 1,
  },
]

export default function ApplyDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { data: session, status } = useSession()

  const [position, setPosition] = useState<Position | null>(null)
  const [loadingPos, setLoadingPos] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [values, setValues] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/positions/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.position) {
          setPosition(d.position)
        } else {
          setNotFound(true)
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoadingPos(false))
  }, [id])

  const activeFields = position
    ? (position.fields.length > 0 ? [...position.fields].sort((a, b) => a.order - b.order) : DEFAULT_FIELDS)
    : []

  function setValue(fieldId: string, val: string) {
    setValues((prev) => ({ ...prev, [fieldId]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    for (const f of activeFields) {
      if (f.required && !values[f.id]?.trim()) {
        const hint =
          f.type === 'image' ? 'Bitte lade ein Bild hoch für' :
          f.type === 'checkbox' ? 'Bitte wähle mindestens eine Option für' :
          'Bitte fülle das Pflichtfeld aus:'
        setError(`${hint} "${f.label}"`)
        return
      }
    }

    setSubmitting(true)
    setError(null)

    const responses = activeFields.map((f) => ({
      fieldId: f.id,
      label: f.label,
      value: values[f.id]?.trim() ?? '',
    }))

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positionId: id, responses }),
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

  if (notFound || !position || position.status !== 'open') {
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

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen hex-bg" style={{ background: '#08010f' }}>
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 pt-28 pb-16">
          <div className="rb-panel p-8 text-center" style={{ transition: 'none' }}>
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
              Deine Bewerbung für <span className="text-white font-semibold">{position.title}</span> wurde erfolgreich übermittelt.
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
        <Link
          href="/apply"
          className="inline-flex items-center gap-1.5 text-sm text-rb-light/40 hover:text-rb-light/70 transition-colors"
        >
          <ArrowLeft size={14} /> Alle Stellen
        </Link>

        {/* Position info */}
        <div className="rb-panel p-5" style={{ transition: 'none', borderTop: '3px solid #6d28d9' }}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <h1 className="text-white font-display text-xl">{position.title}</h1>
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

          {position.gameName && (
            <div className="flex items-center gap-1.5 mb-3">
              <Gamepad2 size={13} style={{ color: '#8b5cf6' }} />
              <span className="text-xs text-rb-light/60">{position.gameName}</span>
            </div>
          )}

          <p className="text-sm text-rb-light/60 leading-relaxed mb-4">{position.description}</p>

          {position.requirements && (
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
            {activeFields.map((field) => (
              <div key={field.id}>
                <label className="block text-rb-light/60 text-sm mb-1.5">
                  {field.label}{' '}
                  {field.required ? (
                    <span style={{ color: '#ef4444' }}>*</span>
                  ) : (
                    <span className="text-rb-light/30">(optional)</span>
                  )}
                </label>
                {field.type === 'textarea' ? (
                  <ApplyTextarea
                    placeholder={field.placeholder}
                    value={values[field.id] ?? ''}
                    onChange={(e) => setValue(field.id, e.target.value)}
                    required={field.required}
                    style={{ minHeight: '160px' }}
                  />
                ) : field.type === 'select' ? (
                  <ApplySelect
                    value={values[field.id] ?? ''}
                    onChange={(e) => setValue(field.id, e.target.value)}
                    required={field.required}
                  >
                    <option value="">— Bitte wählen —</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </ApplySelect>
                ) : field.type === 'checkbox' ? (
                  <CheckboxGroupField
                    field={field}
                    value={values[field.id] ?? ''}
                    onChange={(val) => setValue(field.id, val)}
                  />
                ) : field.type === 'image' ? (
                  <ImageUploadField
                    fieldId={field.id}
                    label={field.label}
                    required={field.required}
                    value={values[field.id] ?? ''}
                    onChange={(url) => setValue(field.id, url)}
                  />
                ) : (
                  <ApplyInput
                    type={field.type}
                    placeholder={field.placeholder}
                    value={values[field.id] ?? ''}
                    onChange={(e) => setValue(field.id, e.target.value)}
                    required={field.required}
                  />
                )}
              </div>
            ))}

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
