package com.example.adoptions_service.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
public class SolicitudAdopcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Date fecha;

    @ManyToOne
    private Perfil adoptante;

    @ManyToOne
    private Mascota mascota;

    @Enumerated(EnumType.STRING)
    private EstadoSolicitud estado;

    public boolean validarRequisitos() { return true; }
    public void cambiarEstado(EstadoSolicitud nuevoEstado) { this.estado = nuevoEstado; }
}
