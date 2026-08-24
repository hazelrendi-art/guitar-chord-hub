import crypto from 'crypto'

const PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

export function generateToken() {
  return crypto.createHash('sha256').update(PASSWORD + '::guitar-chord-hub').digest('hex')
}

export function checkPassword(input) {
  return String(input || '') === PASSWORD
}

export function isAdmin(req) {
  const cookie = req.headers.cookie || ''
  const match = cookie.match(/admin_token=([a-f0-9]{64})/)
  return !!match && match[1] === generateToken()
}