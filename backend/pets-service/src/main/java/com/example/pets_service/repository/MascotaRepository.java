
package com.example.pets_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.pets_service.model.Mascota;

@Repository
public interface MascotaRepository extends JpaRepository<Mascota, Long> {
	// Métodos personalizados si son necesarios
}
