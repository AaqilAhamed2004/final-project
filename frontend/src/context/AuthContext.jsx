// The function of thi
import { createContext, useContext, useState } from 'react'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('aura_token'))
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('aura_user')
    return stored ? JSON.parse(stored) : null
  })

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