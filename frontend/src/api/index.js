const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * Core fetch helper.
 * Automatically attaches the JWT token from localStorage to every request.
 * Throws an error if the response is not OK.
 */
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('aura_token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers })
  const data = await res.json()
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('aura_token')
      localStorage.removeItem('aura_user')
      window.location.href = '/login'
    }
    throw new Error(data.detail || 'An API error occurred')
  }
  return data
}

// ── Authentication ──────────────────────────────────────────────────────
export const loginUser    = (email, password) =>
  apiFetch('/api/auth/login',    { method: 'POST', body: JSON.stringify({ email, password }) })

export const registerUser = (data) =>
  apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(data) })

export const getMe = () => apiFetch('/api/auth/me')

// ── Requests ────────────────────────────────────────────────────────────
export const createRequest  = (data)   => apiFetch('/api/requests', { method: 'POST', body: JSON.stringify(data) })
export const getAllRequests  = ()       => apiFetch('/api/requests')
export const getMyRequests  = ()       => apiFetch('/api/requests/my')
export const updateStatus   = (id, s)  => apiFetch(`/api/requests/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: s }) })

// ── Prolog Logic ────────────────────────────────────────────────────────
export const triggerAnalysis = (id) => apiFetch(`/api/logic/analyze/${id}`, { method: 'POST' })
export const getAnalysis     = (id) => apiFetch(`/api/logic/analysis/${id}`)

// ── Inventory ───────────────────────────────────────────────────────────
export const getInventory       = ()       => apiFetch('/api/inventory')
export const addInventoryItem   = (data)   => apiFetch('/api/inventory', { method: 'POST', body: JSON.stringify(data) })
export const updateInventoryItem = (id, d) => apiFetch(`/api/inventory/${id}`, { method: 'PATCH', body: JSON.stringify(d) })
export const deleteInventoryItem = (id) => apiFetch(`/api/inventory/${id}`, { method: 'DELETE' })

// ── Public Board ────────────────────────────────────────────────────────
export const getPublicBoard = ()          => apiFetch('/api/public/board')
export const getPublicStats = ()          => apiFetch('/api/public/stats')
export const bookRequest    = (id, notes) => apiFetch('/api/public/book', { method: 'POST', body: JSON.stringify({ request_id: id, notes }) })