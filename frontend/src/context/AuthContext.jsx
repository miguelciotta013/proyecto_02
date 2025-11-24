import React, { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(localStorage.getItem('access_token'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refresh_token'));
  const [username, setUsername] = useState(localStorage.getItem('username'));

  useEffect(() => {
    if (accessToken) localStorage.setItem('access_token', accessToken);
    else localStorage.removeItem('access_token');
  }, [accessToken]);

  useEffect(() => {
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
    else localStorage.removeItem('refresh_token');
  }, [refreshToken]);

  useEffect(() => {
    if (username) localStorage.setItem('username', username);
    else localStorage.removeItem('username');
  }, [username]);

  const login = ({ access, refresh, username: uname }) => {
    // Guardar inmediatamente en localStorage para evitar race condition
    if (access) localStorage.setItem('access_token', access);
    if (refresh) localStorage.setItem('refresh_token', refresh);
    if (uname) localStorage.setItem('username', uname);
    setAccessToken(access);
    setRefreshToken(refresh);
    if (uname) setUsername(uname);
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUsername(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ accessToken, refreshToken, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
