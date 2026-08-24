import { getAllChords, saveAllChords, slugify } from '../../../lib/store'
import { isAdmin } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(await getAllChords())
  }

  if (req.method === 'POST') {
    if (!isAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized. Login dulu sebagai admin.' })
    }
    const { name, fingering, difficulty, description } = req.body || {}
    if (!name || !fingering) {
      return res.status(400).json({ error: 'Field "name" dan "fingering" wajib diisi.' })
    }

    const chords = await getAllChords()
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
      await saveAllChords(chords)
      return res.status(201).json({ chord })
    } catch (e) {
      return res.status(500).json({ error: 'Gagal menyimpan: ' + e.message })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}