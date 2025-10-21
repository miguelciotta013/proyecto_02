import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import loginApi from '../../api/loginApi';
import { AuthContext } from '../../context/AuthContext';
import styles from './login.module.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
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
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.loginCard}>
        <div className={styles.logoContainer}>
          <img src="/logo.png" alt="Consultorio Odontológico" className={styles.logo} />
          <h2 className={styles.title}>Consultorio Odontológico GF</h2>
          <p className={styles.subtitle}>Acceso para personal autorizado</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={styles.input}
              placeholder="Ingrese su usuario"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
              placeholder="Ingrese su contraseña"
            />
          </div>
          <button type="submit" className={styles.button}>
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
