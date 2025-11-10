//frontend\src\utils\api.ts

export async function apiRequest(path: string, options: RequestInit = {}) {
  const base = import.meta.env.VITE_API_URL || ''
  const candidates = [
    `${base}/api${path.startsWith('/') ? path : `/${path}`}`,
    `${base}${path.startsWith('/') ? path : `/${path}`}`,
  ]

  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        return { success: false, status: res.status, error: json?.message || json || res.statusText }
      }
      return { success: true, data: json, ...json }
    } catch {
      // try next candidate
    }
  }

  return { success: false, error: 'Network error' }
}