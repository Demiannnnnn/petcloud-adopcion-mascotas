package com.example.users_service.model;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.OneToMany;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Perfil {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tipoPerfil; // PERSONA o EMPRESA
    private String rut;
    private String correo;
    private String contraseña;
    private String condicionesHogar;
    private Boolean activo;

    @OneToMany(mappedBy = "perfil", cascade = CascadeType.ALL)
    private List<Documento> documentosLegales;

    // Getters y setters
    public Long getId() { return id; }
    // El id se genera automáticamente, no se debe asignar manualmente
    // public void setId(Long id) { this.id = id; }
    public String getTipoPerfil() { return tipoPerfil; }
    public void setTipoPerfil(String tipoPerfil) { this.tipoPerfil = tipoPerfil; }
    public String getRut() { return rut; }
    public void setRut(String rut) { this.rut = rut; }
    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }
    public String getContraseña() { return contraseña; }
    public void setContraseña(String contraseña) { this.contraseña = contraseña; }
    public String getCondicionesHogar() { return condicionesHogar; }
    public void setCondicionesHogar(String condicionesHogar) { this.condicionesHogar = condicionesHogar; }
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    public List<Documento> getDocumentosLegales() { return documentosLegales; }
    public void setDocumentosLegales(List<Documento> documentosLegales) { this.documentosLegales = documentosLegales; }

    // Métodos
    public abstract void actualizarDocumentos(Documento d);
    public abstract void registrarMascota(Long mascotaId); // solo referencia
}
