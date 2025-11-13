import { getApiBase } from './apiBase';

// Resolve pets service base at runtime
export const API_BASE = getApiBase('PETS');

// Obtener mascotas por refugio
export async function getMascotasByRefugio(refugioId) {
	const res = await fetch(`${API_BASE}/mascotas/refugio/${refugioId}`);
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
		console.log('Enviando mascotaData:', mascotaData);
		const response = await fetch(`${API_BASE}/mascotas/registrar`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(mascotaData)
		});

		if (!response.ok) {
			// Intentar leer el mensaje de error del backend
			try {
				const errorData = await response.json();
				console.error('Error del backend:', errorData);
				throw new Error(errorData.message || "Error de conexión al registrar mascota");
			} catch (e) {
				throw new Error("Error de conexión al registrar mascota");
			}
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
		const response = await fetch(`${API_BASE}/mascotas`, {
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