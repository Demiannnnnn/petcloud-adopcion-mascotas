package com.example.adoptions_service.controller;

import java.net.URI;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.adoptions_service.model.Mensaje;
import com.example.adoptions_service.model.Notificacion;
import com.example.adoptions_service.repository.ChatParticipanteRepository;
import com.example.adoptions_service.repository.MensajeRepository;
import com.example.adoptions_service.repository.NotificacionRepository;

@RestController
@RequestMapping("/api/chats")
public class ChatMessageController {
    private static final Logger log = LoggerFactory.getLogger(ChatMessageController.class);

    @Autowired
    private MensajeRepository mensajeRepo;

    @Autowired
    private ChatParticipanteRepository participanteRepo;

    @Autowired
    private NotificacionRepository notificacionRepo;

    // list messages for a chat
    @GetMapping("/{chatId}/messages")
    public ResponseEntity<?> listMessages(@PathVariable Long chatId) {
        List<Mensaje> msgs = mensajeRepo.findByChatIdOrderByFechaAsc(chatId);
        return ResponseEntity.ok(msgs);
    }

    // create message in chat
    @PostMapping("/{chatId}/messages")
    public ResponseEntity<?> postMessage(@PathVariable Long chatId, @RequestBody Map<String, Object> body) {
        try {
            if (body == null) return ResponseEntity.badRequest().build();
            Object remit = body.get("remitenteId");
            Object contenido = body.get("contenido");
            if (remit == null || contenido == null) return ResponseEntity.badRequest().body(Map.of("error","remitenteId and contenido required"));
            Long remitenteId = null;
            if (remit instanceof Number) remitenteId = ((Number)remit).longValue();
            else if (remit instanceof String) {
                try { remitenteId = Long.valueOf((String)remit); } catch (Exception x) { }
            }
            if (remitenteId == null) return ResponseEntity.badRequest().body(Map.of("error","invalid remitenteId"));

            Mensaje m = new Mensaje();
            m.setChatId(chatId);
            m.setRemitenteId(remitenteId);
            m.setContenido(String.valueOf(contenido));
            m.setFecha(new Date());
            m.setLeido(false);
            Object tipo = body.get("tipoMensaje");
            if (tipo != null) m.setTipoMensaje(String.valueOf(tipo));
            Object archivo = body.get("archivoUrl");
            if (archivo != null) m.setArchivoUrl(String.valueOf(archivo));

            Mensaje saved = mensajeRepo.save(m);

            // create notifications for other participants and build recipients list
            java.util.List<Long> recipients = new java.util.ArrayList<>();
            try {
                var parts = participanteRepo.findByChatId(chatId);
                for (var p : parts) {
                    if (p.getPerfilId() != null && !p.getPerfilId().equals(remitenteId)) {
                        recipients.add(p.getPerfilId());
                        Notificacion n = new Notificacion();
                        n.setDestinatarioId(p.getPerfilId());
                        n.setTipo("CHAT_MESSAGE");
                        n.setTitulo("Nuevo mensaje");
                        n.setMensaje("Tienes un nuevo mensaje en el chat");
                        n.setFecha(new Date());
                        n.setLeida(false);
                        n.setChatId(chatId);
                        notificacionRepo.save(n);
                    }
                }
            } catch (Exception e) {
                log.debug("Failed to create notifications for chat {}: {}", chatId, e.getMessage());
            }

            java.util.Map<String, Object> out = new java.util.HashMap<>();
            out.put("mensaje", saved);
            out.put("destinatarios", recipients);
            return ResponseEntity.created(URI.create("/api/chats/" + chatId + "/messages/" + saved.getId())).body(out);
        } catch (Exception e) {
            log.error("Failed to save message for chat {}: {}", chatId, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error","internal","message",e.getMessage()));
        }
    }
}
