import { supabase } from './supabase'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Not authenticated')
  return { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' }
}

async function request(method, path, body) {
  const headers = await getAuthHeaders()
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json()
  if (!res.ok) {
    const msg = json?.error?.message || json?.detail || `HTTP ${res.status}`
    throw Object.assign(new Error(msg), { status: res.status, code: json?.error?.code })
  }
  return json.data
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  delete: (path) => request('DELETE', path),
}
