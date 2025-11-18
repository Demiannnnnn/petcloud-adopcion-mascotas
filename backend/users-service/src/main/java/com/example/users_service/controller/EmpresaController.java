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
		// Validar duplicados por rutEmpresa y correo
		if (empresaRepository.findByRutEmpresa(rutEmpresa).isPresent() || perfilRepository.findByRut(rutEmpresa).isPresent()) {
			return new RespuestaRegistro(false, "Ya existe un usuario con ese RUT");
		}
		if (perfilRepository.findByCorreo(correo).isPresent()) {
			return new RespuestaRegistro(false, "Ya existe un usuario con ese correo");
		}

		// Encriptar la contraseña antes de guardar
		String hash = org.springframework.security.crypto.bcrypt.BCrypt.hashpw(contraseña, org.springframework.security.crypto.bcrypt.BCrypt.gensalt());

		Empresa empresa = new Empresa();
		empresa.setTipoPerfil("EMPRESA");
		empresa.setRut(rutEmpresa);
		empresa.setCorreo(correo);
		empresa.setContraseña(hash);
		empresa.setNombreEmpresa(nombreEmpresa);
		empresa.setRutEmpresa(rutEmpresa);
		empresa.setDireccion(direccion);
		empresa.setTelefonoContacto(telefonoContacto);
		empresa.setActivo(true);
		// ubicacion es parte de empresa subclass in some designs; try to set via reflection if exists
		try {
			java.lang.reflect.Method m = Empresa.class.getMethod("setUbicacion", String.class);
			m.invoke(empresa, ubicacion);
		} catch (NoSuchMethodException nsme) {
			// ignore if method not present
		} catch (Exception ex) {
			// ignore other reflection issues
		}

		try {
			empresa = empresaRepository.save(empresa);
			// Guardar certificado como documento si se envía
			if (certificadoLegal != null && !certificadoLegal.isEmpty()) {
				try {
					com.example.users_service.model.Documento doc = new com.example.users_service.model.Documento();
					doc.setPerfil(empresa);
					doc.setTipo("certificadoLegal");
					doc.setNombreArchivo(certificadoLegal.getOriginalFilename());
					doc.setArchivo(certificadoLegal.getBytes());
					documentoRepository.save(doc);
				} catch (Exception e) {
					// no bloquear registro por fallo al guardar documento
				}
			}
		} catch (Exception e) {
			return new RespuestaRegistro(false, "Error al guardar la empresa: " + e.getMessage());
		}

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
