package com.adopcion.service.state;

public class EstadoPendiente implements EstadoSolicitud {
    @Override
    public void aprobar() {
        // Lógica para aprobar
    }
    @Override
    public void rechazar() {
        // Lógica para rechazar
    }
    @Override
    public void pendiente() {
        // Lógica para dejar pendiente
    }
}
