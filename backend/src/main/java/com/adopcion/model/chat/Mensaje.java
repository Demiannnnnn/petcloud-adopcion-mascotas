package com.adopcion.model.chat;

import java.util.Date;
import com.adopcion.model.perfil.Perfil;

public class Mensaje {
    private Long id;
    private Perfil remitente;
    private String contenido;
    private Date fecha;
    private boolean leido;
    
    // Getters y setters
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public Perfil getRemitente() {
        return remitente;
    }
    public void setRemitente(Perfil remitente) {
        this.remitente = remitente;
    }
    public String getContenido() {
        return contenido;
    }
    public void setContenido(String contenido) {
        this.contenido = contenido;
    }
    public Date getFecha() {
        return fecha;
    }
    public void setFecha(Date fecha) {
        this.fecha = fecha;
    }
    public boolean isLeido() {
        return leido;
    }
    public void setLeido(boolean leido) {
        this.leido = leido;
    }
}
