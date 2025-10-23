package com.example.pets_service.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + System.getProperty("user.dir") + "/uploads/");
    // Proxy endpoint for media to avoid adblocker patterns like '/uploads/' being blocked on some clients
    registry.addResourceHandler("/api/media/**")
        .addResourceLocations("file:" + System.getProperty("user.dir") + "/uploads/");
    }
}
