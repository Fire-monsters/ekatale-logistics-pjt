import { Request, Response } from 'express'
import { consumerAuthService } from './consumer.service'
import { ConsumerGoogleAuthSchema, ConsumerPhoneAuthSchema } from './auth.validation'

const handleError = (error: unknown, res: Response) => {
  const message = error instanceof Error ? error.message : 'INTERNAL_ERROR'
  const statusMap: Record<string, number> = {
    INVALID_SUPABASE_TOKEN: 401,
    USER_NOT_FOUND: 404,
    INVALID_OTP: 401,
  }

  res.status(statusMap[message] ?? 500).json({ success: false, error: message })
}

export class ConsumerController {
  async google(req: Request, res: Response) {
    try {
      const input = ConsumerGoogleAuthSchema.parse(req.body)
      const supabaseUser = await consumerAuthService.verifySupabaseToken(input.accessToken)

      const user = await consumerAuthService.findOrCreateConsumer({
        supabaseUserId: supabaseUser.id,
        email: supabaseUser.email,
        fullName: supabaseUser.user_metadata?.full_name ?? supabaseUser.user_metadata?.name,
      })

      const tokens = await consumerAuthService.issueAppTokens(user)

      res.status(200).json({
        success: true,
        data: {
          user: {
            userId: user.userId,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            phone: user.phone,
          },
          ...tokens,
        },
      })
    } catch (error) {
      handleError(error, res)
    }
  }

  async phone(req: Request, res: Response) {
    try {
      const input = ConsumerPhoneAuthSchema.parse(req.body)
      const phone = input.phone
      const otp = input.otp

      const supabaseUser = await consumerAuthService.signInWithPhoneOtp(phone, otp)

      if (!supabaseUser) {
        return res.status(200).json({
          success: true,
          data: { message: 'OTP sent to your phone. Enter the code to continue.' },
        })
      }

      const user = await consumerAuthService.findOrCreateConsumer({
        supabaseUserId: supabaseUser.id,
        phone,
        fullName: supabaseUser.user_metadata?.full_name ?? supabaseUser.user_metadata?.name ?? 'Consumer User',
      })

      const tokens = await consumerAuthService.issueAppTokens(user)

      res.status(200).json({
        success: true,
        data: {
          user: {
            userId: user.userId,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            phone: user.phone,
          },
          ...tokens,
        },
      })
    } catch (error) {
      handleError(error, res)
    }
  }
}

export const consumerController = new ConsumerController()
