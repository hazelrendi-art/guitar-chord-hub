import { getChordById, getAllChords } from '../../lib/chordData'

export default function ChordPage({ chord }) {
  if (!chord) {
    return <p className="p-6">Chord not found.</p>
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-4">{chord.name}</h1>
      <div className="bg-white p-6 rounded shadow mb-6">
        <p className="text-lg mb-2"><strong>Fingering:</strong> {chord.fingering}</p>
        <p className="text-gray-600 mb-4">{chord.description}</p>
        {/* Diagram chord (SVG/gambar) bisa ditambahkan di sini */}
        <div className="text-5xl font-mono">{chord.fingering}</div>
      </div>

      <div className="bg-gray-50 p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">Related Chords</h2>
        <p className="text-gray-500">Explore more chords in the library.</p>
      </div>
    </>
  )
}

export async function getStaticPaths() {
  const chords = await getAllChords()
  return {
    paths: chords.map(chord => ({ params: { id: chord.id } })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const chord = await getChordById(params.id)
  return { props: { chord } }
}