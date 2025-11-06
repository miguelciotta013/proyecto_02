import React, { useState, useEffect } from "react";
import { createUsuario, updateUsuario } from "../../api/panelControlApi";

function FormUsuario({ usuario, onClose, fetchUsuarios, usuariosExistentes }) {
  const generarUsername = () => {
    if (usuario?.username) return usuario.username;
    const ultimoNumero = usuariosExistentes
      .map(u => parseInt(u.username.replace("user", ""), 10))
      .filter(n => !isNaN(n))
      .sort((a, b) => b - a)[0] || 0;
    const nuevoNumero = String(ultimoNumero + 1).padStart(3, "0");
    return `user${nuevoNumero}`;
  };

  const [form, setForm] = useState({
    username: generarUsername(),
    password: "",
    first_name: usuario?.first_name || "",
    last_name: usuario?.last_name || "",
    email: usuario?.email || "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const validarCampos = () => {
    if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{1,50}$/.test(form.first_name)) {
      setError("El nombre solo puede contener letras y tener menos de 50 caracteres.");
      return false;
    }
    if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{1,50}$/.test(form.last_name)) {
      setError("El apellido solo puede contener letras y tener menos de 50 caracteres.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError("El email no tiene un formato válido.");
      return false;
    }
    if (!usuario?.id && form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarCampos()) return;

    try {
      const payload = {
        username: form.username,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        ...(form.password ? { password: form.password } : {}),
      };

      if (usuario?.id) {
        await updateUsuario(usuario.id, payload);
      } else {
        await createUsuario(payload);
      }

      fetchUsuarios();
      onClose();
    } catch (err) {
      console.error("Error al crear/editar usuario:", err);
      setError("Ocurrió un error al guardar el usuario.");
    }
  };

  return (
    <div className="fu-overlay">
      <div className="fu-form animate">
        <div className="fu-header">
          <h3>{usuario ? "Editar Usuario" : "Agregar Usuario"}</h3>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Usuario</label>
          <input
            name="username"
            value={form.username}
            readOnly
            className="fu-readonly"
          />

          {!usuario?.id && (
            <>
              <label>Contraseña</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Contraseña"
                required
              />
            </>
          )}

          <label>Nombre</label>
          <input
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            placeholder="Nombre"
            required
          />

          <label>Apellido</label>
          <input
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            placeholder="Apellido"
            required
          />

          <label>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Correo electrónico"
            required
          />

          {error && <p className="fu-error">{error}</p>}

          <div className="fu-buttons">
            <button type="submit" className="fu-save">Guardar</button>
            <button type="button" className="fu-cancel" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .fu-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          font-family: 'Segoe UI', Roboto, Arial, sans-serif;
          animation: fadeIn 0.3s ease;
        }

        .fu-form {
          width: 400px;
          background: #fff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          transform: scale(0.9);
          opacity: 0;
          animation: zoomIn 0.3s ease forwards;
        }

        .fu-header {
          background: #2e7d9d;
          color: white;
          text-align: center;
          padding: 15px;
          font-size: 20px;
          font-weight: 600;
        }

        form {
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        label {
          font-weight: 600;
          color: #1f2937;
          font-size: 14px;
        }

        input {
          width: 100%;
          padding: 9px;
          border-radius: 8px;
          border: 1px solid #ccc;
          font-size: 15px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        input:focus {
          border-color: #2e7d9d;
          box-shadow: 0 0 4px rgba(46, 125, 157, 0.4);
          outline: none;
        }

        .fu-readonly {
          background-color: #f3f4f6;
          color: #6b7280;
          cursor: not-allowed;
        }

        .fu-error {
          color: #dc2626;
          font-weight: 500;
          margin-top: 4px;
          text-align: center;
        }

        .fu-buttons {
          display: flex;
          justify-content: space-between;
          margin-top: 12px;
        }

        .fu-save {
          background: #4caf50;
          color: white;
          border: none;
          padding: 9px 14px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }

        .fu-save:hover {
          background: #246377;
          transform: scale(1.03);
        }

        .fu-cancel {
          background: #9ca3af;
          color: white;
          border: none;
          padding: 9px 14px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }

        .fu-cancel:hover {
          background: #6b7280;
          transform: scale(1.03);
        }

        /* Animaciones */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes zoomIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default FormUsuario;
