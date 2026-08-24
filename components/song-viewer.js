import { useMemo, useState } from 'react'
import { transposeChord } from '../lib/transpose'

/**
 * Menampilkan lirik + chord inline format [Am].
 * Semua chord dalam kurung siku ikut di-transpose secara real-time.
 */
export default function SongViewer({ content }) {
  const [shift, setShift] = useState(0)

  const lines = useMemo(() => String(content || '').split('\n'), [content])

  // kumpulan unik chord untuk ringkasan
  const uniqueChords = useMemo(() => {
    const set = new Set()
    for (const m of String(content).matchAll(/\[([^\]\r\n]+)\]/g)) {
      set.add(m[1].trim())
    }
    return [...set]
  }, [content])

  const sectionLabelRe = /^(Intro|Verse|Chorus|Bridge|Outro|Reff|Interlude|Solo|Pre-Chorus)/i

  return (
    <div>
      {/* Kontrol transpose */}
      <div className="comic-panel mb-6">
        <h2 className="font-comic text-3xl mb-3">🎵 Transpose</h2>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button onClick={() => setShift(s => Math.max(s - 1, -11))}
                  className="btn-comic bg-pop-red text-white text-2xl px-5" aria-label="Turun semitone">−</button>

          <div className="comic-card bg-pop-yellow px-8 py-2 text-center">
            <div className="font-comic text-4xl text-ink">
              {shift === 0 ? 'ORIGINAL' : `${shift > 0 ? '+' : ''}${shift}`}
            </div>
          </div>

          <button onClick={() => setShift(s => Math.min(s + 1, 11))}
                  className="btn-comic bg-pop-green text-ink text-2xl px-5" aria-label="Naik semitone">+</button>

          {shift !== 0 && (
            <button onClick={() => setShift(0)} className="btn-comic bg-white dark:bg-[#16161e] text-sm">↺ Reset</button>
          )}
        </div>

        {uniqueChords.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <span className="text-sm font-bold opacity-60 self-center">Chord dipakai:</span>
            {uniqueChords.map(c => (
              <span key={c} className="font-mono font-bold text-sm border-2 border-black rounded-md px-2 bg-pop-blue text-white">
                {transposeChord(c, shift)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Lirik */}
      <div className="comic-panel overflow-x-auto">
        <div className="font-body text-base sm:text-lg leading-relaxed min-w-[280px]">
          {lines.map((line, i) => {
            if (!line.trim()) return <div key={i} className="h-4" />

            const trimmed = line.trim()
            // Label section seperti [Verse] / [Chorus] (tanpa chord di dalamnya)
            const bare = trimmed.replace(/\[([^\]]+)\]/g, '$1').trim()
            if (sectionLabelRe.test(bare) && !/\[[A-G][#b]?[a-zA-Z0-9]*\].*[^\s]/.test(trimmed.replace(/^\[[^\]]+\]\s*/, ''))) {
              return (
                <div key={i} className="font-comic text-xl mt-3 mb-1 text-pop-pink dark:text-pop-pink tracking-wide">
                  — {bare.toUpperCase()} —
                </div>
              )
            }

            // Baris berisi chord &/atau lirik
            const segs = line.split(/(\[[^\]]*\])/)
            return (
              <div key={i} className="whitespace-pre-wrap">
                {segs.map((seg, j) => {
                  if (seg.startsWith('[') && seg.endsWith(']')) {
                    const ch = seg.slice(1, -1).trim()
                    if (!ch) return null
                    return (
                      <span key={j} className="inline-block font-mono font-bold text-pop-blue dark:text-[#7EB6FF] mr-1 align-top">
                        {transposeChord(ch, shift)}
                      </span>
                    )
                  }
                  return <span key={j}>{seg}</span>
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}