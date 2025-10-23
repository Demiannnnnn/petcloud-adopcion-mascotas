import { getApiBase } from './apiBase';

export const USERS_API_BASE = getApiBase('USERS');

// users-service exposes a Perfil endpoint at /api/perfil/{id} which returns PerfilDTO
export async function getUserById(id) {
	if (!id) return null;
	try {
		const res = await fetch(`${USERS_API_BASE}/api/perfil/${id}`);
		if (!res.ok) return null;
		return await res.json();
	} catch (e) {
		console.warn('getUserById failed', e);
		return null;
	}
}