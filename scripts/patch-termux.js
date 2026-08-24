/**
 * Patch Next.js SWC loader agar selalu memprioritaskan binding WebAssembly.
 * Diperlukan di Termux/Android karena binary native @next/swc-android-arm64
 * tidak tersedia di npm registry (hanya ada versi canary lama).
 *
 * Dijalankan otomatis via postinstall. Idempotent: aman dijalankan berulang.
 */
const fs = require('fs')
const path = require('path')

const target = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'build', 'swc', 'index.js')

if (!fs.existsSync(target)) {
  console.log('[termux-patch] node_modules/next not found, skipping.')
  process.exit(0)
}

let code = fs.readFileSync(target, 'utf8')

// Kondisi asli (Next 14.2.x)
const original = 'const shouldLoadWasmFallbackFirst = !disableWasmFallback && unsupportedPlatform && useWasmBinary || isWebContainer;'
const patched = 'const shouldLoadWasmFallbackFirst = !disableWasmFallback; /* TERMUX-PATCH: always prefer WASM */'

const patchedAlt = 'const shouldLoadWasmFallbackFirst = !disableWasmFallback;'

if (code.includes(patched) || code.includes('TERMUX-PATCH') || code.includes(patchedAlt)) {
  console.log('[termux-patch] Already patched.')
} else if (code.includes(original)) {
  code = code.replace(original, patched)
  fs.writeFileSync(target, code)
  console.log('[termux-patch] Patched successfully: SWC will use WASM bindings first.')
} else {
  console.log('[termux-patch] WARNING: target line not found. Next.js version may differ — check manually.')
}
