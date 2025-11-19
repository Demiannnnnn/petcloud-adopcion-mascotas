package com.example.pets_service.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.pets_service.dto.PublicMascotaDTO;
import com.example.pets_service.model.Mascota;
import com.example.pets_service.service.MascotaService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/mascotas")
@CrossOrigin(origins = {"http://localhost:3001", "http://localhost:3000"}, allowedHeaders = {"*"}, methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS}, allowCredentials = "true")
public class MascotaController {
	// Endpoint para subir imagen
	@PostMapping("/upload")
	public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) {
		try {
			String uploadDir = System.getProperty("user.dir") + "/uploads/";
			java.io.File dest = new java.io.File(uploadDir + file.getOriginalFilename());
			file.transferTo(dest);
			// Retornar la URL pública
			String imageUrl = "/uploads/" + file.getOriginalFilename();
			return ResponseEntity.ok(imageUrl);
		} catch (IOException | IllegalStateException e) {
			return ResponseEntity.status(500).body("Error al subir la imagen: " + e.getMessage());
		}
	}
	private final MascotaService mascotaService;

	@Autowired
	public MascotaController(MascotaService mascotaService) {
		this.mascotaService = mascotaService;
	}

	@GetMapping
	public List<PublicMascotaDTO> listarMascotas() {
		return mascotaService.listarMascotas();
	}

	@GetMapping("/{id}")
	public ResponseEntity<PublicMascotaDTO> obtenerMascota(@org.springframework.web.bind.annotation.PathVariable Long id) {
		List<PublicMascotaDTO> all = mascotaService.listarMascotas();
		for (PublicMascotaDTO d : all) {
			if (d != null && d.id != null && d.id.equals(id)) {
				return ResponseEntity.ok(d);
			}
		}
		return ResponseEntity.notFound().build();
	}

	@org.springframework.web.bind.annotation.PatchMapping("/{id}/reserve")
	public ResponseEntity<?> reserveMascota(@org.springframework.web.bind.annotation.PathVariable Long id, @org.springframework.web.bind.annotation.RequestParam(required = false) Long adoptanteId) {
		try {
			boolean ok = (adoptanteId == null) ? mascotaService.reserveMascota(id) : mascotaService.reserveMascota(id, adoptanteId);
			if (ok) return ResponseEntity.ok().build();
			return ResponseEntity.status(409).body("Mascota no disponible");
		} catch (IllegalArgumentException ia) {
			return ResponseEntity.status(404).body(ia.getMessage());
		} catch (Exception e) {
			return ResponseEntity.status(500).body(e.getMessage());
		}
	}

	@org.springframework.web.bind.annotation.PostMapping("/{id}/reserve")
	public ResponseEntity<?> reserveMascotaPost(@org.springframework.web.bind.annotation.PathVariable Long id, @org.springframework.web.bind.annotation.RequestParam(required = false) Long adoptanteId) {
		// Accept POST as an alternative to PATCH so other services can call this without needing a PATCH-capable HTTP client
		return reserveMascota(id, adoptanteId);
	}

	@GetMapping("/refugio/{id}")
	public List<PublicMascotaDTO> listarPorRefugio(@org.springframework.web.bind.annotation.PathVariable Long id) {
		// Use the DTO-producing listarMascotas and filter by refugioId so `media` is included
		List<PublicMascotaDTO> all = mascotaService.listarMascotas();
		java.util.List<PublicMascotaDTO> out = new java.util.ArrayList<>();
		for (PublicMascotaDTO d : all) {
			if (d.refugioId != null && d.refugioId.equals(id)) out.add(d);
		}
		return out;
	}

	@GetMapping("/propietario/{id}")
	public List<PublicMascotaDTO> listarPorPropietario(@org.springframework.web.bind.annotation.PathVariable Long id) {
		// Use the DTO-producing listarMascotas and filter by propietarioId so `media` is included
		List<PublicMascotaDTO> all = mascotaService.listarMascotas();
		java.util.List<PublicMascotaDTO> out = new java.util.ArrayList<>();
		for (PublicMascotaDTO d : all) {
			if (d.propietarioId != null && d.propietarioId.equals(id)) out.add(d);
		}
		return out;
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

	// Endpoint para actualizar una mascota existente
	@org.springframework.web.bind.annotation.PutMapping("/{id}")
	public ResponseEntity<?> actualizarMascota(@org.springframework.web.bind.annotation.PathVariable Long id, @RequestBody MascotaRegistroDTO mascotaDTO) {
		try {
			Mascota updated = mascotaService.actualizarMascota(id, mascotaDTO);
			return ResponseEntity.ok(new RespuestaRegistro(true, "Mascota actualizada", updated));
		} catch (IllegalArgumentException ia) {
			return ResponseEntity.status(403).body(new RespuestaRegistro(false, ia.getMessage(), null));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(new RespuestaRegistro(false, "Error al actualizar mascota: " + e.getMessage(), null));
		}
	}

	// Endpoint to remove a specific media item from a mascota
	@org.springframework.web.bind.annotation.DeleteMapping("/{id}/media")
	public ResponseEntity<?> removeMedia(@org.springframework.web.bind.annotation.PathVariable Long id, @org.springframework.web.bind.annotation.RequestParam("url") String url, HttpServletRequest request) {
		try {
			// Authorization: prefer JWT in production; here accept headers from frontend
			String headerUserId = request.getHeader("X-User-Id");
			String headerPerfilId = request.getHeader("X-User-Perfil-Id");
			String headerPerfilTipo = request.getHeader("X-User-Perfil-Tipo");
			// load mascota to check ownership
			Mascota m = mascotaService.listarPorId(id);
			if (m == null) return ResponseEntity.status(404).body(new RespuestaRegistro(false, "Mascota no encontrada", null));
			boolean authorized = false;
			// parse numeric headers defensively
			if (headerUserId != null && !headerUserId.isEmpty()) {
					try {
						if (m.getPropietarioId() != null && m.getPropietarioId().equals(Long.valueOf(headerUserId))) authorized = true;
					} catch (NumberFormatException nfe) {
					// ignore parse errors
				}
			}
			if (!authorized && headerPerfilId != null && headerPerfilTipo != null) {
					try {
						if ("EMPRESA".equalsIgnoreCase(headerPerfilTipo) && m.getRefugioId() != null && m.getRefugioId().equals(Long.valueOf(headerPerfilId))) authorized = true;
					} catch (NumberFormatException nfe) {
					// ignore parse errors
				}
			}
			if (!authorized) return ResponseEntity.status(403).body(new RespuestaRegistro(false, "No autorizado para eliminar esta media", null));
			Mascota updated = mascotaService.removeMedia(id, url);
			return ResponseEntity.ok(new RespuestaRegistro(true, "Media eliminada", updated));
		} catch (IllegalArgumentException ia) {
			return ResponseEntity.status(404).body(new RespuestaRegistro(false, ia.getMessage(), null));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(new RespuestaRegistro(false, "Error al eliminar media: " + e.getMessage(), null));
		}
	}

	@org.springframework.web.bind.annotation.PatchMapping("/{id}/availability")
	public ResponseEntity<?> setAvailability(@org.springframework.web.bind.annotation.PathVariable Long id, HttpServletRequest request, @org.springframework.web.bind.annotation.RequestParam(required = false) Boolean disponible) {
		try {
			String headerUserId = request.getHeader("X-User-Id");
			String headerPerfilId = request.getHeader("X-User-Perfil-Id");
			String headerPerfilTipo = request.getHeader("X-User-Perfil-Tipo");
			Long userId = null;
			Long perfilId = null;
			try { if (headerUserId != null && !headerUserId.isEmpty()) userId = Long.valueOf(headerUserId); } catch (NumberFormatException e) {}
			try { if (headerPerfilId != null && !headerPerfilId.isEmpty()) perfilId = Long.valueOf(headerPerfilId); } catch (NumberFormatException e) {}
			if (disponible == null) {
				// toggle by default if not specified
				Mascota current = mascotaService.listarPorId(id);
				if (current == null) return ResponseEntity.status(404).body(new RespuestaRegistro(false, "Mascota no encontrada", null));
				disponible = !Boolean.TRUE.equals(current.getDisponibleAdopcion());
			}
			Mascota updated = null;
			try {
				updated = mascotaService.setDisponibilidad(id, disponible, perfilId, headerPerfilTipo, userId);
			} catch (SecurityException se) {
				return ResponseEntity.status(403).body(new RespuestaRegistro(false, se.getMessage(), null));
			}
			// Try to convert to DTO for frontend consistency
			List<PublicMascotaDTO> all = mascotaService.listarMascotas();
			for (PublicMascotaDTO d : all) {
				if (d != null && d.id != null && d.id.equals(id)) return ResponseEntity.ok(d);
			}
			return ResponseEntity.ok(updated);
		} catch (IllegalArgumentException ia) {
			// If message indicates not found, return 404, otherwise 400 (bad request)
			String msg = ia.getMessage() != null ? ia.getMessage().toLowerCase() : "";
			if (msg.contains("no encontrada") || msg.contains("no encontrado")) {
				return ResponseEntity.status(404).body(new RespuestaRegistro(false, ia.getMessage(), null));
			}
			return ResponseEntity.status(400).body(new RespuestaRegistro(false, ia.getMessage(), null));
		} catch (Exception e) {
			return ResponseEntity.status(500).body(new RespuestaRegistro(false, "Error cambiando disponibilidad: " + e.getMessage(), null));
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
	public Boolean esterilizado;
		public List<String> enfermedades;
		public List<String> documentos;
		public String descripcion;
		public String foto;
		public java.util.List<java.util.Map<String,String>> media;
		public String ubicacion;
		public String chip;
	public Long propietarioId;
	public Long refugioId; // solo para empresa
	public Long getRefugioId() { return refugioId; }
	public void setRefugioId(Long refugioId) { this.refugioId = refugioId; }

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
	public Boolean getEsterilizado() { return esterilizado; }
	public void setEsterilizado(Boolean esterilizado) { this.esterilizado = esterilizado; }
		public List<String> getEnfermedades() { return enfermedades; }
		public void setEnfermedades(List<String> enfermedades) { this.enfermedades = enfermedades; }
		public List<String> getDocumentos() { return documentos; }
		public void setDocumentos(List<String> documentos) { this.documentos = documentos; }
		public String getDescripcion() { return descripcion; }
		public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
		public String getFoto() { return foto; }
		public void setFoto(String foto) { this.foto = foto; }

		public java.util.List<java.util.Map<String,String>> getMedia() { return media; }
		public void setMedia(java.util.List<java.util.Map<String,String>> media) { this.media = media; }
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
