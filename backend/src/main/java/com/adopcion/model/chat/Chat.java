package com.adopcion.model.chat;

import java.util.List;
import com.adopcion.model.perfil.Perfil;

public class Chat {
    private Long id;
    private List<Perfil> participantes;
    private List<Mensaje> mensajes;

    public void enviarMensaje(Mensaje m) {
        // Lógica para enviar mensaje
    }

    public List<Mensaje> obtenerHistorial() {
        // Lógica para obtener historial
        return mensajes;
    }
    // Getters y setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<Perfil> getParticipantes() {
        return participantes;
    }

    public void setParticipantes(List<Perfil> participantes) {
        this.participantes = participantes;
    }

    public List<Mensaje> getMensajes() {
        return mensajes;
    }

    public void setMensajes(List<Mensaje> mensajes) {
        this.mensajes = mensajes;
    }
}
