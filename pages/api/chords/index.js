import { readChords, writeChords, slugify, isPersistent } from '../../../lib/store'
import { isAdmin } from '../../../lib/auth'

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(readChords())
  }

  if (req.method === 'POST') {
    if (!isAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized. Login dulu sebagai admin.' })
    }
    const { name, fingering, difficulty, description } = req.body || {}
    if (!name || !fingering) {
      return res.status(400).json({ error: 'Field "name" dan "fingering" wajib diisi.' })
    }

    const chords = readChords()
    let id = slugify(name)
    while (chords.some(c => c.id === id)) id = `${id}-${Date.now() % 10000}`

    const chord = {
      id,
      name: String(name),
      fingering: String(fingering),
      difficulty: difficulty || 'Beginner',
      description: description || '',
    }
    chords.push(chord)

    try {
      writeChords(chords)
    } catch (e) {
      return res.status(500).json({ error: 'Gagal menyimpan: ' + e.message })
    }
    return res.status(201).json({ chord, persistent: isPersistent() })
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}