package com.adopcion.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.adopcion.model.mascota.Mascota;

public interface MascotaRepository extends JpaRepository<Mascota, Long> {
}
