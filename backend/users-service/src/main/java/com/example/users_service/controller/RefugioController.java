package com.example.users_service.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.users_service.model.Refugio;
import com.example.users_service.service.RefugioService;

@RestController
@RequestMapping("/api/refugios")
public class RefugioController {
    @Autowired
    private RefugioService refugioService;

    @GetMapping("/empresa/{empresaId}")
    public List<Refugio> getRefugiosByEmpresa(@PathVariable Long empresaId) {
        return refugioService.getRefugiosByEmpresa(empresaId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRefugioById(@PathVariable Long id) {
        try {
            java.util.Optional<com.example.users_service.model.Refugio> opt = refugioService.getRefugioById(id);
            if (opt.isPresent()) return ResponseEntity.ok(opt.get());
            return ResponseEntity.status(404).body(new ErrorResponse("Refugio no encontrado"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Error interno"));
        }
    }

    @PostMapping
    public ResponseEntity<?> registrarRefugio(@RequestBody Refugio refugio) {
        // Validar contacto: debe ser +569 seguido de 8 dígitos
        if (refugio.getContacto() == null || !refugio.getContacto().matches("^\\+569\\d{8}$")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("Contacto inválido. Debe comenzar con +569 y contener 8 dígitos (ej: +56912345678)"));
        }
        Refugio saved = refugioService.registrarRefugio(refugio);
        return ResponseEntity.ok(saved);
    }

    static class ErrorResponse {
        public String message;
        public ErrorResponse(String message) { this.message = message; }
    }
}
