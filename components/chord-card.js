import Link from 'next/link'

const COLORS = ['bg-pop-yellow', 'bg-pop-pink', 'bg-pop-blue', 'bg-pop-green', 'bg-pop-purple']

/** Kartu chord gaya komik — dipakai di homepage & halaman daftar chord */
export default function ChordCard({ chord, index = 0 }) {
  return (
    <Link
      href={`/chord/${chord.id}`}
      className={`comic-card p-5 ${index % 2 ? 'rotate-1' : '-rotate-1'}`}
    >
      <div className={`inline-block px-2 py-0.5 border-2 border-black rounded-md text-xs font-bold ${COLORS[index % COLORS.length]} text-ink`}>
        {chord.difficulty}
      </div>
      <h3 className="font-comic text-4xl mt-2">{chord.name}</h3>
      <p className="font-mono text-lg opacity-60">{chord.fingering}</p>
    </Link>
  )
}