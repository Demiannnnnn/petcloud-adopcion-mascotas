package com.example.pets_service.dto;

import java.sql.Timestamp;

public class PublicMascotaDTO {
    public Long id;
    public Long propietarioId;
    public Long refugioId;
    public String nombre;
    public String especie;
    public String raza;
    public Integer edad;
    public Integer edadYears;
    public Integer edadMonths;
    public String fechaNacimiento; // ISO yyyy-MM-dd
    public String sexo;
    public String ubicacion;
    public String descripcion;
    public Boolean disponibleAdopcion;
    public Timestamp fechaRegistro;
    public String imagenUrl;
    public java.util.List<java.util.Map<String,String>> media;
    public String publicadoPorName; // nuevo campo
}
