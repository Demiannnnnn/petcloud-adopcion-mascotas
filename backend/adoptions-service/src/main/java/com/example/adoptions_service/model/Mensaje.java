package com.example.adoptions_service.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
public class Mensaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Perfil remitente;

    private String contenido;
    private Date fecha;
    private boolean leido;
}
