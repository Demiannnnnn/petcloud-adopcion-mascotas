package com.example.donations_service.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class CampanaDonacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long organizadorId;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(nullable = false)
    private String descripcion;

    private BigDecimal metaMonetaria;
    private BigDecimal montoRecaudado = BigDecimal.ZERO;

    @Column(nullable = false)
    private LocalDate fechaInicio;

    @Column(nullable = false)
    private LocalDate fechaFin;

    private Boolean activa = true;
    private String imagenUrl;
    private String causa;

    // Getters y setters
    // ...
}
