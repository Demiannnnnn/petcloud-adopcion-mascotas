package com.adopcion.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.adopcion.model.documento.Documento;

public interface DocumentoRepository extends JpaRepository<Documento, Long> {
}
