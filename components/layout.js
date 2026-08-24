import Head from 'next/head'
import Link from 'next/link'

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <title>Guitar Chord Hub - Kumpulan Chord Gitar Modern</title>
        <meta name="description" content="Jelajahi ratusan chord gitar dengan diagram mudah dibaca, pencarian cepat, dan tampilan responsif. Cocok untuk pemula hingga pro." />
        <meta name="keywords" content="chord gitar, kunci gitar, chord dasar, belajar gitar, lirik dan chord" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">Guitar Chord Hub</Link>
          <nav>
            <Link href="/" className="mx-3 hover:text-gray-300">Home</Link>
            <Link href="/chords" className="mx-3 hover:text-gray-300">Chords</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto py-8">
        {children}
      </main>

      <footer className="bg-gray-200 text-gray-800 p-4">
        <div className="container mx-auto text-center">
          &copy; {new Date().getFullYear()} Guitar Chord Hub. All rights reserved.
        </div>
      </footer>
    </>
  )
}