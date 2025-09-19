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


    public Persona loginPersona(String rut, String contraseña) {
        return personaRepository.findByRut(rut)
            .filter(persona -> BCrypt.checkpw(contraseña, persona.getContraseña()))
            .orElse(null);
    }

    public Empresa loginEmpresa(String rut, String contraseña) {
        return empresaRepository.findByRutEmpresa(rut)
            .filter(empresa -> org.springframework.security.crypto.bcrypt.BCrypt.checkpw(contraseña, empresa.getContraseña()))
            .orElse(null);
    }
}