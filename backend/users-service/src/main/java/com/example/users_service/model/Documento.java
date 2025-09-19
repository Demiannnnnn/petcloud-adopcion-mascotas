package com.example.users_service.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class Documento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private String tipo;
    private String nombreArchivo;
    private Boolean validado;
    private java.sql.Timestamp fechaSubida;
    @ManyToOne
    private Perfil perfil;
    @jakarta.persistence.Lob
    private byte[] archivo;

    // Getters y setters
    public byte[] getArchivo() { return archivo; }
    public void setArchivo(byte[] archivo) { this.archivo = archivo; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public String getNombreArchivo() { return nombreArchivo; }
    public void setNombreArchivo(String nombreArchivo) { this.nombreArchivo = nombreArchivo; }
    public Boolean getValidado() { return validado; }
    public void setValidado(Boolean validado) { this.validado = validado; }
    public java.sql.Timestamp getFechaSubida() { return fechaSubida; }
    public void setFechaSubida(java.sql.Timestamp fechaSubida) { this.fechaSubida = fechaSubida; }
    public Perfil getPerfil() { return perfil; }
    public void setPerfil(Perfil perfil) { this.perfil = perfil; }
}
