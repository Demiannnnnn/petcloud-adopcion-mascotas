package com.example.adoptions_service.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.example.adoptions_service.model.Chat;
import com.example.adoptions_service.model.ChatParticipante;
import com.example.adoptions_service.model.EstadoSolicitud;
import com.example.adoptions_service.model.Mensaje;
import com.example.adoptions_service.model.Notificacion;
import com.example.adoptions_service.model.SolicitudAdopcion;
import com.example.adoptions_service.repository.ChatParticipanteRepository;
import com.example.adoptions_service.repository.ChatRepository;
import com.example.adoptions_service.repository.MensajeRepository;
import com.example.adoptions_service.repository.NotificacionRepository;
import com.example.adoptions_service.repository.SolicitudAdopcionRepository;

@ExtendWith(MockitoExtension.class)
class SolicitudAdopcionControllerTest {

    private static final String PETS = "http://localhost:8082/api/mascotas/";

    @Mock SolicitudAdopcionRepository repo;
    @Mock RestTemplate rest;
    @Mock NotificacionRepository notificacionRepo;
    @Mock ChatRepository chatRepo;
    @Mock ChatParticipanteRepository participanteRepo;
    @Mock MensajeRepository mensajeRepo;

    private SolicitudAdopcionController controller;

    @BeforeEach
    void setUp() {
        controller = new SolicitudAdopcionController(repo, rest, notificacionRepo, chatRepo, participanteRepo, mensajeRepo);
        lenient().when(repo.save(any(SolicitudAdopcion.class))).thenAnswer(i -> i.getArgument(0));
    }

    @AfterEach
    void tearDown() {
        RequestContextHolder.resetRequestAttributes();
    }

    private static SolicitudAdopcion solicitud(EstadoSolicitud estado) {
        SolicitudAdopcion s = new SolicitudAdopcion();
        s.setId(1L);
        s.setMascotaId(50L);
        s.setAdoptanteId(7L);
        s.setEstado(estado);
        return s;
    }

    private static HttpClientErrorException conflict() {
        return HttpClientErrorException.create(HttpStatus.CONFLICT, "Conflict", new HttpHeaders(), new byte[0], StandardCharsets.UTF_8);
    }

    // ---------------- create ----------------

    @Test
    void createSinMascotaOAdoptanteDevuelve400() {
        assertThat(controller.create(new AdopcionRequest()).getStatusCode().value()).isEqualTo(400);
        assertThat(controller.create(null).getStatusCode().value()).isEqualTo(400);
        verify(repo, never()).save(any());
    }

    @Test
    void createGuardaPendienteYCreaChatConAdoptanteYPropietario() {
        AdopcionRequest req = new AdopcionRequest();
        req.setMascotaId(50L);
        req.setAdoptanteId(7L);
        req.setMensaje("Me encantaría adoptarlo");
        when(repo.save(any(SolicitudAdopcion.class))).thenAnswer(i -> {
            SolicitudAdopcion s = i.getArgument(0);
            s.setId(1L);
            return s;
        });
        when(rest.getForObject(eq(PETS + "50"), eq(Map.class))).thenReturn(Map.of("propietarioId", 9));
        when(participanteRepo.findByPerfilId(7L)).thenReturn(List.of());
        when(chatRepo.save(any(Chat.class))).thenAnswer(i -> {
            Chat c = i.getArgument(0);
            c.setId(100L);
            return c;
        });
        when(participanteRepo.findByChatId(100L)).thenReturn(new ArrayList<>());

        ResponseEntity<?> res = controller.create(req);

        assertThat(res.getStatusCode().value()).isEqualTo(201);
        ArgumentCaptor<SolicitudAdopcion> sol = ArgumentCaptor.forClass(SolicitudAdopcion.class);
        verify(repo).save(sol.capture());
        assertThat(sol.getValue().getEstado()).isEqualTo(EstadoSolicitud.PENDING);
        assertThat(sol.getValue().getComentariosAdoptante()).isEqualTo("Me encantaría adoptarlo");

        ArgumentCaptor<ChatParticipante> parts = ArgumentCaptor.forClass(ChatParticipante.class);
        verify(participanteRepo, times(2)).save(parts.capture());
        assertThat(parts.getAllValues()).extracting(ChatParticipante::getPerfilId).containsExactlyInAnyOrder(7L, 9L);
    }

