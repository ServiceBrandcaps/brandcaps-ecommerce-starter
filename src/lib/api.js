export const API_BASE = process.env.NEXT_PUBLIC_API_BASE

export async function apiGet(path, params = {}) {
  const qs = new URLSearchParams(params).toString()
  const url = `${API_BASE}${path}${qs ? `?${qs}` : ''}`
  const res = await fetch(url, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}
