package com.example.adoptions_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.adoptions_service.model.Notificacion;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
	// Delete all notifications for a destinatario and return count deleted
	long deleteByDestinatarioId(Long destinatarioId);

	@Modifying
	@Query("update Notificacion n set n.leida = true where n.destinatarioId = :destinatarioId")
	int markAllReadByDestinatarioId(@Param("destinatarioId") Long destinatarioId);

}
