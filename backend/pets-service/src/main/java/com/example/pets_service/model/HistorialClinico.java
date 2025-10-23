package com.example.pets_service.model;

import java.util.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class HistorialClinico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Date fecha;
    private String descripcion;
    private String veterinario;

    private String tipoConsulta;
    private java.math.BigDecimal costo;

    @ManyToOne
    @JoinColumn(name = "mascota_id")
    private Mascota mascota;

    public Mascota getMascota() { return mascota; }
    public void setMascota(Mascota mascota) { this.mascota = mascota; }

    public String getTipoConsulta() { return tipoConsulta; }
    public void setTipoConsulta(String tipoConsulta) { this.tipoConsulta = tipoConsulta; }

    public java.math.BigDecimal getCosto() { return costo; }
    public void setCosto(java.math.BigDecimal costo) { this.costo = costo; }
}
