import { getAllChords, saveAllChords } from '../../../lib/store'
import { isAdmin } from '../../../lib/auth'

export default async function handler(req, res) {
  const { id } = req.query
  const chords = await getAllChords()
  const idx = chords.findIndex(c => c.id === id)

  if (req.method === 'GET') {
    if (idx === -1) return res.status(404).json({ error: 'Chord tidak ditemukan.' })
    return res.status(200).json(chords[idx])
  }

  if (!isAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized. Login dulu sebagai admin.' })
  }

  if (req.method === 'PUT' && idx !== -1) {
    const { name, fingering, difficulty, description } = req.body || {}
    if (name) chords[idx].name = String(name)
    if (fingering) chords[idx].fingering = String(fingering)
    if (difficulty) chords[idx].difficulty = difficulty
    if (description !== undefined) chords[idx].description = String(description)
    try {
      await saveAllChords(chords)
      return res.status(200).json({ chord: chords[idx] })
    } catch (e) {
      return res.status(500).json({ error: 'Gagal menyimpan: ' + e.message })
    }
  }

  if (req.method === 'DELETE') {
    if (idx === -1) return res.status(404).json({ error: 'Chord tidak ditemukan.' })
    const [removed] = chords.splice(idx, 1)
    try {
      await saveAllChords(chords)
      return res.status(200).json({ deleted: removed.id })
    } catch (e) {
      return res.status(500).json({ error: 'Gagal menyimpan: ' + e.message })
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}