package com.example.adoptions_service.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.example.adoptions_service.model.Chat;
import com.example.adoptions_service.repository.ChatParticipanteRepository;
import com.example.adoptions_service.repository.ChatRepository;
import com.example.adoptions_service.repository.MensajeRepository;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

    private final ChatRepository chatRepo;
    private final ChatParticipanteRepository participanteRepo;
    private final MensajeRepository mensajeRepo;
    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    public ChatController(ChatRepository chatRepo, ChatParticipanteRepository participanteRepo, MensajeRepository mensajeRepo) {
        this.chatRepo = chatRepo;
        this.participanteRepo = participanteRepo;
        this.mensajeRepo = mensajeRepo;
    }

    @GetMapping("/solicitud/{id}")
    public ResponseEntity<?> getBySolicitud(@PathVariable Long id) {
        Chat c = chatRepo.findBySolicitudAdopcionId(id);
        if (c == null) return ResponseEntity.notFound().build();
        Map<String, Object> out = new HashMap<>();
        out.put("chat", c);
        var parts = participanteRepo.findByChatId(c.getId());
        // build participantes list as maps and enrich with perfil info if available
        java.util.List<Map<String,Object>> participantesOut = new java.util.ArrayList<>();
        var mensajes = mensajeRepo.findByChatIdOrderByFechaAsc(c.getId());
        try {
            String usersBase = System.getenv().getOrDefault("USERS_API_BASE", "http://localhost:8081");
            java.util.Map<Long, java.util.Map<String,Object>> cache = new java.util.HashMap<>();
            for (var p : parts) {
                Map<String,Object> pm = new HashMap<>();
                pm.put("id", p.getId());
                pm.put("chatId", p.getChatId());
                pm.put("perfilId", p.getPerfilId());
                pm.put("fechaUnion", p.getFechaUnion());
                Long pid = p.getPerfilId();
                if (pid != null) {
                    if (!cache.containsKey(pid)) {
                        try {
                            var profile = restTemplate.getForObject(usersBase + "/api/perfil/" + pid, java.util.Map.class);
                            if (profile != null) {
                                java.util.Map<String,Object> info = new java.util.HashMap<>();
                                Object nombre = profile.get("nombreCompleto");
                                if (nombre == null) nombre = profile.get("nombre");
                                if (nombre == null) nombre = profile.get("nombreEmpresa");
                                if (nombre == null) nombre = profile.get("correo");
                                info.put("displayName", nombre == null ? ("#"+pid) : String.valueOf(nombre));
                                info.put("fotoUrl", profile.get("fotoUrl"));
                                cache.put(pid, info);
                            } else {
                                cache.put(pid, java.util.Map.of("displayName", "#"+pid));
                            }
                        } catch (Exception ex) {
                            cache.put(pid, java.util.Map.of("displayName", "#"+pid));
                        }
                    }
                    pm.put("perfilInfo", cache.get(pid));
                }
                participantesOut.add(pm);
            }

            // build mensajes list and enrich remitente info
            java.util.List<Map<String,Object>> mensajesOut = new java.util.ArrayList<>();
            for (var m : mensajes) {
                Map<String,Object> mm = new HashMap<>();
                mm.put("id", m.getId());
                mm.put("remitenteId", m.getRemitenteId());
                mm.put("contenido", m.getContenido());
                mm.put("fecha", m.getFecha());
                mm.put("leido", m.isLeido());
                mm.put("chatId", m.getChatId());
                mm.put("tipoMensaje", m.getTipoMensaje());
                mm.put("archivoUrl", m.getArchivoUrl());
                Long remitente = m.getRemitenteId();
                if (remitente != null) {
                    if (!cache.containsKey(remitente)) {
                        try {
                            var profile = restTemplate.getForObject(usersBase + "/api/perfil/" + remitente, java.util.Map.class);
                            if (profile != null) {
                                java.util.Map<String,Object> info = new java.util.HashMap<>();
                                Object nombre = profile.get("nombreCompleto");
                                if (nombre == null) nombre = profile.get("nombre");
                                if (nombre == null) nombre = profile.get("nombreEmpresa");
                                if (nombre == null) nombre = profile.get("correo");
                                info.put("displayName", nombre == null ? ("#"+remitente) : String.valueOf(nombre));
                                info.put("fotoUrl", profile.get("fotoUrl"));
                                cache.put(remitente, info);
                            } else {
                                cache.put(remitente, java.util.Map.of("displayName", "#"+remitente));
                            }
                        } catch (Exception ex) {
                            cache.put(remitente, java.util.Map.of("displayName", "#"+remitente));
                        }
                    }
                    mm.put("remitentePerfil", cache.get(remitente));
                }
                mensajesOut.add(mm);
            }

            out.put("participantes", participantesOut);
            out.put("mensajes", mensajesOut);
        } catch (Exception e) {
            // if enrichment fails, fall back to raw entities
            out.put("participantes", parts);
            out.put("mensajes", mensajes);
        }
        return ResponseEntity.ok(out);
    }

    @GetMapping("/participant/{perfilId}")
    public ResponseEntity<?> getByParticipant(@PathVariable Long perfilId) {
        try {
            var parts = participanteRepo.findByPerfilId(perfilId);
            java.util.List<Map<String, Object>> out = new java.util.ArrayList<>();
            for (var p : parts) {
                Chat c = chatRepo.findById(p.getChatId()).orElse(null);
                if (c == null) continue;
                Map<String, Object> item = new HashMap<>();
                item.put("chat", c);
                var pparts = participanteRepo.findByChatId(c.getId());
                // build participantes map list
                java.util.List<Map<String,Object>> participantesOut = new java.util.ArrayList<>();
                java.util.Map<Long, java.util.Map<String,Object>> cache = new java.util.HashMap<>();
                String usersBase = System.getenv().getOrDefault("USERS_API_BASE", "http://localhost:8081");
                for (var pp : pparts) {
                    Map<String,Object> pm = new HashMap<>();
                    pm.put("id", pp.getId());
                    pm.put("chatId", pp.getChatId());
                    pm.put("perfilId", pp.getPerfilId());
                    pm.put("fechaUnion", pp.getFechaUnion());
                    Long pid = pp.getPerfilId();
                    if (pid != null) {
                        if (!cache.containsKey(pid)) {
                            try {
                                var profile = restTemplate.getForObject(usersBase + "/api/perfil/" + pid, java.util.Map.class);
                                if (profile != null) {
                                    java.util.Map<String,Object> info = new java.util.HashMap<>();
                                    Object nombre = profile.get("nombreCompleto");
                                    if (nombre == null) nombre = profile.get("nombre");
                                    if (nombre == null) nombre = profile.get("nombreEmpresa");
                                    if (nombre == null) nombre = profile.get("correo");
                                    info.put("displayName", nombre == null ? ("#"+pid) : String.valueOf(nombre));
                                    info.put("fotoUrl", profile.get("fotoUrl"));
                                    cache.put(pid, info);
                                } else {
                                    cache.put(pid, java.util.Map.of("displayName", "#"+pid));
                                }
                            } catch (Exception ex) {
                                cache.put(pid, java.util.Map.of("displayName", "#"+pid));
                            }
                        }
                        pm.put("perfilInfo", cache.get(pid));
                    }
                    participantesOut.add(pm);
                }
                var msgs = mensajeRepo.findByChatIdOrderByFechaAsc(c.getId());
                java.util.List<Map<String,Object>> msgsOut = new java.util.ArrayList<>();
                for (var m : msgs) {
                    Map<String,Object> mm = new HashMap<>();
                    mm.put("id", m.getId());
                    mm.put("remitenteId", m.getRemitenteId());
                    mm.put("contenido", m.getContenido());
                    mm.put("fecha", m.getFecha());
                    mm.put("leido", m.isLeido());
                    mm.put("chatId", m.getChatId());
                    mm.put("tipoMensaje", m.getTipoMensaje());
                    mm.put("archivoUrl", m.getArchivoUrl());
                    Long remitente = m.getRemitenteId();
                    if (remitente != null) {
                        if (!cache.containsKey(remitente)) {
                            try {
                                var profile = restTemplate.getForObject(usersBase + "/api/perfil/" + remitente, java.util.Map.class);
                                if (profile != null) {
                                    java.util.Map<String,Object> info = new java.util.HashMap<>();
                                    Object nombre = profile.get("nombreCompleto");
                                    if (nombre == null) nombre = profile.get("nombre");
                                    if (nombre == null) nombre = profile.get("nombreEmpresa");
                                    if (nombre == null) nombre = profile.get("correo");
                                    info.put("displayName", nombre == null ? ("#"+remitente) : String.valueOf(nombre));
                                    info.put("fotoUrl", profile.get("fotoUrl"));
                                    cache.put(remitente, info);
                                } else {
                                    cache.put(remitente, java.util.Map.of("displayName", "#"+remitente));
                                }
                            } catch (Exception ex) {
                                cache.put(remitente, java.util.Map.of("displayName", "#"+remitente));
                            }
                        }
                        mm.put("remitentePerfil", cache.get(remitente));
                    }
                    msgsOut.add(mm);
                }
                item.put("participantes", participantesOut);
                item.put("mensajes", msgsOut);
                out.add(item);
            }
            return ResponseEntity.ok(out);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error","internal","message",e.getMessage()));
        }
    }

    @GetMapping("/{chatId}")
    public ResponseEntity<?> getById(@PathVariable Long chatId) {
        Chat c = chatRepo.findById(chatId).orElse(null);
        if (c == null) return ResponseEntity.notFound().build();
        Map<String, Object> out = new HashMap<>();
        out.put("chat", c);
        var parts = participanteRepo.findByChatId(c.getId());
        var mensajes = mensajeRepo.findByChatIdOrderByFechaAsc(c.getId());
        try {
            String usersBase = System.getenv().getOrDefault("USERS_API_BASE", "http://localhost:8081");
            java.util.Map<Long, java.util.Map<String,Object>> cache = new java.util.HashMap<>();
            java.util.List<Map<String,Object>> participantesOut = new java.util.ArrayList<>();
            for (var p : parts) {
                Map<String,Object> pm = new HashMap<>();
                pm.put("id", p.getId());
                pm.put("chatId", p.getChatId());
                pm.put("perfilId", p.getPerfilId());
                pm.put("fechaUnion", p.getFechaUnion());
                Long pid = p.getPerfilId();
                if (pid != null) {
                    if (!cache.containsKey(pid)) {
                        try {
                            var profile = restTemplate.getForObject(usersBase + "/api/perfil/" + pid, java.util.Map.class);
                            if (profile != null) {
                                java.util.Map<String,Object> info = new java.util.HashMap<>();
                                Object nombre = profile.get("nombreCompleto");
                                if (nombre == null) nombre = profile.get("nombre");
                                if (nombre == null) nombre = profile.get("nombreEmpresa");
                                if (nombre == null) nombre = profile.get("correo");
                                info.put("displayName", nombre == null ? ("#"+pid) : String.valueOf(nombre));
                                info.put("fotoUrl", profile.get("fotoUrl"));
                                cache.put(pid, info);
                            } else {
                                cache.put(pid, java.util.Map.of("displayName", "#"+pid));
                            }
                        } catch (Exception ex) {
                            cache.put(pid, java.util.Map.of("displayName", "#"+pid));
                        }
                    }
                    pm.put("perfilInfo", cache.get(pid));
                }
                participantesOut.add(pm);
            }

            java.util.List<Map<String,Object>> mensajesOut = new java.util.ArrayList<>();
            for (var m : mensajes) {
                Map<String,Object> mm = new HashMap<>();
                mm.put("id", m.getId());
                mm.put("remitenteId", m.getRemitenteId());
                mm.put("contenido", m.getContenido());
                mm.put("fecha", m.getFecha());
                mm.put("leido", m.isLeido());
                mm.put("chatId", m.getChatId());
                mm.put("tipoMensaje", m.getTipoMensaje());
                mm.put("archivoUrl", m.getArchivoUrl());
                Long remitente = m.getRemitenteId();
                if (remitente != null) {
                    if (!cache.containsKey(remitente)) {
                        try {
                            var profile = restTemplate.getForObject(usersBase + "/api/perfil/" + remitente, java.util.Map.class);
                            if (profile != null) {
                                java.util.Map<String,Object> info = new java.util.HashMap<>();
                                Object nombre = profile.get("nombreCompleto");
                                if (nombre == null) nombre = profile.get("nombre");
                                if (nombre == null) nombre = profile.get("nombreEmpresa");
                                if (nombre == null) nombre = profile.get("correo");
                                info.put("displayName", nombre == null ? ("#"+remitente) : String.valueOf(nombre));
                                info.put("fotoUrl", profile.get("fotoUrl"));
                                cache.put(remitente, info);
                            } else {
                                cache.put(remitente, java.util.Map.of("displayName", "#"+remitente));
                            }
                        } catch (Exception ex) {
                            cache.put(remitente, java.util.Map.of("displayName", "#"+remitente));
                        }
                    }
                    mm.put("remitentePerfil", cache.get(remitente));
                }
                mensajesOut.add(mm);
            }

            out.put("participantes", participantesOut);
            out.put("mensajes", mensajesOut);
        } catch (Exception e) {
            out.put("participantes", parts);
            out.put("mensajes", mensajes);
        }
        return ResponseEntity.ok(out);
    }
}

