import { useEffect, useState } from 'react'
import Layout from '../../components/layout'

const EMPTY = { id: null, name: '', fingering: '', difficulty: 'Beginner', description: '' }

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [chords, setChords] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')

  const loadChords = () =>
    fetch('/api/chords').then(r => r.json()).then(setChords).catch(() => {})

  useEffect(() => {
    if (localStorage.getItem('admin_ok') === '1') {
      setLoggedIn(true)
      loadChords()
    }
  }, [])

  async function login(e) {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      localStorage.setItem('admin_ok', '1')
      setLoggedIn(true)
      loadChords()
    } else {
      const data = await res.json()
      setError(data.error || 'Login gagal')
    }
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true); setNotice('')
    const isEdit = !!form.id
    const res = await fetch(isEdit ? `/api/chords/${form.id}` : '/api/chords', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {
      setNotice('❌ ' + (data.error || 'Gagal menyimpan'))
      return
    }
    setNotice(isEdit ? '✅ Chord diupdate!' : `✅ Chord "${form.name}" ditambahkan!`)
    setForm(EMPTY)
    loadChords()
  }

  async function remove(id) {
    if (!confirm('Hapus chord ini?')) return
    const res = await fetch(`/api/chords/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setNotice('🗑️ Chord dihapus')
      loadChords()
    }
  }

  function edit(chord) {
    setForm({ ...chord })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function logout() {
    localStorage.removeItem('admin_ok')
    document.cookie = 'admin_token=; Max-Age=0; Path=/'
    setLoggedIn(false)
    setPassword('')
  }

  /* ---------- LOGIN VIEW ---------- */
  if (!loggedIn) {
    return (
      <Layout title="Admin Login | Guitar Chord Hub">
        <div className="comic-panel max-w-md mx-auto mt-10 rotate-1">
          <h1 className="font-comic text-4xl text-center">🔐 ADMIN ONLY!</h1>
          <p className="text-center text-sm opacity-70 mt-1 mb-5">Masuk untuk mengelola chord</p>
          <form onSubmit={login} className="space-y-3">
            <input
              type="password"
              className="input-comic"
              placeholder="Password admin"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-pop-red font-bold">💥 {error}</p>}
            <button className="btn-comic bg-pop-blue text-white w-full py-3" type="submit">
              MASUK!
            </button>
          </form>
        </div>
      </Layout>
    )
  }

  /* ---------- DASHBOARD ---------- */
  return (
    <Layout title="Admin Panel | Guitar Chord Hub">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
        <h1 className="font-comic text-4xl">🦸 Admin Panel</h1>
        <button onClick={logout} className="btn-comic bg-pop-red text-white text-sm">Logout</button>
      </div>

      {notice && <div className="comic-panel bg-pop-yellow dark:bg-pop-yellow text-ink mb-4 !py-3 font-bold">{notice}</div>}

      {/* Form tambah/edit */}
      <form onSubmit={save} className="comic-panel mb-8 grid sm:grid-cols-2 gap-4">
        <h2 className="font-comic text-2xl sm:col-span-2">{form.id ? '✏️ Edit Chord' : '➕ Upload Chord Baru'}</h2>
        <input className="input-comic" placeholder="Nama chord (mis. B Minor)" value={form.name}
               onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input className="input-comic font-mono" placeholder="Fingering (mis. x24432)" value={form.fingering}
               onChange={e => setForm({ ...form, fingering: e.target.value })} required />
        <select className="input-comic" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
        <input className="input-comic" placeholder="Deskripsi singkat (opsional)" value={form.description}
               onChange={e => setForm({ ...form, description: e.target.value })} />
        <div className="sm:col-span-2 flex gap-3">
          <button type="submit" disabled={saving} className="btn-comic bg-pop-green text-ink disabled:opacity-50">
            {saving ? 'Menyimpan...' : form.id ? '💾 Update' : '🚀 Upload!'}
          </button>
          {form.id && (
            <button type="button" onClick={() => setForm(EMPTY)} className="btn-comic bg-white dark:bg-[#16161e]">
              Batal
            </button>
          )}
        </div>
      </form>

      {/* Daftar chord */}
      <h2 className="font-comic text-3xl mb-4">📋 Daftar Chord ({chords.length})</h2>
      <div className="space-y-3">
        {chords.map(c => (
          <div key={c.id} className="comic-card p-4 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <span className="font-comic text-2xl">{c.name}</span>
              <code className="ml-3 font-mono opacity-60">{c.fingering}</code>
              <span className="ml-3 text-xs border-2 border-black rounded px-1.5 bg-pop-yellow text-ink">{c.difficulty}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => edit(c)} className="btn-comic bg-pop-blue text-white text-sm px-3 py-1">✏️ Edit</button>
              <button onClick={() => remove(c.id)} className="btn-comic bg-pop-red text-white text-sm px-3 py-1">🗑️ Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}