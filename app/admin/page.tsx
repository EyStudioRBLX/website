'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getRoleMeta, ROLE_HIERARCHY, type Role } from '@/lib/roles'
import {
  LayoutDashboard, Users, Megaphone, Gamepad2, Code2,
  Crown, ArrowLeft, Search, User, Pencil, Trash2,
  Clock, CalendarPlus, ExternalLink, Eye, Heart,
  CheckCircle2, XCircle, Shield, Map, Settings2, HeartHandshake,
  Briefcase, ClipboardList, ChevronDown, ChevronUp, Plus, GripVertical,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminUser {
  _id: string
  discordId: string
  name: string
  email: string | null
  image: string | null
  role: Role
  joinedAt: string
  lastSeen: string
  stats: { loginCount: number; messagesent: number }
}

interface Announcement {
  _id: string
  discordId: string
  title: string
  body: string
  tag: string
  tagColor: string
  date: string
}

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

interface TeamMember {
  _id: string
  initials: string
  name: string
  role: string
  bio: string
  color: string
  badge: string
  level: number
  order: number
}

type Tab = 'overview' | 'users' | 'announcements' | 'games' | 'team' | 'positions' | 'applications'

interface FormField {
  id: string
  label: string
  type: 'text' | 'textarea' | 'url' | 'select' | 'image'
  placeholder: string
  required: boolean
  options: string[]
  order: number
}

interface Position {
  _id: string
  title: string
  description: string
  requirements: string
  gameName: string
  status: 'open' | 'closed'
  fields: FormField[]
}

interface AppResponse {
  fieldId: string
  label: string
  value: string
}

interface Application {
  _id: string
  positionTitle: string
  gameName: string
  discordId: string
  applicantName: string
  applicantTag: string
  responses: AppResponse[]
  status: 'pending' | 'accepted' | 'rejected'
  appliedAt: string
}

// ─── Toast ────────────────────────────────────────────────────────────────────

interface ToastState {
  message: string
  type: 'success' | 'error'
  id: number
}

function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast({ message, type, id: Date.now() })
    timerRef.current = setTimeout(() => setToast(null), 3000)
  }, [])

  return { toast, show }
}

// ─── Input style helper ───────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  background: 'rgba(109,40,217,0.1)',
  border: '1px solid rgba(109,40,217,0.3)',
  borderRadius: '8px',
  padding: '0.5rem 0.75rem',
  color: '#c4b5fd',
  outline: 'none',
  width: '100%',
  fontFamily: 'Nunito, sans-serif',
  fontSize: '0.875rem',
}

function AdminInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
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

function AdminTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const [focused, setFocused] = useState(false)
  return (
    <textarea
      {...props}
      style={{
        ...inputStyle,
        borderColor: focused ? '#8b5cf6' : 'rgba(109,40,217,0.3)',
        resize: 'vertical',
        minHeight: '80px',
        ...(props.style ?? {}),
      }}
      onFocus={(e) => { setFocused(true); props.onFocus?.(e) }}
      onBlur={(e) => { setFocused(false); props.onBlur?.(e) }}
    />
  )
}

function AdminSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
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

// ─── Role Badge ───────────────────────────────────────────────────────────────

const ROLE_ICON_MAP: Record<string, React.ReactNode> = {
  founder: <Crown size={11} />,
  owner: <Shield size={11} />,
  mapper: <Map size={11} />,
  skripter: <Settings2 size={11} />,
  helper: <HeartHandshake size={11} />,
  user: <User size={11} />,
}

