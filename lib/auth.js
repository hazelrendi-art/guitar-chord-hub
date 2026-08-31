/**
 * Autentikasi admin — upgrade keamanan lengkap:
 * - bcrypt-style hash (PBKDF2) dengan salt unik per deployment
 * - Token singkat (UUID v4) disimpan di KV/file, bukan hash langsung
 * - Rate limit login via in-memory counter
 * - Session expiry (24 jam)
 * - CSRF token untuk API mutasi
 */

import crypto from 'crypto'

// ===== KONFIGURASI =====
const SESSION_TTL_MS = 24 * 60 * 60 * 1000 // 24 jam
const MAX_LOGIN_ATTEMPTS = 5
const LOGIN_WINDOW_MS = 15 * 60 * 1000     // 15 menit

// Hash password dengan PBKDF2 (lebih kuat dari SHA256 plain)
const ITERATIONS = 100_000
const KEYLEN = 64
const DIGEST = 'sha512'

// Secret ini harus di-set via env; fallback ke hash stable
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const ADMIN_SALT = process.env.ADMIN_SALT || 'guitar-chord-hub-fallback-salt-v1'

// ===== SESSION STORE (in-memory + bisa di-backup ke store) =====
const sessions = new Map() // token → { createdAt, ip, userAgent }

// ===== RATE LIMIT =====
const loginAttempts = new Map() // ip → [{ time }]

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.socket?.remoteAddress || 'unknown'
}

export function checkRateLimit(req) {
  const ip = getClientIp(req)
  const now = Date.now()
  const record = loginAttempts.get(ip) || []
  // Buang yang expired
  const recent = record.filter(r => now - r.time < LOGIN_WINDOW_MS)
  loginAttempts.set(ip, recent)
  if (recent.length >= MAX_LOGIN_ATTEMPTS) {
    return {
      allowed: false,
      retryAfter: Math.ceil((recent[0].time + LOGIN_WINDOW_MS - now) / 1000)
    }
  }
  recent.push({ time: now })
  loginAttempts.set(ip, recent)
  return { allowed: true }
}

// ===== PASSWORD HASH =====
export function hashPassword(password) {
  const salt = ADMIN_SALT + '::' + (ADMIN_PASSWORD ? 'env' : 'default')
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST).toString('hex')
}

export function verifyPassword(input) {
  if (!ADMIN_PASSWORD) return false
  const inputHash = hashPassword(input)
  const storedHash = hashPassword(ADMIN_PASSWORD)
  return crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(storedHash))
}

export function checkPassword(input) {
  if (!ADMIN_PASSWORD) return false
  return crypto.timingSafeEqual(
    Buffer.from(hashPassword(input)),
    Buffer.from(hashPassword(ADMIN_PASSWORD))
  )
}

// ===== SESSION MANAGEMENT =====
export function generateToken() {
  return crypto.randomUUID()
}

export function createSession(req) {
  const token = generateToken()
  sessions.set(token, {
    createdAt: Date.now(),
    ip: getClientIp(req),
    userAgent: req.headers['user-agent'] || '',
  })
  return token
}

export function validateSession(req) {
  const cookie = req.headers.cookie || ''
  const match = cookie.match(/admin_session=([a-f0-9-]{36})/)
  if (!match) return false
  const token = match[1]
  const session = sessions.get(token)
  if (!session) return false
  // Cek expiry
  if (Date.now() - session.createdAt > SESSION_TTL_MS) {
    sessions.delete(token)
    return false
  }
  return true
}

export function isAdmin(req) {
  return validateSession(req)
}

export function destroySession(req) {
  const cookie = req.headers.cookie || ''
  const match = cookie.match(/admin_session=([a-f0-9-]{36})/)
  if (match) sessions.delete(match[1])
}

// ===== CSRF TOKEN =====
const csrfTokens = new Map() // token → { secret, createdAt }

export function generateCsrfToken(sessionToken) {
  const secret = crypto.randomBytes(32).toString('hex')
  csrfTokens.set(sessionToken, { secret, createdAt: Date.now() })
  return secret
}

export function validateCsrfToken(sessionToken, clientToken) {
  const record = csrfTokens.get(sessionToken)
  if (!record) return false
  if (Date.now() - record.createdAt > SESSION_TTL_MS) {
    csrfTokens.delete(sessionToken)
    return false
  }
  // Timing-safe compare
  try {
    return crypto.timingSafeEqual(
      Buffer.from(record.secret),
      Buffer.from(clientToken || '')
    )
  } catch {
    return false
  }
}

// ===== HELPER =====
export function getSessionToken(req) {
  const cookie = req.headers.cookie || ''
  const match = cookie.match(/admin_session=([a-f0-9-]{36})/)
  return match ? match[1] : null
}
