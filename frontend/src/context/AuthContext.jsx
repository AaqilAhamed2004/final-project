// The function of this file is to provide the AuthContext and AuthProvider for the application.
import { createContext, useContext, useState, useEffect } from 'react'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('aura_token'))
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('aura_user')
    try {
      return stored ? JSON.parse(stored) : null
    } catch (e) {
      console.error("Failed to parse aura_user from localStorage:", e)
      return null
    }
  })

  // On mount: validate stored token against the backend. If invalid or expired, force logout.
  useEffect(() => {
    const storedToken = localStorage.getItem('aura_token')
    if (!storedToken) return

    fetch(`${BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${storedToken}` }
    })
      .then(res => {
        if (!res.ok) {
          // Token is invalid or expired — clear everything
          localStorage.removeItem('aura_token')
          localStorage.removeItem('aura_user')
          setToken(null)
          setUser(null)
        }
      })
      .catch(() => {
        // Backend unreachable — keep local state so app still works offline
      })
  }, [])

  // Listen for aura_logout events dispatched by the API layer on 401, and cross-tab storage changes
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
            try {
              setUser(JSON.parse(storedUser))
            } catch (err) {
              setUser(null)
            }
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

  const login = (tokenValue, userData) => {
    localStorage.setItem('aura_token', tokenValue)
    localStorage.setItem('aura_user', JSON.stringify(userData))
    setToken(tokenValue)
    setUser(userData)
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