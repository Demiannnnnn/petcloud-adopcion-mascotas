package com.example.pets_service.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
public class HistorialClinico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Date fecha;
    private String descripcion;
    private String veterinario;
}
