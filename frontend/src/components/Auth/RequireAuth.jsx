import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import apiClient from '../../api/axiosConfig';

export default function RequireAuth({ children }) {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setAuthenticated(false);
        setChecking(false);
        return;
      }
      try {
        const res = await apiClient.post('/auth/verify/', { token });
        if (res.data?.valid) setAuthenticated(true);
        else setAuthenticated(false);
      } catch (err) {
        setAuthenticated(false);
      } finally {
        setChecking(false);
      }
    };
    verify();
  }, [location.pathname]);

  if (checking) return <div>Verificando sesión...</div>;
  if (!authenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}
