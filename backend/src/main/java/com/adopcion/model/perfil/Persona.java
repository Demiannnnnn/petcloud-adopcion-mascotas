
package com.adopcion.model.perfil;

import com.adopcion.model.documento.Documento;
import com.adopcion.model.filtrodebusqueda.FiltroDeBusqueda;
import com.adopcion.model.mascota.Mascota;
import java.util.List;

import jakarta.persistence.Entity;

@Entity
public class Persona extends Perfil {
    public Persona() {
        super();
    }
    private String nombreCompleto;

    @jakarta.persistence.OneToOne(cascade = jakarta.persistence.CascadeType.ALL)
    private Documento certificadoAntecedentes;

    private String ubicacion;
    private String numeroWhatsapp;

    @Override
    public void actualizarDocumentos(Documento d) {
        // Implementación específica para Persona
    }

    @Override
    public void registrarMascota(Mascota m) {
        // Implementación específica para Persona
    }

    @Override
    public List<Mascota> buscarMascota(FiltroDeBusqueda filtro) {
        // Implementación específica para Persona
        return null;
    }

    // Getters y setters

    @Override
    public String getCorreo() {
        return super.getCorreo();
    }

    @Override
    public void setCorreo(String correo) {
        super.setCorreo(correo);
    }

    @Override
    public String getContrasena() {
        return super.getContrasena();
    }

    @Override
    public void setContrasena(String contrasena) {
        super.setContrasena(contrasena);
    }

    @Override
    public String getUsername() {
        return super.getUsername();
    }

    @Override
    public void setUsername(String username) {
        super.setUsername(username);
    }
    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }

    public Documento getCertificadoAntecedentes() {
        return certificadoAntecedentes;
    }

    public void setCertificadoAntecedentes(Documento certificadoAntecedentes) {
        this.certificadoAntecedentes = certificadoAntecedentes;
    }

    public String getUbicacion() {
        return ubicacion;
    }

    public void setUbicacion(String ubicacion) {
        this.ubicacion = ubicacion;
    }

    public String getNumeroWhatsapp() {
        return numeroWhatsapp;
    }

    public void setNumeroWhatsapp(String numeroWhatsapp) {
        this.numeroWhatsapp = numeroWhatsapp;
    }
}
