
package com.example.pets_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.pets_service.model.Mascota;

@Repository
public interface MascotaRepository extends JpaRepository<Mascota, Long> {
	// Buscar mascotas por propietario
	java.util.List<Mascota> findByPropietarioId(Long propietarioId);
	// Buscar mascotas por refugio (null si no aplica)
	java.util.List<Mascota> findByRefugioId(Long refugioId);
}
