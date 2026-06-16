// backend/all-services/listing-service/src/lib/storage.ts
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads')
const PUBLIC_BASE_URL = process.env.UPLOAD_PUBLIC_URL || 'http://localhost:3002/uploads'

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

export interface StoredFile {
  storageKey: string
  url:        string
  sizeKb:     number
}

/**
 * Saves a photo buffer to local disk and returns its public URL.
 *
 * SWAP POINT: replace this implementation with an S3/R2 putObject call when
 * moving to production. The function signature (buffer in, StoredFile out)
 * stays the same, so callers (listing.service.ts) don't change.
 */
export async function saveListingPhoto(
  listingId: string,
  buffer: Buffer,
  originalName: string,
): Promise<StoredFile> {
  const ext = path.extname(originalName || '.jpg') || '.jpg'
  const key = `listings/${listingId}/${crypto.randomUUID()}${ext}`
  const fullPath = path.join(UPLOAD_DIR, key)

  await fs.promises.mkdir(path.dirname(fullPath), { recursive: true })
  await fs.promises.writeFile(fullPath, buffer)

  return {
    storageKey: key,
    url:        `${PUBLIC_BASE_URL}/${key}`,
    sizeKb:     Math.round(buffer.length / 1024),
  }
}

export async function deleteListingPhoto(storageKey: string): Promise<void> {
  const fullPath = path.join(UPLOAD_DIR, storageKey)
  await fs.promises.unlink(fullPath).catch(() => {
    // Already gone — fine
  })
}