/**
 * Menghitung bentuk jari (fingering) untuk sebuah chord menggunakan
 * sistem barre E-shape / A-shape — memilih posisi dengan fret terendah.
 */

const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

import { parseRoot } from './transpose.js'

// Offset relatif dari fret barre. Urutan senar 6 → 1. null = mute (x), 0 = open.
const SHAPES = {
  e: { // akar di senar 6 (bentuk E)
    major:  [0, 2, 2, 1, 0, 0],   // contoh F: 133211
    minor:  [0, 2, 2, 0, 0, 0],   // contoh Fm: 133111
    dom7:   [0, 2, 0, 1, 0, 0],   // contoh F7: 131211
    min7:   [0, 2, 0, 0, 0, 0],   // contoh Fm7: 131111
  },
  a: { // akar di senar 5 (bentuk A)
    major:  [null, 0, 2, 2, 2, 0], // contoh Bb: x13331
    minor:  [null, 0, 2, 2, 1, 0], // contoh Bm: x24432
    dom7:   [null, 0, 2, 0, 2, 0],
    min7:   [null, 0, 2, 0, 1, 0],
  },
}

const QUALITY_MAP = [
  ['m7', 'min7'], ['min7', 'min7'], ['min', 'minor'], ['minor', 'minor'],
  ['maj7', 'major'], ['ma7', 'major'],
  ['m', 'minor'],
  ['7', 'dom7'],
]

function getQuality(name, rootLen) {
  const suf = String(name).trim().slice(rootLen).replace(/[^a-zA-Z0-9#]/g, '')
  for (const [key, val] of QUALITY_MAP) {
    if (suf.startsWith(key)) return val
  }
  return 'major'
}

export function computeFingering(chordName) {
  const name = String(chordName).trim()
  const root = parseRoot(name)
  const rIdx = CHROMATIC.indexOf(root)
  if (rIdx === -1) return null

  const quality = getQuality(name, root.length)

  // fret barre: akar di senar 6 (open E, index 4) atau senar 5 (open A, index 9)
  const f6 = ((rIdx - 4) % 12 + 12) % 12
  const f5 = ((rIdx - 9) % 12 + 12) % 12

  const candidates = []
  const shapeE = SHAPES.e[quality]
  const shapeA = SHAPES.a[quality]
  if (shapeE && f6 <= 9) {
    const base = f6
    candidates.push({ offs: shapeE, base, max: Math.max(...shapeE.map(v => v ?? 0)) + base })
  }
  if (shapeA && f5 <= 9) {
    const base = f5
    candidates.push({ offs: shapeA, base, max: Math.max(...shapeA.map(v => v ?? 0)) + base })
  }
  if (!candidates.length) return null

  candidates.sort((a, b) => a.max - b.max)
  const best = candidates[0]

  return best.offs.map(v => {
    if (v === null) return 'x'
    const fret = best.base + v
    return fret === 0 ? '0' : String(fret)
  }).join('')
}