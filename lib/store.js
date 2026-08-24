import fs from 'fs'
import path from 'path'

/**
 * Penyimpanan dua lapis:
 * 1. Vercel KV (permanen) — aktif otomatis jika env KV_REST_API_URL & KV_REST_API_TOKEN ada
 *    (Vercel meng-inject env ini saat database KV di-link ke project)
 * 2. Fallback file — data/ jika writable (Termux/local), atau /tmp (serverless tanpa KV)
 */

let kvClient = null

async function getKV() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return null
  if (!kvClient) {
    try {
      const { createClient } = await import('@vercel/kv')
      kvClient = createClient({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
    } catch (e) {
      console.error('[store] Gagal init Vercel KV:', e.message)
      return null
    }
  }
  return kvClient
}

export function isKvEnabled() {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

function readJsonSafe(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

function fallbackFile(seedFile) {
  const localDir = path.join(process.cwd(), 'data')
  try {
    fs.accessSync(localDir, fs.constants.W_OK)
    return { file: seedFile, persistent: true }
  } catch {
    return { file: path.join('/tmp', path.basename(seedFile)), persistent: false }
  }
}

export async function isPersistent() {
  return isKvEnabled() || fallbackFile('').persistent
}

async function loadCollection(key, seedFile) {
  // 1) Coba Vercel KV
  const client = await getKV()
  if (client) {
    try {
      const val = await client.get(key)
      if (Array.isArray(val)) return val
      // Seed pertama kali dari file lokal supaya web tidak kosong
      const base = readJsonSafe(seedFile) || []
      await client.set(key, base)
      return base
    } catch (e) {
      console.error(`[store] KV read error (${key}):`, e.message)
    }
  }

  // 2) Fallback file
  const { file } = fallbackFile(seedFile)
  const current = readJsonSafe(file)
  if (Array.isArray(current)) return current
  return readJsonSafe(seedFile) || []
}

async function saveCollection(key, list, seedFile) {
  const client = await getKV()
  if (client) {
    await client.set(key, list)
    return true
  }
  const { file } = fallbackFile(seedFile)
  fs.writeFileSync(file, JSON.stringify(list, null, 2))
  return true
}

/* ---------- CHORDS ---------- */
const CHORD_KEY = 'gch:chords'
const CHORD_SEED = () => path.join(process.cwd(), 'data', 'chords.json')

export async function getAllChords() {
  return loadCollection(CHORD_KEY, CHORD_SEED())
}

export async function saveAllChords(list) {
  return saveCollection(CHORD_KEY, list, CHORD_SEED())
}

export async function getChordById(id) {
  const chords = await getAllChords()
  return chords.find(c => c.id === id) || null
}

/* ---------- SONGS ---------- */
const SONG_KEY = 'gch:songs'
const SONG_SEED = () => path.join(process.cwd(), 'data', 'songs.json')

export async function getAllSongs() {
  return loadCollection(SONG_KEY, SONG_SEED())
}

export async function saveAllSongs(list) {
  return saveCollection(SONG_KEY, list, SONG_SEED())
}

export async function getSongById(id) {
  const songs = await getAllSongs()
  return songs.find(s => s.id === id) || null
}

/* ---------- UTIL ---------- */
export function slugify(text) {
  return String(text).toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `item-${Date.now()}`
}