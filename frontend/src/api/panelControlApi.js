const BASE_URL = "http://localhost:8000/api/panel-control";

// ==================== USUARIOS ====================
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
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    ...(data.password ? { password: data.password } : {}),
  };
  const res = await fetch(`${BASE_URL}/authuser/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return await res.json();
};

export const toggleUsuarioActivo = async (id, activo) => {
  const res = await fetch(`${BASE_URL}/authuser/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_active: activo ? 1 : 0 }),
  });
  return await res.json();
};

// ==================== EMPLEADOS ====================
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

// ==================== OBRAS SOCIALES ====================
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
    body: JSON.stringify({ eliminado: 1 }),
  });
  return await res.json();
};

// ==================== MÉTODOS DE COBRO ====================
export const getMetodos = async () => {
  const res = await fetch(`${BASE_URL}/metodos_cobro/`);
  return await res.json();
};

export const createMetodo = async (data) => {
  const payload = {
    tipo_cobro: data.tipo_cobro,
    eliminado: 0,
  };
  const res = await fetch(`${BASE_URL}/metodos_cobro/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return await res.json();
};

export const updateMetodo = async (id, data) => {
  const payload = {
    tipo_cobro: data.tipo_cobro,
    eliminado: data.eliminado ? 1 : 0,
  };
  const res = await fetch(`${BASE_URL}/metodos_cobro/${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return await res.json();
};

export const eliminarMetodo = async (id) => {
  const res = await fetch(`${BASE_URL}/metodos_cobro/${id}/`, {
    method: "DELETE",
  });
  return await res.json().catch(() => ({}));
};

// ==================== TRATAMIENTOS ====================
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
  const res = await fetch(`${BASE_URL}/tratamientos/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
};

export const eliminarTratamiento = async (id) => {
  const res = await fetch(`${BASE_URL}/tratamientos/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eliminado: 1 }),
  });
  return await res.json();
};

// ---------- COBERTURAS ----------

export const getCoberturasPorObra = async (idObra) => {
  const response = await fetch(`/api/coberturas/?obra_social=${idObra}`);
  if (!response.ok) throw new Error("Error al obtener coberturas");
  return response.json();
};

export const updateCobertura = async (id, data) => {
  const res = await fetch(`${BASE_URL}/coberturas_os/${id}/`, {
    method: "PATCH",  // ✅ cambio aquí
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
};

export const agregarCobertura = async (data) => {
  const response = await fetch(`/api/coberturas/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Error al agregar cobertura");
  return response.json();
};

export const editarCobertura = async (id, data) => {
  const response = await fetch(`/api/coberturas/${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Error al editar cobertura");
  return response.json();
};

export const getCoberturas = async (obra_social_id) => {
  const res = await fetch(`${BASE_URL}/coberturas_os/?obra_social_id=${obra_social_id}`);
  return await res.json();
};

export const createCobertura = async (data) => {
  const res = await fetch(`${BASE_URL}/coberturas_os/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
};

export const eliminarCobertura = async (id) => {
  const res = await fetch(`${BASE_URL}/coberturas_os/${id}/`, {
    method: "DELETE",
  });
  return await res.json().catch(() => ({}));
};
