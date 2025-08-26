package com.adopcion.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Expone la carpeta /uploads para que los archivos sean accesibles vía HTTP
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}
