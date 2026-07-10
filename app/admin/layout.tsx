import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { hasPermission, type Role } from '@/lib/roles'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role as Role | undefined

  if (!session || !role || !hasPermission(role, 'viewAdminPanel')) {
    redirect('/')
  }

  return <>{children}</>
}
