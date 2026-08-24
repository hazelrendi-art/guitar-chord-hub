import Link from 'next/link'
import Layout from '../components/layout'
import { getAllChords } from '../lib/chordData'

const COLORS = ['bg-pop-yellow', 'bg-pop-pink', 'bg-pop-blue', 'bg-pop-green', 'bg-pop-purple']

export default function Home({ chords }) {
  const featured = chords.slice(0, 6)
  return (
    <Layout>
      {/* Hero ala komik */}
      <div className="comic-panel halftone text-center mb-10 -rotate-1 overflow-hidden">
        <h1 className="font-comic text-5xl sm:text-7xl leading-tight">
          Learn GUITAR<br />
          <span className="text-pop-red">the FUN</span> way!
        </h1>
        <p className="mt-3 max-w-lg mx-auto opacity-80 font-bold">
          Kumpulan chord gitar dengan diagram keren, fitur transpose, dan tema gelap/terang. ZAP!
        </p>
        <div className="mt-5 flex justify-center gap-3 flex-wrap">
          <Link href="/chords" className="btn-comic bg-pop-blue text-white text-xl px-6 py-3">🎸 Jelajahi Chord</Link>
          <Link href="/admin" className="btn-comic bg-white dark:bg-[#16161e] text-xl px-6 py-3">🔐 Admin</Link>
        </div>
        <span className="absolute top-3 right-4 font-comic text-2xl rotate-12 text-pop-pink">POW!</span>
      </div>

      {/* Chord populer */}
      <h2 className="font-comic text-4xl mb-5">Popular CHORDS!</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {featured.map((chord, i) => (
          <Link
            key={chord.id}
            href={`/chord/${chord.id}`}
            className={`comic-card p-5 ${i % 2 ? 'rotate-1' : '-rotate-1'}`}
          >
            <div className={`inline-block px-2 py-0.5 border-2 border-black rounded-md text-xs font-bold ${COLORS[i % COLORS.length]}`}>
              {chord.difficulty}
            </div>
            <h3 className="font-comic text-4xl mt-2">{chord.name}</h3>
            <p className="font-mono text-lg opacity-60">{chord.fingering}</p>
          </Link>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link href="/chords" className="btn-comic bg-pop-purple text-white text-lg px-8 py-3">
          Lihat Semua ({chords.length}) →
        </Link>
      </div>
    </Layout>
  )
}

export async function getStaticProps() {
  const chords = await getAllChords()
  return { props: { chords }, revalidate: 5 }
}