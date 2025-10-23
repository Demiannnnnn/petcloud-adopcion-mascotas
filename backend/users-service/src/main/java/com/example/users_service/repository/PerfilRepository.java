package com.example.users_service.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.users_service.model.Perfil;

public interface PerfilRepository extends JpaRepository<Perfil, Long> {
	Optional<Perfil> findByCorreo(String correo);
	Optional<Perfil> findByRut(String rut);
}
