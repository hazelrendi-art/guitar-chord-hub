import { useEffect, useState } from 'react'
import Layout from '../../components/layout'

const EMPTY_CHORD = { id: null, name: '', fingering: '', difficulty: 'Beginner', description: '' }
const EMPTY_SONG = { id: null, title: '', artist: '', difficulty: 'Beginner', description: '', content: '' }

export default function Admin() {
  const [tab, setTab] = useState('lagu') // 'lagu' | 'chord'
  const [loggedIn, setLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [chords, setChords] = useState([])
  const [songs, setSongs] = useState([])
  const [cForm, setCForm] = useState(EMPTY_CHORD)
  const [sForm, setSForm] = useState(EMPTY_SONG)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')

  async function loadData() {
    fetch('/api/chords').then(r => r.json()).then(d => Array.isArray(d) && setChords(d)).catch(() => {})
    fetch('/api/songs').then(r => r.json()).then(d => Array.isArray(d) && setSongs(d)).catch(() => {})
  }

  useEffect(() => {
    if (localStorage.getItem('admin_ok') === '1') {
      setLoggedIn(true)
      loadData()
    }
  }, [])

  async function login(e) {
    e.preventDefault(); setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      localStorage.setItem('admin_ok', '1')
      setLoggedIn(true)
      loadData()
    } else {
      setError((await res.json()).error || 'Login gagal')
    }
  }

  function flash(msg) { setNotice(msg); setTimeout(() => setNotice(''), 4000) }

  /* ---------- CHORD CRUD ---------- */
  async function saveChord(e) {
    e.preventDefault(); setSaving(true)
    const isEdit = !!cForm.id
    const res = await fetch(isEdit ? `/api/chords/${cForm.id}` : '/api/chords', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cForm),
    })
    setSaving(false)
    if (!res.ok) return flash('❌ ' + ((await res.json()).error || 'Gagal menyimpan'))
    flash(isEdit ? `✅ Chord "${cForm.name}" diupdate!` : `✅ Chord "${cForm.name}" ditambahkan!`)
    setCForm(EMPTY_CHORD); loadData()
  }

  async function removeChord(id) {
    if (!confirm('Hapus chord ini?')) return
    const res = await fetch(`/api/chords/${id}`, { method: 'DELETE' })
    if (res.ok) { flash('🗑️ Chord dihapus'); loadData() }
  }

  /* ---------- SONG CRUD ---------- */
  async function saveSong(e) {
    e.preventDefault(); setSaving(true)
    const isEdit = !!sForm.id
    const res = await fetch(isEdit ? `/api/songs/${sForm.id}` : '/api/songs', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sForm),
    })
    setSaving(false)
    if (!res.ok) return flash('❌ ' + ((await res.json()).error || 'Gagal menyimpan'))
    flash(isEdit ? `✅ Lagu "${sForm.title}" diupdate!` : `✅ Lagu "${sForm.title}" diupload!`)
    setSForm(EMPTY_SONG); loadData()
  }

  async function removeSong(id) {
    if (!confirm('Hapus lagu ini?')) return
    const res = await fetch(`/api/songs/${id}`, { method: 'DELETE' })
    if (res.ok) { flash('🗑️ Lagu dihapus'); loadData() }
  }

  function logout() {
    localStorage.removeItem('admin_ok')
    document.cookie = 'admin_token=; Max-Age=0; Path=/'
    setLoggedIn(false); setPassword('')
  }

  /* ================= LOGIN VIEW ================= */
  if (!loggedIn) {
    return (
      <Layout title="Admin Login | Guitar Chord Hub">
        <div className="comic-panel max-w-md mx-auto mt-10 rotate-1">
          <h1 className="font-comic text-4xl text-center">🔐 ADMIN ONLY!</h1>
          <p className="text-center text-sm opacity-70 mt-1 mb-5">Masuk untuk mengelola chord & lagu</p>
          <form onSubmit={login} className="space-y-3">
            <input type="password" className="input-comic" placeholder="Password admin"
                   value={password} onChange={e => setPassword(e.target.value)} required />
            {error && <p className="text-pop-red font-bold">💥 {error}</p>}
            <button className="btn-comic bg-pop-blue text-white w-full py-3" type="submit">MASUK!</button>
          </form>
        </div>
      </Layout>
    )
  }

  /* ================= DASHBOARD ================= */
  return (
    <Layout title="Admin Panel | Guitar Chord Hub">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h1 className="font-comic text-4xl">🦸 Admin Panel</h1>
        <button onClick={logout} className="btn-comic bg-pop-red text-white text-sm">Logout</button>
      </div>

      {/* Tab */}
      <div className="flex gap-3 mb-6">
        <button onClick={() => setTab('lagu')}
                className={`btn-comic ${tab === 'lagu' ? 'bg-pop-purple text-white' : 'bg-white dark:bg-[#232332]'}`}>
          🎵 Lagu ({songs.length})
        </button>
        <button onClick={() => setTab('chord')}
                className={`btn-comic ${tab === 'chord' ? 'bg-pop-blue text-white' : 'bg-white dark:bg-[#232332]'}`}>
          🎸 Chord ({chords.length})
        </button>
      </div>

      {notice && <div className="comic-panel bg-pop-yellow dark:bg-pop-yellow text-ink mb-4 !py-3 font-bold">{notice}</div>}

      {/* ================= TAB LAGU ================= */}
      {tab === 'lagu' && (
        <>
          <form onSubmit={saveSong} className="comic-panel mb-8 grid sm:grid-cols-2 gap-4">
            <h2 className="font-comic text-2xl sm:col-span-2">{sForm.id ? '✏️ Edit Lagu' : '➕ Upload Lagu Baru'}</h2>
            <input className="input-comic" placeholder="Judul lagu" value={sForm.title}
                   onChange={e => setSForm({ ...sForm, title: e.target.value })} required />
            <input className="input-comic" placeholder="Penyanyi / band" value={sForm.artist}
                   onChange={e => setSForm({ ...sForm, artist: e.target.value })} />

            <select className="input-comic" value={sForm.difficulty} onChange={e => setSForm({ ...sForm, difficulty: e.target.value })}>
              <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
            </select>
            <input className="input-comic" placeholder="Deskripsi singkat (opsional)" value={sForm.description}
                   onChange={e => setSForm({ ...sForm, description: e.target.value })} />

            <div className="sm:col-span-2">
              <label className="text-sm font-bold block mb-1 opacity-70">
                Lirik + chord — tulis chord dalam kurung siku. Contoh:
                <code className="ml-1 bg-black/5 dark:bg-white/10 px-1 rounded">[C]Halo [G]dunia...</code>
              </label>
              <textarea className="input-comic font-mono text-sm min-h-[220px]" placeholder={'[Intro]\n[C] [G] [Am] [F]\n\n[Verse]\n[C]Lirik pertama di sini\n[G]lirik kedua...'}
                        value={sForm.content}
                        onChange={e => setSForm({ ...sForm, content: e.target.value })} required />
            </div>

            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-comic bg-pop-green text-ink disabled:opacity-50">
                {saving ? 'Menyimpan...' : sForm.id ? '💾 Update' : '🚀 Upload!'}
              </button>
              {sForm.id && (
                <button type="button" onClick={() => setSForm(EMPTY_SONG)} className="btn-comic bg-white dark:bg-[#16161e]">Batal</button>
              )}
            </div>
          </form>

          <h2 className="font-comic text-3xl mb-4">📋 Daftar Lagu</h2>
          <div className="space-y-3">
            {songs.map(s => (
              <div key={s.id} className="comic-card p-4 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <span className="font-comic text-2xl">🎶 {s.title}</span>
                  <span className="ml-3 opacity-60 font-bold">{s.artist}</span>
                </div>
                <div className="flex gap-2">
                  <a href={`/songs/${s.id}`} target="_blank" rel="noreferrer"
                     className="btn-comic bg-pop-green text-ink text-sm px-3 py-1">👁️ Lihat</a>
                  <button onClick={() => { setSForm({ id: s.id, title: s.title, artist: s.artist || '', difficulty: s.difficulty || 'Beginner', description: s.description || '', content: s.content }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                          className="btn-comic bg-pop-blue text-white text-sm px-3 py-1">✏️ Edit</button>
                  <button onClick={() => removeSong(s.id)}
                          className="btn-comic bg-pop-red text-white text-sm px-3 py-1">🗑️ Hapus</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ================= TAB CHORD ================= */}
      {tab === 'chord' && (
        <>
          <form onSubmit={saveChord} className="comic-panel mb-8 grid sm:grid-cols-2 gap-4">
            <h2 className="font-comic text-2xl sm:col-span-2">{cForm.id ? '✏️ Edit Chord' : '➕ Upload Chord Baru'}</h2>
            <input className="input-comic" placeholder="Nama chord (mis. B Minor)" value={cForm.name}
                   onChange={e => setCForm({ ...cForm, name: e.target.value })} required />
            <input className="input-comic font-mono" placeholder="Fingering (mis. x24432)" value={cForm.fingering}
                   onChange={e => setCForm({ ...cForm, fingering: e.target.value })} required />
            <select className="input-comic" value={cForm.difficulty} onChange={e => setCForm({ ...cForm, difficulty: e.target.value })}>
              <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
            </select>
            <input className="input-comic" placeholder="Deskripsi singkat (opsional)" value={cForm.description}
                   onChange={e => setCForm({ ...cForm, description: e.target.value })} />
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-comic bg-pop-green text-ink disabled:opacity-50">
                {saving ? 'Menyimpan...' : cForm.id ? '💾 Update' : '🚀 Upload!'}
              </button>
              {cForm.id && (
                <button type="button" onClick={() => setCForm(EMPTY_CHORD)} className="btn-comic bg-white dark:bg-[#16161e]">Batal</button>
              )}
            </div>
          </form>

          <h2 className="font-comic text-3xl mb-4">📋 Daftar Chord</h2>
          <div className="space-y-3">
            {chords.map(c => (
              <div key={c.id} className="comic-card p-4 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <span className="font-comic text-2xl">{c.name}</span>
                  <code className="ml-3 font-mono opacity-60">{c.fingering}</code>
                  <span className="ml-3 text-xs border-2 border-black rounded px-1.5 bg-pop-yellow text-ink">{c.difficulty}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setCForm({ ...c }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                          className="btn-comic bg-pop-blue text-white text-sm px-3 py-1">✏️ Edit</button>
                  <button onClick={() => removeChord(c.id)}
                          className="btn-comic bg-pop-red text-white text-sm px-3 py-1">🗑️ Hapus</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  )
}