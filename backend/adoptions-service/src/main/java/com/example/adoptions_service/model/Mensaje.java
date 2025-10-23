package com.example.adoptions_service.model;

import java.util.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Mensaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long remitenteId;

    private String contenido;
    private Date fecha;
    private boolean leido;
    private Long chatId;
    private String tipoMensaje;
    private String archivoUrl;
}
