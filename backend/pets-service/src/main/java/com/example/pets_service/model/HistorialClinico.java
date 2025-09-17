package com.example.pets_service.model;

import jakarta.persistence.*;
import java.util.Date;

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
