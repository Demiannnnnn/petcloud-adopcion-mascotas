
package com.example.pets_service.service;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;
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
			dto.sexo = m.getSexo();
			dto.ubicacion = m.getUbicacion();
			dto.descripcion = m.getDescripcion();
			dto.disponibleAdopcion = m.getDisponibleAdopcion();
			dto.fechaRegistro = m.getFechaRegistro();
			dto.imagenUrl = m.getImagenUrl();
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
			out.add(dto);
		}
		return out;
	}

	public List<Mascota> listarPorRefugio(Long refugioId) {
		return mascotaRepository.findByRefugioId(refugioId);
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
			} catch (Exception e) {
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
	// Guardar y retornar
	return mascotaRepository.save(mascota);
	}
}
