package com.example.users_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.users_service.model.Empresa;
import com.example.users_service.model.Persona;
import com.example.users_service.service.SistemaAutenticacion;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = { "https://localhost", "https://localhost:443", "http://localhost:3000",
		"http://localhost:3001" })
public class PerfilController {

	private final SistemaAutenticacion sistemaAutenticacion;

	@Autowired
	private com.example.users_service.repository.PersonaRepository personaRepository;

	@Autowired
	private com.example.users_service.repository.EmpresaRepository empresaRepository;

	public PerfilController(SistemaAutenticacion sistemaAutenticacion) {
		this.sistemaAutenticacion = sistemaAutenticacion;
	}

	// GET /api/perfil/{id} - devuelve PerfilDTO si existe

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
			// Si existe una persona con ese rut, aunque la contraseña coincida, indicar
			// tipo de perfil incorrecto
			Persona persona = sistemaAutenticacion.loginPersona(rut, contraseña);
			if (persona != null || sistemaAutenticacion.personaExiste(rut)) {
				return new LoginResponse(false,
						"El RUT corresponde a una persona. Cambia el tipo de perfil para iniciar sesión.");
			}
			return new LoginResponse(false, "Credenciales inválidas para empresa");
		} else {
			Persona persona = sistemaAutenticacion.loginPersona(rut, contraseña);
			if (persona != null) {
				return new LoginResponse(true, "Login exitoso", new PerfilDTO(persona));
			}
			// Si existe una empresa con ese rut, aunque la contraseña coincida, indicar
			// tipo de perfil incorrecto
			Empresa empresa = sistemaAutenticacion.loginEmpresa(rut, contraseña);
			if (empresa != null || sistemaAutenticacion.empresaExiste(rut)) {
				return new LoginResponse(false,
						"El RUT corresponde a una empresa. Cambia el tipo de perfil para iniciar sesión.");
			}
			return new LoginResponse(false, "Credenciales inválidas para persona");
		}
	}

	@PutMapping("/perfil/{id}")
	public ResponseEntity<?> updatePerfil(@PathVariable Long id, @RequestBody PerfilDTO dto) {
		com.example.users_service.model.Perfil perfil = sistemaAutenticacion.getPerfilById(id);
		if (perfil == null)
			return ResponseEntity.status(404).body(new LoginResponse(false, "Perfil no encontrado"));
		try {
			if (perfil instanceof com.example.users_service.model.Empresa empresa) {
				if (dto.nombreEmpresa != null)
					empresa.setNombreEmpresa(dto.nombreEmpresa);
				if (dto.direccion != null)
					empresa.setDireccion(dto.direccion);
				if (dto.telefonoContacto != null)
					empresa.setTelefonoContacto(dto.telefonoContacto);
				if (dto.correo != null)
					empresa.setCorreo(dto.correo);
				com.example.users_service.model.Empresa saved = empresaRepository.save(empresa);
				return ResponseEntity.ok(new PerfilDTO(saved));
			} else if (perfil instanceof com.example.users_service.model.Persona persona) {
				if (dto.nombreCompleto != null)
					persona.setNombreCompleto(dto.nombreCompleto);
				if (dto.ubicacion != null)
					persona.setUbicacion(dto.ubicacion);
				if (dto.numeroWhatsapp != null)
					persona.setNumeroWhatsapp(dto.numeroWhatsapp);
				if (dto.correo != null)
					persona.setCorreo(dto.correo);
				if (dto.fechaNacimiento != null)
					persona.setFechaNacimiento(dto.fechaNacimiento);
				com.example.users_service.model.Persona saved = personaRepository.save(persona);
				return ResponseEntity.ok(new PerfilDTO(saved));
			}
			return ResponseEntity.status(400).body(new LoginResponse(false, "Tipo de perfil no soportado"));
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(500)
					.body(new LoginResponse(false, "Error al actualizar perfil: " + e.getMessage()));
		}
	}

	public static class ChangePasswordRequest {
		public String currentPassword;
		public String newPassword;
	}

	@PostMapping("/perfil/{id}/change-password")
	public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody ChangePasswordRequest req) {
		com.example.users_service.model.Perfil perfil = sistemaAutenticacion.getPerfilById(id);
		if (perfil == null)
			return ResponseEntity.status(404).body(new LoginResponse(false, "Perfil no encontrado"));
		if (req == null || req.currentPassword == null || req.newPassword == null) {
			return ResponseEntity.badRequest().body(new LoginResponse(false, "Payload inválido"));
		}
		// verificar contraseña actual
		if (!org.springframework.security.crypto.bcrypt.BCrypt.checkpw(req.currentPassword, perfil.getContraseña())) {
			return ResponseEntity.status(403).body(new LoginResponse(false, "Contraseña actual incorrecta"));
		}
		String hash = org.springframework.security.crypto.bcrypt.BCrypt.hashpw(req.newPassword,
				org.springframework.security.crypto.bcrypt.BCrypt.gensalt());
		perfil.setContraseña(hash);
		try {
			if (perfil instanceof com.example.users_service.model.Empresa) {
				empresaRepository.save((com.example.users_service.model.Empresa) perfil);
			} else if (perfil instanceof com.example.users_service.model.Persona) {
				personaRepository.save((com.example.users_service.model.Persona) perfil);
			}
			return ResponseEntity.ok(new LoginResponse(true, "Contraseña actualizada"));
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(500)
					.body(new LoginResponse(false, "No se pudo actualizar la contraseña: " + e.getMessage()));
		}
	}

	public static class LoginRequest {
		private String rut;
		private String contraseña;
		private String tipoPerfil;

		public String getRut() {
			return rut;
		}

		public void setRut(String rut) {
			this.rut = rut;
		}

		public String getContraseña() {
			return contraseña;
		}

		public void setContraseña(String contraseña) {
			this.contraseña = contraseña;
		}

		public String getTipoPerfil() {
			return tipoPerfil;
		}

		public void setTipoPerfil(String tipoPerfil) {
			this.tipoPerfil = tipoPerfil;
		}
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

	@GetMapping("/perfil/{id}")
	public ResponseEntity<?> getPerfilById(@PathVariable Long id) {
		com.example.users_service.model.Perfil perfil = sistemaAutenticacion.getPerfilById(id);
		if (perfil == null)
			return ResponseEntity.status(404).body(new LoginResponse(false, "Perfil no encontrado"));
		return ResponseEntity.ok(new PerfilDTO(perfil));
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
		public java.time.LocalDate fechaNacimiento;

		// Default constructor needed for Jackson deserialization when receiving JSON
		// payloads
		public PerfilDTO() {
		}

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
