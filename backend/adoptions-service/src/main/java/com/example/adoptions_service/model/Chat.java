package com.example.adoptions_service.model;

import java.util.Date;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

@Entity
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private java.util.List<Long> participantes;

    @OneToMany(cascade = CascadeType.ALL)
    private List<Mensaje> mensajes;

    private Long solicitudAdopcionId;

    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaCreacion;

    private Boolean activo;
}
