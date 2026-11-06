package com.example.pets_service.controller;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

import com.example.pets_service.service.MascotaService;

class MascotaControllerUploadTest {

    @TempDir
    Path tmp;
    private String userDirOriginal;
    private MascotaController controller;

    @BeforeEach
    void setUp() throws Exception {
        userDirOriginal = System.getProperty("user.dir");
        Path base = tmp.resolve("app");
        Files.createDirectories(base.resolve("uploads"));
        System.setProperty("user.dir", base.toString());
        controller = new MascotaController(Mockito.mock(MascotaService.class));
    }

    @AfterEach
    void tearDown() {
        System.setProperty("user.dir", userDirOriginal);
    }

    @Test
    void subeArchivoDentroDeUploads() {
        ResponseEntity<String> res = controller.uploadImage(new MockMultipartFile("file", "Tom.JPG", "image/jpeg", new byte[] {1}));
        assertThat(res.getBody()).isEqualTo("/uploads/Tom.JPG");
        assertThat(tmp.resolve("app/uploads/Tom.JPG")).exists();
    }

    @Test
    void nombreConRutaRelativaNoEscapaDeUploads() {
        ResponseEntity<String> res = controller.uploadImage(new MockMultipartFile("file", "../../evil.jpg", "image/jpeg", new byte[] {1}));
        assertThat(res.getBody()).isEqualTo("/uploads/evil.jpg");
        assertThat(tmp.resolve("evil.jpg")).doesNotExist();
        assertThat(tmp.resolve("app/uploads/evil.jpg")).exists();
    }

    @Test
    void nombreVacioOPuntosSeRechaza() {
        assertThat(controller.uploadImage(new MockMultipartFile("file", "..", "image/jpeg", new byte[] {1})).getStatusCode().value()).isEqualTo(400);
        assertThat(controller.uploadImage(new MockMultipartFile("file", "dir/", "image/jpeg", new byte[] {1})).getStatusCode().value()).isEqualTo(400);
    }
}
