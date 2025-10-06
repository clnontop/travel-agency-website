import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            customerProfile: true,
            driverProfile: true,
            adminProfile: true
          }
        })

        if (!user || !user.password) {
          throw new Error('User not found')
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error('Invalid password')
        }

        if (!user.isActive) {
          throw new Error('Account is deactivated')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        // Update user info from Google
        await prisma.user.update({
          where: { email: user.email! },
          data: {
            emailVerified: new Date(),
            image: user.image,
            name: user.name,
          }
        }).catch(() => {
          // User doesn't exist yet, will be created by adapter
        })
      }
      return true
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.phone = token.phone as string
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            role: true,
            phone: true,
            emailVerified: true,
            phoneVerified: true
          }
        })
        
        if (dbUser) {
          token.role = dbUser.role
          token.phone = dbUser.phone || undefined
          token.emailVerified = dbUser.emailVerified
          token.phoneVerified = Boolean(dbUser.phoneVerified)
        }
      }
      return token
    }
  },
  events: {
    async createUser({ user }) {
      // Create customer profile by default for new users
      await prisma.customer.create({
        data: {
          userId: user.id,
          walletBalance: 0,
        }
      })
    }
  },
  debug: process.env.NODE_ENV === 'development',
}
