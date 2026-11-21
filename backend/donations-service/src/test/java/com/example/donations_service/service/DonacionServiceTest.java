package com.example.donations_service.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.sql.Timestamp;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.donations_service.model.Donacion;
import com.example.donations_service.repository.DonacionRepository;

@ExtendWith(MockitoExtension.class)
class DonacionServiceTest {

    @Mock
    private DonacionRepository repo;
    @InjectMocks
    private DonacionService service;

    private static Donacion donacion(String estado) {
        Donacion d = new Donacion();
        d.setId(1L);
        d.setEstado(estado);
        return d;
    }

    @Test
    void crearAsignaFechaYEstadoPendientePorDefecto() {
        when(repo.save(any(Donacion.class))).thenAnswer(i -> i.getArgument(0));
        Donacion out = service.crearDonacion(new Donacion());
        assertThat(out.getEstado()).isEqualTo("PENDIENTE");
        assertThat(out.getFechaDonacion()).isNotNull();
    }

    @Test
    void crearRespetaValoresEnviados() {
        when(repo.save(any(Donacion.class))).thenAnswer(i -> i.getArgument(0));
        Donacion d = new Donacion();
        Timestamp t = Timestamp.valueOf("2025-01-01 10:00:00");
        d.setFechaDonacion(t);
        d.setEstado("CONFIRMADA");
        Donacion out = service.crearDonacion(d);
        assertThat(out.getFechaDonacion()).isEqualTo(t);
        assertThat(out.getEstado()).isEqualTo("CONFIRMADA");
    }

    @Test
    void actualizarEstadoConservaComprobanteSiNoSeEnvia() {
        Donacion d = donacion("PENDIENTE");
        d.setComprobanteUrl("http://comprobante/1");
        when(repo.findById(1L)).thenReturn(Optional.of(d));
        when(repo.save(any(Donacion.class))).thenAnswer(i -> i.getArgument(0));
        Donacion out = service.actualizarEstadoDonacion(1L, "CONFIRMADA", null);
        assertThat(out.getEstado()).isEqualTo("CONFIRMADA");
        assertThat(out.getComprobanteUrl()).isEqualTo("http://comprobante/1");
    }

    @Test
    void actualizarEstadoDeDonacionInexistente() {
        when(repo.findById(anyLong())).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.actualizarEstadoDonacion(9L, "X", null)).hasMessageContaining("no encontrada");
    }

    @ParameterizedTest
    @ValueSource(strings = {"PENDIENTE", "CANCELADA"})
    void eliminarPermitidoEnEstadosNoConfirmados(String estado) {
        when(repo.findById(1L)).thenReturn(Optional.of(donacion(estado)));
        assertThat(service.eliminarDonacion(1L)).isTrue();
        verify(repo).deleteById(1L);
    }

    @Test
    void eliminarDonacionConfirmadaLanzaExcepcion() {
        when(repo.findById(1L)).thenReturn(Optional.of(donacion("CONFIRMADA")));
        assertThatThrownBy(() -> service.eliminarDonacion(1L)).hasMessageContaining("confirmada");
        verify(repo, never()).deleteById(any());
    }

    @Test
    void eliminarInexistenteDevuelveFalse() {
        when(repo.findById(1L)).thenReturn(Optional.empty());
        assertThat(service.eliminarDonacion(1L)).isFalse();
    }
}
