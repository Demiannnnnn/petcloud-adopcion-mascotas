package com.adopcion.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.adopcion.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
	Usuario findByUsername(String username);
}
