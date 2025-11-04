package com.example.adoptions_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.adoptions_service.model.Mensaje;

public interface MensajeRepository extends JpaRepository<Mensaje, Long> {
    List<Mensaje> findByChatIdOrderByFechaAsc(Long chatId);
}

