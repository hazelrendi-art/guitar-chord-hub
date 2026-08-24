import '../styles/globals.css'
import Layout from '../components/layout'
import { ThemeProvider } from '../components/theme'

export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  )
}