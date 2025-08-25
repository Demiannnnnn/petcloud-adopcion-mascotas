package com.adopcion.model.filtrodebusqueda;

public class FiltroDeBusqueda {
    private String especie;
    private int edadMinima;
    private int edadMaxima;
    private String genero;

    // Constructor
    public FiltroDeBusqueda(String especie, int edadMinima, int edadMaxima, String genero) {
        this.especie = especie;
        this.edadMinima = edadMinima;
        this.edadMaxima = edadMaxima;
        this.genero = genero;
    }

    // Getters y Setters
    public String getEspecie() {
        return especie;
    }

    public void setEspecie(String especie) {
        this.especie = especie;
    }

    public int getEdadMinima() {
        return edadMinima;
    }

    public void setEdadMinima(int edadMinima) {
        this.edadMinima = edadMinima;
    }

    public int getEdadMaxima() {
        return edadMaxima;
    }

    public void setEdadMaxima(int edadMaxima) {
        this.edadMaxima = edadMaxima;
    }

    public String getGenero() {
        return genero;
    }

    public void setGenero(String genero) {
        this.genero = genero;
    }
}
