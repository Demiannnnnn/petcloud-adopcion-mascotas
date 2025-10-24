
package com.example.pets_service.service;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.example.pets_service.controller.MascotaController.MascotaRegistroDTO;
import com.example.pets_service.dto.PublicMascotaDTO;
import com.example.pets_service.model.Mascota;
import com.example.pets_service.repository.MascotaRepository;

@Service
public class MascotaService {
	@org.springframework.context.annotation.Configuration
	public static class RestConfig {
		@Bean
		public RestTemplate restTemplate() {
			org.springframework.http.client.SimpleClientHttpRequestFactory f = new org.springframework.http.client.SimpleClientHttpRequestFactory();
			// Timeouts cortos para no bloquear la API pública si users-service está caído
			f.setConnectTimeout(1000); // 1s
			f.setReadTimeout(2000); // 2s
			return new RestTemplate(f);
		}
	}
	public List<Mascota> listarPorPropietario(Long propietarioId) {
		return mascotaRepository.findByPropietarioId(propietarioId);
	}
	private final MascotaRepository mascotaRepository;

	@Autowired
	public MascotaService(MascotaRepository mascotaRepository) {
		this.mascotaRepository = mascotaRepository;
	}

	@Autowired
	private RestTemplate restTemplate;

	// Caches simples para nombres de refugio y perfil (evita llamadas repetidas)
	private final java.util.concurrent.ConcurrentMap<Long, String> refugioCache = new java.util.concurrent.ConcurrentHashMap<>();
	private final java.util.concurrent.ConcurrentMap<Long, String> perfilCache = new java.util.concurrent.ConcurrentHashMap<>();

