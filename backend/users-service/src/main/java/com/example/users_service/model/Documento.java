package com.example.users_service.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
public class Documento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tipo;

    @Lob
    private byte[] archivo;

    private Date fechaSubida;

    @ManyToOne
    private Perfil perfil;
}
