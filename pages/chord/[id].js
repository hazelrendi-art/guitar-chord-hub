import Link from 'next/link'
import Layout from '../../components/layout'
import ChordViewer from '../../components/chord-viewer'
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
    <Layout title={`${chord.name} Chord - Fingering & Transpose | ChordSpace`}
            description={`Chord ${chord.name}: posisi jari ${chord.fingering}. Tingkat ${chord.difficulty}. Lengkap dengan fitur transpose.`}>
      <Link href="/chords" className="btn-comic bg-white dark:bg-[#232332] text-sm mb-6 inline-block">← Semua chord</Link>

      <span className={`inline-block px-2 py-0.5 border-2 border-black rounded-md text-xs font-bold bg-pop-green mt-4`}>
        {chord.difficulty}
      </span>
      {chord.description && (
        <p className="opacity-70 mt-2 max-w-xl">{chord.description}</p>
      )}

      {/* Diagram + info + transpose dalam satu komponen */}
      <div className="mt-4">
        <ChordViewer name={chord.name} fingering={chord.fingering} />
      </div>
    </Layout>
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