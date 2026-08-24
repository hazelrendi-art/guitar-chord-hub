import Head from 'next/head'
import Link from 'next/link'
import { ThemeToggle } from './theme'

export default function Layout({ children, title, description }) {
  return (
    <>
      <Head>
        <title>{title || 'Guitar Chord Hub - Kumpulan Chord Gitar Modern'}</title>
        <meta name="description" content={description || 'Jelajahi ratusan chord gitar dengan diagram mudah dibaca, transpose chord, pencarian cepat, dan tampilan responsif.'} />
        <meta name="keywords" content="chord gitar, kunci gitar, chord dasar, transpose chord, belajar gitar" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('dark')}}catch(e){}})()` }} />
      </Head>

      {/* Starburst dekoratif ala komik */}
      <div className="halftone min-h-screen">
        <header className="bg-pop-yellow border-b-4 border-black sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center gap-2">
            <Link href="/" className="font-comic text-3xl sm:text-4xl tracking-wide text-ink hover:-rotate-1 inline-block transition-transform">
              🎸 Guitar Chord <span className="text-pop-red">Hub!</span>
            </Link>
            <nav className="flex items-center gap-2">
              <Link href="/" className="btn-comic bg-white dark:bg-[#232332] hidden sm:inline-block">Home</Link>
              <Link href="/chords" className="btn-comic bg-pop-blue text-white">Chords</Link>
              <Link href="/songs" className="btn-comic bg-pop-pink text-white hidden sm:inline-block">Lagu 🎵</Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">{children}</main>

        <footer className="bg-ink text-gray-100 border-t-4 border-black p-6 mt-12">
          <div className="container mx-auto text-center font-body">
            <p className="font-comic text-2xl tracking-wide">POW! Keep Strummin&apos;!</p>
            <p className="text-sm opacity-70 mt-1">&copy; {new Date().getFullYear()} Guitar Chord Hub</p>
          </div>
        </footer>
      </div>
    </>
  )
}