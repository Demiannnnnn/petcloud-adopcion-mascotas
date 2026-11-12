package com.example.users_service.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import com.example.users_service.model.Empresa;
import com.example.users_service.model.Persona;
import com.example.users_service.repository.EmpresaRepository;
import com.example.users_service.repository.PersonaRepository;

@Service
public class SistemaAutenticacion {
    public boolean personaExiste(String rut) {
        return personaRepository.findByRut(rut).isPresent();
    }

    public boolean empresaExiste(String rut) {
        return empresaRepository.findByRutEmpresa(rut).isPresent();
    }


    @Autowired
    private PersonaRepository personaRepository;
    @Autowired
    private EmpresaRepository empresaRepository;

    public SistemaAutenticacion() {}


    private boolean verificarContraseña(String contraseña, String hashGuardado) {
        if (contraseña == null || hashGuardado == null || !hashGuardado.startsWith("$2")) {
            return false;
        }
        try {
            return BCrypt.checkpw(contraseña, hashGuardado);
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    public Persona loginPersona(String rut, String contraseña) {
        return personaRepository.findByRut(rut)
            .filter(persona -> verificarContraseña(contraseña, persona.getContraseña()))
            .orElse(null);
    }

    public Empresa loginEmpresa(String rut, String contraseña) {
        return empresaRepository.findByRutEmpresa(rut)
            .filter(empresa -> verificarContraseña(contraseña, empresa.getContraseña()))
            .orElse(null);
    }

    public com.example.users_service.model.Perfil getPerfilById(Long id) {
        // Buscar primero en Persona
        java.util.Optional<Persona> p = personaRepository.findById(id);
        if (p.isPresent()) return p.get();
        java.util.Optional<Empresa> e = empresaRepository.findById(id);
        if (e.isPresent()) return e.get();
        return null;
    }
}