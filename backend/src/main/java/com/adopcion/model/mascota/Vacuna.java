package com.adopcion.model.mascota;

import java.util.Date;

public class Vacuna {
    private Long id;
    private String nombre;
    private Date fechaAplicacion;
    private Date proximaDosis;
    
    // Getters y setters
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getNombre() {
        return nombre;
    }
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    public Date getFechaAplicacion() {
        return fechaAplicacion;
    }
    public void setFechaAplicacion(Date fechaAplicacion) {
        this.fechaAplicacion = fechaAplicacion;
    }
    public Date getProximaDosis() {
        return proximaDosis;
    }
    public void setProximaDosis(Date proximaDosis) {
        this.proximaDosis = proximaDosis;
    }
}