function RoleBadge({ role }: { role: Role }) {
  const meta = getRoleMeta(role)
  return (
    <span
      className="rb-badge"
      style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`, fontSize: '0.65rem' }}
    >
      {ROLE_ICON_MAP[role]} {meta.label}
    </span>
  )
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ users, announcements, games, applications }: {
  users: AdminUser[]
  announcements: Announcement[]
  games: Game[]
  applications: Application[]
}) {
  const recent = users.slice(0, 5)
  const latestJoin = users[0]
    ? new Date(users[0].joinedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

  const stats = [
    { label: 'Total Users', value: users.length, icon: <Users size={20} />, color: '#8b5cf6' },
    { label: 'Announcements', value: announcements.length, icon: <Megaphone size={20} />, color: '#22d3ee' },
    { label: 'Games', value: games.length, icon: <Gamepad2 size={20} />, color: '#f59e0b' },
    { label: 'Bewerbungen', value: applications.length, icon: <ClipboardList size={20} />, color: '#e879f9' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="dash-stat-card flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${s.color}18`, border: `1px solid ${s.color}30`, color: s.color }}
            >
              {s.icon}
            </div>
            <div className="min-w-0">
              <p
                className="font-display leading-none truncate"
                style={{ color: s.color, fontSize: (s as any).isDate ? '0.9rem' : '1.8rem' }}
              >
                {s.value}
              </p>
              <p className="text-xs text-rb-light/40 mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rb-panel p-5" style={{ transition: 'none' }}>
        <h2 className="text-lg text-white mb-4 flex items-center gap-2 font-display">
          <Clock size={18} style={{ color: '#22d3ee' }} /> Recent Members
        </h2>
        {recent.length === 0 ? (
          <p className="text-rb-light/40 text-sm">No users yet.</p>
        ) : (
          <div className="space-y-2">
            {recent.map((u) => (
              <div key={u._id} className="dash-activity-item">
                {u.image ? (
                  <Image src={u.image} alt={u.name} width={36} height={36} className="rounded-full ring-2 ring-rb-purple/30 shrink-0" />
                ) : (
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(109,40,217,0.2)', border: '1px solid rgba(109,40,217,0.4)' }}
                  >
                    <User size={18} className="text-rb-light/40" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-semibold truncate">{u.name}</p>
                  <p className="text-xs text-rb-light/40 font-mono truncate">{u.discordId}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <RoleBadge role={u.role} />
                  <span className="text-xs text-rb-light/30">
                    {new Date(u.joinedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

function UsersTab({ users, myDiscordId, onRefresh, showToast }: {
  users: AdminUser[]
  myDiscordId: string
  onRefresh: () => void
  showToast: (msg: string, type?: 'success' | 'error') => void
}) {
  const [search, setSearch] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.discordId.includes(search)
  )

  async function changeRole(userId: string, role: Role) {
    setLoadingId(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      if (!res.ok) {
        const d = await res.json()
        showToast(d.error ?? 'Failed to update role', 'error')
      } else {
        showToast(`Role updated to ${role}`)
        onRefresh()
      }
    } catch {
      showToast('Network error', 'error')
    } finally {
      setLoadingId(null)
    }
  }

  async function deleteUser(userId: string, name: string) {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return
    setLoadingId(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json()
        showToast(d.error ?? 'Failed to delete user', 'error')
      } else {
        showToast(`${name} deleted`)
        onRefresh()
      }
    } catch {
      showToast('Network error', 'error')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-rb-light/30" />
          <AdminInput
            placeholder="Search by name or Discord ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2rem' }}
          />
        </div>
        <span className="text-xs text-rb-light/40 shrink-0">{filtered.length} users</span>
      </div>

      <div className="rb-panel overflow-hidden" style={{ transition: 'none' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(109,40,217,0.2)' }}>
                {['Avatar', 'Name', 'Discord ID', 'Role', 'Joined', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold"
                    style={{ color: 'rgba(196,181,253,0.5)', letterSpacing: '0.07em', textTransform: 'uppercase' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-rb-light/30 text-sm">
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const isMe = u.discordId === myDiscordId
                  const isLoading = loadingId === u._id
                  return (
                    <tr
                      key={u._id}
                      style={{
                        borderBottom: '1px solid rgba(109,40,217,0.1)',
                        opacity: isLoading ? 0.5 : 1,
                        transition: 'opacity 0.15s',
                      }}
                    >
                      {/* Avatar */}
                      <td className="px-4 py-3">
                        {u.image ? (
                          <Image src={u.image} alt={u.name} width={32} height={32} className="rounded-full ring-1 ring-rb-purple/40" />
                        ) : (
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(109,40,217,0.2)', border: '1px solid rgba(109,40,217,0.3)' }}
                          >
                            <User size={18} className="text-rb-light/40" />
                          </div>
                        )}
                      </td>
                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium truncate max-w-[140px]">{u.name}</span>
                          {isMe && (
                            <span
                              className="rb-badge"
                              style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', fontSize: '0.55rem' }}
                            >
                              YOU
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Discord ID */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-rb-light/50">{u.discordId}</span>
                      </td>
                      {/* Role dropdown */}
                      <td className="px-4 py-3">
                        {isMe ? (
                          <RoleBadge role={u.role} />
                        ) : (
                          <AdminSelect
                            value={u.role}
                            disabled={isLoading || isMe}
                            onChange={(e) => changeRole(u._id, e.target.value as Role)}
                            style={{ width: 'auto', minWidth: '110px', fontSize: '0.8rem', padding: '0.3rem 0.5rem' }}
                          >
                            {ROLE_HIERARCHY.map((r) => (
                              <option key={r} value={r} style={{ background: '#140025', color: getRoleMeta(r).color }}>
                                {getRoleMeta(r).label}
                              </option>
                            ))}
                          </AdminSelect>
                        )}
                      </td>
                      {/* Joined */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-rb-light/40">
                          {new Date(u.joinedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        {!isMe && (
                          <button
                            onClick={() => deleteUser(u._id, u.name)}
                            disabled={isLoading}
                            className="rb-btn-outline text-xs px-3 py-1.5 rounded-lg font-display"
                            style={{
                              background: 'rgba(239,68,68,0.08)',
                              border: '1px solid rgba(239,68,68,0.35)',
                              color: '#ef4444',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              cursor: isLoading ? 'not-allowed' : 'pointer',
                              transition: 'all 0.15s',
                              fontFamily: 'Fredoka One, sans-serif',
                            }}
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Announcements Tab ────────────────────────────────────────────────────────

interface AnnouncementForm {
  title: string
  body: string
  tag: string
  tagColor: string
}

const EMPTY_ANN_FORM: AnnouncementForm = { title: '', body: '', tag: 'news', tagColor: '#22d3ee' }

function AnnouncementsTab({ announcements, myDiscordId, onRefresh, showToast }: {
  announcements: Announcement[]
  myDiscordId: string
  onRefresh: () => void
  showToast: (msg: string, type?: 'success' | 'error') => void
}) {
  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<AnnouncementForm>(EMPTY_ANN_FORM)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function openNew() {
    setEditId(null)
    setForm(EMPTY_ANN_FORM)
    setFormOpen(true)
  }

  function openEdit(a: Announcement) {
    setEditId(a._id)
    setForm({ title: a.title, body: a.body, tag: a.tag, tagColor: a.tagColor })
    setFormOpen(true)
  }

  function cancelForm() {
    setFormOpen(false)
    setEditId(null)
    setForm(EMPTY_ANN_FORM)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim()) {
      showToast('Title and body are required', 'error')
      return
    }
    setSaving(true)
    try {
      let res: Response
      if (editId) {
        res = await fetch(`/api/admin/announcements/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      } else {
        res = await fetch('/api/admin/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      }
      if (!res.ok) {
        const d = await res.json()
        showToast(d.error ?? 'Failed to save', 'error')
      } else {
        showToast(editId ? 'Announcement updated' : 'Announcement created')
        cancelForm()
        onRefresh()
      }
    } catch {
      showToast('Network error', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function deleteAnn(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json()
        showToast(d.error ?? 'Failed to delete', 'error')
      } else {
        showToast('Announcement deleted')
        onRefresh()
      }
    } catch {
      showToast('Network error', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg text-white font-display">
          Announcements <span className="text-rb-light/30 text-sm font-body">({announcements.length})</span>
        </h2>
        {!formOpen && (
          <button onClick={openNew} className="rb-btn text-sm py-2 px-4">
            + New Announcement
          </button>
        )}
      </div>

      {/* Inline form */}
      {formOpen && (
        <div className="rb-panel p-5" style={{ transition: 'none', border: '2px solid rgba(109,40,217,0.5)' }}>
          <h3 className="text-white font-display mb-4">{editId ? 'Edit Announcement' : 'New Announcement'}</h3>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-rb-light/60 text-sm mb-1">Title *</label>
              <AdminInput
                placeholder="Announcement title…"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-rb-light/60 text-sm mb-1">Body *</label>
              <AdminTextarea
                placeholder="Announcement body…"
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-rb-light/60 text-sm mb-1">Tag</label>
                <AdminInput
                  placeholder="news, update, milestone…"
                  value={form.tag}
                  onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-rb-light/60 text-sm mb-1">Tag Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.tagColor}
                    onChange={(e) => setForm((f) => ({ ...f, tagColor: e.target.value }))}
                    style={{
                      width: '40px', height: '36px', border: 'none', borderRadius: '6px',
                      background: 'transparent', cursor: 'pointer', padding: '2px',
                    }}
                  />
                  <AdminInput
                    value={form.tagColor}
                    onChange={(e) => setForm((f) => ({ ...f, tagColor: e.target.value }))}
                    placeholder="#22d3ee"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saving} className="rb-btn text-sm py-2 px-5">
                {saving ? 'Saving…' : editId ? 'Save Changes' : 'Create'}
              </button>
              <button type="button" onClick={cancelForm} className="rb-btn-outline text-sm py-2 px-4"
                style={{ fontFamily: 'Fredoka One, sans-serif', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Announcement cards */}
      {announcements.length === 0 ? (
        <div className="rb-panel p-8 text-center text-rb-light/30" style={{ transition: 'none' }}>
          No announcements yet. Create one above!
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => {
            const isDeleting = deletingId === a._id
            return (
              <div
                key={a._id}
                className="rb-panel p-4"
                style={{
                  transition: 'none',
                  opacity: isDeleting ? 0.5 : 1,
                  borderLeft: `3px solid ${a.tagColor}`,
                }}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-white font-semibold">{a.title}</span>
                      <span
                        className="rb-badge"
                        style={{ background: `${a.tagColor}15`, color: a.tagColor, border: `1px solid ${a.tagColor}30`, fontSize: '0.62rem' }}
                      >
                        {a.tag}
                      </span>
                    </div>
                    <p className="text-sm text-rb-light/55 line-clamp-2">{a.body}</p>
                    <p className="text-xs text-rb-light/25 mt-2">
                      {new Date(a.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => openEdit(a)}
                      disabled={isDeleting}
                      className="rb-btn-outline text-xs px-3 py-1.5 rounded-lg"
                      style={{
                        fontFamily: 'Fredoka One, sans-serif',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                      }}
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      onClick={() => deleteAnn(a._id, a.title)}
                      disabled={isDeleting}
                      className="text-xs px-3 py-1.5 rounded-lg"
                      style={{
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.35)',
                        color: '#ef4444',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        cursor: isDeleting ? 'not-allowed' : 'pointer',
                        fontFamily: 'Fredoka One, sans-serif',
                        fontSize: '0.75rem',
                        transition: 'all 0.15s',
                      }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Games Tab ────────────────────────────────────────────────────────────────

interface GameForm {
  name: string
  status: 'Dev' | 'Beta' | 'Live'
  visits: string
  fav: string
  statusColor: string
  progress: number
  robloxUrl: string
}

const EMPTY_GAME_FORM: GameForm = {
  name: '',
  status: 'Dev',
  visits: '—',
  fav: '—',
  statusColor: '#22d3ee',
  progress: 0,
  robloxUrl: '',
}

function GamesTab({ games, onRefresh, showToast }: {
  games: Game[]
  onRefresh: () => void
  showToast: (msg: string, type?: 'success' | 'error') => void
}) {
  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<GameForm>(EMPTY_GAME_FORM)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function openNew() {
    setEditId(null)
    setForm(EMPTY_GAME_FORM)
    setFormOpen(true)
  }

  function openEdit(g: Game) {
    setEditId(g._id)
    setForm({
      name: g.name,
      status: g.status,
      visits: g.visits,
      fav: g.fav,
      statusColor: g.statusColor,
      progress: g.progress,
      robloxUrl: g.robloxUrl,
    })
    setFormOpen(true)
  }

  function cancelForm() {
    setFormOpen(false)
    setEditId(null)
    setForm(EMPTY_GAME_FORM)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      showToast('Game name is required', 'error')
      return
    }
    setSaving(true)
    try {
      let res: Response
      if (editId) {
        res = await fetch(`/api/admin/games/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      } else {
        res = await fetch('/api/admin/games', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      }
      if (!res.ok) {
        const d = await res.json()
        showToast(d.error ?? 'Failed to save', 'error')
      } else {
        showToast(editId ? 'Game updated' : 'Game created')
        cancelForm()
        onRefresh()
      }
    } catch {
      showToast('Network error', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function deleteGame(id: string, name: string) {
    if (!confirm(`Delete game "${name}"?`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/games/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json()
        showToast(d.error ?? 'Failed to delete', 'error')
      } else {
        showToast(`"${name}" deleted`)
        onRefresh()
      }
    } catch {
      showToast('Network error', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg text-white font-display">
          Games <span className="text-rb-light/30 text-sm font-body">({games.length})</span>
        </h2>
        {!formOpen && (
          <button onClick={openNew} className="rb-btn text-sm py-2 px-4">
            + New Game
          </button>
        )}
      </div>

      {/* Inline form */}
      {formOpen && (
        <div className="rb-panel p-5" style={{ transition: 'none', border: '2px solid rgba(109,40,217,0.5)' }}>
          <h3 className="text-white font-display mb-4">{editId ? 'Edit Game' : 'New Game'}</h3>
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-rb-light/60 text-sm mb-1">Game Name *</label>
                <AdminInput
                  placeholder="Void Conquest…"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-rb-light/60 text-sm mb-1">Status</label>
                <AdminSelect
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'Dev' | 'Beta' | 'Live' }))}
                >
                  <option value="Dev">Dev</option>
                  <option value="Beta">Beta</option>
                  <option value="Live">Live</option>
                </AdminSelect>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-rb-light/60 text-sm mb-1">Visits</label>
                <AdminInput
                  placeholder="48.2K or —"
                  value={form.visits}
                  onChange={(e) => setForm((f) => ({ ...f, visits: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-rb-light/60 text-sm mb-1">Favourites</label>
                <AdminInput
                  placeholder="1.1K or —"
                  value={form.fav}
                  onChange={(e) => setForm((f) => ({ ...f, fav: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-rb-light/60 text-sm mb-1">Status Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.statusColor}
                    onChange={(e) => setForm((f) => ({ ...f, statusColor: e.target.value }))}
                    style={{
                      width: '40px', height: '36px', border: 'none', borderRadius: '6px',
                      background: 'transparent', cursor: 'pointer', padding: '2px',
                    }}
                  />
                  <AdminInput
                    value={form.statusColor}
                    onChange={(e) => setForm((f) => ({ ...f, statusColor: e.target.value }))}
                    placeholder="#22d3ee"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-rb-light/60 text-sm mb-1">
                  Progress: <span style={{ color: form.statusColor }}>{form.progress}%</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={form.progress}
                  onChange={(e) => setForm((f) => ({ ...f, progress: Number(e.target.value) }))}
                  style={{ width: '100%', accentColor: form.statusColor, cursor: 'pointer' }}
                />
              </div>
            </div>
            <div>
              <label className="block text-rb-light/60 text-sm mb-1">Roblox URL</label>
              <AdminInput
                placeholder="https://www.roblox.com/games/…"
                value={form.robloxUrl}
                onChange={(e) => setForm((f) => ({ ...f, robloxUrl: e.target.value }))}
                type="url"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saving} className="rb-btn text-sm py-2 px-5">
                {saving ? 'Saving…' : editId ? 'Save Changes' : 'Create'}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="rb-btn-outline text-sm py-2 px-4"
                style={{ fontFamily: 'Fredoka One, sans-serif', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Game cards */}
      {games.length === 0 ? (
        <div className="rb-panel p-8 text-center text-rb-light/30" style={{ transition: 'none' }}>
          No games yet. Add your first game!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {games.map((g) => {
            const isDeleting = deletingId === g._id
            return (
              <div
                key={g._id}
                className="rb-panel p-4"
                style={{ transition: 'none', opacity: isDeleting ? 0.5 : 1, borderTop: `3px solid ${g.statusColor}` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-white font-display text-base truncate max-w-[160px]">{g.name}</span>
                  <span
                    className="rb-badge"
                    style={{ background: `${g.statusColor}18`, color: g.statusColor, border: `1px solid ${g.statusColor}30`, fontSize: '0.6rem' }}
                  >
                    {g.status}
                  </span>
                </div>

                <div className="flex gap-4 text-xs text-rb-light/40 mb-3">
                  <span className="inline-flex items-center gap-1"><Eye size={11} /> {g.visits}</span>
                  <span className="inline-flex items-center gap-1"><Heart size={11} /> {g.fav}</span>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-rb-light/35 mb-1">
                    <span>Progress</span>
                    <span style={{ color: g.statusColor }}>{g.progress}%</span>
                  </div>
                  <div className="xp-bar-track">
                    <div
                      className="xp-bar-fill"
                      style={{
                        ['--xp-width' as any]: `${g.progress}%`,
                        background: `linear-gradient(90deg, ${g.statusColor}70, ${g.statusColor})`,
                        boxShadow: `0 0 8px ${g.statusColor}50`,
                      }}
                    />
                  </div>
                </div>

                {g.robloxUrl && (
                  <a
                    href={g.robloxUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-rb-cyan/60 hover:text-rb-cyan transition-colors truncate block mb-3 inline-flex items-center gap-1"
                  >
                    <ExternalLink size={12} /> Roblox Page
                  </a>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(g)}
                    disabled={isDeleting}
                    className="rb-btn-outline text-xs px-3 py-1.5 rounded-lg flex-1"
                    style={{
                      fontFamily: 'Fredoka One, sans-serif',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                    }}
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    onClick={() => deleteGame(g._id, g.name)}
                    disabled={isDeleting}
                    className="text-xs px-3 py-1.5 rounded-lg flex-1"
                    style={{
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.35)',
                      color: '#ef4444',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem',
                      cursor: isDeleting ? 'not-allowed' : 'pointer',
                      fontFamily: 'Fredoka One, sans-serif',
                      fontSize: '0.75rem',
                      transition: 'all 0.15s',
                    }}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Team Tab ────────────────────────────────────────────────────────────────

interface TeamForm {
  initials: string
  name: string
  role: string
  bio: string
  color: string
  badge: string
  level: number
  order: number
}

const EMPTY_TEAM_FORM: TeamForm = {
  initials: '',
  name: '',
  role: '',
  bio: '',
  color: '#8b5cf6',
  badge: 'Member',
  level: 1,
  order: 0,
}

function TeamTab({ members, onRefresh, showToast }: {
  members: TeamMember[]
  onRefresh: () => void
  showToast: (msg: string, type?: 'success' | 'error') => void
}) {
  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<TeamForm>(EMPTY_TEAM_FORM)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function openNew() {
    setEditId(null)
    setForm(EMPTY_TEAM_FORM)
    setFormOpen(true)
  }

  function openEdit(m: TeamMember) {
    setEditId(m._id)
    setForm({ initials: m.initials, name: m.name, role: m.role, bio: m.bio, color: m.color, badge: m.badge, level: m.level, order: m.order })
    setFormOpen(true)
  }

  function cancelForm() {
    setFormOpen(false)
    setEditId(null)
    setForm(EMPTY_TEAM_FORM)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.initials.trim() || !form.name.trim() || !form.role.trim()) {
      showToast('Initialen, Name und Rolle sind Pflichtfelder', 'error')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(editId ? `/api/admin/team/${editId}` : '/api/admin/team', {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        showToast(d.error ?? 'Fehler beim Speichern', 'error')
      } else {
        showToast(editId ? 'Mitglied aktualisiert' : 'Mitglied hinzugefügt')
        cancelForm()
        onRefresh()
      }
    } catch {
      showToast('Netzwerkfehler', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function deleteMember(id: string, name: string) {
    if (!confirm(`"${name}" wirklich entfernen?`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/team/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json()
        showToast(d.error ?? 'Fehler beim Löschen', 'error')
      } else {
        showToast(`${name} entfernt`)
        onRefresh()
      }
    } catch {
      showToast('Netzwerkfehler', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg text-white font-display">
          Team <span className="text-rb-light/30 text-sm font-body">({members.length} Mitglieder)</span>
        </h2>
        {!formOpen && (
          <button onClick={openNew} className="rb-btn text-sm py-2 px-4">
            + Mitglied hinzufügen
          </button>
        )}
      </div>

      {/* Inline form */}
      {formOpen && (
        <div className="rb-panel p-5" style={{ transition: 'none', border: '2px solid rgba(109,40,217,0.5)' }}>
          <h3 className="text-white font-display mb-4">{editId ? 'Mitglied bearbeiten' : 'Neues Mitglied'}</h3>
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-rb-light/60 text-sm mb-1">Initialen * (max. 3)</label>
                <AdminInput
                  placeholder="EF"
                  value={form.initials}
                  maxLength={3}
                  onChange={(e) => setForm((f) => ({ ...f, initials: e.target.value.toUpperCase() }))}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-rb-light/60 text-sm mb-1">Name *</label>
                <AdminInput
                  placeholder="EyFounder"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-rb-light/60 text-sm mb-1">Rolle / Funktion *</label>
                <AdminInput
                  placeholder="Lead Scripter"
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-rb-light/60 text-sm mb-1">Badge Text</label>
                <AdminInput
                  placeholder="z.B. Scripter"
                  value={form.badge}
                  onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-rb-light/60 text-sm mb-1">Bio</label>
              <AdminTextarea
                placeholder="Kurze Beschreibung des Teammitglieds…"
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-rb-light/60 text-sm mb-1">Farbe</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                    style={{ width: '40px', height: '36px', border: 'none', borderRadius: '6px', background: 'transparent', cursor: 'pointer', padding: '2px' }}
                  />
                  <AdminInput
                    value={form.color}
                    onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                    placeholder="#8b5cf6"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-rb-light/60 text-sm mb-1">
                  Level: <span style={{ color: form.color }}>{form.level}</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={form.level}
                  onChange={(e) => setForm((f) => ({ ...f, level: Number(e.target.value) }))}
                  style={{ width: '100%', accentColor: form.color, cursor: 'pointer', marginTop: '0.6rem' }}
                />
              </div>
              <div>
                <label className="block text-rb-light/60 text-sm mb-1">Reihenfolge</label>
                <AdminInput
                  type="number"
                  min={0}
                  value={form.order}
                  onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saving} className="rb-btn text-sm py-2 px-5">
                {saving ? 'Speichern…' : editId ? 'Änderungen speichern' : 'Hinzufügen'}
              </button>
              <button type="button" onClick={cancelForm}
                className="rb-btn-outline text-sm py-2 px-4"
                style={{ fontFamily: 'Fredoka One, sans-serif', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Member cards */}
      {members.length === 0 ? (
        <div className="rb-panel p-8 text-center text-rb-light/30" style={{ transition: 'none' }}>
          Noch keine Teammitglieder. Füge das erste Mitglied hinzu!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {members.map((m) => {
            const isDeleting = deletingId === m._id
            return (
              <div
                key={m._id}
                className="rb-panel p-4"
                style={{ transition: 'none', opacity: isDeleting ? 0.5 : 1, borderLeft: `3px solid ${m.color}` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  {/* Avatar preview */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold shrink-0"
                    style={{
                      background: `radial-gradient(circle at 35% 30%, ${m.color}35, ${m.color}10)`,
                      border: `2px solid ${m.color}45`,
                      color: m.color,
                      fontFamily: 'Fredoka One, sans-serif',
                    }}
                  >
                    {m.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-display truncate">{m.name}</p>
                    <p className="text-xs truncate" style={{ color: m.color }}>{m.role}</p>
                  </div>
                  <span
                    className="rb-badge ml-auto shrink-0"
                    style={{ background: `${m.color}15`, color: m.color, border: `1px solid ${m.color}30`, fontSize: '0.6rem' }}
                  >
                    Lv.{m.level}
                  </span>
                </div>

                <p className="text-xs text-rb-light/40 mb-3 line-clamp-2 leading-relaxed">{m.bio || '—'}</p>

                <div className="mb-3">
                  <span
                    className="rb-badge"
                    style={{ background: `${m.color}10`, color: m.color, border: `1px solid ${m.color}25`, fontSize: '0.65rem' }}
                  >
                    {m.badge}
                  </span>
                </div>

                {/* XP bar preview */}
                <div className="xp-bar-track mb-3">
                  <div
                    className="xp-bar-fill"
                    style={{
                      ['--xp-width' as any]: `${(m.level / 50) * 100}%`,
                      background: `linear-gradient(90deg, ${m.color}60, ${m.color})`,
                      boxShadow: `0 0 8px ${m.color}50`,
                    }}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(m)}
                    disabled={isDeleting}
                    className="rb-btn-outline text-xs px-3 py-1.5 rounded-lg flex-1"
                    style={{ fontFamily: 'Fredoka One, sans-serif', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', cursor: 'pointer', fontSize: '0.75rem' }}
                  >
                    <Pencil size={13} /> Bearbeiten
                  </button>
                  <button
                    onClick={() => deleteMember(m._id, m.name)}
                    disabled={isDeleting}
                    className="text-xs px-3 py-1.5 rounded-lg flex-1"
                    style={{
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.35)',
                      color: '#ef4444',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem',
                      cursor: isDeleting ? 'not-allowed' : 'pointer',
                      fontFamily: 'Fredoka One, sans-serif',
                      fontSize: '0.75rem',
                      transition: 'all 0.15s',
                    }}
                  >
                    <Trash2 size={13} /> Entfernen
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Positionen Tab ───────────────────────────────────────────────────────────

interface PositionForm {
  title: string
  description: string
  requirements: string
  gameName: string
  status: 'open' | 'closed'
}

const EMPTY_POS_FORM: PositionForm = {
  title: '',
  description: '',
  requirements: '',
  gameName: '',
  status: 'open',
}

const EMPTY_FIELD_FORM: Omit<FormField, 'id' | 'order'> = {
  label: '',
  type: 'textarea',
  placeholder: '',
  required: true,
  options: [],
}

function FormEditorPanel({ position, onClose, showToast }: {
  position: Position
  onClose: () => void
  showToast: (msg: string, type?: 'success' | 'error') => void
}) {
  const [fields, setFields] = useState<FormField[]>(() =>
    [...(position.fields ?? [])].sort((a, b) => a.order - b.order)
  )
  const [addOpen, setAddOpen] = useState(false)
  const [editingField, setEditingField] = useState<FormField | null>(null)
  const [fieldForm, setFieldForm] = useState<Omit<FormField, 'id' | 'order'>>(EMPTY_FIELD_FORM)
  const [optionsRaw, setOptionsRaw] = useState('')
  const [saving, setSaving] = useState(false)

  function openAdd() {
    setEditingField(null)
    setFieldForm(EMPTY_FIELD_FORM)
    setOptionsRaw('')
    setAddOpen(true)
  }

  function openEditField(f: FormField) {
    setEditingField(f)
    setFieldForm({ label: f.label, type: f.type, placeholder: f.placeholder, required: f.required, options: f.options })
    setOptionsRaw(f.options.join(', '))
    setAddOpen(true)
  }

  function cancelFieldForm() {
    setAddOpen(false)
    setEditingField(null)
  }

  function saveField() {
    if (!fieldForm.label.trim()) { showToast('Label ist Pflicht', 'error'); return }
    const options = optionsRaw.split(',').map((o) => o.trim()).filter(Boolean)
    if (editingField) {
      setFields((prev) => prev.map((f) => f.id === editingField.id
        ? { ...editingField, ...fieldForm, options }
        : f
      ))
    } else {
      const newField: FormField = {
        id: `field_${Date.now()}`,
        ...fieldForm,
        options,
        order: fields.length,
      }
      setFields((prev) => [...prev, newField])
    }
    cancelFieldForm()
  }

  function removeField(id: string) {
    setFields((prev) => prev.filter((f) => f.id !== id).map((f, i) => ({ ...f, order: i })))
  }

  function moveField(id: string, dir: -1 | 1) {
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.id === id)
      if (idx + dir < 0 || idx + dir >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[idx + dir]] = [next[idx + dir], next[idx]]
      return next.map((f, i) => ({ ...f, order: i }))
    })
  }

  async function saveAll() {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/positions/${position._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
      })
      if (!res.ok) {
        const d = await res.json()
        showToast(d.error ?? 'Fehler beim Speichern', 'error')
      } else {
        showToast('Formular gespeichert')
        onClose()
      }
    } catch {
      showToast('Netzwerkfehler', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rb-panel p-5 mt-2" style={{ transition: 'none', border: '2px solid rgba(109,40,217,0.4)', background: 'rgba(109,40,217,0.04)' }}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-white font-display text-sm flex items-center gap-2">
          <GripVertical size={14} style={{ color: '#8b5cf6' }} /> Form Editor — {position.title}
        </h4>
        <span className="text-xs text-rb-light/35">
          {fields.length === 0 ? 'Standard-Felder werden verwendet' : `${fields.length} Felder`}
        </span>
      </div>

      {/* Field list */}
      {fields.length === 0 ? (
        <div className="text-center py-4 text-rb-light/30 text-sm mb-4">
          Keine benutzerdefinierten Felder. Standardfelder (Motivation + Portfolio) werden angezeigt.
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          {fields.map((f, idx) => (
            <div key={f.id} className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.18)' }}>
              <div className="flex flex-col gap-0.5">
                <button onClick={() => moveField(f.id, -1)} disabled={idx === 0}
                  style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', color: idx === 0 ? 'rgba(196,181,253,0.2)' : '#8b5cf6', padding: 0, lineHeight: 1 }}>
                  <ChevronUp size={12} />
                </button>
                <button onClick={() => moveField(f.id, 1)} disabled={idx === fields.length - 1}
                  style={{ background: 'none', border: 'none', cursor: idx === fields.length - 1 ? 'not-allowed' : 'pointer', color: idx === fields.length - 1 ? 'rgba(196,181,253,0.2)' : '#8b5cf6', padding: 0, lineHeight: 1 }}>
                  <ChevronDown size={12} />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-white font-semibold">{f.label}</span>
                <span className="ml-2 text-xs text-rb-light/40">{f.type}</span>
                {f.required && <span className="ml-2 text-xs" style={{ color: '#ef4444' }}>*</span>}
              </div>
              <button onClick={() => openEditField(f)}
                className="rb-btn-outline text-xs px-2 py-1 rounded"
                style={{ fontFamily: 'Fredoka One, sans-serif', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', cursor: 'pointer', fontSize: '0.7rem' }}>
                <Pencil size={11} />
              </button>
              <button onClick={() => removeField(f.id)}
                className="text-xs px-2 py-1 rounded"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem' }}>
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit field inline form */}
      {addOpen && (
        <div className="rounded-lg p-4 mb-4 space-y-3"
          style={{ background: 'rgba(109,40,217,0.1)', border: '1px solid rgba(109,40,217,0.35)' }}>
          <h5 className="text-white text-sm font-display">{editingField ? 'Feld bearbeiten' : 'Neues Feld'}</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-rb-light/50 text-xs mb-1">Label *</label>
              <AdminInput placeholder="z.B. Warum möchtest du mitmachen?" value={fieldForm.label}
                onChange={(e) => setFieldForm((f) => ({ ...f, label: e.target.value }))} />
            </div>
            <div>
              <label className="block text-rb-light/50 text-xs mb-1">Typ</label>
              <AdminSelect value={fieldForm.type}
                onChange={(e) => setFieldForm((f) => ({ ...f, type: e.target.value as FormField['type'] }))}>
                <option value="textarea">Textarea (langer Text)</option>
                <option value="text">Text (kurze Eingabe)</option>
                <option value="url">URL (Link)</option>
                <option value="select">Auswahl (Dropdown)</option>
                <option value="image">Bild-Upload (Beweis / Screenshot)</option>
              </AdminSelect>
            </div>
          </div>
          <div>
            <label className="block text-rb-light/50 text-xs mb-1">Platzhaltertext</label>
            <AdminInput placeholder="z.B. Schreibe hier deine Antwort…" value={fieldForm.placeholder}
              onChange={(e) => setFieldForm((f) => ({ ...f, placeholder: e.target.value }))} />
          </div>
          {fieldForm.type === 'select' && (
            <div>
              <label className="block text-rb-light/50 text-xs mb-1">Optionen (kommagetrennt)</label>
              <AdminInput placeholder="Option A, Option B, Option C" value={optionsRaw}
                onChange={(e) => setOptionsRaw(e.target.value)} />
            </div>
          )}
          <label className="flex items-center gap-2 cursor-pointer text-sm text-rb-light/60">
            <input type="checkbox" checked={fieldForm.required}
              onChange={(e) => setFieldForm((f) => ({ ...f, required: e.target.checked }))}
              style={{ accentColor: '#8b5cf6', width: '14px', height: '14px' }} />
            Pflichtfeld
          </label>
          <div className="flex gap-2">
            <button onClick={saveField} className="rb-btn text-xs py-1.5 px-4">
              {editingField ? 'Aktualisieren' : 'Hinzufügen'}
            </button>
            <button onClick={cancelFieldForm}
              className="rb-btn-outline text-xs py-1.5 px-3"
              style={{ fontFamily: 'Fredoka One, sans-serif', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
              Abbrechen
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {!addOpen && (
          <button onClick={openAdd} className="rb-btn text-xs py-1.5 px-3 inline-flex items-center gap-1.5">
            <Plus size={13} /> Feld hinzufügen
          </button>
        )}
        <button onClick={saveAll} disabled={saving}
          className="rb-btn text-xs py-1.5 px-4"
          style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', color: '#22c55e' }}>
          {saving ? 'Speichern…' : 'Formular speichern'}
        </button>
        <button onClick={onClose}
          className="rb-btn-outline text-xs py-1.5 px-3"
          style={{ fontFamily: 'Fredoka One, sans-serif', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
          Schließen
        </button>
      </div>
    </div>
  )
}

function PositionenTab({ positions, onRefresh, showToast }: {
  positions: Position[]
  onRefresh: () => void
  showToast: (msg: string, type?: 'success' | 'error') => void
}) {
  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<PositionForm>(EMPTY_POS_FORM)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formEditorId, setFormEditorId] = useState<string | null>(null)

  function openNew() {
    setEditId(null)
    setForm(EMPTY_POS_FORM)
    setFormOpen(true)
  }

  function openEdit(p: Position) {
    setEditId(p._id)
    setFormEditorId(null)
    setForm({
      title: p.title,
      description: p.description,
      requirements: p.requirements,
      gameName: p.gameName,
      status: p.status,
    })
    setFormOpen(true)
  }

  function cancelForm() {
    setFormOpen(false)
    setEditId(null)
    setForm(EMPTY_POS_FORM)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) {
      showToast('Titel und Beschreibung sind Pflichtfelder', 'error')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(editId ? `/api/admin/positions/${editId}` : '/api/admin/positions', {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        showToast(d.error ?? 'Fehler beim Speichern', 'error')
      } else {
        showToast(editId ? 'Position aktualisiert' : 'Position erstellt')
        cancelForm()
        onRefresh()
      }
    } catch {
      showToast('Netzwerkfehler', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function deletePosition(id: string, title: string) {
    if (!confirm(`Position "${title}" löschen? Alle zugehörigen Bewerbungen werden ebenfalls gelöscht.`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/positions/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json()
        showToast(d.error ?? 'Fehler beim Löschen', 'error')
      } else {
        showToast(`"${title}" gelöscht`)
        onRefresh()
      }
    } catch {
      showToast('Netzwerkfehler', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg text-white font-display">
          Positionen <span className="text-rb-light/30 text-sm font-body">({positions.length})</span>
        </h2>
        {!formOpen && (
          <button onClick={openNew} className="rb-btn text-sm py-2 px-4">
            + Neue Position
          </button>
        )}
      </div>

      {formOpen && (
        <div className="rb-panel p-5" style={{ transition: 'none', border: '2px solid rgba(109,40,217,0.5)' }}>
          <h3 className="text-white font-display mb-4">{editId ? 'Position bearbeiten' : 'Neue Position'}</h3>
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-rb-light/60 text-sm mb-1">Titel *</label>
                <AdminInput
                  placeholder="z.B. Lead Scripter"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-rb-light/60 text-sm mb-1">Spiel (optional)</label>
                <AdminInput
                  placeholder="Void Conquest…"
                  value={form.gameName}
                  onChange={(e) => setForm((f) => ({ ...f, gameName: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-rb-light/60 text-sm mb-1">Beschreibung *</label>
              <AdminTextarea
                placeholder="Was macht diese Rolle aus? Was wird erwartet?"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-rb-light/60 text-sm mb-1">Anforderungen</label>
              <AdminTextarea
                placeholder="Welche Erfahrungen / Skills werden benötigt?"
                value={form.requirements}
                onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))}
                style={{ minHeight: '70px' }}
              />
            </div>
            <div>
              <label className="block text-rb-light/60 text-sm mb-1">Status</label>
              <AdminSelect
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'open' | 'closed' }))}
              >
                <option value="open">Offen</option>
                <option value="closed">Geschlossen</option>
              </AdminSelect>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saving} className="rb-btn text-sm py-2 px-5">
                {saving ? 'Speichern…' : editId ? 'Änderungen speichern' : 'Erstellen'}
              </button>
              <button type="button" onClick={cancelForm}
                className="rb-btn-outline text-sm py-2 px-4"
                style={{ fontFamily: 'Fredoka One, sans-serif', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      {positions.length === 0 ? (
        <div className="rb-panel p-8 text-center text-rb-light/30" style={{ transition: 'none' }}>
          Noch keine Positionen. Erstelle die erste Position!
        </div>
      ) : (
        <div className="space-y-3">
          {positions.map((p) => {
            const isDeleting = deletingId === p._id
            return (
              <div
                key={p._id}
                className="rb-panel p-4"
                style={{
                  transition: 'none',
                  opacity: isDeleting ? 0.5 : 1,
                  borderLeft: `3px solid ${p.status === 'open' ? '#22c55e' : '#6b7280'}`,
                }}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-white font-semibold">{p.title}</span>
                      {p.gameName && (
                        <span className="rb-badge" style={{ background: 'rgba(109,40,217,0.15)', color: '#c4b5fd', border: '1px solid rgba(109,40,217,0.3)', fontSize: '0.62rem' }}>
                          {p.gameName}
                        </span>
                      )}
                      <span
                        className="rb-badge"
                        style={{
                          background: p.status === 'open' ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.12)',
                          color: p.status === 'open' ? '#22c55e' : '#9ca3af',
                          border: `1px solid ${p.status === 'open' ? 'rgba(34,197,94,0.3)' : 'rgba(107,114,128,0.3)'}`,
                          fontSize: '0.6rem',
                        }}
                      >
                        {p.status === 'open' ? 'OFFEN' : 'GESCHLOSSEN'}
                      </span>
                    </div>
                    <p className="text-sm text-rb-light/55 line-clamp-2">{p.description}</p>
                  </div>
                  <div className="flex gap-2 shrink-0 flex-wrap">
                    <button
                      onClick={() => setFormEditorId(formEditorId === p._id ? null : p._id)}
                      disabled={isDeleting}
                      className="text-xs px-3 py-1.5 rounded-lg"
                      style={{
                        background: formEditorId === p._id ? 'rgba(109,40,217,0.25)' : 'rgba(109,40,217,0.08)',
                        border: `1px solid ${formEditorId === p._id ? 'rgba(109,40,217,0.6)' : 'rgba(109,40,217,0.3)'}`,
                        color: '#c4b5fd',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        cursor: 'pointer',
                        fontFamily: 'Fredoka One, sans-serif',
                        fontSize: '0.75rem',
                      }}
                    >
                      <GripVertical size={13} /> Form
                    </button>
                    <button
                      onClick={() => openEdit(p)}
                      disabled={isDeleting}
                      className="rb-btn-outline text-xs px-3 py-1.5 rounded-lg"
                      style={{ fontFamily: 'Fredoka One, sans-serif', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      <Pencil size={13} /> Bearbeiten
                    </button>
                    <button
                      onClick={() => deletePosition(p._id, p.title)}
                      disabled={isDeleting}
                      className="text-xs px-3 py-1.5 rounded-lg"
                      style={{
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.35)',
                        color: '#ef4444',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        cursor: isDeleting ? 'not-allowed' : 'pointer',
                        fontFamily: 'Fredoka One, sans-serif',
                        fontSize: '0.75rem',
                        transition: 'all 0.15s',
                      }}
                    >
                      <Trash2 size={13} /> Löschen
                    </button>
                  </div>
                </div>
                {formEditorId === p._id && (
                  <FormEditorPanel
                    position={p}
                    onClose={() => { setFormEditorId(null); onRefresh() }}
                    showToast={showToast}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Bewerbungen Tab ──────────────────────────────────────────────────────────

type AppFilter = 'all' | 'pending' | 'accepted' | 'rejected'

function BewerbungenTab({ applications, onRefresh, showToast, highlightedId }: {
  applications: Application[]
  onRefresh: () => void
  showToast: (msg: string, type?: 'success' | 'error') => void
  highlightedId: string | null
}) {
  const [filter, setFilter] = useState<AppFilter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const highlightRef = useRef<HTMLDivElement | null>(null)

  const filtered = applications.filter((a) => filter === 'all' || a.status === filter)

  useEffect(() => {
    if (highlightedId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [highlightedId, applications])

  async function decide(id: string, status: 'accepted' | 'rejected') {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const d = await res.json()
        showToast(d.error ?? 'Fehler', 'error')
      } else {
        showToast(status === 'accepted' ? 'Bewerbung angenommen ✅' : 'Bewerbung abgelehnt ❌')
        onRefresh()
      }
    } catch {
      showToast('Netzwerkfehler', 'error')
    } finally {
      setLoadingId(null)
    }
  }

  const filterBtns: { id: AppFilter; label: string }[] = [
    { id: 'all', label: `Alle (${applications.length})` },
    { id: 'pending', label: `Ausstehend (${applications.filter((a) => a.status === 'pending').length})` },
    { id: 'accepted', label: `Angenommen (${applications.filter((a) => a.status === 'accepted').length})` },
    { id: 'rejected', label: `Abgelehnt (${applications.filter((a) => a.status === 'rejected').length})` },
  ]

  const statusColors: Record<Application['status'], string> = {
    pending: '#f59e0b',
    accepted: '#22c55e',
    rejected: '#ef4444',
  }

  const statusLabels: Record<Application['status'], string> = {
    pending: 'Ausstehend',
    accepted: 'Angenommen',
    rejected: 'Abgelehnt',
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg text-white font-display">
        Bewerbungen <span className="text-rb-light/30 text-sm font-body">({applications.length})</span>
      </h2>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2">
        {filterBtns.map((btn) => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id)}
            className="text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: filter === btn.id ? 'rgba(109,40,217,0.3)' : 'rgba(109,40,217,0.08)',
              border: `1px solid ${filter === btn.id ? 'rgba(109,40,217,0.6)' : 'rgba(109,40,217,0.2)'}`,
              color: filter === btn.id ? '#c4b5fd' : 'rgba(196,181,253,0.45)',
              cursor: 'pointer',
              fontFamily: 'Fredoka One, sans-serif',
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rb-panel p-8 text-center text-rb-light/30" style={{ transition: 'none' }}>
          Keine Bewerbungen in dieser Kategorie.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => {
            const isHighlighted = app._id === highlightedId
            const isExpanded = expandedId === app._id
            const isLoading = loadingId === app._id
            const statusColor = statusColors[app.status]

            return (
              <div
                key={app._id}
                ref={isHighlighted ? highlightRef : null}
                className="rb-panel p-4"
                style={{
                  transition: 'box-shadow 0.3s',
                  opacity: isLoading ? 0.6 : 1,
                  borderLeft: `3px solid ${statusColor}`,
                  boxShadow: isHighlighted ? `0 0 0 2px ${statusColor}50, 0 0 20px ${statusColor}20` : undefined,
                }}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-white font-semibold">{app.applicantName}</span>
                      <span className="font-mono text-xs text-rb-light/35">{app.discordId}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap text-xs text-rb-light/50">
                      <span>Bewirbt sich für: <span className="text-rb-light/70 font-medium">{app.positionTitle}</span></span>
                      {app.gameName && (
                        <span className="rb-badge" style={{ background: 'rgba(109,40,217,0.12)', color: '#c4b5fd', border: '1px solid rgba(109,40,217,0.25)', fontSize: '0.6rem' }}>
                          {app.gameName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="rb-badge"
                      style={{ background: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}35`, fontSize: '0.65rem' }}
                    >
                      {statusLabels[app.status]}
                    </span>
                    <span className="text-xs text-rb-light/30">
                      {new Date(app.appliedAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Toggle responses */}
                {app.responses.length > 0 && (
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : app._id)}
                    className="flex items-center gap-1.5 text-xs text-rb-light/40 hover:text-rb-light/70 transition-colors mb-2"
                    style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                  >
                    {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    Antworten {isExpanded ? 'ausblenden' : 'anzeigen'}
                  </button>
                )}

                {isExpanded && (
                  <div className="space-y-2 mb-3">
                    {app.responses.map((r) => (
                      <div key={r.fieldId}>
                        <p className="text-xs text-rb-light/40 mb-1 font-semibold">{r.label}</p>
                        {/\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(r.value) || r.value.startsWith('/uploads/') ? (
                          <a href={r.value} target="_blank" rel="noopener noreferrer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={r.value}
                              alt={r.label}
                              style={{
                                maxWidth: '100%',
                                maxHeight: '260px',
                                objectFit: 'contain',
                                borderRadius: '8px',
                                border: '1px solid rgba(109,40,217,0.3)',
                                cursor: 'zoom-in',
                              }}
                            />
                          </a>
                        ) : r.value.startsWith('http') || r.value.startsWith('/') ? (
                          <a
                            href={r.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-rb-cyan/60 hover:text-rb-cyan transition-colors"
                          >
                            <ExternalLink size={12} /> {r.value}
                          </a>
                        ) : r.value ? (
                          <div
                            className="rounded-lg p-3"
                            style={{ background: 'rgba(109,40,217,0.06)', border: '1px solid rgba(109,40,217,0.15)' }}
                          >
                            <p className="text-sm text-rb-light/70 leading-relaxed whitespace-pre-wrap">{r.value}</p>
                          </div>
                        ) : (
                          <p className="text-xs text-rb-light/25 italic">Keine Angabe</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Action buttons — only if pending */}
                {app.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => decide(app._id, 'accepted')}
                      disabled={isLoading}
                      className="text-xs px-4 py-1.5 rounded-lg"
                      style={{
                        background: 'rgba(34,197,94,0.1)',
                        border: '1px solid rgba(34,197,94,0.35)',
                        color: '#22c55e',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        fontFamily: 'Fredoka One, sans-serif',
                        transition: 'all 0.15s',
                      }}
                    >
                      <CheckCircle2 size={13} /> Annehmen
                    </button>
                    <button
                      onClick={() => decide(app._id, 'rejected')}
                      disabled={isLoading}
                      className="text-xs px-4 py-1.5 rounded-lg"
                      style={{
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.35)',
                        color: '#ef4444',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        fontFamily: 'Fredoka One, sans-serif',
                        transition: 'all 0.15s',
                      }}
                    >
                      <XCircle size={13} /> Ablehnen
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Sidebar Nav ──────────────────────────────────────────────────────────────

interface NavItem {
  id: Tab
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { id: 'users', label: 'Users', icon: <Users size={18} /> },
  { id: 'announcements', label: 'Announcements', icon: <Megaphone size={18} /> },
  { id: 'games', label: 'Games', icon: <Gamepad2 size={18} /> },
  { id: 'team', label: 'Team', icon: <Code2 size={18} /> },
  { id: 'positions', label: 'Positionen', icon: <Briefcase size={18} /> },
  { id: 'applications', label: 'Bewerbungen', icon: <ClipboardList size={18} /> },
]

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast, show: showToast } = useToast()

  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [users, setUsers] = useState<AdminUser[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [highlightedApplicationId, setHighlightedApplicationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const user = session?.user as any
  const myDiscordId = user?.discordId as string ?? ''

  // Redirect if not founder (client-side safety net — server layout already handles it)
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
    if (status === 'authenticated' && user?.role !== 'founder') router.push('/')
  }, [status, user, router])

  // Handle ?bewerbung=ID URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const bewerbungId = params.get('bewerbung')
    if (bewerbungId) {
      setActiveTab('applications')
      setHighlightedApplicationId(bewerbungId)
    }
  }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [uRes, aRes, gRes, tRes, pRes, appRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/announcements'),
        fetch('/api/admin/games'),
        fetch('/api/admin/team'),
        fetch('/api/admin/positions'),
        fetch('/api/admin/applications'),
      ])
      if (uRes.ok) { const d = await uRes.json(); setUsers(d.users ?? []) }
      if (aRes.ok) { const d = await aRes.json(); setAnnouncements(d.announcements ?? []) }
      if (gRes.ok) { const d = await gRes.json(); setGames(d.games ?? []) }
      if (tRes.ok) { const d = await tRes.json(); setTeamMembers(d.members ?? []) }
      if (pRes.ok) { const d = await pRes.json(); setPositions(d.positions ?? []) }
      if (appRes.ok) { const d = await appRes.json(); setApplications(d.applications ?? []) }
    } catch {
      showToast('Failed to load data', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  // Fetch when tab changes
  useEffect(() => {
    if (status === 'authenticated') fetchAll()
  }, [activeTab, status, fetchAll])

  if (status === 'loading') return <AdminSkeleton />
  if (!session || user?.role !== 'founder') return null

  return (
    <div className="min-h-screen hex-bg flex flex-col" style={{ background: '#08010f' }}>
      {/* Top bar */}
      <header
        className="sticky top-0 z-50 border-b border-rb-border/40 backdrop-blur-xl"
        style={{ background: 'rgba(8,1,15,0.92)' }}
      >
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* Left: logo + breadcrumb */}
          <div className="flex items-center gap-3">
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="lg:hidden p-2 rounded-lg text-rb-light/50 hover:text-rb-light transition-colors"
              style={{ background: 'rgba(109,40,217,0.1)' }}
              aria-label="Toggle sidebar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-display" style={{ color: '#c4b5fd', letterSpacing: '0.05em' }}>
                Ey<span style={{ color: '#8b5cf6' }}>Studio</span>
              </span>
              <span className="text-xs text-rb-light/30 hidden sm:block">/</span>
              <span className="text-xs text-rb-light/50 hidden sm:block font-mono">Admin CMS</span>
            </Link>
          </div>

          {/* Right: founder badge + avatar + logout */}
          <div className="flex items-center gap-3">
            <span
              className="rb-badge hidden sm:inline-flex items-center gap-1"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.4)', fontSize: '0.65rem' }}
            >
              <Crown size={12} /> Founder
            </span>
            {user?.image && (
              <Image
                src={user.image}
                alt="Avatar"
                width={30}
                height={30}
                className="rounded-full ring-2 ring-rb-gold/40"
              />
            )}
            <span className="text-sm text-rb-light/60 hidden sm:block truncate max-w-[120px]">{user?.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="rb-btn-outline py-1.5 px-3 text-xs"
              style={{ fontFamily: 'Fredoka One, sans-serif', display: 'inline-flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.75rem' }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar overlay on mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static z-40 top-0 left-0 h-full lg:h-auto
            flex flex-col gap-1 p-3 pt-20 lg:pt-4
            border-r border-rb-border/30
            transition-transform duration-200
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
          style={{
            width: '220px',
            background: 'rgba(8,1,15,0.97)',
            minHeight: '100vh',
          }}
        >
          <p className="text-xs text-rb-light/25 uppercase tracking-widest font-semibold px-3 mb-2">
            Navigation
          </p>
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left w-full transition-all duration-150"
                style={{
                  background: isActive ? 'rgba(109,40,217,0.25)' : 'transparent',
                  border: isActive ? '1px solid rgba(109,40,217,0.45)' : '1px solid transparent',
                  color: isActive ? '#c4b5fd' : 'rgba(196,181,253,0.45)',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 0 16px rgba(109,40,217,0.15) inset' : 'none',
                }}
              >
                <span className="w-6 flex items-center justify-center">{item.icon}</span>
                <span className="text-sm font-semibold">{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#8b5cf6' }} />
                )}
              </button>
            )
          })}

          {/* Bottom: back to dashboard */}
          <div className="mt-auto pt-4 border-t border-rb-border/20">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-rb-light/30 hover:text-rb-light/60 transition-colors text-sm"
            >
              <ArrowLeft size={14} /> Dashboard
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 min-w-0">
          {/* Tab heading */}
          <div className="mb-6 flex items-center gap-3">
            <span className="flex items-center">{NAV_ITEMS.find((n) => n.id === activeTab)?.icon}</span>
            <h1 className="text-2xl text-white font-display">
              {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
            </h1>
            {loading && (
              <span className="text-xs text-rb-light/30 animate-pulse ml-2">Loading…</span>
            )}
          </div>

          {loading ? (
            <TabSkeleton />
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewTab users={users} announcements={announcements} games={games} applications={applications} />
              )}
              {activeTab === 'users' && (
                <UsersTab
                  users={users}
                  myDiscordId={myDiscordId}
                  onRefresh={fetchAll}
                  showToast={showToast}
                />
              )}
              {activeTab === 'announcements' && (
                <AnnouncementsTab
                  announcements={announcements}
                  myDiscordId={myDiscordId}
                  onRefresh={fetchAll}
                  showToast={showToast}
                />
              )}
              {activeTab === 'games' && (
                <GamesTab
                  games={games}
                  onRefresh={fetchAll}
                  showToast={showToast}
                />
              )}
              {activeTab === 'team' && (
                <TeamTab
                  members={teamMembers}
                  onRefresh={fetchAll}
                  showToast={showToast}
                />
              )}
              {activeTab === 'positions' && (
                <PositionenTab
                  positions={positions}
                  onRefresh={fetchAll}
                  showToast={showToast}
                />
              )}
              {activeTab === 'applications' && (
                <BewerbungenTab
                  applications={applications}
                  onRefresh={fetchAll}
                  showToast={showToast}
                  highlightedId={highlightedApplicationId}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          key={toast.id}
          className="fixed bottom-6 right-6 z-[9999] px-4 py-3 rounded-xl text-sm font-semibold shadow-lg flex items-center gap-2"
          style={{
            background: toast.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
            color: toast.type === 'success' ? '#22c55e' : '#ef4444',
            backdropFilter: 'blur(8px)',
            animation: 'fadeInUp 0.2s ease',
            maxWidth: '320px',
          }}
        >
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />} {toast.message}
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function AdminSkeleton() {
  return (
    <div className="min-h-screen hex-bg" style={{ background: '#08010f' }}>
      <div className="h-14 border-b border-rb-border/40" style={{ background: 'rgba(8,1,15,0.9)' }} />
      <div className="flex">
        <div className="w-[220px] h-screen border-r border-rb-border/30" style={{ background: 'rgba(8,1,15,0.97)' }} />
        <div className="flex-1 p-6 animate-pulse space-y-4">
          <div className="h-8 w-48 rounded-lg" style={{ background: 'rgba(109,40,217,0.15)' }} />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="dash-stat-card h-20" />
            ))}
          </div>
          <div className="rb-panel h-64" />
        </div>
      </div>
    </div>
  )
}

function TabSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="dash-stat-card h-20" />
        ))}
      </div>
      <div className="rb-panel h-48" />
      <div className="rb-panel h-32" />
    </div>
  )
}
