import Link from 'next/link'
import Layout from '../../components/layout'
import { getAllChords } from '../../lib/chordData'
const COLORS = ['bg-pop-yellow', 'bg-pop-pink', 'bg-pop-blue', 'bg-pop-green', 'bg-pop-purple']

export default function ChordsPage({ chords }) {
  return (
    <Layout title="Semua Chord Gitar | Guitar Chord Hub">
      <div className="comic-panel bg-white dark:bg-[#232332] mb-8 -rotate-1">
        <h1 className="font-comic text-4xl sm:text-5xl">All the CHORDS!</h1>
        <p className="mt-1 opacity-70">{chords.length} chord tersedia. Klik untuk detail & transpose.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {chords.map((chord, i) => (
          <Link
            key={chord.id}
            href={`/chord/${chord.id}`}
            className={`comic-card p-5 ${i % 2 ? 'rotate-1' : '-rotate-1'}`}
          >
            <div className={`inline-block px-2 py-0.5 border-2 border-black rounded-md text-xs font-bold ${COLORS[i % COLORS.length]}`}>
              {chord.difficulty}
            </div>
            <h2 className="font-comic text-4xl mt-2">{chord.name}</h2>
            <p className="font-mono text-lg opacity-60">{chord.fingering}</p>
          </Link>
        ))}
      </div>
    </Layout>
  )
}

export async function getStaticProps() {
  const chords = await getAllChords()
  return { props: { chords } }
}