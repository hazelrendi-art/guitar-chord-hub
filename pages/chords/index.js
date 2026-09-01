import Layout from '../../components/layout'
import ChordCard from '../../components/chord-card'
import { getAllChords } from '../../lib/chordData'

export default function ChordsPage({ chords }) {
  return (
    <Layout title="Semua Chord Gitar | ChordSpace">
      <div className="comic-panel bg-white dark:bg-[#232332] mb-8 -rotate-1">
        <h1 className="font-comic text-4xl sm:text-5xl">All the CHORDS!</h1>
        <p className="mt-1 opacity-70">{chords.length} chord tersedia. Klik untuk detail & transpose.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {chords.map((chord, i) => (
          <ChordCard key={chord.id} chord={chord} index={i} />
        ))}
      </div>
    </Layout>
  )
}

export async function getStaticProps() {
  const chords = await getAllChords()
  return { props: { chords }, revalidate: 5 }
}