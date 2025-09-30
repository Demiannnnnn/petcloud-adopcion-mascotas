// API para gestión de mascotas

export async function registrarMascota(mascotaData) {
	try {
		const response = await fetch("http://localhost:8082/api/mascotas/registrar", {
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
		const response = await fetch("http://localhost:8082/api/mascotas", {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			}
		});

		if (!response.ok) {
			throw new Error("Error de conexión al listar mascotas");
		}

		return await response.json();
	} catch (error) {
		console.error("Error en listarMascotas:", error);
		throw error;
	}
}