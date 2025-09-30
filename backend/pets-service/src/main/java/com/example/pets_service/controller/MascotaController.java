package com.example.pets_service.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.pets_service.model.Mascota;
import com.example.pets_service.service.MascotaService;

@RestController
@RequestMapping("/api/mascotas")
@CrossOrigin(origins = {"http://localhost:3001", "http://localhost:3000"})
public class MascotaController {
	private final MascotaService mascotaService;

	@Autowired
	public MascotaController(MascotaService mascotaService) {
		this.mascotaService = mascotaService;
	}

	@GetMapping
	public List<Mascota> listarMascotas() {
		return mascotaService.listarMascotas();
	}

	@PostMapping("/registrar")
	public ResponseEntity<?> registrarMascota(@RequestBody MascotaRegistroDTO mascotaDTO) {
		try {
			Mascota mascota = mascotaService.registrarMascota(mascotaDTO);
			return ResponseEntity.ok(new RespuestaRegistro(true, "Mascota registrada exitosamente", mascota));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(new RespuestaRegistro(false, "Error al registrar mascota: " + e.getMessage(), null));
		}
	}

	// DTO para recibir datos del frontend
	public static class MascotaRegistroDTO {
		public String nombre;
		public String especie;
		public String raza;
		public String fechaNacimiento;
		public String sexo;
		public String tamaño;
		public List<String> vacunas;
		public String esterilizado;
		public List<String> enfermedades;
		public List<String> documentos;
		public String descripcion;
		public String foto;
		public String ubicacion;
		public String chip;
		public Long propietarioId;

		// Getters y setters
		public String getNombre() { return nombre; }
		public void setNombre(String nombre) { this.nombre = nombre; }
		public String getEspecie() { return especie; }
		public void setEspecie(String especie) { this.especie = especie; }
		public String getRaza() { return raza; }
		public void setRaza(String raza) { this.raza = raza; }
		public String getFechaNacimiento() { return fechaNacimiento; }
		public void setFechaNacimiento(String fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; }
		public String getSexo() { return sexo; }
		public void setSexo(String sexo) { this.sexo = sexo; }
		public String getTamaño() { return tamaño; }
		public void setTamaño(String tamaño) { this.tamaño = tamaño; }
		public List<String> getVacunas() { return vacunas; }
		public void setVacunas(List<String> vacunas) { this.vacunas = vacunas; }
		public String getEsterilizado() { return esterilizado; }
		public void setEsterilizado(String esterilizado) { this.esterilizado = esterilizado; }
		public List<String> getEnfermedades() { return enfermedades; }
		public void setEnfermedades(List<String> enfermedades) { this.enfermedades = enfermedades; }
		public List<String> getDocumentos() { return documentos; }
		public void setDocumentos(List<String> documentos) { this.documentos = documentos; }
		public String getDescripcion() { return descripcion; }
		public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
		public String getFoto() { return foto; }
		public void setFoto(String foto) { this.foto = foto; }
		public String getUbicacion() { return ubicacion; }
		public void setUbicacion(String ubicacion) { this.ubicacion = ubicacion; }
		public String getChip() { return chip; }
		public void setChip(String chip) { this.chip = chip; }
		public Long getPropietarioId() { return propietarioId; }
		public void setPropietarioId(Long propietarioId) { this.propietarioId = propietarioId; }
	}

	// Respuesta del endpoint
	public static class RespuestaRegistro {
		public boolean success;
		public String message;
		public Mascota mascota;

		public RespuestaRegistro(boolean success, String message, Mascota mascota) {
			this.success = success;
			this.message = message;
			this.mascota = mascota;
		}
	}
}
