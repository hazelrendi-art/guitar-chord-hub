import { createContext, useContext, useMemo, useState } from 'react'

const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const FLAT_MAP = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' }

const TransposeCtx = createContext(null)

export function parseRoot(name) {
  let n = name.trim()
  // normalisasi flat → sharp
  for (const [flat, sharp] of Object.entries(FLAT_MAP)) {
    if (n.startsWith(flat) && (n.length === flat.length || !/[b#]/.test(n[flat.length]) )) {
      if (n[flat.length] === undefined || /[a-zA-Z0-9]/.test(n[flat.length])) {
        if (n === flat) return sharp
      }
    }
  }
  if (n.startsWith('A#') ) return 'A#'
  const two = n.slice(0, 2)
  if (/^[A-G]#$/.test(two)) return two
  return n[0]
}

export function transposeChord(name, semitones) {
  const root = parseRoot(name)
  const suffix = name.trim().slice(root.length)
  const idx = CHROMATIC.indexOf(root)
  if (idx === -1) return name
  const newIdx = ((idx + semitones) % 12 + 12) % 12
  return CHROMATIC[newIdx] + suffix
}

export function useTransposer(initialName) {
  const [shift, setShift] = useState(0)
  const value = useMemo(() => ({
    shift,
    setShift,
    reset: () => setShift(0),
    up: () => setShift(s => Math.min(s + 1, 11)),
    down: () => setShift(s => Math.max(s - 1, -11)),
  }), [shift])
  return value
}

export default function Transposer({ chordName }) {
  const [shift, setShift] = useState(0)

  const display = shift === 0 ? chordName : transposeChord(chordName, shift)

  return (
    <div className="comic-panel mt-6">
      <h2 className="font-comic text-3xl mb-1">Transpose! 🎵</h2>
      <p className="text-sm opacity-70 mb-4">Geser nada chord ini naik/turun.</p>

      <div className="flex items-center justify-center gap-4 flex-wrap">
        <button onClick={() => setShift(s => Math.max(s - 1, -11))} className="btn-comic bg-pop-red text-white text-2xl px-5" aria-label="Turunkan setengah nada">−</button>

        <div className="comic-card bg-pop-yellow dark:bg-pop-yellow px-8 py-3 text-center">
          <div className="font-comic text-5xl text-ink">{display}</div>
          <div className="text-xs font-bold text-ink/60">
            {shift === 0 ? 'ORIGINAL' : `${shift > 0 ? '+' : ''}${shift} semitone`}
          </div>
        </div>

        <button onClick={() => setShift(s => Math.min(s + 1, 11))} className="btn-comic bg-pop-green text-ink text-2xl px-5" aria-label="Naikkan setengah nada">+</button>
      </div>

      <div className="flex justify-center mt-4">
        <button onClick={() => setShift(0)} className="btn-comic bg-white dark:bg-[#16161e] text-sm">↺ Reset</button>
      </div>

      {/* Semua versi */}
      <details className="mt-4">
        <summary className="cursor-pointer font-bold text-pop-blue dark:text-pop-blue">Lihat semua 12 kunci</summary>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
          {Array.from({ length: 12 }, (_, i) => i).map(i => (
            <button
              key={i}
              onClick={() => setShift(i)}
              className={`btn-comic text-sm px-2 py-1 ${i === 0 ? 'bg-pop-purple text-white' : 'bg-white dark:bg-[#16161e]'} ${i === shift ? 'ring-4 ring-pop-yellow' : ''}`}
            >
              {transposeChord(chordName, i)}
            </button>
          ))}
        </div>
      </details>
    </div>
  )
}