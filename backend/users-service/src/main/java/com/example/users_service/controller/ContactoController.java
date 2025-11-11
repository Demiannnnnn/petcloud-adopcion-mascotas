package com.example.users_service.controller;

import java.net.URI;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.users_service.model.Contacto;
import com.example.users_service.repository.ContactoRepository;

@RestController
@RequestMapping("/api/contactos")
public class ContactoController {

    @Autowired
    private ContactoRepository repo;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        if (body == null) return ResponseEntity.badRequest().build();
        Object owner = body.get("ownerPerfilId");
        Object contacto = body.get("contactoPerfilId");
        if (owner == null || contacto == null) return ResponseEntity.badRequest().body(Map.of("error","ownerPerfilId and contactoPerfilId required"));
        Long ownerId = null, contactoId = null;
        try { ownerId = Long.valueOf(String.valueOf(owner)); } catch (Exception e) {}
        try { contactoId = Long.valueOf(String.valueOf(contacto)); } catch (Exception e) {}
        if (ownerId == null || contactoId == null) return ResponseEntity.badRequest().body(Map.of("error","invalid ids"));

        // avoid duplicates
        var existing = repo.findByOwnerPerfilIdAndContactoPerfilId(ownerId, contactoId);
        if (existing.isPresent()) return ResponseEntity.status(409).body(Map.of("error","already_exists"));

        Contacto c = new Contacto();
        c.setOwnerPerfilId(ownerId);
        c.setContactoPerfilId(contactoId);
        c.setFechaUnion(new Date());
        Contacto saved = repo.save(c);
        return ResponseEntity.created(URI.create("/api/contactos/" + saved.getId())).body(saved);
    }

    @GetMapping("/participant/{perfilId}")
    public ResponseEntity<?> listByOwner(@PathVariable Long perfilId) {
        try {
            List<Contacto> list = repo.findByOwnerPerfilId(perfilId);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error","internal","message",e.getMessage()));
        }
    }
}
