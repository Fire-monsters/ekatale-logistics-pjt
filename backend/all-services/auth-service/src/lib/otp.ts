import crypto from 'crypto'

// Generate a cryptographically random 6-digit OTP
export const generateOtp = (): string => {
  const code = crypto.randomInt(100000, 999999)
  return code.toString()
}

// OTP expiry — 10 minutes from now
export const otpExpiresAt = (): Date => {
  return new Date(Date.now() + 10 * 60 * 1000)
}

// In production this calls Africa's Talking SMS API
// In development it logs to console
export const sendOtpSms = async (
  phone: string,
  code: string,
  purpose: string
): Promise<void> => {
  const messages: Record<string, string> = {
    register: `Your E-Katale registration code is ${code}. Valid for 10 minutes. Do not share.`,
    login:    `Your E-Katale login code is ${code}. Valid for 10 minutes.`,
    payment:  `Your E-Katale payment authorisation code is ${code}. Valid for 10 minutes.`,
    delivery: `Your E-Katale delivery confirmation code is ${code}.`,
  }

  const message = messages[purpose] || `Your E-Katale code is ${code}.`

  if (process.env.NODE_ENV === 'production') {
    // TODO: Africa's Talking integration
    const AfricasTalking = require('africastalking')
    const at = AfricasTalking({
      apiKey:   process.env.AT_API_KEY!,
      username: process.env.AT_USERNAME!,
    })
    await at.SMS.send({ to: [phone], message, from: 'E-Katale' })
  } else {
    // Development: print to console
    console.log(`\n📱 OTP SMS to ${phone}: ${message}\n`)
  }
}