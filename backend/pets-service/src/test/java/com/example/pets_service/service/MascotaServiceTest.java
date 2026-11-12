package com.example.pets_service.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import com.example.pets_service.controller.MascotaController.MascotaRegistroDTO;
import com.example.pets_service.dto.PublicMascotaDTO;
import com.example.pets_service.model.Mascota;
import com.example.pets_service.repository.MascotaRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
class MascotaServiceTest {

    @Mock
    private MascotaRepository repo;
    @Mock
    private RestTemplate restTemplate;

    private MascotaService service;
    private final ObjectMapper om = new ObjectMapper();

    @BeforeEach
    void setUp() {
        service = new MascotaService(repo);
        ReflectionTestUtils.setField(service, "restTemplate", restTemplate);
    }

    private static MascotaRegistroDTO dto() {
        MascotaRegistroDTO d = new MascotaRegistroDTO();
        d.setPropietarioId(10L);
        d.setNombre("Firulais");
        d.setEspecie("Perro");
        d.setFoto("/uploads/firulais.jpg");
        return d;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, String>> media(Mascota m) throws Exception {
        return om.readValue(m.getMediaJson(), List.class);
    }

    // ---------- registrarMascota ----------

    @Test
    void registrarAplicaValoresPorDefecto() throws Exception {
        when(repo.save(any(Mascota.class))).thenAnswer(i -> i.getArgument(0));
        Mascota m = service.registrarMascota(dto());
        assertThat(m.getPropietarioId()).isEqualTo(10L);
        assertThat(m.getDisponibleAdopcion()).isTrue();
        assertThat(m.getEsterilizado()).isFalse();
        assertThat(m.getEdad()).isZero();
        assertThat(m.getPeso()).isEqualByComparingTo("0");
        assertThat(m.getFechaRegistro()).isNotNull();
        assertThat(m.getVacunas()).isEmpty();
        assertThat(media(m)).containsExactly(Map.of("url", "/uploads/firulais.jpg", "type", "image/*"));
    }

    @Test
    void registrarCalculaEdadDesdeFechaNacimiento() {
        when(repo.save(any(Mascota.class))).thenAnswer(i -> i.getArgument(0));
        MascotaRegistroDTO d = dto();
        d.setFechaNacimiento(LocalDate.now().minusYears(3).minusMonths(2).toString());
        d.setTamaño("12.5");
        d.setVacunas(List.of("rabia", "octuple"));
        Mascota m = service.registrarMascota(d);
        assertThat(m.getEdad()).isEqualTo(3);
        assertThat(m.getFechaNacimiento()).isNotNull();
        assertThat(m.getPeso()).isEqualByComparingTo(new BigDecimal("12.5"));
        assertThat(m.getVacunas()).isEqualTo("rabia,octuple");
    }

    @Test
    void registrarMascotaMapeaTamanoAPeso() {
        when(repo.save(any(Mascota.class))).thenAnswer(i -> i.getArgument(0));

        MascotaRegistroDTO dPequeno = dto();
        dPequeno.setTamaño("Pequeño");
        assertThat(service.registrarMascota(dPequeno).getPeso()).isEqualByComparingTo("5.0");

        MascotaRegistroDTO dMediano = dto();
        dMediano.setTamaño("Mediano");
        assertThat(service.registrarMascota(dMediano).getPeso()).isEqualByComparingTo("15.0");

        MascotaRegistroDTO dGrande = dto();
        dGrande.setTamaño("Grande");
        assertThat(service.registrarMascota(dGrande).getPeso()).isEqualByComparingTo("30.0");

        MascotaRegistroDTO dNumerico = dto();
        dNumerico.setTamaño("12.5");
        assertThat(service.registrarMascota(dNumerico).getPeso()).isEqualByComparingTo("12.5");

        MascotaRegistroDTO dVacio = dto();
        dVacio.setTamaño("");
        assertThat(service.registrarMascota(dVacio).getPeso()).isEqualByComparingTo("0.0");

        MascotaRegistroDTO dDesconocido = dto();
        dDesconocido.setTamaño("Desconocido");
        assertThat(service.registrarMascota(dDesconocido).getPeso()).isEqualByComparingTo("0.0");
    }

    @Test
    void registrarConFechaInvalidaDejaEdadCero() {
        when(repo.save(any(Mascota.class))).thenAnswer(i -> i.getArgument(0));
        MascotaRegistroDTO d = dto();
        d.setFechaNacimiento("31/12/2020");
        assertThat(service.registrarMascota(d).getEdad()).isZero();
    }

    @Test
    void registrarExigePropietarioYFoto() {
        MascotaRegistroDTO sinProp = dto();
        sinProp.setPropietarioId(null);
        assertThatThrownBy(() -> service.registrarMascota(sinProp)).isInstanceOf(IllegalArgumentException.class);

        MascotaRegistroDTO sinFoto = dto();
        sinFoto.setFoto("");
        assertThatThrownBy(() -> service.registrarMascota(sinFoto)).hasMessageContaining("imagen");
        verify(repo, never()).save(any());
    }

    @Test
    void registrarNormalizaYDeduplicaMediaConservandoMayusculas() throws Exception {
        when(repo.save(any(Mascota.class))).thenAnswer(i -> i.getArgument(0));
        MascotaRegistroDTO d = dto();
        d.setMedia(List.of(
            Map.of("url", "IMG_0956.jpg", "type", "image/jpeg"),
            Map.of("url", "/uploads/img_0956.jpg?v=2", "type", "image/jpeg"),
            Map.of("url", "https://cdn.example.com/a.mp4", "type", "video/mp4"),
            Map.of("url", "  ", "type", "x")));
        List<Map<String, String>> out = media(service.registrarMascota(d));
        assertThat(out).extracting(e -> e.get("url"))
            .containsExactly("/uploads/IMG_0956.jpg", "https://cdn.example.com/a.mp4");
    }

    // ---------- actualizarMascota ----------

    @Test
    void actualizarRechazaPropietarioDistinto() {
        Mascota m = new Mascota();
        m.setPropietarioId(10L);
        when(repo.findById(1L)).thenReturn(Optional.of(m));
        MascotaRegistroDTO d = new MascotaRegistroDTO();
        d.setPropietarioId(99L);
        assertThatThrownBy(() -> service.actualizarMascota(1L, d)).hasMessageContaining("permiso");
        verify(repo, never()).save(any());
    }

    @Test
    void actualizarSoloCambiaCamposEnviadosYMapeaTamanoTextual() {
        Mascota m = new Mascota();
        m.setPropietarioId(10L);
        m.setNombre("Antes");
        m.setRaza("Quiltro");
        when(repo.findById(1L)).thenReturn(Optional.of(m));
        when(repo.save(any(Mascota.class))).thenAnswer(i -> i.getArgument(0));
        MascotaRegistroDTO d = new MascotaRegistroDTO();
        d.setNombre("Después");
        d.setTamaño("Grande");
        Mascota out = service.actualizarMascota(1L, d);
        assertThat(out.getNombre()).isEqualTo("Después");
        assertThat(out.getRaza()).isEqualTo("Quiltro");
        assertThat(out.getPeso()).isEqualByComparingTo("30.0");
    }

    @Test
    void actualizarConTextoNoReconocidoNoModificaPeso() {
        Mascota m = new Mascota();
        m.setPropietarioId(10L);
        m.setPeso(new BigDecimal("20.0"));
        when(repo.findById(1L)).thenReturn(Optional.of(m));
        when(repo.save(any(Mascota.class))).thenAnswer(i -> i.getArgument(0));

        MascotaRegistroDTO d = new MascotaRegistroDTO();
        d.setTamaño("no-reconocido");
        Mascota out = service.actualizarMascota(1L, d);
        assertThat(out.getPeso()).isEqualByComparingTo("20.0");
    }

    @Test
    void actualizarMascotaInexistente() {
        when(repo.findById(1L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.actualizarMascota(1L, new MascotaRegistroDTO()))
            .isInstanceOf(IllegalArgumentException.class);
    }

    // ---------- reserva ----------

    @Test
    void reservarDisponible() {
        when(repo.reserveIfAvailableWithAdoptante(1L, 5L)).thenReturn(1);
        assertThat(service.reserveMascota(1L, 5L)).isTrue();
        verify(repo, never()).existsById(any());
    }

    @Test
    void reservarYaReservadaDevuelveFalse() {
        when(repo.reserveIfAvailable(1L)).thenReturn(0);
        when(repo.existsById(1L)).thenReturn(true);
        assertThat(service.reserveMascota(1L)).isFalse();
    }

    @Test
    void reservarInexistenteLanzaExcepcion() {
        when(repo.reserveIfAvailableWithAdoptante(1L, 5L)).thenReturn(0);
        when(repo.existsById(1L)).thenReturn(false);
        assertThatThrownBy(() -> service.reserveMascota(1L, 5L)).hasMessage("Mascota no encontrada");
    }

    // ---------- setDisponibilidad ----------

    @Test
    void setDisponibilidadPorPropietario() {
        Mascota m = new Mascota();
        m.setPropietarioId(10L);
        when(repo.findById(1L)).thenReturn(Optional.of(m));
        when(repo.save(any(Mascota.class))).thenAnswer(i -> i.getArgument(0));
        assertThat(service.setDisponibilidad(1L, false, null, null, 10L).getDisponibleAdopcion()).isFalse();
    }

    @Test
    void setDisponibilidadPorRefugioEmpresa() {
        Mascota m = new Mascota();
        m.setPropietarioId(10L);
        m.setRefugioId(3L);
        when(repo.findById(1L)).thenReturn(Optional.of(m));
        when(repo.save(any(Mascota.class))).thenAnswer(i -> i.getArgument(0));
        assertThat(service.setDisponibilidad(1L, true, 3L, "empresa", 999L).getDisponibleAdopcion()).isTrue();
    }

    @Test
    void setDisponibilidadNoAutorizado() {
        Mascota m = new Mascota();
        m.setPropietarioId(10L);
        m.setRefugioId(3L);
        when(repo.findById(1L)).thenReturn(Optional.of(m));
        assertThatThrownBy(() -> service.setDisponibilidad(1L, true, 3L, "PERSONA", 11L)).isInstanceOf(SecurityException.class);
    }

    @Test
    void noSePuedeReabrirMascotaAdoptada() {
        Mascota m = new Mascota();
        m.setPropietarioId(10L);
        m.setAdoptanteId(20L);
        when(repo.findById(1L)).thenReturn(Optional.of(m));
        assertThatThrownBy(() -> service.setDisponibilidad(1L, true, null, null, 10L)).hasMessageContaining("ya adoptada");
        verify(repo, never()).save(any());
    }

    // ---------- removeMedia ----------

    @Test
    void removeMediaQuitaPorUrlIgnorandoQueryYMayusculas() throws Exception {
        Mascota m = new Mascota();
        m.setMediaJson(om.writeValueAsString(List.of(
            Map.of("url", "/uploads/no-existe-A.jpg", "type", "image/*"),
            Map.of("url", "/uploads/b.jpg", "type", "image/*"))));
        when(repo.findById(1L)).thenReturn(Optional.of(m));
        when(repo.save(any(Mascota.class))).thenAnswer(i -> i.getArgument(0));
        Mascota out = service.removeMedia(1L, "uploads/NO-EXISTE-a.jpg?x=1");
        assertThat(media(out)).extracting(e -> e.get("url")).containsExactly("/uploads/b.jpg");
    }

    @Test
    void removeMediaSinCoincidenciaNoGuarda() throws Exception {
        Mascota m = new Mascota();
        m.setMediaJson(om.writeValueAsString(List.of(Map.of("url", "/uploads/b.jpg", "type", "image/*"))));
        when(repo.findById(1L)).thenReturn(Optional.of(m));
        service.removeMedia(1L, "/uploads/otra.jpg");
        verify(repo, never()).save(any());
    }

    // ---------- listarMascotas ----------

    @Test
    void listarMascotasArmaDtoYResuelveNombreDelRefugioConCache() {
        Mascota a = new Mascota();
        a.setId(1L);
        a.setRefugioId(3L);
        a.setImagenUrl("a.jpg");
        a.setFechaNacimiento(LocalDate.now().minusYears(2).minusMonths(4));
        Mascota b = new Mascota();
        b.setId(2L);
        b.setRefugioId(3L);
        b.setEdad(5);
        when(repo.findAll()).thenReturn(List.of(a, b));
        when(restTemplate.getForObject(eq("http://localhost:8081/api/refugios/3"), eq(Map.class)))
            .thenReturn(Map.of("nombre", "Refugio Patitas"));

        List<PublicMascotaDTO> out = service.listarMascotas();

        assertThat(out).hasSize(2);
        assertThat(out.get(0).publicadoPorName).isEqualTo("Refugio Patitas");
        assertThat(out.get(0).edadYears).isEqualTo(2);
        assertThat(out.get(0).edadMonths).isEqualTo(4);
        assertThat(out.get(0).media).containsExactly(Map.of("url", "/uploads/a.jpg", "type", "image/*"));
        assertThat(out.get(1).edadYears).isEqualTo(5);
        assertThat(out.get(1).media).isNull();
        verify(restTemplate, times(1)).getForObject(anyString(), eq(Map.class));
    }

    @Test
    void listarMascotasToleraUsersServiceCaido() {
        Mascota a = new Mascota();
        a.setPropietarioId(10L);
        a.setAdoptanteId(20L);
        when(repo.findAll()).thenReturn(List.of(a));
        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenThrow(new ResourceAccessException("down"));
        List<PublicMascotaDTO> out = service.listarMascotas();
        assertThat(out.get(0).publicadoPorName).isNull();
        assertThat(out.get(0).adoptanteName).isNull();
        assertThat(out.get(0).adoptanteId).isEqualTo(20L);
    }
}
