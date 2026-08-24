import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  if (req.method === 'GET') {
    const filePath = path.join(process.cwd(), 'data', 'chords.json')
    const jsonData = fs.readFileSync(filePath, 'utf8')
    const chords = JSON.parse(jsonData)
    res.status(200).json(chords)
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}