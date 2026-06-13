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

// Sends OTP via Africa's Talking if credentials are configured,
// otherwise logs to console (dev fallback).
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

  const hasAtCredentials = !!process.env.AT_API_KEY && !!process.env.AT_USERNAME

  if (hasAtCredentials) {
    try {
      const AfricasTalking = require('africastalking')
      const at = AfricasTalking({
        apiKey:   process.env.AT_API_KEY!,
        username: process.env.AT_USERNAME!,
      })
      const result = await at.SMS.send({
        to: [phone],
        message,
        from: process.env.AT_SENDER_ID || undefined,
      })
      console.log(`\n📱 OTP SMS sent to ${phone} via Africa's Talking:`, JSON.stringify(result))
    } catch (err) {
      console.error(`\n❌ Failed to send OTP SMS to ${phone}:`, err)
      // Always log the code as a fallback so dev/testing isn't blocked
      console.log(`\n📱 [FALLBACK] OTP for ${phone}: ${code}\n`)
    }
  } else {
    // No AT credentials configured — print to console
    console.log(`\n📱 OTP SMS to ${phone}: ${message}\n`)
  }
}