const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const FLAT_MAP = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' }

export function parseRoot(name) {
  const n = String(name).trim()
  const two = n.slice(0, 2)
  if (FLAT_MAP[two]) return FLAT_MAP[two]
  if (/^[A-G]#$/.test(two)) return two
  return n[0]
}

export function transposeChord(name, semitones) {
  if (!semitones) return name
  const root = parseRoot(name)
  const suffix = String(name).trim().slice(root.length)
  const idx = CHROMATIC.indexOf(root)
  if (idx === -1) return name
  const newIdx = (((idx + semitones) % 12) + 12) % 12
  return CHROMATIC[newIdx] + suffix
}