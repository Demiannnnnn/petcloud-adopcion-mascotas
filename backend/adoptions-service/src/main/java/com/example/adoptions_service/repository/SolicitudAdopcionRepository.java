package com.example.adoptions_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.adoptions_service.model.EstadoSolicitud;
import com.example.adoptions_service.model.SolicitudAdopcion;

public interface SolicitudAdopcionRepository extends JpaRepository<SolicitudAdopcion, Long> {
	List<SolicitudAdopcion> findByAdoptanteId(Long adoptanteId);

	List<SolicitudAdopcion> findByMascotaId(Long mascotaId);

	List<SolicitudAdopcion> findByMascotaIdIn(java.util.List<Long> mascotaIds);
    
	List<SolicitudAdopcion> findByEstado(EstadoSolicitud estado);
}
