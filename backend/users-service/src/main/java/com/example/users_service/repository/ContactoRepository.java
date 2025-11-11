package com.example.users_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.users_service.model.Contacto;

public interface ContactoRepository extends JpaRepository<Contacto, Long> {
    java.util.List<Contacto> findByOwnerPerfilId(Long ownerPerfilId);
    java.util.List<Contacto> findByContactoPerfilId(Long contactoPerfilId);
    java.util.Optional<Contacto> findByOwnerPerfilIdAndContactoPerfilId(Long owner, Long contacto);
}