    @Test
    void createReutilizaChatExistenteEntreLasMismasPartes() {
        AdopcionRequest req = new AdopcionRequest();
        req.setMascotaId(50L);
        req.setAdoptanteId(7L);
        when(repo.save(any(SolicitudAdopcion.class))).thenAnswer(i -> {
            SolicitudAdopcion s = i.getArgument(0);
            s.setId(2L);
            return s;
        });
        when(rest.getForObject(eq(PETS + "50"), eq(Map.class))).thenReturn(Map.of("propietarioId", "9"));
        ChatParticipante deAdoptante = new ChatParticipante();
        deAdoptante.setChatId(100L);
        deAdoptante.setPerfilId(7L);
        ChatParticipante deProp = new ChatParticipante();
        deProp.setChatId(100L);
        deProp.setPerfilId(9L);
        when(participanteRepo.findByPerfilId(7L)).thenReturn(List.of(deAdoptante));
        when(participanteRepo.findByChatId(100L)).thenReturn(List.of(deAdoptante, deProp));
        Chat existente = new Chat();
        existente.setId(100L);
        existente.setSolicitudAdopcionId(1L);
        when(chatRepo.findById(100L)).thenReturn(Optional.of(existente));
        when(chatRepo.save(any(Chat.class))).thenAnswer(i -> i.getArgument(0));

        controller.create(req);

        assertThat(existente.getSolicitudAdopcionId()).isEqualTo(2L);
        verify(participanteRepo, never()).save(any());
    }

    // ---------------- approve ----------------

    @Test
    void approveSinCabecerasDeUsuarioDevuelve403() {
        when(repo.findById(1L)).thenReturn(Optional.of(solicitud(EstadoSolicitud.PENDING)));
        assertThat(controller.approve(1L, new MockHttpServletRequest()).getStatusCode().value()).isEqualTo(403);
        verify(repo, never()).save(any());
    }

    @Test
    void approveSolicitudNoPendienteOInexistente() {
        when(repo.findById(1L)).thenReturn(Optional.of(solicitud(EstadoSolicitud.REJECTED)));
        assertThat(controller.approve(1L, new MockHttpServletRequest()).getStatusCode().value()).isEqualTo(400);
        when(repo.findById(2L)).thenReturn(Optional.empty());
        assertThat(controller.approve(2L, new MockHttpServletRequest()).getStatusCode().value()).isEqualTo(404);
    }

    @Test
    void approveReservaMascotaYNotificaAlAdoptante() {
        SolicitudAdopcion s = solicitud(EstadoSolicitud.PENDING);
        when(repo.findById(1L)).thenReturn(Optional.of(s));
        when(rest.getForObject(eq(PETS + "50"), eq(Map.class))).thenReturn(Map.of("nombre", "Firulais"));
        MockHttpServletRequest http = new MockHttpServletRequest();
        http.addHeader("X-User-Id", "9");

        ResponseEntity<?> res = controller.approve(1L, http);

        assertThat(res.getStatusCode().value()).isEqualTo(200);
        assertThat(s.getEstado()).isEqualTo(EstadoSolicitud.APPROVED);
        assertThat(s.getEvaluadorId()).isEqualTo(9L);
        verify(rest).exchange(eq(PETS + "50/reserve?adoptanteId=7"), eq(HttpMethod.POST), any(HttpEntity.class), eq(Void.class));
        ArgumentCaptor<Notificacion> n = ArgumentCaptor.forClass(Notificacion.class);
        verify(notificacionRepo).save(n.capture());
        assertThat(n.getValue().getTipo()).isEqualTo("ADOPTION_APPROVED");
        assertThat(n.getValue().getDestinatarioId()).isEqualTo(7L);
        assertThat(n.getValue().getMensaje()).contains("Firulais");
    }

    @Test
    void approveConMascotaYaReservadaRevierteYDevuelve409() {
        SolicitudAdopcion s = solicitud(EstadoSolicitud.PENDING);
        when(repo.findById(1L)).thenReturn(Optional.of(s));
        when(rest.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(Void.class))).thenThrow(conflict());
        MockHttpServletRequest http = new MockHttpServletRequest();
        http.addHeader("X-User-Perfil-Tipo", "EMPRESA");
        http.addHeader("X-User-Perfil-Id", "3");

