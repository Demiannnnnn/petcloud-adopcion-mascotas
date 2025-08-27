package com.example.users_service.model;

import jakarta.persistence.*;

@Entity
public class Empresa extends Perfil {

    private String nombreEmpresa;
    private boolean verificado;

    @OneToOne
    private Documento certificadoLegal;

    @Override
    public void actualizarDocumentos(Documento d) { }
    @Override
    public void registrarMascota(Long mascotaId) { }
}