	public List<PublicMascotaDTO> listarMascotas() {
		List<Mascota> all = mascotaRepository.findAll();
		java.util.List<PublicMascotaDTO> out = new java.util.ArrayList<>();
		java.util.Map<String,String> env = System.getenv();
		String usersBase = env.getOrDefault("USERS_API_BASE", "http://localhost:8081");
		for (Mascota m : all) {
			PublicMascotaDTO dto = new PublicMascotaDTO();
			dto.id = m.getId();
			dto.propietarioId = m.getPropietarioId();
			dto.refugioId = m.getRefugioId();
			dto.nombre = m.getNombre();
			dto.especie = m.getEspecie();
			dto.raza = m.getRaza();
			dto.edad = m.getEdad();
			// fechaNacimiento and detailed age
			if (m.getFechaNacimiento() != null) {
				dto.fechaNacimiento = m.getFechaNacimiento().toString();
				java.time.Period p = java.time.Period.between(m.getFechaNacimiento(), java.time.LocalDate.now());
				dto.edadYears = p.getYears();
				dto.edadMonths = p.getMonths();
			} else {
				dto.fechaNacimiento = null;
				if (dto.edad == null) dto.edadYears = 0;
				else dto.edadYears = dto.edad;
				dto.edadMonths = 0;
			}
			dto.sexo = m.getSexo();
			dto.ubicacion = m.getUbicacion();
			dto.descripcion = m.getDescripcion();
			dto.disponibleAdopcion = m.getDisponibleAdopcion();
			dto.fechaRegistro = m.getFechaRegistro();
			dto.imagenUrl = m.getImagenUrl();
			// Deserialize media JSON if present. If none, use imagenUrl as single-item media so gallery is consistent.
			dto.media = null;
			if (m.getMediaJson() != null && !m.getMediaJson().isEmpty()) {
				try {
					com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
					java.util.List<java.util.Map<String,String>> parsed = om.readValue(m.getMediaJson(), java.util.List.class);
					// Prefix API base if needed
					String apiBase = java.util.Optional.ofNullable(System.getenv().get("API_BASE")).orElse("http://localhost:8082");
					for (java.util.Map<String,String> item : parsed) {
						String u = item.getOrDefault("url", "");
						if (u != null && !u.isEmpty() && !u.startsWith("http")) {
							item.put("url", apiBase + (u.startsWith("/") ? u : ("/uploads/" + u)));
						}
					}
					dto.media = parsed;
				} catch (java.io.IOException ex) {
					// ignore JSON parse/IO errors for media
				}
			}
			// If no mediaJson and imagenUrl exists, expose imagenUrl as a single media entry
			if ((dto.media == null || dto.media.isEmpty()) && dto.imagenUrl != null && !dto.imagenUrl.isEmpty()) {
				java.util.Map<String,String> single = new java.util.HashMap<>();
				String apiBase = java.util.Optional.ofNullable(System.getenv().get("API_BASE")).orElse("http://localhost:8082");
				String u = dto.imagenUrl;
				if (!u.startsWith("http")) u = apiBase + (u.startsWith("/") ? u : ("/uploads/" + u));
				single.put("url", u);
				single.put("type", "image/*");
				dto.media = new java.util.ArrayList<>();
				dto.media.add(single);
			}
			dto.publicadoPorName = null;
				try {
				if (m.getRefugioId() != null) {
					Long rid = m.getRefugioId();
					dto.publicadoPorName = refugioCache.computeIfAbsent(rid, id -> {
						try {
							String url = usersBase + "/api/refugios/" + id;
							java.util.Map resp = restTemplate.getForObject(url, java.util.Map.class);
							if (resp != null && resp.get("nombre") != null) return String.valueOf(resp.get("nombre"));
						} catch (org.springframework.web.client.RestClientException ex) {
							// ignore
						}
						return null;
					});
				} else if (m.getPropietarioId() != null) {
					Long pid = m.getPropietarioId();
					dto.publicadoPorName = perfilCache.computeIfAbsent(pid, id -> {
						try {
							String url = usersBase + "/api/perfil/" + id;
							java.util.Map resp = restTemplate.getForObject(url, java.util.Map.class);
							if (resp != null) {
								if (resp.get("nombreCompleto") != null) return String.valueOf(resp.get("nombreCompleto"));
								if (resp.get("nombreEmpresa") != null) return String.valueOf(resp.get("nombreEmpresa"));
							}
						} catch (org.springframework.web.client.RestClientException ex) {
							// ignore
						}
						return null;
					});
				}
			} catch (org.springframework.web.client.RestClientException e) {
				// ignore resolution errors from remote lookups
			}

			 // include adoptanteId/adoptanteName if present in entity
			 dto.adoptanteId = m.getAdoptanteId();
			 if (dto.adoptanteId != null) {
				 try {
					 String url = usersBase + "/api/perfil/" + dto.adoptanteId;
					 java.util.Map resp = restTemplate.getForObject(url, java.util.Map.class);
					 if (resp != null) {
						 if (resp.get("nombreCompleto") != null) dto.adoptanteName = String.valueOf(resp.get("nombreCompleto"));
						 else if (resp.get("nombre") != null) dto.adoptanteName = String.valueOf(resp.get("nombre"));
					 }
				 } catch (org.springframework.web.client.RestClientException ex) {
					 // ignore
				 }
			 }
			out.add(dto);
		}
		return out;
	}

	public List<Mascota> listarPorRefugio(Long refugioId) {
		return mascotaRepository.findByRefugioId(refugioId);
	}

	/**
	 * Try to reserve a mascota (mark available=false) using an atomic conditional UPDATE at the repository level.
	 * Returns true if reserved, false if already not available. Throws IllegalArgumentException if mascota not found.
	 */
	@Transactional
	public boolean reserveMascota(Long id) {
		// backward-compatible: reserve without adoptanteId
		int updated = mascotaRepository.reserveIfAvailable(id);
		if (updated > 0) return true;
		boolean exists = mascotaRepository.existsById(id);
		if (!exists) throw new IllegalArgumentException("Mascota no encontrada");
		return false;
	}

