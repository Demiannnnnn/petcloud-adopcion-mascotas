package com.adopcion.service.state;

public class EstadoAprobada implements EstadoSolicitud {
    @Override
    public void aprobar() {
        // Ya está aprobada
    }
    @Override
    public void rechazar() {
        // No se puede rechazar
    }
    @Override
    public void pendiente() {
        // No se puede volver a pendiente
    }
}
