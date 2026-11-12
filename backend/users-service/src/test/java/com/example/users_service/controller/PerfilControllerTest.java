package com.example.users_service.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.test.util.ReflectionTestUtils;

import com.example.users_service.model.Empresa;
import com.example.users_service.model.Persona;
import com.example.users_service.repository.EmpresaRepository;
import com.example.users_service.repository.PersonaRepository;
import com.example.users_service.service.SistemaAutenticacion;

@ExtendWith(MockitoExtension.class)
class PerfilControllerTest {

    @Mock
    private SistemaAutenticacion auth;
    @Mock
    private PersonaRepository personaRepository;
    @Mock
    private EmpresaRepository empresaRepository;

    private PerfilController controller;

    @BeforeEach
    void setUp() {
        controller = new PerfilController(auth);
        ReflectionTestUtils.setField(controller, "personaRepository", personaRepository);
        ReflectionTestUtils.setField(controller, "empresaRepository", empresaRepository);
    }

    private static PerfilController.LoginRequest req(String rut, String clave, String tipo) {
        PerfilController.LoginRequest r = new PerfilController.LoginRequest();
        r.setRut(rut);
        r.setContraseña(clave);
        r.setTipoPerfil(tipo);
        return r;
    }

    private static Persona persona(Long id) {
        Persona p = new Persona();
        ReflectionTestUtils.setField(p, "id", id);
        p.setTipoPerfil("PERSONA");
        p.setRut("11.111.111-1");
        p.setNombreCompleto("Ana Pérez");
        p.setContraseña(BCrypt.hashpw("actual", BCrypt.gensalt(4)));
        return p;
    }

    @Test
    void loginPersonaExitosoDevuelvePerfilSinContrasena() {
        when(auth.loginPersona("1", "x")).thenReturn(persona(7L));
        PerfilController.LoginResponse res = (PerfilController.LoginResponse) controller.login(req("1", "x", "PERSONA"));
        assertThat(res.success).isTrue();
        assertThat(res.perfil.id).isEqualTo(7L);
        assertThat(res.perfil.nombreCompleto).isEqualTo("Ana Pérez");
    }

    @Test
    void loginPersonaConRutDeEmpresaIndicaTipoIncorrecto() {
        when(auth.loginPersona("1", "x")).thenReturn(null);
        when(auth.loginEmpresa("1", "x")).thenReturn(null);
        when(auth.empresaExiste("1")).thenReturn(true);
        PerfilController.LoginResponse res = (PerfilController.LoginResponse) controller.login(req("1", "x", null));
        assertThat(res.success).isFalse();
        assertThat(res.message).contains("corresponde a una empresa");
    }

    @Test
    void loginEmpresaConCredencialesInvalidas() {
        when(auth.loginEmpresa("1", "x")).thenReturn(null);
        when(auth.loginPersona("1", "x")).thenReturn(null);
        when(auth.personaExiste("1")).thenReturn(false);
        PerfilController.LoginResponse res = (PerfilController.LoginResponse) controller.login(req("1", "x", "empresa"));
        assertThat(res.success).isFalse();
        assertThat(res.message).isEqualTo("Credenciales inválidas para empresa");
    }

    @Test
    void loginEmpresaConRutDePersonaIndicaTipoIncorrecto() {
        when(auth.loginEmpresa("1", "x")).thenReturn(null);
        when(auth.loginPersona("1", "x")).thenReturn(persona(1L));
        PerfilController.LoginResponse res = (PerfilController.LoginResponse) controller.login(req("1", "x", "EMPRESA"));
        assertThat(res.message).contains("corresponde a una persona");
    }

    @Test
    void getPerfilInexistenteDevuelve404() {
        when(auth.getPerfilById(9L)).thenReturn(null);
        assertThat(controller.getPerfilById(9L).getStatusCode().value()).isEqualTo(404);
    }

    @Test
    void getPerfilEmpresaMapeaCamposDeEmpresa() {
        Empresa e = new Empresa();
        e.setNombreEmpresa("Refugio Patitas");
        e.setRutEmpresa("76.086.428-5");
        e.setVerificado(true);
        when(auth.getPerfilById(2L)).thenReturn(e);
        ResponseEntity<?> res = controller.getPerfilById(2L);
        PerfilController.PerfilDTO dto = (PerfilController.PerfilDTO) res.getBody();
        assertThat(dto.nombreEmpresa).isEqualTo("Refugio Patitas");
        assertThat(dto.verificado).isTrue();
        assertThat(dto.nombreCompleto).isNull();
    }

    @Test
    void updatePerfilPersonaSoloCambiaCamposEnviados() {
        Persona p = persona(1L);
        p.setUbicacion("Santiago");
        when(auth.getPerfilById(1L)).thenReturn(p);
        when(personaRepository.save(any(Persona.class))).thenAnswer(i -> i.getArgument(0));
        PerfilController.PerfilDTO dto = new PerfilController.PerfilDTO();
        dto.numeroWhatsapp = "+56911111111";
        ResponseEntity<?> res = controller.updatePerfil(1L, dto);
        assertThat(res.getStatusCode().value()).isEqualTo(200);
        assertThat(p.getNumeroWhatsapp()).isEqualTo("+56911111111");
        assertThat(p.getUbicacion()).isEqualTo("Santiago");
        assertThat(p.getNombreCompleto()).isEqualTo("Ana Pérez");
    }

    @Test
    void changePasswordConClaveActualCorrectaGuardaNuevoHash() {
        Persona p = persona(1L);
        when(auth.getPerfilById(1L)).thenReturn(p);
        PerfilController.ChangePasswordRequest r = new PerfilController.ChangePasswordRequest();
        r.currentPassword = "actual";
        r.newPassword = "nueva123";
        assertThat(controller.changePassword(1L, r).getStatusCode().value()).isEqualTo(200);
        ArgumentCaptor<Persona> captor = ArgumentCaptor.forClass(Persona.class);
        verify(personaRepository).save(captor.capture());
        assertThat(BCrypt.checkpw("nueva123", captor.getValue().getContraseña())).isTrue();
    }

    @Test
    void changePasswordConClaveActualIncorrectaDevuelve403() {
        when(auth.getPerfilById(1L)).thenReturn(persona(1L));
        PerfilController.ChangePasswordRequest r = new PerfilController.ChangePasswordRequest();
        r.currentPassword = "otra";
        r.newPassword = "nueva123";
        assertThat(controller.changePassword(1L, r).getStatusCode().value()).isEqualTo(403);
        verify(personaRepository, never()).save(any());
    }

    @Test
    void changePasswordConPayloadIncompletoDevuelve400() {
        when(auth.getPerfilById(1L)).thenReturn(persona(1L));
        assertThat(controller.changePassword(1L, new PerfilController.ChangePasswordRequest()).getStatusCode().value()).isEqualTo(400);
    }
}