	@Transactional
	public boolean reserveMascota(Long id, Long adoptanteId) {
		// Try to reserve and set adoptanteId atomically
		int updated = mascotaRepository.reserveIfAvailableWithAdoptante(id, adoptanteId);
		if (updated > 0) return true;
		boolean exists = mascotaRepository.existsById(id);
		if (!exists) throw new IllegalArgumentException("Mascota no encontrada");
		return false;
	}
	public Mascota registrarMascota(MascotaRegistroDTO mascotaDTO) {
		Mascota mascota = new Mascota();
		
		// Mapear datos básicos
		// Asegurar que propietarioId nunca sea null ni string
		if (mascotaDTO.getPropietarioId() != null) {
			mascota.setPropietarioId(mascotaDTO.getPropietarioId());
		} else {
			throw new IllegalArgumentException("El propietarioId es obligatorio y no puede ser null");
		}
		// Asociar refugio solo si viene en el DTO (empresa)
		if (mascotaDTO.getRefugioId() != null) {
			mascota.setRefugioId(mascotaDTO.getRefugioId());
		}
		mascota.setNombre(mascotaDTO.getNombre());
		mascota.setEspecie(mascotaDTO.getEspecie());
		mascota.setRaza(mascotaDTO.getRaza() != null && !mascotaDTO.getRaza().isEmpty() ? mascotaDTO.getRaza() : null);
		mascota.setSexo(mascotaDTO.getSexo());
		mascota.setUbicacion(mascotaDTO.getUbicacion());
		mascota.setDescripcion(mascotaDTO.getDescripcion());
		
		// Manejar esterilizado (viene como Boolean del frontend)
		if (mascotaDTO.getEsterilizado() != null) {
			mascota.setEsterilizado(mascotaDTO.getEsterilizado());
		} else {
			mascota.setEsterilizado(Boolean.FALSE);
		}
		
		// Configurar valores por defecto
		mascota.setDisponibleAdopcion(true);
		mascota.setFechaRegistro(new Timestamp(System.currentTimeMillis()));
		if (mascotaDTO.getFoto() != null && !mascotaDTO.getFoto().isEmpty()) {
			mascota.setImagenUrl(mascotaDTO.getFoto());
		} else {
			throw new IllegalArgumentException("La imagen de la mascota es obligatoria.");
		}
		
		// Calcular edad a partir de fecha de nacimiento
		if (mascotaDTO.getFechaNacimiento() != null && !mascotaDTO.getFechaNacimiento().isEmpty()) {
			try {
				LocalDate fechaNac = LocalDate.parse(mascotaDTO.getFechaNacimiento(), DateTimeFormatter.ISO_LOCAL_DATE);
				LocalDate ahora = LocalDate.now();
				int edad = Period.between(fechaNac, ahora).getYears();
				mascota.setEdad(edad >= 0 ? edad : 0);
				// Persistimos la fechaNacimiento en la entidad (LocalDate)
				mascota.setFechaNacimiento(fechaNac);
			} catch (java.time.format.DateTimeParseException e) {
				System.err.println("Error parseando fecha: " + e.getMessage());
				mascota.setEdad(0); // Default si hay error
			}
		} else {
			mascota.setEdad(0);
		}
		
		// Peso por defecto (se puede agregar al formulario después)
		// Mapear tamaño del DTO a peso
		if (mascotaDTO.getTamaño() != null && !mascotaDTO.getTamaño().isEmpty()) {
			try {
				mascota.setPeso(new java.math.BigDecimal(mascotaDTO.getTamaño()));
			} catch (Exception e) {
				mascota.setPeso(new java.math.BigDecimal("0.0"));
			}
		} else {
			mascota.setPeso(new java.math.BigDecimal("0.0"));
		}
		
	// Mapear campos extra
	mascota.setChip(mascotaDTO.getChip());
	// Guardar como texto plano (puedes cambiar a lista si lo necesitas)
	mascota.setDocumentos(mascotaDTO.getDocumentos() != null ? String.join(",", mascotaDTO.getDocumentos()) : "");
	mascota.setEnfermedades(mascotaDTO.getEnfermedades() != null ? String.join(",", mascotaDTO.getEnfermedades()) : "");
	mascota.setVacunas(mascotaDTO.getVacunas() != null ? String.join(",", mascotaDTO.getVacunas()) : "");

		// Guardar media adicional como JSON string. If frontend doesn't send media but sent foto, initialize mediaJson with foto.
		try {
			com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
			if (mascotaDTO.getMedia() != null) {
				java.util.List<java.util.Map<String,String>> cleaned = normalizeAndDedupeMedia(mascotaDTO.getMedia());
				// debug: print cleaned media to logs to diagnose duplicate persistence
				System.out.println("[MascotaService.registrarMascota] cleaned media: " + cleaned);
				mascota.setMediaJson(om.writeValueAsString(cleaned));
			} else if (mascotaDTO.getFoto() != null && !mascotaDTO.getFoto().isEmpty()) {
				java.util.List<java.util.Map<String,String>> list = new java.util.ArrayList<>();
				java.util.Map<String,String> item = new java.util.HashMap<>();
				item.put("url", mascotaDTO.getFoto());
				item.put("type", "image/*");
				list.add(item);
				mascota.setMediaJson(om.writeValueAsString(list));
			} else {
				mascota.setMediaJson(null);
			}
		} catch (com.fasterxml.jackson.core.JsonProcessingException e) {
			mascota.setMediaJson(null);
		}
	// Guardar y retornar
	return mascotaRepository.save(mascota);
	}

