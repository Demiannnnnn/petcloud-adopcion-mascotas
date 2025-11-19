
package com.example.users_service.model;

import jakarta.persistence.Entity;


@Entity
public class Persona extends Perfil {

    private String nombreCompleto;
    private String ubicacion;
    private String numeroWhatsapp;
    private java.time.LocalDate fechaNacimiento;

    // Getters y setters
    public String getNombreCompleto() { return nombreCompleto; }
    public void setNombreCompleto(String nombreCompleto) { this.nombreCompleto = nombreCompleto; }
    public String getUbicacion() { return ubicacion; }
    public void setUbicacion(String ubicacion) { this.ubicacion = ubicacion; }
    public String getNumeroWhatsapp() { return numeroWhatsapp; }
    public void setNumeroWhatsapp(String numeroWhatsapp) { this.numeroWhatsapp = numeroWhatsapp; }
    public java.time.LocalDate getFechaNacimiento() { return fechaNacimiento; }
    public void setFechaNacimiento(java.time.LocalDate fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; }

    @Override
    public void actualizarDocumentos(Documento d) { }
    @Override
    public void registrarMascota(Long mascotaId) { }
}
