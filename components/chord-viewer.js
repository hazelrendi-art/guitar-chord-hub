import { useMemo, useState } from 'react'
import { transposeChord } from '../lib/transpose'
import { computeFingering } from '../lib/fingering'

/* ---------- Diagram fretboard SVG ---------- */
function FretboardDiagram({ fingering }) {
  const strings = String(fingering).split('')
  const W = 140, H = 190, padX = 25, padY = 30
  const stringGap = (W - padX * 2) / 5
  const fretGap = (H - padY * 2) / 4

  return (
    <svg viewBox="0 0 160 210" width="180" className="comic-card bg-white dark:bg-[#232332] shrink-0" style={{ transform: 'rotate(2deg)' }}>
      <line x1={padX - 4} y1={padY} x2={W - padX + 4} y2={padY} stroke="black" strokeWidth="7" />
      {[1, 2, 3, 4].map(f => (
        <line key={f} x1={padX} y1={padY + f * fretGap} x2={W - padX} y2={padY + f * fretGap} stroke="#888" strokeWidth="2" />
      ))}
      {/* label fret awal kalau posisi tinggi */}
      {strings.some(s => s !== 'x' && s !== '0' && Number(s) > 4) && (
        Array.from(new Set(strings.filter(s => s !== 'x' && s !== '0').map(Number))).sort((a, b) => a - b).length > 0 && (() => {
          const minFret = Math.min(...strings.filter(s => s !== 'x' && s !== '0').map(Number))
          const start = Math.max(1, minFret)
          return (
            <>
              <text x={W / 2} y={H - 8} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#555">{start}fr</text>
            </>
          )
        })()
      )}
      {strings.map((s, i) => {
        const x = padX + i * stringGap
        const isMute = s === 'x'
        const isOpen = s === '0'
        const fret = Number(s)
        const minPos = Math.min(...strings.filter(t => t !== 'x' && t !== '0').map(Number), 99)
        const start = minPos > 4 ? minPos : 1  // geser window fret kalau posisi tinggi

        // posisi dalam window 4-fret
        let yPos = padY, display = ''
        if (!isMute && !isOpen) {
          const rel = fret - start
          if (rel >= 0 && rel <= 3) {
            yPos = padY + (rel + 0.5) * fretGap
          } else {
            yPos = padY + 3.75 * fretGap // di luar jangkauan, tampil di bawah
            display = fret
          }
        }

        return (
          <g key={i}>
            <line x1={x} y1={padY} x2={x} y2={padY + 4 * fretGap} stroke={isMute ? '#999' : '#333'} strokeWidth="2.5" />
            {isMute && <text x={x} y={padY - 12} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#FF4E4E">×</text>}
            {isOpen && <circle cx={x} cy={padY - 14} r="7" fill="none" stroke="#333" strokeWidth="3" />}
            {!isMute && !isOpen && (
              <>
                <circle cx={x} cy={yPos} r="11" fill="#FFD93D" stroke="black" strokeWidth="3" />
                <text x={x} y={yPos + 5} textAnchor="middle" fontSize="13" fontWeight="bold">
                  {display || fret}
                </text>
              </>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/**
 * Viewer chord lengkap: diagram + posisi jari + kontrol transpose.
 * Semua ikut berubah secara real-time saat ditranspose.
 */
export default function ChordViewer({ name, fingering }) {
  const [shift, setShift] = useState(0)

  const currentName = shift === 0 ? name : transposeChord(name, shift)
  const currentFingering = useMemo(
    () => (shift === 0 ? fingering : (computeFingering(currentName) || fingering)),
    [shift, name, fingering, currentName]
  )

  return (
    <>
      {/* Panel utama: diagram + info */}
      <div className="comic-panel">
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start justify-center">
          <div key={currentFingering}>
            <FretboardDiagram fingering={currentFingering} />
          </div>
          <div className="text-center sm:text-left flex-1 min-w-[200px]">
            <h1 className="font-comic text-6xl mt-2">{currentName}</h1>
            <p className="mt-3">
              <span className="font-bold">Posisi jari:</span>{' '}
              <code key={currentFingering} className="font-mono text-xl bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded border-2 border-black">
                {currentFingering}
              </code>
            </p>
            <p className="text-xs opacity-50 mt-2">
              {shift !== 0 ? '⚡ Bentuk barre otomatis dihitung dari transpose' : '\u00A0'}
            </p>
          </div>
        </div>
      </div>

      {/* Kontrol transpose */}
      <div className="comic-panel mt-6">
        <h2 className="font-comic text-3xl mb-1">Transpose! 🎵</h2>
        <p className="text-sm opacity-70 mb-4">Diagram &amp; posisi jari ikut berubah.</p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button onClick={() => setShift(s => Math.max(s - 1, -11))}
                  className="btn-comic bg-pop-red text-white text-2xl px-5" aria-label="Turunkan setengah nada">−</button>

          <div className="comic-card bg-pop-yellow dark:bg-pop-yellow px-8 py-3 text-center">
            <div className="font-comic text-5xl text-ink">{currentName}</div>
            <div className="text-xs font-bold text-ink/60">
              {shift === 0 ? 'ORIGINAL' : `${shift > 0 ? '+' : ''}${shift} semitone`}
            </div>
          </div>

          <button onClick={() => setShift(s => Math.min(s + 1, 11))}
                  className="btn-comic bg-pop-green text-ink text-2xl px-5" aria-label="Naikkan setengah nada">+</button>
        </div>

        <div className="flex justify-center mt-4">
          {shift !== 0 && (
            <button onClick={() => setShift(0)} className="btn-comic bg-white dark:bg-[#16161e] text-sm">↺ Reset ke {name}</button>
          )}
        </div>

        <details className="mt-4">
          <summary className="cursor-pointer font-bold text-pop-blue dark:text-[#7EB6FF]">Lihat semua 12 kunci</summary>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
            {Array.from({ length: 12 }, (_, i) => i).map(i => {
              const n = i === 0 ? name : transposeChord(name, i)
              const f = i === 0 ? fingering : computeFingering(n)
              return (
                <button key={i} onClick={() => setShift(i)}
                        title={`Fingering: ${f || '?'}`}
                        className={`btn-comic text-sm px-2 py-1 ${i === 0 ? 'bg-pop-purple text-white' : 'bg-white dark:bg-[#16161e]'} ${i === shift ? 'ring-4 ring-pop-yellow' : ''}`}>
                  {n}
                </button>
              )
            })}
          </div>
        </details>
      </div>
    </>
  )
}