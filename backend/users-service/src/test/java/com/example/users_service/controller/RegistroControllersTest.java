package com.example.users_service.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.bcrypt.BCrypt;

import com.example.users_service.model.Documento;
import com.example.users_service.model.Empresa;
import com.example.users_service.model.Persona;
import com.example.users_service.repository.DocumentoRepository;
import com.example.users_service.repository.EmpresaRepository;
import com.example.users_service.repository.PerfilRepository;
import com.example.users_service.repository.PersonaRepository;

class RegistroControllersTest {

    @Nested
    @ExtendWith(MockitoExtension.class)
    class RegistroPersona {
        @Mock
        PersonaRepository repo;
        @InjectMocks
        PersonaController controller;

        Persona nueva() {
            Persona p = new Persona();
            p.setRut("11.111.111-1");
            p.setCorreo("ana@mail.cl");
            p.setNumeroWhatsapp("+56900000000");
            p.setContraseña("clave-plana");
            return p;
        }

        @Test
        void registroExitosoGuardaContrasenaHasheada() {
            when(repo.findByRut(any())).thenReturn(Optional.empty());
            when(repo.findByCorreo(any())).thenReturn(Optional.empty());
            when(repo.findByNumeroWhatsapp(any())).thenReturn(Optional.empty());
            PersonaController.RespuestaRegistro r = (PersonaController.RespuestaRegistro) controller.registrarPersona(nueva());
            assertThat(r.success).isTrue();
            ArgumentCaptor<Persona> captor = ArgumentCaptor.forClass(Persona.class);
            verify(repo).save(captor.capture());
            String guardada = captor.getValue().getContraseña();
            assertThat(guardada).isNotEqualTo("clave-plana");
            assertThat(BCrypt.checkpw("clave-plana", guardada)).isTrue();
        }

        @Test
        void rutDuplicadoNoGuarda() {
            when(repo.findByRut("11.111.111-1")).thenReturn(Optional.of(new Persona()));
            PersonaController.RespuestaRegistro r = (PersonaController.RespuestaRegistro) controller.registrarPersona(nueva());
            assertThat(r.success).isFalse();
            assertThat(r.message).contains("RUT");
            verify(repo, never()).save(any());
        }

        @Test
        void correoYWhatsappDuplicados() {
            when(repo.findByRut(any())).thenReturn(Optional.empty());
            when(repo.findByCorreo("ana@mail.cl")).thenReturn(Optional.of(new Persona()));
            assertThat(((PersonaController.RespuestaRegistro) controller.registrarPersona(nueva())).message).contains("correo");

            when(repo.findByCorreo("ana@mail.cl")).thenReturn(Optional.empty());
            when(repo.findByNumeroWhatsapp("+56900000000")).thenReturn(Optional.of(new Persona()));
            assertThat(((PersonaController.RespuestaRegistro) controller.registrarPersona(nueva())).message).contains("WhatsApp");
            verify(repo, never()).save(any());
        }
    }

    @Nested
    @ExtendWith(MockitoExtension.class)
    class RegistroEmpresa {
        @Mock
        EmpresaRepository empresaRepository;
        @Mock
        PerfilRepository perfilRepository;
        @Mock
        DocumentoRepository documentoRepository;
        @InjectMocks
        EmpresaController controller;

        Object registrar(MockMultipartFile cert) {
            return controller.registrarEmpresa("Refugio", "76.086.428-5", "r@mail.cl", "clave", "Calle 1", "+569", "Santiago", cert);
        }

        @Test
        void registroExitosoCreaEmpresaActivaYGuardaCertificado() {
            when(empresaRepository.findByRutEmpresa(any())).thenReturn(Optional.empty());
            when(perfilRepository.findByRut(any())).thenReturn(Optional.empty());
            when(perfilRepository.findByCorreo(any())).thenReturn(Optional.empty());
            when(empresaRepository.save(any(Empresa.class))).thenAnswer(i -> i.getArgument(0));

            MockMultipartFile cert = new MockMultipartFile("certificadoLegal", "cert.pdf", "application/pdf", new byte[] {1, 2, 3});
            EmpresaController.RespuestaRegistro r = (EmpresaController.RespuestaRegistro) registrar(cert);

            assertThat(r.success).isTrue();
            ArgumentCaptor<Empresa> emp = ArgumentCaptor.forClass(Empresa.class);
            verify(empresaRepository).save(emp.capture());
            assertThat(emp.getValue().getTipoPerfil()).isEqualTo("EMPRESA");
            assertThat(emp.getValue().getActivo()).isTrue();
            assertThat(BCrypt.checkpw("clave", emp.getValue().getContraseña())).isTrue();

            ArgumentCaptor<Documento> doc = ArgumentCaptor.forClass(Documento.class);
            verify(documentoRepository).save(doc.capture());
            assertThat(doc.getValue().getTipo()).isEqualTo("certificadoLegal");
            assertThat(doc.getValue().getNombreArchivo()).isEqualTo("cert.pdf");
        }

        @Test
        void certificadoVacioNoSeGuarda() {
            when(empresaRepository.findByRutEmpresa(any())).thenReturn(Optional.empty());
            when(perfilRepository.findByRut(any())).thenReturn(Optional.empty());
            when(perfilRepository.findByCorreo(any())).thenReturn(Optional.empty());
            when(empresaRepository.save(any(Empresa.class))).thenAnswer(i -> i.getArgument(0));
            registrar(new MockMultipartFile("certificadoLegal", new byte[0]));
            verify(documentoRepository, never()).save(any());
        }

        @Test
        void rutYaUsadoPorOtroPerfilNoRegistra() {
            when(empresaRepository.findByRutEmpresa(any())).thenReturn(Optional.empty());
            when(perfilRepository.findByRut("76.086.428-5")).thenReturn(Optional.of(new Persona()));
            EmpresaController.RespuestaRegistro r = (EmpresaController.RespuestaRegistro) registrar(null);
            assertThat(r.success).isFalse();
            verify(empresaRepository, never()).save(any());
        }

        @Test
        void correoDuplicadoNoRegistra() {
            when(empresaRepository.findByRutEmpresa(any())).thenReturn(Optional.empty());
            when(perfilRepository.findByRut(any())).thenReturn(Optional.empty());
            when(perfilRepository.findByCorreo("r@mail.cl")).thenReturn(Optional.of(new Persona()));
            assertThat(((EmpresaController.RespuestaRegistro) registrar(null)).message).contains("correo");
        }
    }
}
