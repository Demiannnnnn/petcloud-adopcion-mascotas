
package com.example.adoptions_service.model;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

@Entity
public class SolicitudAdopcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long mascotaId;
    private Long adoptanteId;
    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaSolicitud;
    private String estado;
    @Column(columnDefinition = "TEXT")
    private String motivoRechazo;
    @Column(columnDefinition = "TEXT")
    private String comentariosAdoptante;
    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaRespuesta;
    private Long evaluadorId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getMascotaId() { return mascotaId; }
    public void setMascotaId(Long mascotaId) { this.mascotaId = mascotaId; }

    public Long getAdoptanteId() { return adoptanteId; }
    public void setAdoptanteId(Long adoptanteId) { this.adoptanteId = adoptanteId; }

    public Date getFechaSolicitud() { return fechaSolicitud; }
    public void setFechaSolicitud(Date fechaSolicitud) { this.fechaSolicitud = fechaSolicitud; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getMotivoRechazo() { return motivoRechazo; }
    public void setMotivoRechazo(String motivoRechazo) { this.motivoRechazo = motivoRechazo; }

    public String getComentariosAdoptante() { return comentariosAdoptante; }
    public void setComentariosAdoptante(String comentariosAdoptante) { this.comentariosAdoptante = comentariosAdoptante; }

    public Date getFechaRespuesta() { return fechaRespuesta; }
    public void setFechaRespuesta(Date fechaRespuesta) { this.fechaRespuesta = fechaRespuesta; }

    public Long getEvaluadorId() { return evaluadorId; }
    public void setEvaluadorId(Long evaluadorId) { this.evaluadorId = evaluadorId; }
}