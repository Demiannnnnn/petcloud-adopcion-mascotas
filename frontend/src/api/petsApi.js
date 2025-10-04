// Use single API base env var with fallback to localhost. Keep backwards compatibility with older env names.
const API_BASE =
	process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_PETS || process.env.REACT_APP_API_IP_PETS || 'http://localhost:8082';

// Obtener mascotas por refugio
export async function getMascotasByRefugio(refugioId) {
	const res = await fetch(`${API_BASE}/api/mascotas/refugio/${refugioId}`);
	if (!res.ok) {
		// If the backend returns 404 or empty, return empty array to avoid breaking callers.
		console.warn('getMascotasByRefugio: non-ok response', res.status);
		return [];
	}
	return await res.json();
}
// API para gestión de mascotas

export async function registrarMascota(mascotaData) {
	try {
		const response = await fetch(`${API_BASE}/api/mascotas/registrar`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(mascotaData)
		});

		if (!response.ok) {
			throw new Error("Error de conexión al registrar mascota");
		}

		const result = await response.json();
		
		if (!result.success) {
			throw new Error(result.message || "Error al registrar mascota");
		}

		return result;
	} catch (error) {
		console.error("Error en registrarMascota:", error);
		throw error;
	}
}

export async function listarMascotas() {
	try {
		const response = await fetch(`${API_BASE}/api/mascotas`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			}
		});
		if (!response.ok) {
			throw new Error("Error al listar mascotas");
		}
		return await response.json();
	} catch (error) {
		console.error("Error en listarMascotas:", error);
		throw error;
	}
}