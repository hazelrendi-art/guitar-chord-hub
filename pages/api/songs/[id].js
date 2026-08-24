import { getAllSongs, saveAllSongs } from '../../../lib/store'
import { isAdmin } from '../../../lib/auth'

export default async function handler(req, res) {
  const { id } = req.query
  const songs = await getAllSongs()
  const idx = songs.findIndex(s => s.id === id)

  if (req.method === 'GET') {
    if (idx === -1) return res.status(404).json({ error: 'Lagu tidak ditemukan.' })
    return res.status(200).json(songs[idx])
  }

  if (!isAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized. Login dulu sebagai admin.' })
  }

  if (req.method === 'PUT' && idx !== -1) {
    const { title, artist, content, difficulty, description } = req.body || {}
    if (title) songs[idx].title = String(title)
    if (artist !== undefined) songs[idx].artist = String(artist)
    if (content) songs[idx].content = String(content)
    if (difficulty) songs[idx].difficulty = difficulty
    if (description !== undefined) songs[idx].description = String(description)
    try {
      await saveAllSongs(songs)
      return res.status(200).json({ song: songs[idx] })
    } catch (e) {
      return res.status(500).json({ error: 'Gagal menyimpan: ' + e.message })
    }
  }

  if (req.method === 'DELETE') {
    if (idx === -1) return res.status(404).json({ error: 'Lagu tidak ditemukan.' })
    const [removed] = songs.splice(idx, 1)
    try {
      await saveAllSongs(songs)
      return res.status(200).json({ deleted: removed.id })
    } catch (e) {
      return res.status(500).json({ error: 'Gagal menyimpan: ' + e.message })
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}