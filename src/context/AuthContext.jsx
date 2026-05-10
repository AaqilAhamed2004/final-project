import React, { createContext, useState } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const login = (user) => {
    setCurrentUser(user);
    setUserRole(user.role);
  };

  const logout = () => {
    setCurrentUser(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
