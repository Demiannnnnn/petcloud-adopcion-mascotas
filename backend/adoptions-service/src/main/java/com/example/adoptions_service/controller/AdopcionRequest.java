package com.example.adoptions_service.controller;

public class AdopcionRequest {
    public Long mascotaId;
    public Long adoptanteId;
    public String mensaje;
    public String contacto;

    public Long getMascotaId() { return mascotaId; }
    public void setMascotaId(Long mascotaId) { this.mascotaId = mascotaId; }
    public Long getAdoptanteId() { return adoptanteId; }
    public void setAdoptanteId(Long adoptanteId) { this.adoptanteId = adoptanteId; }
    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
    public String getContacto() { return contacto; }
    public void setContacto(String contacto) { this.contacto = contacto; }
}
