package com.example.users_service.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.users_service.model.Empresa;

public interface EmpresaRepository extends JpaRepository<Empresa, Long> {
	Optional<Empresa> findByRutEmpresa(String rutEmpresa);
}
