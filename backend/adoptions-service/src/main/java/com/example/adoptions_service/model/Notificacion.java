package com.example.adoptions_service.model;

import java.util.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

@Entity
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String mensaje;
    private String tipo;
    private String titulo;
    @Temporal(TemporalType.TIMESTAMP)
    private Date fecha;
    private Boolean leida;
    private Long solicitudAdopcionId;
    private Long chatId;
    private Long destinatarioId;

}
