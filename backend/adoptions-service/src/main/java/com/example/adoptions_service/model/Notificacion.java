package com.example.adoptions_service.model;

import jakarta.persistence.*;
import java.util.Date;

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
