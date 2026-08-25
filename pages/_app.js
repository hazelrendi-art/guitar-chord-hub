import '../styles/globals.css'
import { ThemeProvider } from '../components/theme'

// Layout TIDAK dibungkus di sini — setiap halaman memasang <Layout>-nya sendiri
// (agar bisa mengirim title/description SEO khusus per halaman).
export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}