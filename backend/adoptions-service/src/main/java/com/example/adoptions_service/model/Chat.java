package com.example.adoptions_service.model;

import jakarta.persistence.*;
import java.util.Date;
import java.util.List;

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
