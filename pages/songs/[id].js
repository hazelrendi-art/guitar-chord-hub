import Link from 'next/link'
import Layout from '../../components/layout'
import SongViewer from '../../components/song-viewer'
import { getSongById, getAllSongs } from '../../lib/store'

export default function SongPage({ song }) {
  if (!song) {
    return (
      <Layout>
        <div className="comic-panel text-center">
          <h1 className="font-comic text-5xl text-pop-red">404!</h1>
          <p className="my-3">Lagu tidak ditemukan.</p>
          <Link href="/songs" className="btn-comic bg-pop-yellow">← Kembali</Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={`${song.title} - ${song.artist} (Chord & Lirik) | ChordSpace`}
            description={`Chord gitar dan lirik lagu "${song.title}" dari ${song.artist}. Lengkap dengan fitur transpose real-time.`}>
      <Link href="/songs" className="btn-comic bg-white dark:bg-[#232332] text-sm mb-6 inline-block">← Semua lagu</Link>

      <div className="comic-panel mt-4 mb-6">
        <span className="inline-block px-2 py-0.5 border-2 border-black rounded-md text-xs font-bold bg-pop-green">
          {song.difficulty || 'Beginner'}
        </span>
        <h1 className="font-comic text-4xl sm:text-6xl mt-2">{song.title}</h1>
        <p className="opacity-70 font-bold text-lg">oleh {song.artist}</p>
        {song.description && <p className="opacity-60 mt-2">{song.description}</p>}
      </div>

      <SongViewer content={song.content} />
    </Layout>
  )
}

export async function getStaticPaths() {
  const songs = await getAllSongs()
  return {
    paths: songs.map(s => ({ params: { id: s.id } })),
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }) {
  const song = await getSongById(params.id)
  if (!song) return { notFound: true }
  return {
    props: { song },
    revalidate: 10,
  }
}