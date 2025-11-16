
package com.example.users_service.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Entity;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "perfil"})
public class Empresa extends Perfil {

    private String nombreEmpresa;
    private boolean verificado;
    private String rutEmpresa;
    private String direccion;
    private String telefonoContacto;

    // Getters y setters
    public String getNombreEmpresa() { return nombreEmpresa; }
    public void setNombreEmpresa(String nombreEmpresa) { this.nombreEmpresa = nombreEmpresa; }
    public boolean isVerificado() { return verificado; }
    public void setVerificado(boolean verificado) { this.verificado = verificado; }
    public String getRutEmpresa() { return rutEmpresa; }
    public void setRutEmpresa(String rutEmpresa) { this.rutEmpresa = rutEmpresa; }
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    public String getTelefonoContacto() { return telefonoContacto; }
    public void setTelefonoContacto(String telefonoContacto) { this.telefonoContacto = telefonoContacto; }

    @Override
    public void actualizarDocumentos(Documento d) { }
    @Override
    public void registrarMascota(Long mascotaId) { }
}
