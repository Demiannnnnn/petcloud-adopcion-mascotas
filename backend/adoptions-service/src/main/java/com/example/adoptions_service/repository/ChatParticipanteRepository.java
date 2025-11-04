package com.example.adoptions_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.adoptions_service.model.ChatParticipante;

public interface ChatParticipanteRepository extends JpaRepository<ChatParticipante, Long> {

	java.util.List<com.example.adoptions_service.model.ChatParticipante> findByChatId(Long chatId);

	java.util.List<com.example.adoptions_service.model.ChatParticipante> findByPerfilId(Long perfilId);

}
