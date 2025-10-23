package com.example.users_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.users_service.model.Documento;

public interface DocumentoRepository extends JpaRepository<Documento, Long> {
    // Métodos personalizados si se requieren
}