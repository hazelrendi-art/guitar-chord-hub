import { checkPassword, generateToken } from '../../../lib/auth'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  if (!checkPassword(req.body?.password)) {
    return res.status(401).json({ error: 'Password admin salah!' })
  }

  res.setHeader('Set-Cookie',
    `admin_token=${generateToken()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`)
  return res.status(200).json({ ok: true })
}