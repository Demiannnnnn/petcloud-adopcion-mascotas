package com.example.users_service.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Perfil {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String rut;
    private String correo;
    private String contraseña;
    private String condicionesHogar;

    @OneToMany(mappedBy = "perfil", cascade = CascadeType.ALL)
    private List<Documento> documentosLegales;

    // Métodos
    public abstract void actualizarDocumentos(Documento d);
    public abstract void registrarMascota(Long mascotaId); // solo referencia
}
