import fs from 'fs'
import path from 'path'

/**
 * Menentukan lokasi penyimpanan chord:
 * - Jika folder data/ bisa ditulis (Termux/local) → pakai data/chords.json (permanen)
 * - Jika read-only (serverless seperti Vercel) → fallback /tmp (sementara)
 */
function resolveDb() {
  const local = path.join(process.cwd(), 'data', 'chords.json')
  try {
    fs.accessSync(path.dirname(local), fs.constants.W_OK)
    return { file: local, persistent: true }
  } catch {
    return { file: path.join('/tmp', 'chords-db.json'), persistent: false }
  }
}

export function isPersistent() {
  return resolveDb().persistent
}

function baseChords() {
  const base = path.join(process.cwd(), 'data', 'chords.json')
  return JSON.parse(fs.readFileSync(base, 'utf8'))
}

export function readChords() {
  const { file } = resolveDb()
  try {
    const raw = fs.readFileSync(file, 'utf8')
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
  } catch { /* fall through ke data dasar */ }
  return baseChords()
}

export function writeChords(list) {
  const { file } = resolveDb()
  fs.writeFileSync(file, JSON.stringify(list, null, 2))
}

export function slugify(text) {
  return String(text).toLowerCase().trim()
    .replace(/[^a-z0-9#+]+/g, '-')
    .replace(/^-+|-+$/g, '') || `chord-${Date.now()}`
}