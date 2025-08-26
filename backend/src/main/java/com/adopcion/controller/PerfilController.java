package com.adopcion.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.adopcion.model.perfil.Perfil;
import com.adopcion.model.perfil.Persona;
import com.adopcion.model.documento.Documento;
import com.adopcion.repository.PerfilRepository;
import com.adopcion.repository.DocumentoRepository;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")

public class PerfilController {
    @Autowired
    private PerfilRepository perfilRepository;

    @Autowired
    private DocumentoRepository documentoRepository;

    @GetMapping
    public List<Perfil> getAll() {
        return perfilRepository.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Perfil> getById(@PathVariable Long id) {
        return perfilRepository.findById(id);
    }

    @PostMapping
    public Persona create(@RequestBody Persona persona) {
        return perfilRepository.save(persona);
    }

    @PutMapping("/{id}")
    public Persona update(@PathVariable Long id, @RequestBody Persona persona) {
        persona.setId(id);
        // Robustez: Si certificadoAntecedentes tiene id, buscarlo por internalId o por id (string)
        if (persona.getCertificadoAntecedentes() != null) {
            Documento cert = persona.getCertificadoAntecedentes();
            Documento existente = null;
            if (cert.getInternalId() != null) {
                existente = documentoRepository.findById(cert.getInternalId()).orElse(null);
            }
            // Si no se encontró por internalId, buscar por id (string)
            if (existente == null && cert.getId() != null && !cert.getId().isEmpty()) {
                // Buscar por id (string) manualmente
                existente = documentoRepository.findAll().stream()
                    .filter(d -> cert.getId().equals(d.getId()))
                    .findFirst().orElse(null);
            }
            if (existente != null) {
                persona.setCertificadoAntecedentes(existente);
            } else if (cert.getId() != null && !cert.getId().isEmpty()) {
                // Si no existe, guardar el nuevo documento
                persona.setCertificadoAntecedentes(documentoRepository.save(cert));
            } else {
                persona.setCertificadoAntecedentes(null);
            }
        }
        return perfilRepository.save(persona);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        perfilRepository.deleteById(id);
    }
}
