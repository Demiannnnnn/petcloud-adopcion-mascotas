package com.example.donations_service.model;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Donacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long donanteId;

    private Long receptorId;

    @Column(nullable = false, length = 20)
    private String tipoDonacion;

    private String descripcion;
    private BigDecimal monto;
    private Integer cantidad;
    private String unidad;
    private Timestamp fechaDonacion;
    private String estado;
    private String metodoPago;
    private String comprobanteUrl;
    private String direccionEntrega;
    private LocalDate fechaEntrega;
    private String comentarios;

    // Getters y setters
    // ...
}
