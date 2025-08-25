package com.adopcion.model.donacion;

import java.util.Date;
import com.adopcion.model.perfil.Perfil;
import com.adopcion.model.perfil.Empresa;

public class Donacion {
    private Long id;
    private Double monto;
    private boolean recurrente;
    private Perfil donante;
    private Empresa receptor;
    private Date fecha;
    
    // Getters y setters
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public Double getMonto() {
        return monto;
    }
    public void setMonto(Double monto) {
        this.monto = monto;
    }
    public boolean isRecurrente() {
        return recurrente;
    }
    public void setRecurrente(boolean recurrente) {
        this.recurrente = recurrente;
    }
    public Perfil getDonante() {
        return donante;
    }
    public void setDonante(Perfil donante) {
        this.donante = donante;
    }
    public Empresa getReceptor() {
        return receptor;
    }
    public void setReceptor(Empresa receptor) {
        this.receptor = receptor;
    }
    public Date getFecha() {
        return fecha;
    }
    public void setFecha(Date fecha) {
        this.fecha = fecha;
    }
}
