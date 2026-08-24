import fs from 'fs'
import path from 'path'

export function getAllChords() {
  const filePath = path.join(process.cwd(), 'data', 'chords.json')
  const jsonData = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(jsonData)
}

export function getChordById(id) {
  const chords = getAllChords()
  return chords.find(chord => chord.id === id) || null
}