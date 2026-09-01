# AGENTS.md — Panduan pi Agent untuk Project ChordSpace

> **Baca bagian atas ini dulu** untuk ringkasan. Scroll ke bawah untuk detail lengkap.

## TL;DR — Quick Start (Hemat Token)

```bash
# 1. Install (Termux)
npm install --no-bin-links

# 2. Dev
npm run dev          # http://localhost:3000

# 3. Build
npm run build

# 4. Test semua route
for u in / /chords /chord/c /api/chords; do
  curl -s -o /dev/null -w "$u -> %{http_code}\n" http://localhost:3000$u
done

# 5. Deploy = git push
# Vercel auto-build dari GitHub main branch
```

### Struktur Penting (Yang Sering Diubah)
- `data/chords.json` — data chord (tambah/edit di sini)
- `data/songs.json` — data lagu
- `pages/api/` — CRUD API
- `components/chord-viewer.js` — diagram fretboard + transpose
- `lib/transpose.js` — logika transpose

### Kalau Error
| Error | Fix |
|---|---|
| `EACCES symlink` | `npm install --no-bin-links` |
| `sh: next: not found` | Sudah pakai `node node_modules/next/dist/bin/next` |
| Vercel stuck di 6 chord | Hapus KV key `gch:chords` di dashboard Vercel → Redeploy |
| curl 000 | Port 3000 dipakai → cek `Local:` di log |

### Deploy Checklist
1. `git add .` → `git commit` → `git push`
2. Vercel auto-build dari `origin/main`
3. Kalau data lama di Vercel: hapus KV key → Redeploy
4. Live di: **https://guitar-chord-hub.vercel.app**

### Catatan Penting
- **JANGAN upgrade** `next` ke 15+, **JANGAN** tambah `"type":"commonjs"`
- **Chord ID** harus URL-safe (pakai `-`, bukan `/`)
- Admin password: `.env.local` → `ADMIN_PASSWORD`

---

## Detail Lengkap

> Sisa dokumen ini untuk konteks teknis penuh.

### 1. Konteks Project

- **Nama:** ChordSpace
- **Stack:** Next.js 14.2.33 (Pages Router) + React 18 + Tailwind CSS 3
- **Struktur:**

---


## 2. Limitasi Wajib Tahu di Termux/Android

### 2.1 Filesystem `/storage/emulated` TIDAK mendukung symlink
- `npm install` **gagal dengan EACCES syscall symlink** jika tanpa flag.
- **Solusi:** SELALU install dengan:
  ```bash
  npm install --no-bin-links
  ```
- Konsekuensi `--no-bin-links`: folder `node_modules/.bin` kosong.
  Perintah `npx next ...` / `npm run dev` yang memanggil `next` langsung akan gagal (`sh: next: not found`).
- **Solusi:** scripts package.json memanggil next via node langsung:
  ```json
  "dev":   "node node_modules/next/dist/bin/next dev",
  "build": "node node_modules/next/dist/bin/next build",
  "start": "node node_modules/next/dist/bin/next start"
  ```
  **Jangan ubah** kembali ke `next dev` atau `npx next dev`.

### 2.2 Binary native SWC tidak ada untuk Android
- Next butuh compiler SWC native (`@next/swc-android-arm64`). Package ini **tidak ada di npm**
  (hanya versi canary lama) → Next mencoba download saat runtime dan gagal 404 → build crash.
- **Solusi (3 lapis, semua sudah diterapkan):**
  1. Install binding WASM: `npm install -D @next/swc-wasm-nodejs@14.2.33 --no-bin-links`
     (versi HARUS sama persis dengan versi next).
  2. `next.config.js` berisi `experimental: { useWasmBinary: true }`.
  3. `postinstall` menjalankan `scripts/patch-termux.js` yang mem-patch
     `node_modules/next/dist/build/swc/index.js` agar WASM selalu diprioritaskan
     (tanpa patch ini, `next build` tetap crash meski dev jalan).

### 2.3 Versi terkunci — JANGAN upgrade sembarangan
| Package | Versi | Alasan |
|---|---|---|
| next | 14.2.33 | Versi WASM terakhir yang tersedia; Next 15/16 pakai Turbopack default yang tidak support android/arm64 |
| react / react-dom | ^18 | Pasangan resmi Next 14 |
| tailwindcss | 3.x | Config project memakai format v3 (`@tailwind base;`), v4 beda sintaks |

### 2.4 Hal-hal kecil tapi penting
- `package.json` **TIDAK BOLEH** punya `"type": "commonjs"` — webpack akan memparse `.js`
  sebagai CommonJS murni dan error `'import' and 'export' may appear only with 'sourceType: module'`.
- Watchpack akan spam warning `EACCES watch '/storage'` — ini normal di Android, **abaikan**,
  tidak memengaruhi fungsionalitas.
- Jika port 3000 masih dipakai proses lama/zombie, Next otomatis pindah ke 3001 dst.
  Cek baris `Local:` di log sebelum curl.
- `/tmp` tidak ada di Termux — gunakan `$HOME` atau `$PREFIX/tmp` untuk file sementara.
- Setelah edit `next.config.js` atau ganti dependensi, hapus cache: `rm -rf .next`

## 3. Perintah Harian

```bash
cd ~/storage/shared/dt/dat/guitar-chord-web   # sesuaikan path

npm run dev      # development server (http://localhost:3000)
npm run build    # production build (butuh patch-termux sudah jalan)
npm run start    # jalankan hasil build

# tes cepat semua route:
for u in / /chords /chord/c /api/chords; do curl -s -o /dev/null -w "$u -> %{http_code}\n" http://localhost:3000$u; done
```

Kalau instalasi ulang from scratch:
```bash
rm -rf node_modules .next
npm install --no-bin-links        # postinstall otomatis menjalankan patch-termux.js
npm run build && npm run start    # verifikasi
```

## 4. Deploy ke Hosting Gratis

Project ini deploy **apa adanya** ke Vercel/Netlify/Railway — semua patch Termux bersifat lokal
(di `node_modules`, tidak ikut ke git). Di server Linux biasa, Next 14.2.33 memakai binary
native linux yang tersedia sehingga tidak perlu patch.

- **Vercel (paling mudah):** push ke GitHub → import di vercel.com → deploy otomatis (deteksi Next.js).
- **Netlify:** plugin `@netlify/plugin-nextjs`.
- API route `pages/api/chords.js` otomatis jadi serverless function.

## 5. Cara Menambah Chord Baru

Edit `data/chords.json`, tambah objek:
```json
{
  "id": "bm",              // unik, dipakai di URL /chord/bm
  "name": "B Minor",
  "difficulty": "Intermediate",
  "fingering": "x24432",   // format: 6 string, x = mute, 0 = open
  "description": "..."
}
```
Jalankan `npm run build` ulang (halaman SSG). Selesai.

## 6. Checklist Troubleshooting Cepat

| Gejala | Penyebab | Fix |
|---|---|---|
| `EACCES symlink` saat install | lupa `--no-bin-links` | `npm install --no-bin-links` |
| `sh: next: not found` | scripts memanggil `next` langsung | pakai `node node_modules/next/dist/bin/next` |
| 404 download swc-android-arm64 | binding native tak tersedia | lihat §2.2 (wasm + patch) |
| `sourceType: module` parse error | ada `"type": "commonjs"` di package.json | hapus field `type` |
| Turbopack error di Next 16 | versi next terlalu baru | turunkan ke next@14.2.33 |
| curl 000 padahal server jalan | pindah port (3000 dipakai) | cek log baris `Local:` |
