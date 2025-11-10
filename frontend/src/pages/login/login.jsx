// frontend/src/pages/login/login.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import loginApi from '../../api/loginApi';
import { AuthContext } from '../../context/AuthContext';
import styles from './login.module.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const data = await loginApi.login(username, password);
      if (data?.access) {
        login({ access: data.access, refresh: data.refresh });
        navigate('/');
      } else {
        setError(data?.error || 'Credenciales inválidas');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Error en el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.loginCard}>
        
        {/* Header con franja azul */}
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <div className={styles.logoCircle}>
              <span className={styles.logoIcon}>🦷</span>
            </div>
            <h1 className={styles.title}>Consultorio GF</h1>
          </div>
          <p className={styles.subtitle}>Sistema de Gestión Odontológica</p>
        </div>

        {/* Contenido del formulario */}
        <div className={styles.formContainer}>
          {error && (
            <div className={styles.errorAlert}>
              <span className={styles.errorIcon}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={styles.input}
                placeholder="Ingrese su usuario"
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
                placeholder="Ingrese su contraseña"
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className={styles.btnPrimary}
              disabled={loading}
            >
              {loading ? 'Ingresando...' : 'Ingresar al Sistema'}
            </button>

            <button 
              type="button" 
              className={styles.btnSecondary}
              onClick={() => navigate('/recuperar-contraseña')}
              disabled={loading}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.footerText}>Acceso exclusivo para personal autorizado</p>
          <p className={styles.footerCopy}>© 2025 Consultorio GF - Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  );
}