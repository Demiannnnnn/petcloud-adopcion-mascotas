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
import com.adopcion.repository.PerfilRepository;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class PerfilController {
    @Autowired
    private PerfilRepository perfilRepository;

    @GetMapping
    public List<Perfil> getAll() {
        return perfilRepository.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Perfil> getById(@PathVariable Long id) {
        return perfilRepository.findById(id);
    }

    @PostMapping
    public Perfil create(@RequestBody Perfil perfil) {
        return perfilRepository.save(perfil);
    }

    @PutMapping("/{id}")
    public Perfil update(@PathVariable Long id, @RequestBody Perfil perfil) {
        perfil.setId(id);
        return perfilRepository.save(perfil);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        perfilRepository.deleteById(id);
    }
}
