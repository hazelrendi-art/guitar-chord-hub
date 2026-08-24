import Link from 'next/link'
import { getAllChords } from '../lib/chordData'

export default function Home({ chords }) {
  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Popular Guitar Chords</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {chords.map(chord => (
          <Link key={chord.id} href={`/chord/${chord.id}`} className="bg-white p-4 rounded shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold">{chord.name}</h2>
            <p className="text-gray-600">Difficulty: {chord.difficulty}</p>
          </Link>
        ))}
      </div>
    </>
  )
}

export async function getStaticProps() {
  const chords = await getAllChords()
  return { props: { chords } }
}