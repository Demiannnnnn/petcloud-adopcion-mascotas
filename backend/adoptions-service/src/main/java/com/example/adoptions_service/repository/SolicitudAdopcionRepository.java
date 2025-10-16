package com.example.adoptions_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.adoptions_service.model.SolicitudAdopcion;

public interface SolicitudAdopcionRepository extends JpaRepository<SolicitudAdopcion, Long> {
	List<SolicitudAdopcion> findByAdoptanteId(Long adoptanteId);
}
