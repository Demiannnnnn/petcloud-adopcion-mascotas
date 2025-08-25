package com.adopcion.model.documento;

public class Documento {
    private String id;
    private String nombre;
    private String rutaArchivo;

    // Constructor
    public Documento(String id, String nombre, String rutaArchivo) {
        this.id = id;
        this.nombre = nombre;
        this.rutaArchivo = rutaArchivo;
    }

    // Getters y Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getRutaArchivo() {
        return rutaArchivo;
    }

    public void setRutaArchivo(String rutaArchivo) {
        this.rutaArchivo = rutaArchivo;
    }
}
