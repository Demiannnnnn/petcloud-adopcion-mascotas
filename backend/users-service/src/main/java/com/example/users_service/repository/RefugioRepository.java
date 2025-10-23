package com.example.users_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.users_service.model.Refugio;

public interface RefugioRepository extends JpaRepository<Refugio, Long> {
    List<Refugio> findByEmpresaId(Long empresaId);
}
