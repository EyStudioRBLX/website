import type { NextAuthOptions } from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { FOUNDER_DISCORD_ID } from '@/lib/roles'

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: 'identify email' } },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'discord' && profile) {
        try {
          await connectDB()
          const discordId = account.providerAccountId
          const isFounder = discordId === FOUNDER_DISCORD_ID
          const existing = await User.findOne({ discordId })
          if (existing) {
            existing.lastSeen = new Date()
            existing.name = user.name ?? existing.name
            existing.image = user.image ?? existing.image
            existing.stats.loginCount += 1
            if (isFounder && existing.role !== 'founder') existing.role = 'founder'
            await existing.save()
          } else {
            await User.create({
              discordId,
              name: user.name ?? 'Unknown',
              email: user.email ?? null,
              image: user.image ?? null,
              role: isFounder ? 'founder' : 'user',
            })
          }
        } catch (err) {
          console.error('[Auth] MongoDB error:', err)
        }
      }
      return true
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub
        ;(session.user as any).discordId = token.discordId as string
        ;(session.user as any).role = token.role as string
      }
      return session
    },

    async jwt({ token, account, profile }) {
      if (account?.provider === 'discord') {
        token.discordId = account.providerAccountId
        try {
          await connectDB()
          const dbUser = await User.findOne({ discordId: account.providerAccountId }).lean()
          if (dbUser) token.role = (dbUser as any).role
        } catch {}
      }
      return token
    },
  },
  pages: { signIn: '/', error: '/' },
  secret: process.env.NEXTAUTH_SECRET,
}
