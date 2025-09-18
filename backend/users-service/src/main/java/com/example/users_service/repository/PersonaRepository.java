package com.example.users_service.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.users_service.model.Persona;

public interface PersonaRepository extends JpaRepository<Persona, Long> {
	Optional<Persona> findByRutAndContraseña(String rut, String contraseña);
	Optional<Persona> findByRut(String rut);
	Optional<Persona> findByCorreo(String correo);
}
