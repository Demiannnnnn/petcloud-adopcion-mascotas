package com.adopcion.config;

import com.adopcion.model.perfil.Persona;
import com.adopcion.repository.PerfilRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AdminProfileInitializer {
    @Bean
    public CommandLineRunner createAdminProfile(PerfilRepository perfilRepository) {
        return args -> {
            if (perfilRepository.findByUsername("admin") == null) {
                Persona admin = new Persona();
                admin.setUsername("admin");
                admin.setCorreo("admin@admin.com");
                admin.setContrasena("admin");
                admin.setNombreCompleto("Administrador");
                admin.setUbicacion("");
                admin.setNumeroWhatsapp("");
                perfilRepository.save(admin);
                System.out.println("Perfil admin creado automáticamente.");
            }
        };
    }
}
