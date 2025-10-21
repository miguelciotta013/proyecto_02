import React, { useState } from "react";
import { createUsuario, updateUsuario } from "../../api/panelControlApi";

function FormUsuario({ usuario, onClose, fetchUsuarios, usuariosExistentes }) {
  const [form, setForm] = useState({
    username: usuario?.username || "",
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

  const validarUsername = (username) => {
    if (/\s/.test(username)) {
      setError("El username no puede contener espacios.");
      return false;
    }
    if (!/^user\d+$/.test(username)) {
      setError("El username debe ser 'user' seguido de un número.");
      return false;
    }
    const existe = usuariosExistentes.some(u => u.username === username && u.id !== usuario?.id);
    if (existe) {
      setError("El username ya existe.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarUsername(form.username)) return;

    try {
      if (usuario?.id) {
        await updateUsuario(usuario.id, form);
      } else {
        await createUsuario(form);
      }
      fetchUsuarios();
      onClose();
    } catch (err) {
      console.error("Error al crear/editar usuario:", err);
    }
  };

  return (
    <div className="fo-overlay">
      <div className="fo-form">
        <h3 className="fo-title">{usuario ? "Editar Usuario" : "Agregar Usuario"}</h3>
        <form onSubmit={handleSubmit}>
          <input name="username" value={form.username} onChange={handleChange} placeholder="Usuario" required />
          {!usuario?.id && <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Contraseña" required />}
          <input name="first_name" value={form.first_name} onChange={handleChange} placeholder="Nombre" />
          <input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Apellido" />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" />
          {error && <p style={{color: "red"}}>{error}</p>}
          <div className="fo-buttons">
            <button type="submit" className="fo-guardar">Guardar</button>
            <button type="button" className="fo-cancel" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>

      <style>{`
        .fo-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.34); display: flex; align-items: center; justify-content: center; z-index: 2000; }
        .fo-form { width: 400px; background: white; border-radius: 10px; padding: 20px; box-shadow: 0 8px 24px rgba(17,24,39,0.15); font-family: 'Segoe UI', Roboto, Arial, sans-serif; }
        .fo-title { text-align: center; color: #1751a3; margin-bottom: 14px; }
        input { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ccc; margin-bottom: 10px; }
        .fo-buttons { display: flex; justify-content: space-between; }
        .fo-guardar { background: #3b82f6; color: white; border: none; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-weight: 600; }
        .fo-cancel { background: #9ca3af; color: white; border: none; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-weight: 600; }
      `}</style>
    </div>
  );
}

export default FormUsuario;
