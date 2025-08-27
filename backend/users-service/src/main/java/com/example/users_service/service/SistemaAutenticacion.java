package com.example.users_service.service;

import com.adopcion.users.model.Persona;
import com.adopcion.users.model.Empresa;

public class SistemaAutenticacion {

    private static SistemaAutenticacion instancia;

    private SistemaAutenticacion() {}

    public static SistemaAutenticacion getInstance() {
        if(instancia == null) instancia = new SistemaAutenticacion();
        return instancia;
    }

    public Persona loginPersona(String rut, String contraseña) { return null; }
    public Empresa loginEmpresa(String rut, String contraseña) { return null; }
}