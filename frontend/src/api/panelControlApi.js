const BASE_URL = "http://localhost:8000/api";

// ------------------- USUARIOS -------------------
export const getUsuarios = async () => {
  const res = await fetch(`${BASE_URL}/authuser/`);
  return await res.json();
};

export const createUsuario = async (data) => {
  const payload = {
    username: data.username,
    password: data.password,
    first_name: data.first_name || "",
    last_name: data.last_name || "",
    email: data.email || "",
    is_staff: false,
    is_superuser: false,
    is_active: true,
  };
  const res = await fetch(`${BASE_URL}/authuser/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return await res.json();
};

export const updateUsuario = async (id, data) => {
  const payload = {
    first_name: data.first_name || "",
    last_name: data.last_name || "",
    email: data.email || "",
    is_staff: false,
    is_superuser: false,
    is_active: true,
  };
  const res = await fetch(`${BASE_URL}/authuser/${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return await res.json();
};

export const eliminarUsuario = async (id) => {
  const res = await fetch(`${BASE_URL}/authuser/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eliminado: true }),
  });
  return await res.json();
};

// ------------------- EMPLEADOS -------------------
export const getEmpleados = async () => {
  const res = await fetch(`${BASE_URL}/empleados/`);
  return await res.json();
};

export const createEmpleado = async (data) => {
  const res = await fetch(`${BASE_URL}/empleados/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
};

export const updateEmpleado = async (id, data) => {
  const res = await fetch(`${BASE_URL}/empleados/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
};

export const eliminarEmpleado = async (id) => {
  const res = await fetch(`${BASE_URL}/empleados/${id}/`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  return await res.json();
};

// ------------------- OBRAS SOCIALES -------------------
export const getObrasSociales = async () => {
  const res = await fetch(`${BASE_URL}/obras_sociales/`);
  return await res.json();
};

export const createObraSocial = async (data) => {
  const res = await fetch(`${BASE_URL}/obras_sociales/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
};

export const updateObraSocial = async (id, data) => {
  const res = await fetch(`${BASE_URL}/obras_sociales/${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
};

export const eliminarObraSocial = async (id) => {
  const res = await fetch(`${BASE_URL}/obras_sociales/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eliminado: true }),
  });
  return await res.json();
};

// ------------------- MÉTODOS DE COBRO -------------------
export const getMetodos = async () => {
  const res = await fetch(`${BASE_URL}/metodos_cobro/`);
  return await res.json();
};

export const createMetodo = async (data) => {
  const res = await fetch(`${BASE_URL}/metodos_cobro/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
};

export const updateMetodo = async (id, data) => {
  const res = await fetch(`${BASE_URL}/metodos_cobro/${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
};

export const eliminarMetodo = async (id) => {
  const res = await fetch(`${BASE_URL}/metodos_cobro/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eliminado: true }),
  });
  return await res.json();
};
// ------------------- TRATAMIENTOS -------------------
export const getTratamientos = async () => {
  const res = await fetch(`${BASE_URL}/tratamientos/`);
  return await res.json();
};

export const createTratamiento = async (data) => {
  const payload = {
    nombre_tratamiento: data.nombre_tratamiento,
    codigo: data.codigo,
    importe: parseFloat(data.importe),
    eliminado: 0,
  };
  const res = await fetch(`${BASE_URL}/tratamientos/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return await res.json();
};

export const updateTratamiento = async (id, data) => {
  const payload = {
    nombre_tratamiento: data.nombre_tratamiento,
    codigo: data.codigo,
    importe: parseFloat(data.importe),
  };
  const res = await fetch(`${BASE_URL}/tratamientos/${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return await res.json();
};

export const eliminarTratamiento = async (id) => {
  const res = await fetch(`${BASE_URL}/tratamientos/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eliminado: true }),
  });
  return await res.json();
};
