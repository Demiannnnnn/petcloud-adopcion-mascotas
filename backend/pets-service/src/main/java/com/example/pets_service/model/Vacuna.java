package com.example.pets_service.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
public class Vacuna {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "mascota_id")
    private Mascota mascota;

    private String nombre;
    private Date fechaAplicacion;
    private Date proximaDosis;
    private String lote;
    private String veterinario;

    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Mascota getMascota() { return mascota; }
    public void setMascota(Mascota mascota) { this.mascota = mascota; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public Date getFechaAplicacion() { return fechaAplicacion; }
    public void setFechaAplicacion(Date fechaAplicacion) { this.fechaAplicacion = fechaAplicacion; }

    public Date getProximaDosis() { return proximaDosis; }
    public void setProximaDosis(Date proximaDosis) { this.proximaDosis = proximaDosis; }

    public String getLote() { return lote; }
    public void setLote(String lote) { this.lote = lote; }

    public String getVeterinario() { return veterinario; }
    public void setVeterinario(String veterinario) { this.veterinario = veterinario; }
}
