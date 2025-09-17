package com.example.adoptions_service.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
public class SolicitudAdopcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Date fecha;

    private Long adoptanteId;
    private Long mascotaId;
    private String estado;

    @Column(columnDefinition = "TEXT")
    private String motivoRechazo;

    @Column(columnDefinition = "TEXT")
    private String comentariosAdoptante;

    private Date fechaRespuesta;

    private Long evaluadorId;

    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaSolicitud;

    public boolean validarRequisitos() { return true; }
    public void cambiarEstado(String nuevoEstado) { this.estado = nuevoEstado; }
}
