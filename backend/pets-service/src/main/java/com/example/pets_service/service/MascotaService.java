
package com.example.pets_service.service;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.pets_service.controller.MascotaController.MascotaRegistroDTO;
import com.example.pets_service.model.Mascota;
import com.example.pets_service.repository.MascotaRepository;

@Service
public class MascotaService {
	public List<Mascota> listarPorPropietario(Long propietarioId) {
		return mascotaRepository.findByPropietarioId(propietarioId);
	}
	private final MascotaRepository mascotaRepository;

	@Autowired
	public MascotaService(MascotaRepository mascotaRepository) {
		this.mascotaRepository = mascotaRepository;
	}

	public List<Mascota> listarMascotas() {
		return mascotaRepository.findAll();
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
		
		// Manejar esterilizado (viene como boolean del frontend)
		if (mascotaDTO.getEsterilizado() != null) {
			mascota.setEsterilizado(Boolean.parseBoolean(mascotaDTO.getEsterilizado()));
		} else {
			mascota.setEsterilizado(false);
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
