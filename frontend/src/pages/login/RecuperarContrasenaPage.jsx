import React, { useState } from 'react';
import styles from './login.module.css';
import axios from 'axios';

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');

  const handleEnviarCodigo = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    try {
      // Aquí deberías llamar a tu API para enviar el código por correo
      await axios.post('/api/recuperar-contrasena/', { email });
      setCodigoEnviado(true);
      setMensaje('Código enviado a tu correo electrónico');
    } catch (err) {
      setError('No se pudo enviar el código. Verifica el correo.');
    }
  };

  const handleCambiarContrasena = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    try {
      // Aquí deberías llamar a tu API para cambiar la contraseña con el código
      await axios.post('/api/cambiar-contrasena/', { email, codigo, nuevaContrasena });
      setMensaje('Contraseña cambiada exitosamente');
    } catch (err) {
      setError('No se pudo cambiar la contraseña. Verifica el código.');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.loginCard}>
        <h2>Recuperar contraseña</h2>
        {!codigoEnviado ? (
          <form onSubmit={handleEnviarCodigo} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
                placeholder="Ingrese su correo"
              />
            </div>
            <button type="submit" className={styles.button}>
              Enviar código
            </button>
          </form>
        ) : (
          <form onSubmit={handleCambiarContrasena} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Código recibido</label>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                required
                className={styles.input}
                placeholder="Ingrese el código"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Nueva contraseña</label>
              <input
                type="password"
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
                required
                className={styles.input}
                placeholder="Ingrese la nueva contraseña"
              />
            </div>
            <button type="submit" className={styles.button}>
              Cambiar contraseña
            </button>
          </form>
        )}
        {mensaje && <div className={styles.success}>{mensaje}</div>}
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
}
