import { z } from 'zod';

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

export const phoneSchema = z.object({
  phone: z
    .string()
    .min(9, 'Enter a valid phone number')
    .max(12, 'Phone number too long')
    .regex(/^\d+$/, 'Numbers only'),
  countryCode: z.string().default('256'),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'Enter the 6-digit code')
    .regex(/^\d{6}$/, 'Numbers only'),
});

// ─────────────────────────────────────────────
// FARMER REGISTRATION
// ─────────────────────────────────────────────

export const farmerRegisterSchema = z.object({
  fullName: z.string().min(3, 'Enter your full name').max(80),
  nin: z
    .string()
    .min(14, 'Enter a valid National ID')
    .max(20),
  district: z.string().min(1, 'Select your district'),
  village: z.string().optional(),
  farmSizeAcres: z
    .number()
    .min(0.1, 'Minimum 0.1 acres')
    .max(10000),
  crops: z.array(z.string()).min(1, 'Select at least one crop'),
  paymentProvider: z.enum(['MTN_MOMO', 'AIRTEL_MONEY']),
  paymentNumber: z
    .string()
    .min(9, 'Enter your Mobile Money number')
    .max(12)
    .regex(/^\d+$/, 'Numbers only'),
});

export type FarmerRegisterFormData = z.infer<typeof farmerRegisterSchema>;

// ─────────────────────────────────────────────
// PRODUCE LISTING
// ─────────────────────────────────────────────

export const listingStep1Schema = z.object({
  commodityId: z.string().min(1, 'Select a crop type'),
  quantity: z
    .number()
    .min(1, 'Minimum 1')
    .max(100000),
  unit: z.enum(['kg', 'tonne', 'sack', 'crate', 'bunch']),
  grade: z.enum(['A', 'B', 'C']),
  availabilityDate: z.string().min(1, 'Select availability date'),
});

export const listingStep2Schema = z.object({
  photos: z.array(z.string()).min(1, 'Add at least 1 photo'),
  qualityDescription: z.string().max(200).optional(),
});

export const listingStep3Schema = z.object({
  askingPricePerUnit: z.number().positive().optional(),
});

export type ListingStep1Data = z.infer<typeof listingStep1Schema>;
export type ListingStep2Data = z.infer<typeof listingStep2Schema>;
export type ListingStep3Data = z.infer<typeof listingStep3Schema>;

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/** Format Zod errors as a flat key→message record */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  return Object.fromEntries(
    error.issues.map((e) => [e.path.join('.'), e.message]),
  );
}