	/**
	 * Remove a media entry from a mascota by URL. Returns the updated Mascota.
	 * Also attempts to delete the underlying file in /uploads if the URL refers to a local upload.
	 */
	public Mascota removeMedia(Long id, String rawUrl) {
		java.util.Optional<Mascota> maybe = mascotaRepository.findById(id);
		if (!maybe.isPresent()) throw new IllegalArgumentException("Mascota no encontrada");
		Mascota mascota = maybe.get();
		if (rawUrl == null || rawUrl.trim().isEmpty()) return mascota;
		String apiBase = java.util.Optional.ofNullable(System.getenv().get("API_BASE")).orElse("http://localhost:8082");
		// canonicalize incoming URL similar to normalizeAndDedupeMedia
		String url = rawUrl.trim();
		if (!url.startsWith("http")) url = (url.startsWith("/") ? apiBase + url : apiBase + "/" + url.replaceAll("^/+", ""));
		int q = url.indexOf('?'); if (q >= 0) url = url.substring(0, q);
		int h = url.indexOf('#'); if (h >= 0) url = url.substring(0, h);
		while (url.length() > 1 && url.endsWith("/")) url = url.substring(0, url.length() - 1);
		String canonical = url.toLowerCase();

		com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
		java.util.List<java.util.Map<String,String>> existing = new java.util.ArrayList<>();
		if (mascota.getMediaJson() != null && !mascota.getMediaJson().isEmpty()) {
			try {
				existing = om.readValue(mascota.getMediaJson(), java.util.List.class);
			} catch (java.io.IOException ex) {
				existing = new java.util.ArrayList<>();
			}
		}
		java.util.List<java.util.Map<String,String>> kept = new java.util.ArrayList<>();
		boolean removed = false;
		for (java.util.Map<String,String> it : existing) {
			if (it == null) continue;
			String u = it.getOrDefault("url", "");
			if (u == null || u.trim().isEmpty()) continue;
			String full = u.startsWith("http") ? u : (u.startsWith("/") ? apiBase + u : apiBase + "/" + u.replaceAll("^/+", ""));
			int q2 = full.indexOf('?'); if (q2 >= 0) full = full.substring(0, q2);
			int h2 = full.indexOf('#'); if (h2 >= 0) full = full.substring(0, h2);
			while (full.length() > 1 && full.endsWith("/")) full = full.substring(0, full.length() - 1);
			String canonFull = full.toLowerCase();
			if (canonFull.equals(canonical)) {
				// remove this one
				removed = true;
				// attempt to delete file on disk if it's a local upload
				try {
					String localPath = null;
					if (full.startsWith(apiBase)) {
						String rel = full.substring(apiBase.length());
						if (rel.startsWith("/")) rel = rel.substring(1);
						localPath = System.getProperty("user.dir") + System.getProperty("file.separator") + rel.replace('/', java.io.File.separatorChar);
					} else if (full.contains("/uploads/")) {
						int idx = full.indexOf("/uploads/");
						String rel = full.substring(idx + 1);
						localPath = System.getProperty("user.dir") + System.getProperty("file.separator") + rel.replace('/', java.io.File.separatorChar);
					}
					if (localPath != null) {
						java.io.File f = new java.io.File(localPath);
						if (f.exists() && f.isFile()) {
							try {
								// move to uploads/trash with timestamp prefix instead of deleting
								String uploadsDir = System.getProperty("user.dir") + System.getProperty("file.separator") + "uploads";
								java.io.File trashDir = new java.io.File(uploadsDir + System.getProperty("file.separator") + "trash");
								if (!trashDir.exists()) trashDir.mkdirs();
								String baseName = f.getName();
								String targetName = System.currentTimeMillis() + "-" + baseName;
								java.nio.file.Path src = f.toPath();
								java.nio.file.Path dst = trashDir.toPath().resolve(targetName);
								java.nio.file.Files.move(src, dst, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
							} catch (Exception e) {
								// fallback: attempt delete if move fails
								try { f.delete(); } catch (Exception ignore) {}
							}
						}
					}
				} catch (Exception e) {
					// ignore file deletion errors
				}
				continue;
			}
			kept.add(it);
		}
		try {
			mascota.setMediaJson(kept.isEmpty() ? null : om.writeValueAsString(kept));
		} catch (com.fasterxml.jackson.core.JsonProcessingException e) {
			mascota.setMediaJson(null);
		}
		if (removed) {
			return mascotaRepository.save(mascota);
		}
		return mascota;
	}

	/**
	 * Normalize and dedupe an incoming media list. Ensures URLs are absolute (prefixed with API_BASE when needed)
	 * and removes duplicate entries by URL.
	 */
	private java.util.List<java.util.Map<String,String>> normalizeAndDedupeMedia(java.util.List<java.util.Map<String,String>> raw) {
		java.util.List<java.util.Map<String,String>> out = new java.util.ArrayList<>();
		if (raw == null) return out;
		String apiBase = java.util.Optional.ofNullable(System.getenv().get("API_BASE")).orElse("http://localhost:8082");
		java.util.Set<String> seen = new java.util.HashSet<>();
		for (java.util.Map<String,String> it : raw) {
			if (it == null) continue;
			String url = it.getOrDefault("url", "").trim();
			if (url.isEmpty()) continue;
			if (!url.startsWith("http")) {
				url = apiBase + (url.startsWith("/") ? url : ("/uploads/" + url));
			}
			// canonicalize: remove query/hash, trailing slash and lowercase for dedupe
			int q = url.indexOf('?'); if (q >= 0) url = url.substring(0, q);
			int h = url.indexOf('#'); if (h >= 0) url = url.substring(0, h);
			if (url.length() > 1 && url.endsWith("/")) url = url.substring(0, url.length() - 1);
			String canonical = url.toLowerCase();
			if (seen.contains(canonical)) continue;
			seen.add(canonical);
			java.util.Map<String,String> copy = new java.util.HashMap<>();
			copy.put("url", canonical);
			copy.put("type", it.getOrDefault("type", ""));
			out.add(copy);
		}
		return out;
	}

	public Mascota actualizarMascota(Long id, com.example.pets_service.controller.MascotaController.MascotaRegistroDTO mascotaDTO) {
		java.util.Optional<Mascota> maybe = mascotaRepository.findById(id);
		if (!maybe.isPresent()) throw new IllegalArgumentException("Mascota no encontrada");
		Mascota mascota = maybe.get();

		// Seguridad mínima: si propietarioId se envía, debe coincidir
		if (mascotaDTO.getPropietarioId() != null && !mascotaDTO.getPropietarioId().equals(mascota.getPropietarioId())) {
			throw new IllegalArgumentException("No tienes permiso para editar esta mascota");
		}

		// Actualizar campos permitidos (si vienen)
		if (mascotaDTO.getNombre() != null) mascota.setNombre(mascotaDTO.getNombre());
		if (mascotaDTO.getEspecie() != null) mascota.setEspecie(mascotaDTO.getEspecie());
		if (mascotaDTO.getRaza() != null) mascota.setRaza(mascotaDTO.getRaza());
		if (mascotaDTO.getSexo() != null) mascota.setSexo(mascotaDTO.getSexo());
		if (mascotaDTO.getUbicacion() != null) mascota.setUbicacion(mascotaDTO.getUbicacion());
		if (mascotaDTO.getDescripcion() != null) mascota.setDescripcion(mascotaDTO.getDescripcion());
		if (mascotaDTO.getChip() != null) mascota.setChip(mascotaDTO.getChip());
		if (mascotaDTO.getDocumentos() != null) mascota.setDocumentos(String.join(",", mascotaDTO.getDocumentos()));
		if (mascotaDTO.getEnfermedades() != null) mascota.setEnfermedades(String.join(",", mascotaDTO.getEnfermedades()));
		if (mascotaDTO.getVacunas() != null) mascota.setVacunas(String.join(",", mascotaDTO.getVacunas()));
		if (mascotaDTO.getEsterilizado() != null) mascota.setEsterilizado(mascotaDTO.getEsterilizado());
		if (mascotaDTO.getFoto() != null && !mascotaDTO.getFoto().isEmpty()) mascota.setImagenUrl(mascotaDTO.getFoto());

		// Si se envía fechaNacimiento, recalcular edad y guardarla
		if (mascotaDTO.getFechaNacimiento() != null && !mascotaDTO.getFechaNacimiento().isEmpty()) {
			try {
				java.time.LocalDate fechaNac = java.time.LocalDate.parse(mascotaDTO.getFechaNacimiento(), java.time.format.DateTimeFormatter.ISO_LOCAL_DATE);
				java.time.LocalDate ahora = java.time.LocalDate.now();
				int edad = java.time.Period.between(fechaNac, ahora).getYears();
				mascota.setEdad(edad >= 0 ? edad : 0);
				// Guardar también la fechaNacimiento en la entidad
				mascota.setFechaNacimiento(fechaNac);
			} catch (Exception e) {
				// si no se puede parsear, no modificar edad
			}
		}

		// Si se envía tamaño, intentar mapear a peso (si viene textual)
		if (mascotaDTO.getTamaño() != null && !mascotaDTO.getTamaño().isEmpty()) {
			String t = mascotaDTO.getTamaño();
			try {
				// intentar parsear número por si el frontend envía peso
				java.math.BigDecimal bd = new java.math.BigDecimal(t);
				mascota.setPeso(bd);
			} catch (Exception ex) {
				// mapear por palabras clave
				String s = t.toLowerCase();
				if (s.contains("peque")) mascota.setPeso(new java.math.BigDecimal("5.0"));
				else if (s.contains("med") || s.contains("medio")) mascota.setPeso(new java.math.BigDecimal("15.0"));
				else if (s.contains("grand")) mascota.setPeso(new java.math.BigDecimal("30.0"));
			}
		}

		// Media: if media provided, save JSON; otherwise if foto provided ensure mediaJson contains it so gallery persists
		try {
			com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
			if (mascotaDTO.getMedia() != null) {
				// Treat incoming media as authoritative (the client sends the desired final list).
				java.util.List<java.util.Map<String,String>> cleaned = normalizeAndDedupeMedia(mascotaDTO.getMedia());
				// debug: print cleaned media to logs to diagnose duplicate persistence
				System.out.println("[MascotaService.actualizarMascota] cleaned media (from incoming): " + cleaned);
				mascota.setMediaJson(om.writeValueAsString(cleaned));
			} else if (mascotaDTO.getFoto() != null && !mascotaDTO.getFoto().isEmpty()) {
				java.util.List<java.util.Map<String,String>> list = new java.util.ArrayList<>();
				java.util.Map<String,String> item = new java.util.HashMap<>();
				item.put("url", mascotaDTO.getFoto());
				item.put("type", "image/*");
				list.add(item);
				mascota.setMediaJson(om.writeValueAsString(list));
			}
		} catch (com.fasterxml.jackson.core.JsonProcessingException e) {
			// ignore on serialization errors
		}

		return mascotaRepository.save(mascota);
	}

	// Helper to fetch mascota by id
	public Mascota listarPorId(Long id) {
		return mascotaRepository.findById(id).orElse(null);
	}

}
