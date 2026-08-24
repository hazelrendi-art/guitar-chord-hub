/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // WAJIB di Termux/Android: pakai binding SWC WebAssembly
  // (binary native @next/swc-android-arm64 tidak tersedia di npm)
  experimental: {
    useWasmBinary: true,
  },
}

module.exports = nextConfig