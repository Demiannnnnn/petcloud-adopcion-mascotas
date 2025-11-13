const API_BASE = process.env.REACT_APP_API_DONATIONS;

// Crear nueva donación
export async function crearDonacion(donacionData) {
	try {
		const res = await fetch(`${API_BASE}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(donacionData)
		});
		if (!res.ok) {
			const error = await res.json();
			throw new Error(error.error || 'Error al crear donación');
		}
		return await res.json();
	} catch (error) {
		console.error('Error en crearDonacion:', error);
		throw error;
	}
}

// Listar donaciones hechas por un perfil (donante)
export async function listDonacionesByDonante(donanteId) {
	if (!donanteId) return [];
	try {
		const res = await fetch(`${API_BASE}/donante/${donanteId}`);
		if (res.ok) return await res.json();
		return [];
	} catch (e) {
		console.error('Error listando donaciones por donante:', e);
		return [];
	}
}

// Listar donaciones recibidas por un receptor (por ejemplo empresa/refugio)
export async function listDonacionesRecibidas(receptorId) {
	if (!receptorId) return [];
	try {
		const res = await fetch(`${API_BASE}/receptor/${receptorId}`);
		if (res.ok) return await res.json();
		return [];
	} catch (e) {
		console.error('Error listando donaciones recibidas:', e);
		return [];
	}
}

// Fallback: listar todas las donaciones
export async function listAllDonaciones() {
	try {
		const res = await fetch(`${API_BASE}`);
		if (res.ok) return await res.json();
		return [];
	} catch (e) {
		console.error('Error listando todas las donaciones:', e);
		return [];
	}
}
