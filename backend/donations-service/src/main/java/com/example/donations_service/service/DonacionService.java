package com.example.donations_service.service;

import com.example.donations_service.model.Donacion;
import com.example.donations_service.repository.DonacionRepository;
import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.preference.Preference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class DonacionService {
    
    private static final Logger log = LoggerFactory.getLogger(DonacionService.class);
    
    @Autowired
    private DonacionRepository donacionRepository;
    
    @Value("${mercadopago.access.token:}")
    private String mercadoPagoAccessToken;
    
    @Value("${app.frontend.url:https://localhost}")
    private String frontendUrl;
    
    /**
     * Crear una nueva donación
     */
    @Transactional
    public Donacion crearDonacion(Donacion donacion) {
        if (donacion.getFechaDonacion() == null) {
            donacion.setFechaDonacion(new Timestamp(System.currentTimeMillis()));
        }
        if (donacion.getEstado() == null) {
            donacion.setEstado("PENDIENTE");
        }
        return donacionRepository.save(donacion);
    }
    
    /**
     * Crear preferencia de pago en Mercado Pago
     */
    public Preference crearPreferenciaMercadoPago(Donacion donacion) throws MPException, MPApiException {
        try {
            // Configurar SDK con access token
            MercadoPagoConfig.setAccessToken(mercadoPagoAccessToken);
            
            // Crear item de pago
            PreferenceItemRequest itemRequest = PreferenceItemRequest.builder()
                .title("Donación a " + (donacion.getReceptorId() != null ? "Refugio #" + donacion.getReceptorId() : "PetCloud"))
                .description(donacion.getDescripcion() != null ? donacion.getDescripcion() : "Donación para mascotas")
                .quantity(1)
                .currencyId("CLP") // Peso chileno
                .unitPrice(donacion.getMonto())
                .build();
            
            List<PreferenceItemRequest> items = new ArrayList<>();
            items.add(itemRequest);
            
            // URLs de retorno
            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                .success(frontendUrl + "/donaciones?status=success")
                .failure(frontendUrl + "/donaciones?status=failure")
                .pending(frontendUrl + "/donaciones?status=pending")
                .build();
            
            // Crear preferencia
            PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                .items(items)
                .backUrls(backUrls)
                .autoReturn("approved") // Retorna automáticamente si es aprobado
                .externalReference(String.valueOf(donacion.getId())) // ID de nuestra donación
                .statementDescriptor("PETCLOUD DONACION")
                .build();
            
            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(preferenceRequest);
            
            log.info("Preferencia de pago creada: {}", preference.getId());
            
            return preference;
            
        } catch (MPException | MPApiException e) {
            log.error("Error al crear preferencia de Mercado Pago", e);
            throw e;
        }
    }
    
    /**
     * Actualizar estado de donación (webhook de Mercado Pago)
     */
    @Transactional
    public Donacion actualizarEstadoDonacion(Long donacionId, String nuevoEstado, String comprobanteUrl) {
        Optional<Donacion> opt = donacionRepository.findById(donacionId);
        if (opt.isEmpty()) {
            throw new RuntimeException("Donación no encontrada: " + donacionId);
        }
        
        Donacion donacion = opt.get();
        donacion.setEstado(nuevoEstado);
        if (comprobanteUrl != null) {
            donacion.setComprobanteUrl(comprobanteUrl);
        }
        
        return donacionRepository.save(donacion);
    }
    
    /**
     * Listar donaciones por donante
     */
    public List<Donacion> listarPorDonante(Long donanteId) {
        return donacionRepository.findByDonanteIdOrderByFechaDonacionDesc(donanteId);
    }
    
    /**
     * Listar donaciones por receptor
     */
    public List<Donacion> listarPorReceptor(Long receptorId) {
        return donacionRepository.findByReceptorIdOrderByFechaDonacionDesc(receptorId);
    }
    
    /**
     * Obtener donación por ID
     */
    public Optional<Donacion> obtenerPorId(Long id) {
        return donacionRepository.findById(id);
    }
    
    /**
     * Listar todas las donaciones
     */
    public List<Donacion> listarTodas() {
        return donacionRepository.findAll();
    }
    
    /**
     * Eliminar donación (solo si está en estado PENDIENTE)
     */
    @Transactional
    public boolean eliminarDonacion(Long id) {
        Optional<Donacion> opt = donacionRepository.findById(id);
        if (opt.isEmpty()) {
            return false;
        }
        
        Donacion donacion = opt.get();
        if (!"PENDIENTE".equals(donacion.getEstado()) && !"CANCELADA".equals(donacion.getEstado())) {
            throw new RuntimeException("No se puede eliminar una donación confirmada");
        }
        
        donacionRepository.deleteById(id);
        return true;
    }
}
