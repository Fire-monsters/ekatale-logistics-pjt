// backend/all-services/notification-service/src/lib/sms.ts

/**
 * Sends a transactional SMS via Africa's Talking.
 * Used for: order status updates, OTP-adjacent alerts, USSD-less farmers.
 * Falls back to console logging if AT credentials aren't configured.
 */
export const sendSms = async (phone: string, message: string): Promise<void> => {
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
      console.log(` SMS sent to ${phone} via Africa's Talking:`, JSON.stringify(result))
    } catch (err) {
      console.error(` Failed to send SMS to ${phone}:`, err)
      console.log(`\n [FALLBACK] SMS for ${phone}: ${message}\n`)
    }
  } else {
    console.log(`\n SMS to ${phone}: ${message}\n`)
  }
}
