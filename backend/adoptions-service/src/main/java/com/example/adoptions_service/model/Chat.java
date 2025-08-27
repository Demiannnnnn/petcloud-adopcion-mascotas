package com.example.adoptions_service.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToMany
    private List<Perfil> participantes;

    @OneToMany(cascade = CascadeType.ALL)
    private List<Mensaje> mensajes;
}
