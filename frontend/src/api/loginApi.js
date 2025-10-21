import apiClient from './axiosConfig';

const authEndpoint = '/auth/'; // axiosConfig usa baseURL /api

async function login(username, password) {
	const payload = { username, password };
	const res = await apiClient.post(authEndpoint, payload);
	// Respuesta esperada: { success, refresh, access, ... }
	if (res.data?.access) {
		localStorage.setItem('access_token', res.data.access);
		localStorage.setItem('refresh_token', res.data.refresh);
	}
	return res.data;
}

async function logout() {
	const refresh = localStorage.getItem('refresh_token');
	try {
		if (refresh) {
			// Hacemos la petición con fetch directamente para evitar los interceptores de axios
			// (si el access token está expirado el interceptor podría añadirlo y provocar 401)
			await fetch('/api/auth/logout/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ refresh_token: refresh }),
			});
		}
	} catch (err) {
		// ignorar errores de logout remoto, seguimos limpiando
		console.warn('Logout remoto falló', err?.message || err);
	}

	localStorage.removeItem('access_token');
	localStorage.removeItem('refresh_token');
	window.location.href = '/login';
}

export default {
	login,
	logout,
};
