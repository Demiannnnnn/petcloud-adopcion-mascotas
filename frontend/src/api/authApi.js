export async function registrarPersona(personaData) {
	const response = await fetch("/api/registro-persona", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(personaData)
	});
	if (!response.ok) {
		throw new Error("Error de conexión");
	}
	return response.json();
}
//login, registro
export async function login(rut, contraseña) {
	const response = await fetch("/api/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ rut, contraseña })
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