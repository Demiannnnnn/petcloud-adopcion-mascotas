package com.example.users_service.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.users_service.model.Documento;
import com.example.users_service.model.Empresa;
import com.example.users_service.repository.DocumentoRepository;
import com.example.users_service.repository.EmpresaRepository;
import com.example.users_service.repository.PerfilRepository;

@RestController
@RequestMapping("/api")
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
		// Validar formato de telefono: +569 seguido de 8 digitos
		if (telefonoContacto == null || !telefonoContacto.matches("^\\+569\\d{8}$")) {
			return new RespuestaRegistro(false, "Teléfono de contacto inválido. Usa el formato +569XXXXXXXX (ej: +56912345678)");
		}
		// Validar duplicados solo en empresas
		if (empresaRepository.findByRutEmpresa(rutEmpresa).isPresent()) {
			return new RespuestaRegistro(false, "Ya existe una empresa con ese RUT");
		}
		if (perfilRepository.findByCorreo(correo).isPresent()) {
			return new RespuestaRegistro(false, "Ya existe una empresa con ese correo");
		}
		if (certificadoLegal == null || certificadoLegal.isEmpty()) {
			return new RespuestaRegistro(false, "El certificado legal es obligatorio");
		}
		// Encriptar la contraseña antes de guardar
		String hash = org.springframework.security.crypto.bcrypt.BCrypt.hashpw(contraseña, org.springframework.security.crypto.bcrypt.BCrypt.gensalt());
		Empresa empresa = new Empresa();
		empresa.setNombreEmpresa(nombreEmpresa);
		empresa.setRutEmpresa(rutEmpresa);
		empresa.setRut(rutEmpresa); // Guardar el RUT de empresa también en Perfil
		empresa.setCorreo(correo);
		empresa.setContraseña(hash);
		empresa.setDireccion(direccion);
		empresa.setTelefonoContacto(telefonoContacto);
		// empresa.setUbicacion(ubicacion); // No existe en Empresa, solo en Persona. Usar dirección y otros campos.
		empresa.setTipoPerfil("EMPRESA");
		empresa.setVerificado(false);
		empresa.setActivo(true);
		// Guardar empresa (esto guarda en perfil y empresa por herencia JOINED)
		Empresa empresaGuardada = empresaRepository.save(empresa);
		// Guardar el documento
		try {
			Documento doc = new Documento();
			doc.setTipo("CERTIFICADO_LEGAL");
			doc.setNombreArchivo(certificadoLegal.getOriginalFilename());
			doc.setFechaSubida(new java.sql.Timestamp(System.currentTimeMillis()));
			doc.setValidado(false);
			doc.setPerfil(empresaGuardada);
			doc.setArchivo(certificadoLegal.getBytes());
			documentoRepository.save(doc);
		} catch (IOException | RuntimeException ex) {
			return new RespuestaRegistro(false, "Error al guardar el certificado legal");
		}
	// ...existing code...
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
