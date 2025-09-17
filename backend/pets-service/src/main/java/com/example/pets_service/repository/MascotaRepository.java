
package com.example.pets_service.repository;

import com.example.pets_service.model.Mascota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MascotaRepository extends JpaRepository<Mascota, Long> {
	// Métodos personalizados si son necesarios
}
