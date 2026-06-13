import { prisma }           from '../lib/prisma'
import { generateOtp, otpExpiresAt, sendOtpSms } from '../lib/otp'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../lib/jwt'
import crypto               from 'crypto'
import type {
  RequestOtpInput,
  VerifyOtpInput,
  CompleteRegistrationInput,
} from './auth.validation'

export class AuthService {

  // ── Step 1: Send OTP ──────────────────────────────────────
  async requestOtp(input: RequestOtpInput) {
    const { phone, purpose } = input

    console.log('📨 REQUEST OTP INPUT:', JSON.stringify(input))

    // If registering, check phone is not already taken
    if (purpose === 'register') {
      const existing = await prisma.user.findUnique({ where: { phone } })
      if (existing) {
        throw new Error('PHONE_ALREADY_REGISTERED')
      }
    }

    // If logging in, check user exists
    if (purpose === 'login') {
      const existing = await prisma.user.findUnique({ where: { phone } })
      if (!existing) throw new Error('USER_NOT_FOUND')
      if (!existing.isActive) throw new Error('ACCOUNT_SUSPENDED')
    }

    // Invalidate any previous unused OTPs for this phone + purpose
    await prisma.otp.updateMany({
      where: { phone, purpose, isUsed: false },
      data:  { isUsed: true },
    })

    // Generate and save new OTP
    const code = generateOtp()
    const created = await prisma.otp.create({
      data: {
        phone,
        code,
        purpose,
        expiresAt: otpExpiresAt(),
      },
    })

    console.log('📨 OTP CREATED:', JSON.stringify(created))

    // Send via SMS
    await sendOtpSms(phone, code, purpose)

    return { message: 'OTP sent successfully' }
  }

  // ── Step 2: Verify OTP ────────────────────────────────────
  async verifyOtp(input: VerifyOtpInput) {
    const { phone, code, purpose } = input

    console.log('🔍 VERIFY OTP INPUT:', JSON.stringify({ phone, code, purpose, now: new Date().toISOString() }))

    // Show recent OTPs for this phone, regardless of filters,
    // so we can compare against what's being searched for
    const candidates = await prisma.otp.findMany({
      where: { phone },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })
    console.log('🔍 CANDIDATES FOR PHONE:', JSON.stringify(candidates, null, 2))

    // Find the latest unused, unexpired OTP
    const otp = await prisma.otp.findFirst({
      where: {
        phone,
        code,
        purpose,
        isUsed:    false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    console.log('🔍 MATCHED OTP:', JSON.stringify(otp))

    if (!otp) throw new Error('INVALID_OR_EXPIRED_OTP')

    // Mark OTP as used
    await prisma.otp.update({
      where: { otpId: otp.otpId },
      data:  { isUsed: true },
    })

    return { verified: true, phone }
  }

  // ── Step 3: Complete Registration ─────────────────────────
  async register(input: CompleteRegistrationInput) {
    const { phone, fullName, role, languagePref } = input

    // Confirm phone was OTP-verified (must have a used register OTP)
    const verifiedOtp = await prisma.otp.findFirst({
      where: {
        phone,
        purpose: 'register',
        isUsed:  true,
        expiresAt: { gt: new Date(Date.now() - 30 * 60 * 1000) }, // within last 30 min
      },
    })
    if (!verifiedOtp) throw new Error('PHONE_NOT_VERIFIED')

    // Check not already registered
    const existing = await prisma.user.findUnique({ where: { phone } })
    if (existing) throw new Error('PHONE_ALREADY_REGISTERED')

    // Create user + role-specific profile in a transaction
    const user = await prisma.$transaction(async (tx: any) => {
      const newUser = await tx.user.create({
        data: {
          phone,
          fullName,
          role:         role as any,
          languagePref: languagePref as any,
          kycStatus:    'pending',
        },
      })

      // Create role-specific profile
      if (role === 'farmer') {
        await tx.farmerProfile.create({
          data: {
            farmerId:        newUser.userId,
            district:        input.district!,
            village:         input.village,
            gpsLat:          input.gpsLat,
            gpsLng:          input.gpsLng,
            farmSizeAcres:   input.farmSizeAcres,
            paymentProvider: input.paymentProvider,
            paymentNumber:   input.paymentNumber,
            cropsGrown:      input.cropsGrown ?? [],
          },
        })
      }

      if (role === 'village_agent') {
        await tx.villageAgentProfile.create({
          data: {
            agentId:           newUser.userId,
            territoryDistrict: input.territoryDistrict!,
            territoryVillages: input.territoryVillages ?? [],
          },
        })
      }

      return newUser
    })

    // Issue tokens
    const tokens = await this.issueTokens(user.userId, user.role, user.phone)

    return {
      user: {
        userId:   user.userId,
        phone:    user.phone,
        fullName: user.fullName,
        role:     user.role,
      },
      ...tokens,
    }
  }

  // ── Login (after OTP verified) ────────────────────────────
  async login(phone: string, deviceInfo?: object) {
    const user = await prisma.user.findUnique({ where: { phone } })
    if (!user) throw new Error('USER_NOT_FOUND')
    if (!user.isActive) throw new Error('ACCOUNT_SUSPENDED')

    // Update last login
    await prisma.user.update({
      where: { userId: user.userId },
      data:  { lastLoginAt: new Date() },
    })

    const tokens = await this.issueTokens(
      user.userId, user.role, user.phone, deviceInfo
    )

    return {
      user: {
        userId:       user.userId,
        phone:        user.phone,
        fullName:     user.fullName,
        role:         user.role,
        languagePref: user.languagePref,
        kycStatus:    user.kycStatus,
      },
      ...tokens,
    }
  }

  // ── Refresh access token ──────────────────────────────────
  async refreshToken(refreshToken: string) {
    let payload: any
    try {
      payload = verifyRefreshToken(refreshToken)
    } catch {
      throw new Error('INVALID_REFRESH_TOKEN')
    }

    // Verify token exists in DB and is not revoked
    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex')

    const stored = await prisma.refreshToken.findFirst({
      where: { userId: payload.userId, tokenHash, isRevoked: false },
    })
    if (!stored) throw new Error('REFRESH_TOKEN_REVOKED')
    if (stored.expiresAt < new Date()) throw new Error('REFRESH_TOKEN_EXPIRED')

    const user = await prisma.user.findUnique({
      where: { userId: payload.userId }
    })
    if (!user || !user.isActive) throw new Error('ACCOUNT_SUSPENDED')

    const accessToken = generateAccessToken({
      userId: user.userId,
      role:   user.role,
      phone:  user.phone,
    })

    return { accessToken }
  }

  // ── Logout ────────────────────────────────────────────────
  async logout(userId: string, refreshToken: string) {
    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex')

    await prisma.refreshToken.updateMany({
      where: { userId, tokenHash },
      data:  { isRevoked: true },
    })

    return { message: 'Logged out successfully' }
  }

  // ── Internal: issue access + refresh tokens ───────────────
  private async issueTokens(
    userId: string,
    role: string,
    phone: string,
    deviceInfo?: object
  ) {
    const payload = { userId, role, phone }

    const accessToken  = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)

    // Hash before storing — never store raw tokens
    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex')

    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        deviceInfo: deviceInfo ?? {},
        expiresAt:  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    return { accessToken, refreshToken }
  }
}

export const authService = new AuthService()