package com.example.users_service.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.users_service.model.Empresa;
import com.example.users_service.model.Persona;
import com.example.users_service.service.SistemaAutenticacion;

@RestController
@RequestMapping("/api")
public class PerfilController {

	private final SistemaAutenticacion sistemaAutenticacion;

	public PerfilController(SistemaAutenticacion sistemaAutenticacion) {
		this.sistemaAutenticacion = sistemaAutenticacion;
	}

	@PostMapping("/login")
	public Object login(@RequestBody LoginRequest loginRequest) {
		String rut = loginRequest.getRut();
		String contraseña = loginRequest.getContraseña();
		// Primero intenta login como Persona
		Persona persona = sistemaAutenticacion.loginPersona(rut, contraseña);
		if (persona != null) return persona;
		// Si no, intenta como Empresa
		Empresa empresa = sistemaAutenticacion.loginEmpresa(rut, contraseña);
		if (empresa != null) return empresa;
		// Si ninguno, retorna error
		return new LoginResponse(false, "Credenciales inválidas");
	}

	public static class LoginRequest {
		private String rut;
		private String contraseña;
		public String getRut() { return rut; }
		public void setRut(String rut) { this.rut = rut; }
		public String getContraseña() { return contraseña; }
		public void setContraseña(String contraseña) { this.contraseña = contraseña; }
	}

	static class LoginResponse {
		public boolean success;
		public String message;
		public LoginResponse(boolean success, String message) {
			this.success = success;
			this.message = message;
		}
	}
}
