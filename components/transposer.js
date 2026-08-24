import { useState } from 'react'
import { transposeChord } from '../lib/transpose'

/** Transpose untuk satu chord (halaman detail chord) */
export default function Transposer({ chordName }) {
  const [shift, setShift] = useState(0)
  const display = shift === 0 ? chordName : transposeChord(chordName, shift)

  return (
    <div className="comic-panel mt-6">
      <h2 className="font-comic text-3xl mb-1">Transpose! 🎵</h2>
      <p className="text-sm opacity-70 mb-4">Geser nada chord ini naik/turun.</p>

      <div className="flex items-center justify-center gap-4 flex-wrap">
        <button onClick={() => setShift(s => Math.max(s - 1, -11))}
                className="btn-comic bg-pop-red text-white text-2xl px-5" aria-label="Turunkan setengah nada">−</button>

        <div className="comic-card bg-pop-yellow dark:bg-pop-yellow px-8 py-3 text-center">
          <div className="font-comic text-5xl text-ink">{display}</div>
          <div className="text-xs font-bold text-ink/60">
            {shift === 0 ? 'ORIGINAL' : `${shift > 0 ? '+' : ''}${shift} semitone`}
          </div>
        </div>

        <button onClick={() => setShift(s => Math.min(s + 1, 11))}
                className="btn-comic bg-pop-green text-ink text-2xl px-5" aria-label="Naikkan setengah nada">+</button>
      </div>

      <div className="flex justify-center mt-4">
        <button onClick={() => setShift(0)} className="btn-comic bg-white dark:bg-[#16161e] text-sm">↺ Reset</button>
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer font-bold text-pop-blue dark:text-[#7EB6FF]">Lihat semua 12 kunci</summary>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
          {Array.from({ length: 12 }, (_, i) => i).map(i => (
            <button key={i} onClick={() => setShift(i)}
                    className={`btn-comic text-sm px-2 py-1 ${i === 0 ? 'bg-pop-purple text-white' : 'bg-white dark:bg-[#16161e]'} ${i === shift ? 'ring-4 ring-pop-yellow' : ''}`}>
              {transposeChord(chordName, i)}
            </button>
          ))}
        </div>
      </details>
    </div>
  )
}