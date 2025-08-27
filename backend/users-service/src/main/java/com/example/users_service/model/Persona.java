package com.example.users_service.model;

import jakarta.persistence.*;

@Entity
public class Persona extends Perfil {

    private String nombreCompleto;
    private String ubicacion;
    private String numeroWhatsapp;

    @OneToOne
    private Documento certificadoAntecedentes;

    @Override
    public void actualizarDocumentos(Documento d) { }
    @Override
    public void registrarMascota(Long mascotaId) { }
}
