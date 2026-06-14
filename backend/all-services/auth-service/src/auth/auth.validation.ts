import { z } from 'zod'

// Uganda phone: +256 followed by 9 digits
const ugandaPhone = z
  .string()
  .regex(/^\+256[0-9]{9}$/, 'Enter a valid Uganda phone number (+256XXXXXXXXX)')

export const RequestOtpSchema = z.object({
  phone:   ugandaPhone,
  purpose: z.enum(['register', 'login']),
  role:    z.enum([
    'farmer', 'village_agent', 'warehouse',
    'sme', 'grocery', 'consumer', 'transport'
  ]).optional(),
})

export const VerifyOtpSchema = z.object({
  phone:   ugandaPhone,
  code:    z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/),
  purpose: z.enum(['register', 'login']),
})

export const CompleteRegistrationSchema = z.object({
  phone:        ugandaPhone,
  fullName:     z.string().min(2).max(255),
  password:     z.string().min(6, 'Password must be at least 6 characters').max(72),
  role:         z.enum([
    'farmer', 'village_agent', 'warehouse',
    'sme', 'grocery', 'consumer', 'transport'
  ]),
  languagePref: z.enum(['en', 'lg', 'sw', 'ac', 'rn', 'fr']).default('en'),

  // Farmer-specific — required when role === 'farmer'
  district:       z.string().min(2).max(100).optional(),
  village:        z.string().max(100).optional(),
  nin:            z.string().max(20).optional(),
  gpsLat:         z.number().min(-90).max(90).optional(),
  gpsLng:         z.number().min(-180).max(180).optional(),
  farmSizeAcres:  z.number().positive().optional(),
  paymentProvider: z.enum(['mtn', 'airtel']).optional(),
  paymentNumber:   z.string().max(20).optional(),
  cropsGrown:     z.array(z.string()).optional(),

  // Village agent specific
  territoryDistrict: z.string().max(100).optional(),
  territoryVillages: z.array(z.string()).optional(),
}).refine(data => {
  // Farmer must provide district and payment details
  if (data.role === 'farmer') {
    return data.district && data.paymentProvider && data.paymentNumber
  }
  // Village agent must provide territory
  if (data.role === 'village_agent') {
    return data.territoryDistrict
  }
  return true
}, {
  message: 'Missing required fields for this role',
})

export const LoginWithPasswordSchema = z.object({
  phone:    ugandaPhone,
  password: z.string().min(1, 'Enter your password'),
})

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
})

export type RequestOtpInput           = z.infer<typeof RequestOtpSchema>
export type VerifyOtpInput            = z.infer<typeof VerifyOtpSchema>
export type CompleteRegistrationInput = z.infer<typeof CompleteRegistrationSchema>
export type LoginWithPasswordInput    = z.infer<typeof LoginWithPasswordSchema>