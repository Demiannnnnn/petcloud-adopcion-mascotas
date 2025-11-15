package com.example.donations_service.controller;

import com.example.donations_service.model.Donacion;
import com.example.donations_service.service.DonacionService;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.preference.Preference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/donaciones")
@CrossOrigin(origins = {"https://localhost", "https://localhost:443", "http://localhost:3000"})
public class DonacionController {
    
    private static final Logger log = LoggerFactory.getLogger(DonacionController.class);
    
    @Autowired
    private DonacionService donacionService;
    
    /**
     * Crear una nueva donación y generar link de pago de Mercado Pago
     * POST /api/donaciones
     */
    @PostMapping
    public ResponseEntity<?> crearDonacion(@RequestBody Donacion donacion) {
        try {
            // Validaciones básicas
            if (donacion.getDonanteId() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "donanteId es requerido"));
            }
            if (donacion.getTipoDonacion() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "tipoDonacion es requerido"));
            }
            
            // Para donaciones monetarias, validar monto
            if ("MONETARIA".equals(donacion.getTipoDonacion()) || "MONETARY".equals(donacion.getTipoDonacion())) {
                if (donacion.getMonto() == null || donacion.getMonto().doubleValue() <= 0) {
                    return ResponseEntity.badRequest().body(Map.of("error", "monto debe ser mayor a 0"));
                }
            }
            
            // Crear donación en BD
            Donacion saved = donacionService.crearDonacion(donacion);
            
            Map<String, Object> response = new HashMap<>();
            response.put("donacion", saved);
            
            // Si es monetaria, generar preferencia de Mercado Pago
            if (("MONETARIA".equals(saved.getTipoDonacion()) || "MONETARY".equals(saved.getTipoDonacion())) 
                && saved.getMonto() != null && saved.getMonto().doubleValue() > 0) {
                try {
                    Preference preference = donacionService.crearPreferenciaMercadoPago(saved);
                    response.put("mercadoPagoPreferenceId", preference.getId());
                    response.put("mercadoPagoInitPoint", preference.getInitPoint());
                    response.put("mercadoPagoSandboxInitPoint", preference.getSandboxInitPoint());
                    
                    log.info("Donación creada con MercadoPago: {} - Preference: {}", saved.getId(), preference.getId());
                } catch (MPException | MPApiException e) {
                    log.error("Error al crear preferencia de Mercado Pago", e);
                    response.put("warning", "Donación creada pero no se pudo generar link de pago: " + e.getMessage());
                }
            }
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            log.error("Error al crear donación", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error al crear donación: " + e.getMessage()));
        }
    }
    
    /**
     * Listar donaciones por donante
     * GET /api/donaciones/donante/{donanteId}
     */
    @GetMapping("/donante/{donanteId}")
    public ResponseEntity<List<Donacion>> listarPorDonante(@PathVariable Long donanteId) {
        List<Donacion> donaciones = donacionService.listarPorDonante(donanteId);
        return ResponseEntity.ok(donaciones);
    }
    
    /**
     * Listar donaciones por receptor
     * GET /api/donaciones/receptor/{receptorId}
     */
    @GetMapping("/receptor/{receptorId}")
    public ResponseEntity<List<Donacion>> listarPorReceptor(@PathVariable Long receptorId) {
        List<Donacion> donaciones = donacionService.listarPorReceptor(receptorId);
        return ResponseEntity.ok(donaciones);
    }
    
    /**
     * Obtener donación por ID
     * GET /api/donaciones/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        Optional<Donacion> donacion = donacionService.obtenerPorId(id);
        if (donacion.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(donacion.get());
    }
    
    /**
     * Listar todas las donaciones
     * GET /api/donaciones
     */
    @GetMapping
    public ResponseEntity<List<Donacion>> listarTodas() {
        List<Donacion> donaciones = donacionService.listarTodas();
        return ResponseEntity.ok(donaciones);
    }
    
    /**
     * Actualizar estado de donación (usado por webhook o admin)
     * PATCH /api/donaciones/{id}/estado
     */
    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> actualizarEstado(
        @PathVariable Long id,
        @RequestBody Map<String, String> payload
    ) {
        try {
            String nuevoEstado = payload.get("estado");
            String comprobanteUrl = payload.get("comprobanteUrl");
            
            if (nuevoEstado == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "estado es requerido"));
            }
            
            Donacion actualizada = donacionService.actualizarEstadoDonacion(id, nuevoEstado, comprobanteUrl);
            return ResponseEntity.ok(actualizada);
            
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error al actualizar estado de donación", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error al actualizar estado"));
        }
    }
    
    /**
     * Webhook de Mercado Pago para recibir notificaciones de pago
     * POST /api/donaciones/webhook/mercadopago
     */
    @PostMapping("/webhook/mercadopago")
    public ResponseEntity<?> webhookMercadoPago(@RequestBody Map<String, Object> payload) {
        try {
            log.info("Webhook recibido de MercadoPago: {}", payload);
            
            // Procesar notificación según tipo
            String type = (String) payload.get("type");
            
            if ("payment".equals(type)) {
                // Aquí procesarías el pago
                // Normalmente harías una consulta a la API de MercadoPago para obtener detalles
                log.info("Notificación de pago recibida");
            }
            
            return ResponseEntity.ok(Map.of("status", "received"));
            
        } catch (Exception e) {
            log.error("Error procesando webhook de MercadoPago", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Eliminar donación (solo si está pendiente)
     * DELETE /api/donaciones/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarDonacion(@PathVariable Long id) {
        try {
            boolean eliminada = donacionService.eliminarDonacion(id);
            if (!eliminada) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(Map.of("message", "Donación eliminada exitosamente"));
            
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error al eliminar donación", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error al eliminar donación"));
        }
    }
}
