/**
 * Transpose chord — akurat & lengkap.
 *
 * Mendukung:
 * - Root note (C, C#, Db, Bb, F#, ...)
 * - Quality suffix (maj7, maj9, 7, 9, 11, 13, dim, dim7, aug, sus2, sus4, add9, 6, m6, ...)
 * - Slash chord (C/E, G/B, Bb/D) → bass ikut transpose
 * - Parentheses (Cmaj7(9), F#m7b5, G7(b9))
 * - Multiple roots (sus4 chord: root + bass)
 * - Tidak memutarbalikkan suffix yang diakui
 */
const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const FLAT_TO_SHARP = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#', Cb: 'B', Fb: 'E', 'E#': 'F', 'B#': 'C' }

/**
 * Normalisasi akar ke bentuk sharp (C#, D#, F#, G#, A#).
 */
function normalizeRoot(root) {
  return FLAT_TO_SHARP[root] || root
}

/**
 * Cari akar di awal string. Mengembalikan { root, rest }.
 * rest = sisa string setelah akar (tanpa spasi).
 */
function parseRootToken(str) {
  const s = str.trim()
  // cek 2 karakter dulu (C#, Db, Bb, F#, E#, G#)
  const two = s.slice(0, 2)
  if (FLAT_TO_SHARP[two]) return { root: two, rest: s.slice(2) }
  if (/^[A-G]#$/.test(two)) return { root: two, rest: s.slice(2) }
  if (/^[A-G]b$/.test(two)) return { root: two, rest: s.slice(2) }
  if (/^[A-G]$/.test(s[0])) return { root: s[0], rest: s.slice(1) }
  return { root: null, rest: s }
}

/**
 * Fungsi utama: transpose chord name.
 * @param {string} name   chord name (contoh "Cmaj7", "G/B", "F#m7b5")
 * @param {number} semitones  (-11 .. 11)
 * @returns {string}
 */
export function transposeChord(name, semitones) {
  if (!semitones) return name
  if (!name) return name
  const s = String(name).trim()
  if (!s) return name

  // Pisahkan bagian bass (slash chord): C/E → root=C, bass=E
  let bass = null
  let chordPart = s
  // cari slash yang bukan di dalam parentheses
  const slashIdx = findTopLevelSlash(s)
  if (slashIdx >= 0) {
    chordPart = s.slice(0, slashIdx)
    bass = s.slice(slashIdx + 1).trim()
  }

  // Parse akar chord
  const rootToken = parseRootToken(chordPart)
  if (!rootToken.root) return name // tidak dikenali, kembalikan asli

  const oldRoot = normalizeRoot(rootToken.root)
  const suffix = rootToken.rest // sisa setelah akar, berisi quality + optional (extensions)

  // Transpose akar
  const idx = CHROMATIC.indexOf(oldRoot)
  if (idx === -1) return name
  const newIdx = (((idx + semitones) % 12) + 12) % 12
  const newRoot = CHROMATIC[newIdx]

  // Transpose bass
  let newBass = null
  if (bass) {
    const bassToken = parseRootToken(bass)
    if (bassToken.root) {
      const oldBass = normalizeRoot(bassToken.root)
      const bIdx = CHROMATIC.indexOf(oldBass)
      if (bIdx !== -1) {
        const newBIdx = (((bIdx + semitones) % 12) + 12) % 12
        newBass = CHROMATIC[newBIdx] + bassToken.rest
      } else {
        newBass = bass
      }
    } else {
      newBass = bass
    }
  }

  // Rekonstruksi
  let result = newRoot + suffix
  if (newBass) result += '/' + newBass
  return result
}

/**
 * Cari slash '/' di luar parentheses. Return indeks atau -1.
 */
function findTopLevelSlash(s) {
  let depth = 0
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (ch === '(') depth++
    else if (ch === ')') depth--
    else if (ch === '/' && depth === 0) return i
  }
  return -1
}

/**
 * Hitung transpose offset (semitones) dari kunci asal ke kunci tujuan.
 * @param {string} from  "C", "F#", "Bb"
 * @param {string} to    "G", "A", "Eb"
 * @returns {number}  (-11..11)Semis
 */
export function keyOffset(from, to) {
  const f = parseRootToken(from)
  const t = parseRootToken(to)
  if (!f.root || !t.root) return 0
  const fi = CHROMATIC.indexOf(normalizeRoot(f.root))
  const ti = CHROMATIC.indexOf(normalizeRoot(t.root))
  if (fi === -1 || ti === -1) return 0
  return (((ti - fi) % 12) + 12) % 12
}

/**
 * Parse root note saja (kompatibel dengan lib/fingering.js).
 * Mengembalikan root dalam bentuk sharp (C#, D#, F#, G#, A#).
 */
export function parseRoot(name) {
  const token = parseRootToken(name)
  return normalizeRoot(token.root || name.trim()[0] || 'C')
}