        assertThat(controller.approve(1L, http).getStatusCode().value()).isEqualTo(409);
        assertThat(s.getEstado()).isEqualTo(EstadoSolicitud.PENDING);
        assertThat(s.getEvaluadorId()).isNull();
        assertThat(s.getFechaRespuesta()).isNull();
        verify(notificacionRepo, never()).save(any());
    }

    @Test
    void approveConPetsServiceCaidoRevierteYDevuelve502() {
        SolicitudAdopcion s = solicitud(EstadoSolicitud.PENDING);
        when(repo.findById(1L)).thenReturn(Optional.of(s));
        when(rest.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(Void.class)))
            .thenThrow(new ResourceAccessException("Connection refused"));
        MockHttpServletRequest http = new MockHttpServletRequest();
        http.addHeader("X-User-Id", "9");

        assertThat(controller.approve(1L, http).getStatusCode().value()).isEqualTo(502);
        assertThat(s.getEstado()).isEqualTo(EstadoSolicitud.PENDING);
    }

    // ---------------- reject / cancel ----------------

    @Test
    void rejectGuardaMotivoNotificaYEliminaElChat() {
        SolicitudAdopcion s = solicitud(EstadoSolicitud.PENDING);
        when(repo.findById(1L)).thenReturn(Optional.of(s));
        MockHttpServletRequest http = new MockHttpServletRequest();
        http.addHeader("X-User-Perfil-Id", "3");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(http));
        Chat chat = new Chat();
        chat.setId(100L);
        when(chatRepo.findBySolicitudAdopcionId(1L)).thenReturn(chat);
        List<Mensaje> mensajes = List.of(new Mensaje());
        when(mensajeRepo.findByChatIdOrderByFechaAsc(100L)).thenReturn(mensajes);
        List<ChatParticipante> parts = List.of(new ChatParticipante());
        when(participanteRepo.findByChatId(100L)).thenReturn(parts);

        ResponseEntity<SolicitudAdopcion> res = controller.reject(1L, "Hogar sin patio");

        assertThat(res.getBody().getEstado()).isEqualTo(EstadoSolicitud.REJECTED);
        assertThat(res.getBody().getMotivoRechazo()).isEqualTo("Hogar sin patio");
        assertThat(res.getBody().getEvaluadorId()).isEqualTo(3L);
        ArgumentCaptor<Notificacion> n = ArgumentCaptor.forClass(Notificacion.class);
        verify(notificacionRepo).save(n.capture());
        assertThat(n.getValue().getMensaje()).endsWith("Motivo: Hogar sin patio");
        verify(mensajeRepo).deleteAll(mensajes);
        verify(participanteRepo).deleteAll(parts);
        verify(chatRepo).delete(chat);
    }

    @Test
    void rejectYCancelSoloDesdePendiente() {
        when(repo.findById(1L)).thenReturn(Optional.of(solicitud(EstadoSolicitud.APPROVED)));
        assertThat(controller.reject(1L, null).getStatusCode().value()).isEqualTo(400);
        assertThat(controller.cancel(1L).getStatusCode().value()).isEqualTo(400);
        verify(repo, never()).save(any());
    }

    @Test
    void cancelSinRequestHttpLigadoFunciona() {
        when(repo.findById(1L)).thenReturn(Optional.of(solicitud(EstadoSolicitud.PENDING)));
        ResponseEntity<SolicitudAdopcion> res = controller.cancel(1L);
        assertThat(res.getBody().getEstado()).isEqualTo(EstadoSolicitud.CANCELLED);
        assertThat(res.getBody().getFechaRespuesta()).isNotNull();
    }

    // ---------------- consultas ----------------

    @Test
    void listReceivedParseaListaDeIdsIgnorandoInvalidos() {
        controller.listReceived(null, "1, 2,x,3");
        verify(repo).findByMascotaIdIn(List.of(1L, 2L, 3L));
        assertThat(controller.listReceived(null, " ")).isEmpty();
        controller.listReceived(5L, "1,2");
        verify(repo).findByMascotaId(5L);
    }

    @Test
    void listByAdoptanteFiltraSoloSiSeIndica() {
        controller.listByAdoptante(7L);
        verify(repo).findByAdoptanteId(7L);
        controller.listByAdoptante(null);
        verify(repo).findAll();
    }

    // ---------------- reconcile ----------------

    @Test
    @SuppressWarnings("unchecked")
    void reconcileCuentaReparadasConflictosYErrores() {
        SolicitudAdopcion ok = solicitud(EstadoSolicitud.APPROVED);
        SolicitudAdopcion choque = solicitud(EstadoSolicitud.APPROVED);
        choque.setMascotaId(51L);
        SolicitudAdopcion caida = solicitud(EstadoSolicitud.APPROVED);
        caida.setMascotaId(52L);
        when(repo.findByEstado(EstadoSolicitud.APPROVED)).thenReturn(List.of(ok, choque, caida));
        lenient().when(rest.exchange(eq(PETS + "51/reserve?adoptanteId=7"), eq(HttpMethod.POST), any(HttpEntity.class), eq(Void.class))).thenThrow(conflict());
        lenient().when(rest.exchange(eq(PETS + "52/reserve?adoptanteId=7"), eq(HttpMethod.POST), any(HttpEntity.class), eq(Void.class)))
            .thenThrow(new ResourceAccessException("down"));

        Map<String, Object> body = (Map<String, Object>) controller.reconcileApproved().getBody();

        assertThat(body).containsEntry("attempted", 3).containsEntry("repaired", 1)
            .containsEntry("conflicts_reverted", 1).containsEntry("errors_reverted", 1);
        assertThat(ok.getEstado()).isEqualTo(EstadoSolicitud.APPROVED);
        assertThat(choque.getEstado()).isEqualTo(EstadoSolicitud.PENDING);
        assertThat(caida.getEstado()).isEqualTo(EstadoSolicitud.PENDING);
    }
}
