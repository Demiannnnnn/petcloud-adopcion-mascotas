package com.example.pets_service.model;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
public class Mascota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long propietarioId;
    private String nombre;
    private String especie;
    private String raza;
    private Integer edad;
    private String sexo;
    private String ubicacion;
    private String descripcion;
    private Boolean disponibleAdopcion;
    private java.sql.Timestamp fechaRegistro;
    private String imagenUrl;
    private java.math.BigDecimal peso;
    private Boolean esterilizado;

    @OneToMany(cascade = CascadeType.ALL)
    private List<HistorialClinico> historialClinico;

    @OneToMany(cascade = CascadeType.ALL)
    private List<Vacuna> vacunas;

    public boolean esAptaParaAdopcion() {
        return historialClinico != null && !historialClinico.isEmpty();
    }

    public Long getPropietarioId() { return propietarioId; }
    public void setPropietarioId(Long propietarioId) { this.propietarioId = propietarioId; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getEspecie() { return especie; }
    public void setEspecie(String especie) { this.especie = especie; }

    public String getRaza() { return raza; }
    public void setRaza(String raza) { this.raza = raza; }

    public Integer getEdad() { return edad; }
    public void setEdad(Integer edad) { this.edad = edad; }

    public String getSexo() { return sexo; }
    public void setSexo(String sexo) { this.sexo = sexo; }

    public String getUbicacion() { return ubicacion; }
    public void setUbicacion(String ubicacion) { this.ubicacion = ubicacion; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Boolean getDisponibleAdopcion() { return disponibleAdopcion; }
    public void setDisponibleAdopcion(Boolean disponibleAdopcion) { this.disponibleAdopcion = disponibleAdopcion; }

    public java.sql.Timestamp getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(java.sql.Timestamp fechaRegistro) { this.fechaRegistro = fechaRegistro; }

    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }

    public java.math.BigDecimal getPeso() { return peso; }
    public void setPeso(java.math.BigDecimal peso) { this.peso = peso; }

    public Boolean getEsterilizado() { return esterilizado; }
    public void setEsterilizado(Boolean esterilizado) { this.esterilizado = esterilizado; }
}
