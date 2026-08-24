import Link from 'next/link'
import Layout from '../../components/layout'
import Transposer from '../../components/transposer'
import { getAllChords, getChordById } from '../../lib/chordData'

export default function ChordPage({ chord }) {
  if (!chord) {
    return (
      <Layout>
        <div className="comic-panel text-center">
          <h1 className="font-comic text-5xl text-pop-red">404!</h1>
          <p className="my-3">Chord tidak ditemukan.</p>
          <Link href="/chords" className="btn-comic bg-pop-yellow">← Kembali ke daftar</Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={`${chord.name} Chord - Fingering & Transpose | Guitar Chord Hub`}
            description={`Chord ${chord.name}: posisi jari ${chord.fingering}. Tingkat ${chord.difficulty}. Lengkap dengan fitur transpose.`}>
      <Link href="/chords" className="btn-comic bg-white dark:bg-[#232332] text-sm mb-6 inline-block">← Semua chord</Link>

      <div className="comic-panel mt-4">
        {/* Diagram fingerboard SVG */}
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start justify-center">
          <FretboardDiagram fingering={chord.fingering} />
          <div className="text-center sm:text-left flex-1 min-w-[200px]">
            <span className="inline-block px-2 py-0.5 border-2 border-black rounded-md text-xs font-bold bg-pop-green">
              {chord.difficulty}
            </span>
            <h1 className="font-comic text-6xl mt-2">{chord.name}</h1>
            <p className="opacity-70 mt-2 max-w-md">{chord.description}</p>
            <p className="mt-3"><span className="font-bold">Posisi jari:</span> <code className="font-mono text-xl bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded border-2 border-black">{chord.fingering}</code></p>
          </div>
        </div>
      </div>

      <Transposer chordName={chord.name} />
    </Layout>
  )
}

/* Diagram fretboard sederhana dalam SVG */
function FretboardDiagram({ fingering }) {
  // format "x32010": x = mute, 0 = open, angka = fret
  const strings = String(fingering).split('')
  const W = 140, H = 190, padX = 25, padY = 30
  const stringGap = (W - padX * 2) / 5   // 6 senar
  const fretGap = (H - padY * 2) / 4     // 4 fret ditampilkan

  return (
    <svg viewBox="0 0 160 210" width="180" className="comic-card bg-white dark:bg-[#232332] shrink-0" style={{ transform: 'rotate(2deg)' }}>
      {/* nut */}
      <line x1={padX - 4} y1={padY} x2={W - padX + 4} y2={padY} stroke="black" strokeWidth="7" />
      {/* frets */}
      {[1, 2, 3, 4].map(f => (
        <line key={f} x1={padX} y1={padY + f * fretGap} x2={W - padX} y2={padY + f * fretGap} stroke="#555" strokeWidth="2" />
      ))}
      {/* senar + penanda jari */}
      {strings.map((s, i) => {
        const x = padX + i * stringGap
        const isMute = s === 'x'
        const isOpen = s === '0'
        const fret = Number(s)
        return (
          <g key={i}>
            <line x1={x} y1={padY} x2={x} y2={padY + 4 * fretGap} stroke={isMute ? '#ccc' : '#333'} strokeWidth="2.5" />
            {isMute && <text x={x} y={padY - 12} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#FF4E4E">×</text>}
            {isOpen && <circle cx={x} cy={padY - 14} r="7" fill="none" stroke="#333" strokeWidth="3" />}
            {!isMute && !isOpen && (
              <>
                <circle cx={x} cy={padY + (fret - 0.5) * fretGap} r="11" fill="#FFD93D" stroke="black" strokeWidth="3" />
                <text x={x} y={padY + (fret - 0.5) * fretGap + 5} textAnchor="middle" fontSize="13" fontWeight="bold">{fret}</text>
              </>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export async function getStaticPaths() {
  const chords = await getAllChords()
  return {
    paths: chords.map(c => ({ params: { id: c.id } })),
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }) {
  const chord = await getChordById(params.id)
  if (!chord) return { notFound: true, revalidate: 5 }
  return { props: { chord }, revalidate: 5 }
}