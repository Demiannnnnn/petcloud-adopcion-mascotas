package com.example.pets_service.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Mascota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String especie;
    private String raza;
    private int edad;
    private String sexo;
    private String ubicacion;
    private String descripcion;

    @OneToMany(cascade = CascadeType.ALL)
    private List<HistorialClinico> historialClinico;

    @OneToMany(cascade = CascadeType.ALL)
    private List<Vacuna> vacunas;

    public boolean esAptaParaAdopcion() {
        return historialClinico != null && !historialClinico.isEmpty();
    }
}
