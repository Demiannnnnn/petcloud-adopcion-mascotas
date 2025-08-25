package com.adopcion.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.adopcion.model.perfil.Perfil;

public interface PerfilRepository extends JpaRepository<Perfil, Long> {
	Perfil findByUsername(String username);
}
