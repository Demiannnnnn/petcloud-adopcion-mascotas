package com.adopcion.model.solicitud;

import jakarta.persistence.*;
import java.util.Date;
import com.adopcion.model.perfil.Perfil;
import com.adopcion.model.mascota.Mascota;

@Entity
public class SolicitudAdopcion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Temporal(TemporalType.TIMESTAMP)
    private Date fecha;

    @Transient // State pattern, no persistido directamente
    private EstadoSolicitud estado;

    @ManyToOne
    private Perfil adoptante;

    @ManyToOne
    private Mascota mascota;

    public boolean validarRequisitos() {
        // Lógica de validación según requisitos del diagrama
        return adoptante != null && mascota != null;
    }

    public void cambiarEstado(EstadoSolicitud e) {
        this.estado = e;
    }

    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Date getFecha() { return fecha; }
    public void setFecha(Date fecha) { this.fecha = fecha; }
    public EstadoSolicitud getEstado() { return estado; }
    public void setEstado(EstadoSolicitud estado) { this.estado = estado; }
    public Perfil getAdoptante() { return adoptante; }
    public void setAdoptante(Perfil adoptante) { this.adoptante = adoptante; }
    public Mascota getMascota() { return mascota; }
    public void setMascota(Mascota mascota) { this.mascota = mascota; }
}
