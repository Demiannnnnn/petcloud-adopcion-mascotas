package com.example.users_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.users_service.model.Empresa;
import com.example.users_service.repository.DocumentoRepository;
import com.example.users_service.repository.EmpresaRepository;
import com.example.users_service.repository.PerfilRepository;

@RestController
@RequestMapping("/api")
@org.springframework.web.bind.annotation.CrossOrigin(origins = {"https://localhost", "https://localhost:443", "http://localhost:3000", "http://localhost:3001"})
public class EmpresaController {

	@Autowired
	private EmpresaRepository empresaRepository;
	@Autowired
	private PerfilRepository perfilRepository;

	@Autowired
	private DocumentoRepository documentoRepository;

	@PostMapping("/registro-empresa")
	public Object registrarEmpresa(
		@RequestParam("nombreEmpresa") String nombreEmpresa,
		@RequestParam("rutEmpresa") String rutEmpresa,
		@RequestParam("correo") String correo,
		@RequestParam("contraseña") String contraseña,
		@RequestParam("direccion") String direccion,
		@RequestParam("telefonoContacto") String telefonoContacto,
		@RequestParam("ubicacion") String ubicacion,
		@RequestParam("certificadoLegal") MultipartFile certificadoLegal
	) {
		// ...existing code...
		return new RespuestaRegistro(true, "Registro exitoso");
	}

	@GetMapping("/empresas")
	public java.util.List<Empresa> listarEmpresas() {
		return empresaRepository.findAll();
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
