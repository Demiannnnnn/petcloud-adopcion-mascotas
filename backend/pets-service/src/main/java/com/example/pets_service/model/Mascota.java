package com.example.pets_service.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Mascota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long propietarioId;
    private Long refugioId; // null si es persona
    public Long getRefugioId() { return refugioId; }
    public void setRefugioId(Long refugioId) { this.refugioId = refugioId; }
    
    // Getter y setter para id (usado por JPA y para evitar advertencias de análisis estático)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    private String nombre;
    private String especie;
    private String raza;
    private Integer edad;
    private String sexo;
    private String ubicacion;
    private String descripcion;
    private Boolean disponibleAdopcion;
    private Long adoptanteId; // Id del usuario que adoptó (si aplica)
    private java.sql.Timestamp fechaRegistro;
    private java.time.LocalDate fechaNacimiento;
    private String imagenUrl;
    private String mediaJson; // JSON array with additional media items [{"url":"/uploads/..","type":"image/jpeg"}, ...]
    private java.math.BigDecimal peso;
    private Boolean esterilizado;


        // Nuevos campos para guardar todo lo que envía el frontend
        private String chip;
        private String documentos; // Guardar como texto plano (puedes cambiar a lista si lo necesitas)
        private String enfermedades; // Guardar como texto plano (puedes cambiar a lista si lo necesitas)
        private String vacunas; // Guardar como texto plano (puedes cambiar a lista si lo necesitas)

    public boolean esAptaParaAdopcion() {
        return true;
    }
    public String getChip() { return chip; }
    public void setChip(String chip) { this.chip = chip; }
    public String getDocumentos() { return documentos; }
    public void setDocumentos(String documentos) { this.documentos = documentos; }
    public String getEnfermedades() { return enfermedades; }
    public void setEnfermedades(String enfermedades) { this.enfermedades = enfermedades; }
    public String getVacunas() { return vacunas; }
    public void setVacunas(String vacunas) { this.vacunas = vacunas; }

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

    public Long getAdoptanteId() { return adoptanteId; }
    public void setAdoptanteId(Long adoptanteId) { this.adoptanteId = adoptanteId; }

    public java.sql.Timestamp getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(java.sql.Timestamp fechaRegistro) { this.fechaRegistro = fechaRegistro; }

    public java.time.LocalDate getFechaNacimiento() { return fechaNacimiento; }
    public void setFechaNacimiento(java.time.LocalDate fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; }

    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }

    public java.math.BigDecimal getPeso() { return peso; }
    public void setPeso(java.math.BigDecimal peso) { this.peso = peso; }

    public Boolean getEsterilizado() { return esterilizado; }
    public void setEsterilizado(Boolean esterilizado) { this.esterilizado = esterilizado; }

    public String getMediaJson() { return mediaJson; }
    public void setMediaJson(String mediaJson) { this.mediaJson = mediaJson; }
}
