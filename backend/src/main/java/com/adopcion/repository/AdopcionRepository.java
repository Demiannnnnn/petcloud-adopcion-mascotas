package com.adopcion.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.adopcion.model.Adopcion;

public interface AdopcionRepository extends JpaRepository<Adopcion, Long> {
}
