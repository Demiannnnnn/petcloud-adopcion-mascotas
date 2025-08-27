package com.example.pets_service.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
public class Vacuna {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private Date fechaAplicacion;
    private Date proximaDosis;
}
