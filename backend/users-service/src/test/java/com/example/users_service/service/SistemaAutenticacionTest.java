package com.example.users_service.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCrypt;

import com.example.users_service.model.Empresa;
import com.example.users_service.model.Persona;
import com.example.users_service.repository.EmpresaRepository;
import com.example.users_service.repository.PersonaRepository;

@ExtendWith(MockitoExtension.class)
class SistemaAutenticacionTest {

    @Mock
    private PersonaRepository personaRepository;
    @Mock
    private EmpresaRepository empresaRepository;
    @InjectMocks
    private SistemaAutenticacion sistema;

    private static Persona persona(String rut, String clavePlana) {
        Persona p = new Persona();
        p.setRut(rut);
        p.setContraseña(BCrypt.hashpw(clavePlana, BCrypt.gensalt(4)));
        return p;
    }

    @Test
    void loginPersonaConClaveCorrectaDevuelvePersona() {
        Persona p = persona("11.111.111-1", "secreta");
        when(personaRepository.findByRut("11.111.111-1")).thenReturn(Optional.of(p));
        assertThat(sistema.loginPersona("11.111.111-1", "secreta")).isSameAs(p);
    }

    @Test
    void loginPersonaConClaveIncorrectaDevuelveNull() {
        when(personaRepository.findByRut("11.111.111-1")).thenReturn(Optional.of(persona("11.111.111-1", "secreta")));
        assertThat(sistema.loginPersona("11.111.111-1", "otra")).isNull();
    }

    @Test
    void loginPersonaInexistenteDevuelveNull() {
        when(personaRepository.findByRut("x")).thenReturn(Optional.empty());
        assertThat(sistema.loginPersona("x", "y")).isNull();
    }

    @Test
    void loginPersonaConContrasenaEnTextoPlanoDevuelveNull() {
        Persona p = new Persona();
        p.setRut("11.111.111-1");
        p.setContraseña("claveEnTextoPlano");
        when(personaRepository.findByRut("11.111.111-1")).thenReturn(Optional.of(p));
        assertThat(sistema.loginPersona("11.111.111-1", "claveEnTextoPlano")).isNull();
    }

    @Test
    void loginPersonaConContrasenaNulaDevuelveNull() {
        Persona p = new Persona();
        p.setRut("11.111.111-1");
        p.setContraseña(null);
        when(personaRepository.findByRut("11.111.111-1")).thenReturn(Optional.of(p));
        assertThat(sistema.loginPersona("11.111.111-1", "clave")).isNull();
    }

    @Test
    void loginEmpresaConContrasenaEnTextoPlanoDevuelveNull() {
        Empresa e = new Empresa();
        e.setRutEmpresa("76.086.428-5");
        e.setContraseña("claveEnTextoPlano");
        when(empresaRepository.findByRutEmpresa("76.086.428-5")).thenReturn(Optional.of(e));
        assertThat(sistema.loginEmpresa("76.086.428-5", "claveEnTextoPlano")).isNull();
    }

    @Test
    void loginEmpresaVerificaHashBcrypt() {
        Empresa e = new Empresa();
        e.setRutEmpresa("76.086.428-5");
        e.setContraseña(BCrypt.hashpw("clave", BCrypt.gensalt(4)));
        when(empresaRepository.findByRutEmpresa("76.086.428-5")).thenReturn(Optional.of(e));
        assertThat(sistema.loginEmpresa("76.086.428-5", "clave")).isSameAs(e);
        assertThat(sistema.loginEmpresa("76.086.428-5", "mala")).isNull();
    }

    @Test
    void existenciaPorRut() {
        when(personaRepository.findByRut("1")).thenReturn(Optional.of(new Persona()));
        when(empresaRepository.findByRutEmpresa("1")).thenReturn(Optional.empty());
        assertThat(sistema.personaExiste("1")).isTrue();
        assertThat(sistema.empresaExiste("1")).isFalse();
    }

    @Test
    void getPerfilByIdBuscaPrimeroPersonaLuegoEmpresa() {
        Persona p = new Persona();
        when(personaRepository.findById(1L)).thenReturn(Optional.of(p));
        assertThat(sistema.getPerfilById(1L)).isSameAs(p);
        verify(empresaRepository, never()).findById(1L);

        Empresa e = new Empresa();
        when(personaRepository.findById(2L)).thenReturn(Optional.empty());
        when(empresaRepository.findById(2L)).thenReturn(Optional.of(e));
        assertThat(sistema.getPerfilById(2L)).isSameAs(e);

        when(personaRepository.findById(3L)).thenReturn(Optional.empty());
        when(empresaRepository.findById(3L)).thenReturn(Optional.empty());
        assertThat(sistema.getPerfilById(3L)).isNull();
    }
}
