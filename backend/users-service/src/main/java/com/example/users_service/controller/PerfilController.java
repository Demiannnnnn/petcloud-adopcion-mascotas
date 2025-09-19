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
		String tipoPerfil = loginRequest.getTipoPerfil();
		if ("EMPRESA".equalsIgnoreCase(tipoPerfil)) {
			Empresa empresa = sistemaAutenticacion.loginEmpresa(rut, contraseña);
			if (empresa != null) {
				return new LoginResponse(true, "Login exitoso", new PerfilDTO(empresa));
			}
			// Si existe una persona con ese rut, aunque la contraseña coincida, indicar tipo de perfil incorrecto
			Persona persona = sistemaAutenticacion.loginPersona(rut, contraseña);
			if (persona != null || sistemaAutenticacion.personaExiste(rut)) {
				return new LoginResponse(false, "El RUT corresponde a una persona. Cambia el tipo de perfil para iniciar sesión.");
			}
			return new LoginResponse(false, "Credenciales inválidas para empresa");
		} else {
			Persona persona = sistemaAutenticacion.loginPersona(rut, contraseña);
			if (persona != null) {
				return new LoginResponse(true, "Login exitoso", new PerfilDTO(persona));
			}
			// Si existe una empresa con ese rut, aunque la contraseña coincida, indicar tipo de perfil incorrecto
			Empresa empresa = sistemaAutenticacion.loginEmpresa(rut, contraseña);
			if (empresa != null || sistemaAutenticacion.empresaExiste(rut)) {
				return new LoginResponse(false, "El RUT corresponde a una empresa. Cambia el tipo de perfil para iniciar sesión.");
			}
			return new LoginResponse(false, "Credenciales inválidas para persona");
		}
	}

	public static class LoginRequest {
	private String rut;
	private String contraseña;
	private String tipoPerfil;
	public String getRut() { return rut; }
	public void setRut(String rut) { this.rut = rut; }
	public String getContraseña() { return contraseña; }
	public void setContraseña(String contraseña) { this.contraseña = contraseña; }
	public String getTipoPerfil() { return tipoPerfil; }
	public void setTipoPerfil(String tipoPerfil) { this.tipoPerfil = tipoPerfil; }
	}

	static class LoginResponse {
		public boolean success;
		public String message;
		public PerfilDTO perfil;
		public LoginResponse(boolean success, String message) {
			this.success = success;
			this.message = message;
		}
		public LoginResponse(boolean success, String message, PerfilDTO perfil) {
			this.success = success;
			this.message = message;
			this.perfil = perfil;
		}
	}

	static class PerfilDTO {
		public Long id;
		public String tipoPerfil;
		public String rut;
		public String correo;
		public Boolean activo;
		public String nombreEmpresa;
		public String rutEmpresa;
		public String direccion;
		public String telefonoContacto;
		public boolean verificado;
		public String nombreCompleto;
		public String ubicacion;
		public String numeroWhatsapp;
		public java.sql.Date fechaNacimiento;

		public PerfilDTO(com.example.users_service.model.Perfil perfil) {
			this.id = perfil.getId();
			this.tipoPerfil = perfil.getTipoPerfil();
			this.rut = perfil.getRut();
			this.correo = perfil.getCorreo();
			this.activo = perfil.getActivo();
			if (perfil instanceof com.example.users_service.model.Empresa empresa) {
				this.nombreEmpresa = empresa.getNombreEmpresa();
				this.rutEmpresa = empresa.getRutEmpresa();
				this.direccion = empresa.getDireccion();
				this.telefonoContacto = empresa.getTelefonoContacto();
				this.verificado = empresa.isVerificado();
			}
			if (perfil instanceof com.example.users_service.model.Persona persona) {
				this.nombreCompleto = persona.getNombreCompleto();
				this.ubicacion = persona.getUbicacion();
				this.numeroWhatsapp = persona.getNumeroWhatsapp();
				this.fechaNacimiento = persona.getFechaNacimiento();
			}
		}
	}
}
