package com.example.adoptions_service.model;

import jakarta.persistence.*;
import java.util.Date;

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
