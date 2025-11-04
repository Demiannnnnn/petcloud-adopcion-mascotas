package com.example.adoptions_service.model;

import java.util.Date;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

@Entity
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private java.util.List<Long> participantes;

    @OneToMany(cascade = CascadeType.ALL)
    private List<Mensaje> mensajes;

    private Long solicitudAdopcionId;

    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaCreacion;

    private Boolean activo;
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public java.util.List<Long> getParticipantes() { return participantes; }
    public void setParticipantes(java.util.List<Long> participantes) { this.participantes = participantes; }

    public List<Mensaje> getMensajes() { return mensajes; }
    public void setMensajes(List<Mensaje> mensajes) { this.mensajes = mensajes; }

    public Long getSolicitudAdopcionId() { return solicitudAdopcionId; }
    public void setSolicitudAdopcionId(Long solicitudAdopcionId) { this.solicitudAdopcionId = solicitudAdopcionId; }

    public Date getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(Date fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}
