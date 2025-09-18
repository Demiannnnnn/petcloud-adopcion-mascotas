package com.example.users_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.users_service.model.Persona;
import com.example.users_service.repository.PersonaRepository;

@RestController
@RequestMapping("/api")
public class PersonaController {

	@Autowired
	private PersonaRepository personaRepository;

	@PostMapping("/registro-persona")
	public Object registrarPersona(@RequestBody Persona persona) {
		// Validar duplicados por rut y correo
		if (personaRepository.findByRut(persona.getRut()).isPresent()) {
			return new RespuestaRegistro(false, "Ya existe un usuario con ese RUT");
		}
		if (personaRepository.findByCorreo(persona.getCorreo()).isPresent()) {
			return new RespuestaRegistro(false, "Ya existe un usuario con ese correo");
		}
        // Encriptar la contraseña antes de guardar
        String hash = org.springframework.security.crypto.bcrypt.BCrypt.hashpw(persona.getContraseña(), org.springframework.security.crypto.bcrypt.BCrypt.gensalt());
        persona.setContraseña(hash);
		personaRepository.save(persona);
		return new RespuestaRegistro(true, "Registro exitoso");
	}

	static class RespuestaRegistro {
		public boolean success;
		public String message;
		public RespuestaRegistro(boolean success, String message) {
			this.success = success;
			this.message = message;
		}
	}
}
