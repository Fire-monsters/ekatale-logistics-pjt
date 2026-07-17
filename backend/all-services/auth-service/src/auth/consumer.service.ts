import { prisma } from '../lib/prisma'
import { generateAccessToken, generateRefreshToken } from '../lib/jwt'
import { supabaseAdmin } from '../lib/supabase'

export class ConsumerAuthService {
  async verifySupabaseToken(accessToken: string) {
    const { data, error } = await supabaseAdmin.auth.getUser(accessToken)

    if (error || !data?.user) {
      throw new Error('INVALID_SUPABASE_TOKEN')
    }

    return data.user
  }

  async signInWithPhoneOtp(phone: string, otp?: string) {
    if (!otp) {
      const { error } = await supabaseAdmin.auth.signInWithOtp({ phone })
      if (error) {
        throw new Error(error.message)
      }
      return null
    }

    const { data, error } = await supabaseAdmin.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms',
    })

    if (error || !data?.user) {
      throw new Error('INVALID_OTP')
    }

    return data.user
  }

  async findOrCreateConsumer(input: { supabaseUserId: string; email?: string | null; fullName?: string | null; phone?: string | null }) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { supabaseUserId: input.supabaseUserId },
          ...(input.email ? [{ email: input.email }] : []),
        ],
      },
    })

    if (existing) {
      const updateData: Record<string, unknown> = {}
      if (input.email && !existing.email) updateData.email = input.email
      if (input.fullName && !existing.fullName) updateData.fullName = input.fullName
      if (input.phone && !existing.phone) updateData.phone = input.phone
      if (!existing.supabaseUserId) updateData.supabaseUserId = input.supabaseUserId
      if (Object.keys(updateData).length > 0) {
        await prisma.user.update({
          where: { userId: existing.userId },
          data: updateData,
        })
      }
      return existing
    }

    return prisma.user.create({
      data: {
        role: 'consumer',
        fullName: input.fullName ?? input.email ?? 'Consumer User',
        email: input.email ?? null,
        supabaseUserId: input.supabaseUserId,
        phone: input.phone ?? null,
        kycStatus: 'pending',
      },
    })
  }

  async issueAppTokens(user: { userId: string; role: string; phone: string | null }) {
    const payload = {
      userId: user.userId,
      role: user.role,
      phone: user.phone ?? '',
    }

    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    }
  }
}

export const consumerAuthService = new ConsumerAuthService()
