/**
 * @fileoverview AURA — AuthContext
 *
 * Provides authentication state (token + user) to the entire application.
 * Handles:
 * - Token persistence via localStorage
 * - Spring Boot login response normalization
 * - Token validation against the backend on app mount
 * - Cross-tab logout synchronization via storage events
 * - Force logout on 401 (dispatched by the API layer)
 *
 * @import { User } from '../types/index.js'
 */
import { createContext, useContext, useState, useEffect } from 'react'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const AuthContext = createContext(null)

/**
 * Normalizes the user object from a Spring Boot login response.
 * Handles both old FastAPI field names and new Spring Boot field names.
 *
 * Spring Boot response (LoginResponseDto):
 *   { access_token, token_type, user: { id, email, full_name, role } }
 *
 * @param {Object} responseData - Raw login API response
 * @returns {{ token: string|null, user: User|null }}
 */
function normalizeLoginResponse(responseData) {
  // Extract token — Spring Boot uses 'access_token'
  const token = responseData.access_token || responseData.token || null

  // Extract user — Spring Boot nests it under 'user'
  const rawUser = responseData.user || responseData || null

  if (!token || !rawUser) return { token: null, user: null }

  // Normalize field names — Spring Boot now uses snake_case via Jackson,
  // so full_name is already in snake_case. Keep both for backward compatibility.
  const user = {
    id:        rawUser.id       || rawUser._id,
    email:     rawUser.email,
    full_name: rawUser.full_name,
    role:      rawUser.role,
    is_active: rawUser.is_active !== false, // default true if not set
  }

  return { token, user }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('aura_token'))
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('aura_user')
    try {
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  // ── Validate stored token on mount ────────────────────────────────────────
  // Calls /api/auth/me to confirm the token is still valid on the backend.
  // If not, clears local state to force re-login.
  useEffect(() => {
    const storedToken = localStorage.getItem('aura_token')
    if (!storedToken) return

    fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then((res) => {
        if (!res.ok) {
          // Token is invalid or expired — clear everything
          localStorage.removeItem('aura_token')
          localStorage.removeItem('aura_user')
          setToken(null)
          setUser(null)
        }
      })
      .catch(() => {
        // Backend unreachable — keep local state so the app still works offline
      })
  }, [])

  // ── Cross-tab logout + force logout on 401 ───────────────────────────────
  useEffect(() => {
    const handleForceLogout = () => {
      setToken(null)
      setUser(null)
    }

    const handleStorageChange = (e) => {
      if (e.key === 'aura_token') {
        if (!e.newValue) {
          setToken(null)
          setUser(null)
        } else {
          setToken(e.newValue)
          const storedUser = localStorage.getItem('aura_user')
          if (storedUser) {
            try { setUser(JSON.parse(storedUser)) } catch { setUser(null) }
          }
        }
      }
    }

    window.addEventListener('aura_logout', handleForceLogout)
    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('aura_logout', handleForceLogout)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // ── Login — accepts the raw Spring Boot API response ─────────────────────
  /**
   * Persist auth state after a successful login.
   * Accepts the raw Spring Boot LoginResponseDto and normalizes it internally.
   * @param {string|Object} tokenOrResponse - Either the JWT string or the full login response object
   * @param {User} [userData] - User object (only needed if tokenOrResponse is a plain token string)
   */
  const login = (tokenOrResponse, userData) => {
    let finalToken, finalUser

    // Support both call signatures:
    //   login(response)             ← new: pass the full API response
    //   login(token, user)          ← legacy: direct token + user objects
    if (typeof tokenOrResponse === 'object' && tokenOrResponse !== null && !userData) {
      const normalized = normalizeLoginResponse(tokenOrResponse)
      finalToken = normalized.token
      finalUser  = normalized.user
    } else {
      // Legacy path — token string + user object passed separately
      finalToken = tokenOrResponse
      finalUser  = userData
    }

    if (!finalToken || !finalUser) {
      console.error('[AuthContext] login() received invalid token or user data')
      return
    }

    localStorage.setItem('aura_token', finalToken)
    localStorage.setItem('aura_user', JSON.stringify(finalUser))
    setToken(finalToken)
    setUser(finalUser)
  }

  const logout = () => {
    localStorage.removeItem('aura_token')
    localStorage.removeItem('aura_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, currentUser: user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}