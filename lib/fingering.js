/**
 * Fingering (posisi jari) untuk chord — upgrade signifikan.
 *
 * Mendukung kualitas:
 *   - major, minor, dom7, min7, maj7
 *   - dim, dim7, m7b5 (half-diminished), aug
 *   - sus2, sus4
 *   - 6, m6, 7sus4, add9
 *
 * Sistem: E-shape (barre fret 6) & A-shape (barre fret 5).
 * Memilih posisi dengan fret maksimal terkecil (nyaman dimainkan).
 * Mendukung 2-fret window: bila root > 3, geser startFret.
 */

import { parseRoot } from './transpose.js'

const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// Catatan: 6 senar diurutkan dari senar 6 (low E) → senar 1 (high E).
// null = mute (x), 0 = open, >0 = fret.
const SHAPES = {
  e: {
    major:  [0, 2, 2, 1, 0, 0],
    minor:  [0, 2, 2, 0, 0, 0],
    dom7:   [0, 2, 0, 1, 0, 0],
    maj7:   [0, 2, 1, 1, 0, 0],
    min7:   [0, 2, 0, 0, 0, 0],
    m7b5:   [0, 2, 0, 0, 0, 1],  // Bm7b5 style
    dim:    [0, 2, 0, 1, 2, 3],
    dim7:   [0, 2, 0, 1, 2, 0],
    aug:    [0, 2, 2, 2, 0, 0],
    sus2:   [0, 2, 2, 2, 0, 0],
    sus4:   [0, 2, 2, 0, 0, 0],
    '6':    [0, 2, 2, 1, 2, 0],
    m6:     [0, 2, 2, 0, 2, 0],
    '7sus4':[0, 2, 2, 0, 3, 0],
    add9:   [0, 2, 2, 1, 0, 2],
  },
  a: {
    major:  [null, 0, 2, 2, 2, 0],
    minor:  [null, 0, 2, 2, 1, 0],
    dom7:   [null, 0, 2, 0, 2, 0],
    maj7:   [null, 0, 2, 1, 2, 0],
    min7:   [null, 0, 2, 0, 1, 0],
    m7b5:   [null, 0, 2, 0, 1, 1],
    dim:    [null, 0, 2, 0, 1, 0],
    dim7:   [null, 0, 2, 0, 1, 0],
    aug:    [null, 0, 2, 2, 2, 2],
    sus2:   [null, 0, 2, 2, 2, 0],
    sus4:   [null, 0, 2, 2, 3, 0],
    '6':    [null, 0, 2, 2, 2, 2],
    m6:     [null, 0, 2, 2, 1, 2],
    '7sus4':[null, 0, 2, 2, 3, 0],
    add9:   [null, 0, 2, 2, 0, 0],
  },
}

const QUALITY_MAP = [
  // Urutan penting: cek suffix terpanjang dulu
  ['m7b5', 'm7b5'], ['min7b5', 'm7b5'], ['half-dim', 'm7b5'],
  ['maj7', 'maj7'], ['ma7', 'maj7'], ['Δ', 'maj7'],
  ['m7', 'min7'], ['min7', 'min7'],
  ['7sus4', '7sus4'], ['sus4', 'sus4'],
  ['sus2', 'sus2'],
  ['add9', 'add9'],
  ['m6', 'm6'], ['min6', 'm6'],
  ['6', '6'],
  ['9', 'dom7'],
  ['dim7', 'dim7'],
  ['dim', 'dim'],
  ['aug', 'aug'], ['+', 'aug'],
  ['m', 'minor'], ['min', 'minor'], ['minor', 'minor'],
  ['maj', 'major'], ['7', 'dom7'],
]

function getQuality(name, rootLen) {
  const suf = String(name).trim().slice(rootLen).replace(/\([^)]*\)/g, '').replace(/[^a-zA-Z0-9#]/g, '')
  for (const [key, val] of QUALITY_MAP) {
    if (suf.startsWith(key)) return val
  }
  return 'major'
}

/**
 * Menghitung fingering 6-senar untuk nama chord.
 * Return null jika kualitas tidak dikenali.
 */
export function computeFingering(chordName) {
  const name = String(chordName || '').trim()
  if (!name) return null
  const root = parseRoot(name)
  const rIdx = CHROMATIC.indexOf(root)
  if (rIdx === -1) return null

  const quality = getQuality(name, root.length)
  const shapeE = SHAPES.e[quality]
  const shapeA = SHAPES.a[quality]
  if (!shapeE && !shapeA) return null

  // Fret barre: root di senar 6 (low E, index 4) atau senar 5 (A, index 9)
  const f6 = ((rIdx - 4) % 12 + 12) % 12
  const f5 = ((rIdx - 9) % 12 + 12) % 12

  const candidates = []
  if (shapeE && f6 <= 9) {
    const base = f6
    const max = Math.max(...shapeE.map(v => v ?? 0)) + base
    candidates.push({ offs: shapeE, base, max })
  }
  if (shapeA && f5 <= 9) {
    const base = f5
    const max = Math.max(...shapeA.map(v => v ?? 0)) + base
    candidates.push({ offs: shapeA, base, max })
  }
  if (!candidates.length) return null

  // Pilih yang fret max-nya paling rendah
  candidates.sort((a, b) => a.max - b.max)
  const best = candidates[0]

  // Render: null → 'x', 0 → '0', n → String(n)
  return best.offs.map(v => {
    if (v === null) return 'x'
    const fret = best.base + v
    return fret === 0 ? '0' : String(fret)
  }).join('')
}
