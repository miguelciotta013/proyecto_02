import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import apiClient from '../../api/axiosConfig';

export default function RequireAuth({ children }) {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
  const token = localStorage.getItem('access_token');
  setAuthenticated(!!token); // Si hay token, lo damos por válido (aunque puede estar expirado)
  setChecking(false);
 }, []);




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
        if (res.data?.valid) {
          setAuthenticated(true);
          setError(null);
        } else {
          setAuthenticated(false);
        }
      } catch (err) {
        console.error(err);
        setError('No se pudo verificar la sesión. Intenta nuevamente.');
        setAuthenticated(false);
      } finally {
        setChecking(false);
      }
    };

    verify();
  }, [location.pathname]);

  if (checking) {
    return (
      <div style={{
        position: 'fixed',
        top: 0, left: 0, width: '100vw', height: '100vh',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
        fontFamily: 'Poppins, sans-serif', flexDirection: 'column', gap: 20
      }}>
        <div style={{
          border: '6px solid #f3f3f3',
          borderTop: '6px solid #1976d2',
          borderRadius: '50%',
          width: 80,
          height: 80,
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: '#fff', fontSize: 18 }}>Verificando sesión...</p>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        position: 'fixed',
        top: 0, left: 0, width: '100vw', height: '100vh',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
        fontFamily: 'Poppins, sans-serif'
      }}>
        <div style={{
          backgroundColor: '#fff',
          padding: '30px 40px',
          borderRadius: 16,
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          maxWidth: 400,
          textAlign: 'center',
          color: 'red',
          fontWeight: 600
        }}>
          {error}
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
