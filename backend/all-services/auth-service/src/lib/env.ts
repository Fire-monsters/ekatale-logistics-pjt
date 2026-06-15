import fs from 'fs'
import path from 'path'

const parseEnvLine = (line: string): [string, string] | null => {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) return null

  const equalsAt = trimmed.indexOf('=')
  if (equalsAt === -1) return null

  const key = trimmed.slice(0, equalsAt).trim()
  let value = trimmed.slice(equalsAt + 1).trim()

  if (!key) return null

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1)
  }

  return [key, value]
}

const candidateEnvFiles = [
  process.env.AUTH_SERVICE_ENV_FILE,
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend/all-services/auth-service/.env'),
].filter(Boolean) as string[]

const envFile = candidateEnvFiles.find((file) => fs.existsSync(file))

if (envFile) {
  const contents = fs.readFileSync(envFile, 'utf8')

  for (const line of contents.split(/\r?\n/)) {
    const entry = parseEnvLine(line)
    if (!entry) continue

    const [key, value] = entry
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}
