import { formatRut } from '../utils/rut';
import { getApiBase } from './apiBase';

const API_BASE = getApiBase('USERS');

export const registerPersona = async (formData) => {
	try {
		const response = await fetch(`${API_BASE}/api/registro-persona`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(formData),
		});

		// ... resto de la lógica ...
	} catch (error) {
		console.error('Error registering persona:', error);
		throw error;
	}
};

// Registro de empresa
export async function registrarEmpresa(empresaData) {
	const formData = new FormData();
	const copy = { ...empresaData };
	if (copy.rutEmpresa) copy.rutEmpresa = formatRut(copy.rutEmpresa);
	for (const key in copy) {
		if (copy[key] !== undefined && copy[key] !== null) {
			formData.append(key, copy[key]);
		}
	}
	const response = await fetch(`${API_BASE}/api/registro-empresa`, {
		method: "POST",
		body: formData
	});
	if (!response.ok) {
		throw new Error("Error de conexión");
	}
	return response.json();
}
//login, registro
export async function login(rut, contraseña) {
	const payloadRut = formatRut(rut);
		const response = await fetch(`${API_BASE}/api/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ rut: payloadRut, contraseña, tipoPerfil: window.tipoPerfilLogin || 'PERSONA' })
		});
	let result;
	try {
		result = await response.json();
	} catch {
		throw new Error("Error de conexión");
	}
	if (!response.ok || (result && result.success === false)) {
		throw new Error(result && result.message ? result.message : "Credenciales inválidas");
	}
	return result;
}