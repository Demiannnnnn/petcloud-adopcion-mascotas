package com.adopcion.service.state;

public interface EstadoSolicitud {
    void aprobar();
    void rechazar();
    void pendiente();
}
