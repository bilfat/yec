import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'default-secret-key-at-least-32-chars-long'
)

export async function hashPin(pin: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  const hashed = await bcrypt.hash(pin, salt)
  return `${pin}:${hashed}`
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  if (!hash) return false
  if (hash.includes(':')) {
    const [raw, hashPart] = hash.split(':')
    if (pin === raw) return true
    return bcrypt.compare(pin, hashPart)
  }
  return bcrypt.compare(pin, hash)
}

export function extractRawPin(hash?: string | null): string {
  if (!hash) return '------'
  if (hash.includes(':')) {
    return hash.split(':')[0]
  }
  return '------'
}

// Simple JWT session for participants since they don't have standard Supabase Auth accounts
export async function createParticipantSession(teamId: string, teamName: string) {
  const token = await new SignJWT({ teamId, teamName })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h') // 24 hours expiry
    .sign(JWT_SECRET)
  return token
}

export async function verifyParticipantSession(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    return null
  }
}

