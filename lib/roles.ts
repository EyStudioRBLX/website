export type Role = 'user' | 'helper' | 'skripter' | 'mapper' | 'owner' | 'founder'

export const FOUNDER_DISCORD_ID = '1408739495662190694'

export interface RolePermissions {
  manageUsers: boolean
  manageRoles: boolean
  manageGames: boolean
  manageScripts: boolean
  manageAnnouncements: boolean
  viewAdminPanel: boolean
  viewDashboard: boolean
}

const ALL_PERMISSIONS: RolePermissions = {
  manageUsers: true,
  manageRoles: true,
  manageGames: true,
  manageScripts: true,
  manageAnnouncements: true,
  viewAdminPanel: true,
  viewDashboard: true,
}

export const ROLES: Record<Role, { label: string; color: string; bg: string; border: string; icon: string; permissions: RolePermissions }> = {
  founder: {
    label: 'Founder',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.15)',
    border: 'rgba(245,158,11,0.4)',
    icon: '',
    permissions: ALL_PERMISSIONS,
  },
  owner: {
    label: 'Owner',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.15)',
    border: 'rgba(239,68,68,0.4)',
    icon: '',
    permissions: {
      manageUsers: true,
      manageRoles: false,
      manageGames: true,
      manageScripts: true,
      manageAnnouncements: true,
      viewAdminPanel: true,
      viewDashboard: true,
    },
  },
  mapper: {
    label: 'Mapper',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.15)',
    border: 'rgba(34,197,94,0.4)',
    icon: '',
    permissions: {
      manageUsers: false,
      manageRoles: false,
      manageGames: true,
      manageScripts: false,
      manageAnnouncements: false,
      viewAdminPanel: false,
      viewDashboard: true,
    },
  },
  skripter: {
    label: 'Skripter',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.15)',
    border: 'rgba(139,92,246,0.4)',
    icon: '',
    permissions: {
      manageUsers: false,
      manageRoles: false,
      manageGames: false,
      manageScripts: true,
      manageAnnouncements: false,
      viewAdminPanel: false,
      viewDashboard: true,
    },
  },
  helper: {
    label: 'Helper',
    color: '#22d3ee',
    bg: 'rgba(34,211,238,0.15)',
    border: 'rgba(34,211,238,0.4)',
    icon: '',
    permissions: {
      manageUsers: false,
      manageRoles: false,
      manageGames: false,
      manageScripts: false,
      manageAnnouncements: false,
      viewAdminPanel: false,
      viewDashboard: true,
    },
  },
  user: {
    label: 'User',
    color: '#94a3b8',
    bg: 'rgba(148,163,184,0.1)',
    border: 'rgba(148,163,184,0.3)',
    icon: '',
    permissions: {
      manageUsers: false,
      manageRoles: false,
      manageGames: false,
      manageScripts: false,
      manageAnnouncements: false,
      viewAdminPanel: false,
      viewDashboard: true,
    },
  },
}

export function hasPermission(role: Role, permission: keyof RolePermissions): boolean {
  return ROLES[role]?.permissions[permission] ?? false
}

export function getRoleMeta(role: string) {
  return ROLES[role as Role] ?? ROLES.user
}

export const ROLE_HIERARCHY: Role[] = ['user', 'helper', 'skripter', 'mapper', 'owner', 'founder']

export function getRoleRank(role: Role): number {
  return ROLE_HIERARCHY.indexOf(role)
}

export function canManage(actorRole: Role, targetRole: Role): boolean {
  if (actorRole === 'founder') return true
  return getRoleRank(actorRole) > getRoleRank(targetRole)
}
