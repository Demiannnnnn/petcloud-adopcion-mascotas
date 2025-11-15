package com.example.users_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.users_service.controller.PerfilController.PerfilDTO;
import com.example.users_service.model.Empresa;
import com.example.users_service.model.Persona;
import com.example.users_service.repository.EmpresaRepository;
import com.example.users_service.repository.PersonaRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = {"https://localhost", "https://localhost:443", "http://localhost:3000", "http://localhost:3001"})
public class UserListController {

	@Autowired
	private PersonaRepository personaRepository;

	@Autowired
	private EmpresaRepository empresaRepository;

	// GET /all - listar todos los perfiles (nginx convierte /api/users/all -> /all)
	@GetMapping("/all")
	public ResponseEntity<?> getAllUsers() {
		try {
			List<PerfilDTO> perfiles = new ArrayList<>();
			
			// Agregar todas las personas
			List<Persona> personas = personaRepository.findAll();
			perfiles.addAll(personas.stream().map(PerfilDTO::new).collect(Collectors.toList()));
			
			// Agregar todas las empresas
			List<Empresa> empresas = empresaRepository.findAll();
			perfiles.addAll(empresas.stream().map(PerfilDTO::new).collect(Collectors.toList()));
			
			return ResponseEntity.ok(perfiles);
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body("Error al obtener usuarios: " + e.getMessage());
		}
	}
}
