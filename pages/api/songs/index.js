import { getAllSongs, saveAllSongs, slugify } from '../../../lib/store'
import { isAdmin } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(await getAllSongs())
  }

  if (req.method === 'POST') {
    if (!isAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized. Login dulu sebagai admin.' })
    }
    const { title, artist, content, difficulty, description } = req.body || {}
    if (!title || !content) {
      return res.status(400).json({ error: 'Field "title" dan "content" wajib diisi.' })
    }

    const songs = await getAllSongs()
    let id = slugify(title)
    while (songs.some(s => s.id === id)) id = `${id}-${Date.now() % 10000}`

    const song = {
      id,
      title: String(title),
      artist: artist || 'Unknown',
      difficulty: difficulty || 'Beginner',
      description: description || '',
      content: String(content),
    }
    songs.push(song)

    try {
      await saveAllSongs(songs)
      return res.status(201).json({ song })
    } catch (e) {
      return res.status(500).json({ error: 'Gagal menyimpan: ' + e.message })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}