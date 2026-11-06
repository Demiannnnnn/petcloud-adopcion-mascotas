package com.example.donations_service.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import com.example.donations_service.model.Donacion;
import com.example.donations_service.service.DonacionService;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.preference.Preference;

@ExtendWith(MockitoExtension.class)
class DonacionControllerTest {

    @Mock
    private DonacionService service;
    @InjectMocks
    private DonacionController controller;

    private static Donacion monetaria(String monto) {
        Donacion d = new Donacion();
        d.setDonanteId(1L);
        d.setReceptorId(3L);
        d.setTipoDonacion("MONETARIA");
        d.setMonto(monto == null ? null : new BigDecimal(monto));
        return d;
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> body(ResponseEntity<?> res) {
        return (Map<String, Object>) res.getBody();
    }

    @Test
    void validaCamposObligatorios() {
        Donacion sinDonante = monetaria("1000");
        sinDonante.setDonanteId(null);
        assertThat(body(controller.crearDonacion(sinDonante))).containsEntry("error", "donanteId es requerido");

        Donacion sinTipo = monetaria("1000");
        sinTipo.setTipoDonacion(null);
        assertThat(body(controller.crearDonacion(sinTipo))).containsEntry("error", "tipoDonacion es requerido");
        verify(service, never()).crearDonacion(any());
    }

    @Test
    void donacionMonetariaExigeMontoPositivo() {
        assertThat(controller.crearDonacion(monetaria("0")).getStatusCode().value()).isEqualTo(400);
        assertThat(controller.crearDonacion(monetaria(null)).getStatusCode().value()).isEqualTo(400);
        Donacion monetary = monetaria("-5");
        monetary.setTipoDonacion("MONETARY");
        assertThat(controller.crearDonacion(monetary).getStatusCode().value()).isEqualTo(400);
        verify(service, never()).crearDonacion(any());
    }

    @Test
    void donacionMonetariaDevuelveLinkDePago() throws Exception {
        Donacion d = monetaria("5000");
        when(service.crearDonacion(d)).thenReturn(d);
        Preference pref = mock(Preference.class);
        when(pref.getId()).thenReturn("pref-1");
        when(pref.getInitPoint()).thenReturn("https://mp/init");
        when(service.crearPreferenciaMercadoPago(d)).thenReturn(pref);

        ResponseEntity<?> res = controller.crearDonacion(d);

        assertThat(res.getStatusCode().value()).isEqualTo(201);
        assertThat(body(res)).containsEntry("mercadoPagoPreferenceId", "pref-1").containsEntry("mercadoPagoInitPoint", "https://mp/init");
    }

    @Test
    void siMercadoPagoFallaLaDonacionSeCreaConAdvertencia() throws Exception {
        Donacion d = monetaria("5000");
        when(service.crearDonacion(d)).thenReturn(d);
        when(service.crearPreferenciaMercadoPago(d)).thenThrow(new MPException("sin token"));

        ResponseEntity<?> res = controller.crearDonacion(d);

        assertThat(res.getStatusCode().value()).isEqualTo(201);
        assertThat((String) body(res).get("warning")).contains("sin token");
    }

    @Test
    void donacionEnEspecieNoGeneraPreferencia() throws Exception {
        Donacion d = new Donacion();
        d.setDonanteId(1L);
        d.setTipoDonacion("ALIMENTO");
        when(service.crearDonacion(d)).thenReturn(d);
        assertThat(controller.crearDonacion(d).getStatusCode().value()).isEqualTo(201);
        verify(service, never()).crearPreferenciaMercadoPago(any());
    }

    @Test
    void actualizarEstadoRequiereEstadoY404SiNoExiste() {
        assertThat(controller.actualizarEstado(1L, Map.of()).getStatusCode().value()).isEqualTo(400);
        when(service.actualizarEstadoDonacion(1L, "CONFIRMADA", null)).thenThrow(new RuntimeException("Donación no encontrada: 1"));
        assertThat(controller.actualizarEstado(1L, Map.of("estado", "CONFIRMADA")).getStatusCode().value()).isEqualTo(404);
    }

    @Test
    void eliminarMapeaResultadosAStatusHttp() {
        when(service.eliminarDonacion(1L)).thenReturn(true);
        when(service.eliminarDonacion(2L)).thenReturn(false);
        when(service.eliminarDonacion(3L)).thenThrow(new RuntimeException("No se puede eliminar una donación confirmada"));
        assertThat(controller.eliminarDonacion(1L).getStatusCode().value()).isEqualTo(200);
        assertThat(controller.eliminarDonacion(2L).getStatusCode().value()).isEqualTo(404);
        assertThat(controller.eliminarDonacion(3L).getStatusCode().value()).isEqualTo(400);
    }

    @Test
    void webhookSiempreResponde200() {
        assertThat(controller.webhookMercadoPago(Map.of("type", "payment")).getStatusCode().value()).isEqualTo(200);
    }
}
