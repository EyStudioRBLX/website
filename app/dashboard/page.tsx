'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getRoleMeta, type Role } from '@/lib/roles'
import {
  KeyRound, Star, Gamepad2, Users, Megaphone, Link2, ChevronRight,
  Joystick, Eye, Heart, MessageCircle, Mail, User, Crown, Shield,
  Map, Settings2, HeartHandshake, Briefcase,
} from 'lucide-react'

interface DbUser {
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

interface Position {
  _id: string
  title: string
  description: string
  requirements: string
  gameName: string
  status: 'open' | 'closed'
}

const QUICK_LINKS = [
  { label: 'Discord Server', Icon: MessageCircle, href: '#', color: '#5865F2' },
  { label: 'Roblox Gruppe', Icon: Gamepad2, href: '#', color: '#e879f9' },
  { label: 'Spiele ansehen', Icon: Joystick, href: '/#games', color: '#22d3ee' },
  { label: 'Team kontaktieren', Icon: Mail, href: '/#contact', color: '#f59e0b' },
]

const ROLE_ICON_MAP: Record<string, React.ReactNode> = {
  founder: <Crown size={12} />,
  owner: <Shield size={12} />,
  mapper: <Map size={12} />,
  skripter: <Settings2 size={12} />,
  helper: <HeartHandshake size={12} />,
  user: <User size={12} />,
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [dbUser, setDbUser] = useState<DbUser | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [teamCount, setTeamCount] = useState(0)
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    Promise.all([
      fetch('/api/user').then((r) => r.json()),
      fetch('/api/announcements').then((r) => r.json()),
      fetch('/api/games').then((r) => r.json()),
      fetch('/api/team').then((r) => r.json()),
      fetch('/api/positions').then((r) => r.json()),
    ])
      .then(([userData, annData, gameData, teamData, posData]) => {
        if (userData.user) setDbUser(userData.user)
        if (annData.announcements) setAnnouncements(annData.announcements.slice(0, 5))
        if (gameData.games) setGames(gameData.games)
        if (teamData.members) setTeamCount(teamData.members.length)
        if (posData.positions) setPositions(posData.positions)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [status])

  if (status === 'loading' || loading) return <DashboardSkeleton />
  if (!session) return null

  const user = session.user as any
  const joinDate = dbUser
    ? new Date(dbUser.joinedAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—'
  const lastSeen = dbUser
    ? new Date(dbUser.lastSeen).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '—'
  const loginCount = dbUser?.stats.loginCount ?? 1
  const xpLevel = Math.min(Math.floor(loginCount / 3) + 1, 50)
  const xpProgress = ((loginCount % 3) / 3) * 100
  const role = getRoleMeta(dbUser?.role ?? 'user')
  const liveGames = games.filter((g) => g.status === 'Live').length

  const statCards = [
    { label: 'Logins gesamt', value: loginCount, Icon: KeyRound, color: '#8b5cf6', suffix: 'x' },
    { label: 'Studio Level',  value: xpLevel,    Icon: Star,     color: '#f59e0b', suffix: '' },
    { label: 'Live Spiele',   value: liveGames,  Icon: Gamepad2, color: '#22d3ee', suffix: '' },
    { label: 'Team',          value: teamCount,  Icon: Users,    color: '#22c55e', suffix: '' },
  ]

  return (
    <div className="min-h-screen hex-bg" style={{ background: '#08010f' }}>
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-rb-border/40 backdrop-blur-xl"
        style={{ background: 'rgba(8,1,15,0.9)' }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl" style={{ fontFamily: 'Fredoka One, sans-serif', color: '#c4b5fd', letterSpacing: '0.05em' }}>
              Ey<span style={{ color: '#8b5cf6' }}>Studio</span>
            </span>
            <span className="text-xs text-rb-light/30 hidden sm:block">/ Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            {user.image && (
              <Image src={user.image} alt="Avatar" width={32} height={32} className="rounded-full ring-2 ring-rb-purple/50" />
            )}
            <span className="text-sm text-rb-light/70 hidden sm:block">{user.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="rb-btn rb-btn-outline text-xs py-1.5 px-3"
              style={{ fontSize: '0.75rem' }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Profile Card */}
        <div className="rb-panel p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="relative">
            {user.image ? (
              <Image src={user.image} alt="Avatar" width={80} height={80}
                className="rounded-2xl ring-4 ring-rb-purple/40" />
            ) : (
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(109,40,217,0.2)', border: '2px solid rgba(109,40,217,0.4)' }}>
                <User size={32} style={{ color: '#c4b5fd' }} />
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: '#6d28d9', border: '2px solid #08010f', fontFamily: 'Fredoka One', color: 'white' }}>
              {xpLevel}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl text-white truncate" style={{ fontFamily: 'Fredoka One, sans-serif' }}>
                {user.name}
              </h1>
              <span className="rb-badge text-xs font-bold flex items-center gap-1"
                style={{ background: role.bg, color: role.color, border: `1px solid ${role.border}` }}>
                {ROLE_ICON_MAP[dbUser?.role ?? 'user']} {role.label}
              </span>
            </div>
            <p className="text-rb-light/40 text-sm mb-3">Mitglied seit {joinDate}</p>
            <div className="max-w-xs">
              <div className="flex justify-between text-xs text-rb-light/40 mb-1">
                <span>Level {xpLevel}</span>
                <span>{loginCount % 3}/3 XP</span>
              </div>
              <div className="xp-bar-track">
                <div className="xp-bar-fill" style={{ ['--xp-width' as any]: `${xpProgress}%` }} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 text-xs text-rb-light/40 sm:text-right shrink-0">
            <span>Letzter Login: <span className="text-rb-light/70">{lastSeen}</span></span>
            <span>Discord ID: <span className="text-rb-light/70 font-mono">{user.discordId ?? '—'}</span></span>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <div key={s.label} className="dash-stat-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
                <s.Icon size={24} style={{ color: s.color }} />
              </div>
              <div>
                <p className="stat-value" style={{ color: s.color }}>{s.value}{s.suffix}</p>
                <p className="text-xs text-rb-light/40 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Announcements */}
          <div className="lg:col-span-2 rb-panel p-5" style={{ transition: 'none' }}>
            <h2 className="text-lg text-white mb-4 flex items-center gap-2"
              style={{ fontFamily: 'Fredoka One, sans-serif' }}>
              <Megaphone size={18} style={{ color: '#8b5cf6' }} /> Studio-News
            </h2>
            {announcements.length === 0 ? (
              <p className="text-rb-light/30 text-sm py-6 text-center">Noch keine Neuigkeiten.</p>
            ) : (
              <div className="space-y-3">
                {announcements.map((a) => (
                  <div key={a._id} className="dash-activity-item">
                    <div className="w-2 h-2 rounded-full shrink-0 mt-0.5" style={{ background: a.tagColor }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <p className="text-sm text-white font-semibold truncate">{a.title}</p>
                        <span className="rb-badge text-xs shrink-0"
                          style={{ background: `${a.tagColor}15`, color: a.tagColor, border: `1px solid ${a.tagColor}30` }}>
                          {a.tag}
                        </span>
                      </div>
                      <p className="text-xs text-rb-light/50 mt-0.5 line-clamp-1">{a.body}</p>
                    </div>
                    <span className="text-xs text-rb-light/25 shrink-0 self-center">
                      {new Date(a.date).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick links + Account */}
          <div className="rb-panel p-5" style={{ transition: 'none' }}>
            <h2 className="text-lg text-white mb-4 flex items-center gap-2"
              style={{ fontFamily: 'Fredoka One, sans-serif' }}>
              <Link2 size={18} style={{ color: '#22d3ee' }} /> Quick Links
            </h2>
            <div className="space-y-2">
              {QUICK_LINKS.map((l) => (
                <Link key={l.label} href={l.href}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group"
                  style={{ background: 'rgba(109,40,217,0.06)', border: '1px solid rgba(109,40,217,0.15)' }}>
                  <l.Icon size={20} style={{ color: l.color }} />
                  <span className="text-sm text-rb-light/70 group-hover:text-white transition-colors">{l.label}</span>
                  <span className="ml-auto text-rb-light/20 group-hover:text-rb-light/60 transition-colors">
                    <ChevronRight size={14} />
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-rb-border/30">
              <p className="text-xs text-rb-light/30 mb-3">Dein Account</p>
              <div className="space-y-2 text-xs">
                {[
                  ['Name', user.name],
                  ['E-Mail', user.email ?? '—'],
                  ['Provider', 'Discord'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-rb-light/35">{k}</span>
                    <span className="text-rb-light/70 font-medium truncate max-w-[150px]">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Games overview */}
        <div className="rb-panel p-5" style={{ transition: 'none' }}>
          <h2 className="text-lg text-white mb-4 flex items-center gap-2"
            style={{ fontFamily: 'Fredoka One, sans-serif' }}>
            <Joystick size={18} style={{ color: '#f59e0b' }} /> Spiele-Übersicht
          </h2>
          {games.length === 0 ? (
            <p className="text-rb-light/30 text-sm py-6 text-center">Noch keine Spiele vorhanden.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {games.map((g) => (
                <div key={g._id} className="rounded-xl p-4"
                  style={{ background: 'rgba(109,40,217,0.06)', border: '1px solid rgba(109,40,217,0.18)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white font-semibold truncate max-w-[140px]"
                      style={{ fontFamily: 'Fredoka One' }}>{g.name}</span>
                    <span className="rb-badge text-xs flex items-center gap-1"
                      style={{ background: `${g.statusColor}15`, color: g.statusColor, border: `1px solid ${g.statusColor}30` }}>
                      {g.status === 'Live' && (
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block"
                          style={{ background: g.statusColor }} />
                      )}
                      {g.status}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-rb-light/40 mb-3">
                    <span className="inline-flex items-center gap-1"><Eye size={11} /> {g.visits}</span>
                    <span className="inline-flex items-center gap-1"><Heart size={11} /> {g.fav}</span>
                  </div>
                  <div className="xp-bar-track">
                    <div className="xp-bar-fill" style={{
                      ['--xp-width' as any]: `${g.progress}%`,
                      background: `linear-gradient(90deg, ${g.statusColor}80, ${g.statusColor})`,
                      boxShadow: `0 0 8px ${g.statusColor}50`,
                    }} />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-rb-light/25">Fertigstellung {g.progress}%</p>
                    {g.robloxUrl && (
                      <a href={g.robloxUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-rb-cyan/50 hover:text-rb-cyan transition-colors">
                        Spielen →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Open Positions */}
        {positions.length > 0 && (
          <div className="rb-panel p-5" style={{ transition: 'none' }}>
            <h2 className="text-lg text-white mb-4 flex items-center gap-2"
              style={{ fontFamily: 'Fredoka One, sans-serif' }}>
              <Briefcase size={18} style={{ color: '#8b5cf6' }} /> Offene Stellen
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {positions.map((p) => (
                <div key={p._id} className="rounded-xl p-4 flex flex-col"
                  style={{ background: 'rgba(109,40,217,0.06)', border: '1px solid rgba(109,40,217,0.18)' }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-sm text-white font-semibold leading-tight"
                      style={{ fontFamily: 'Fredoka One' }}>{p.title}</span>
                    {p.gameName && (
                      <span className="rb-badge shrink-0"
                        style={{ background: 'rgba(109,40,217,0.18)', color: '#c4b5fd', border: '1px solid rgba(109,40,217,0.3)', fontSize: '0.58rem' }}>
                        {p.gameName}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-rb-light/50 leading-relaxed line-clamp-2 flex-1 mb-3">
                    {p.description}
                  </p>
                  <Link href={`/apply/${p._id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold mt-auto"
                    style={{ color: '#8b5cf6', fontFamily: 'Fredoka One, sans-serif' }}>
                    Bewerben <ChevronRight size={13} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen hex-bg" style={{ background: '#08010f' }}>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-pulse">
        <div className="rb-panel p-6 h-32" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="dash-stat-card h-20" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rb-panel h-64" />
          <div className="rb-panel h-64" />
        </div>
        <div className="rb-panel h-48" />
      </div>
    </div>
  )
}
