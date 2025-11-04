package com.example.adoptions_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.adoptions_service.model.Chat;

public interface ChatRepository extends JpaRepository<Chat, Long> {
    Chat findBySolicitudAdopcionId(Long solicitudId);
}

