package com.adopcion.service.state;

public class EstadoRechazada implements EstadoSolicitud {
    @Override
    public void aprobar() {
        // No se puede aprobar
    }
    @Override
    public void rechazar() {
        // Ya está rechazada
    }
    @Override
    public void pendiente() {
        // No se puede volver a pendiente
    }
}
