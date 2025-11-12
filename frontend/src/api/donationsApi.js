import { getApiBase } from './apiBase';

const API_BASE = getApiBase('DONATIONS');

async function tryCandidates(candidates) {
	for (const path of candidates) {
		try {
			const url = API_BASE + path;
			const res = await fetch(url);
			if (res.ok) return await res.json();
		} catch (e) {
			// try next
		}
	}
	return [];
}

// Listar donaciones hechas por un perfil (donante)
export async function listDonacionesByDonante(donanteId) {
	if (!donanteId) return [];
	const candidates = [
		`/api/donaciones/donante/${donanteId}`,
		`/api/donaciones/por-donante/${donanteId}`,
		`/api/donaciones?donanteId=${donanteId}`,
		`/api/donations/donor/${donanteId}`,
		`/api/donations?donanteId=${donanteId}`
	];
	return await tryCandidates(candidates);
}

// Listar donaciones recibidas por un receptor (por ejemplo empresa/refugio)
export async function listDonacionesRecibidas(receptorId) {
	if (!receptorId) return [];
	const candidates = [
		`/api/donaciones/receptor/${receptorId}`,
		`/api/donaciones/recibidas/${receptorId}`,
		`/api/donaciones?receptorId=${receptorId}`,
		`/api/donations/receiver/${receptorId}`,
		`/api/donations?receptorId=${receptorId}`
	];
	return await tryCandidates(candidates);
}

// Fallback: listar todas las donaciones (si el backend expone /api/donaciones)
export async function listAllDonaciones() {
	const candidates = ['/api/donaciones', '/api/donations', '/api/donaciones/all'];
	return await tryCandidates(candidates);
}
