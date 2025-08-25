package com.adopcion.service.factory;

import com.adopcion.model.perfil.Persona;
import com.adopcion.model.perfil.Empresa;

public class SistemaAutenticacion {
    private static SistemaAutenticacion instancia;

    private SistemaAutenticacion() {}

    public static SistemaAutenticacion getInstance() {
        if (instancia == null) {
            instancia = new SistemaAutenticacion();
        }
        return instancia;
    }

    public Persona loginPersona(String rut, String contrasena) {
        // Lógica de autenticación para persona
        return null;
    }

    public Empresa loginEmpresa(String rut, String contrasena) {
        // Lógica de autenticación para empresa
        return null;
    }
}
