// auth-service/src/lib/storage.ts
import fs     from 'fs'
import path   from 'path'
import crypto from 'crypto'
import type { Express } from 'express'

const UPLOAD_DIR =
  process.env.PROFILE_UPLOAD_DIR ??
  path.join(process.cwd(), 'uploads', 'profiles')

const PUBLIC_URL =
  process.env.PROFILE_PHOTOS_PUBLIC_URL ??
  'http://localhost:3001/uploads/profiles'

function ensureUserDir(userId: string): string {
  const dir = path.join(UPLOAD_DIR, userId)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

/**
 * Writes an uploaded profile photo buffer to disk under
 * `{PROFILE_UPLOAD_DIR}/{userId}/` and returns the public URL.
 */
export async function saveProfilePhoto(
  userId: string,
  file: Express.Multer.File,
): Promise<string> {
  const dir  = ensureUserDir(userId)
  const ext  = path.extname(file.originalname).toLowerCase() || '.jpg'
  const name = `profile_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`
  const dest = path.join(dir, name)

  fs.writeFileSync(dest, file.buffer)

  return `${PUBLIC_URL}/${userId}/${name}`
}