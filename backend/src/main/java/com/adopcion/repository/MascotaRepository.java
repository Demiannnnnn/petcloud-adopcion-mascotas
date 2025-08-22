package com.adopcion.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.adopcion.model.Mascota;

public interface MascotaRepository extends JpaRepository<Mascota, Long> {
}
