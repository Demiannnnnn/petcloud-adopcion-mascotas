package com.adopcion.model.mascota;

import com.adopcion.model.perfil.Perfil;
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
    private String tipo;
    private String sexo;
    private String ubicacion;
    private String descripcion;
    private boolean adoptado;

    @ManyToOne
    @JoinColumn(name = "perfil_id") // referencia al dueño
    private Perfil perfil;

    @OneToMany(mappedBy = "mascota", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Foto> fotos;

    @OneToMany(mappedBy = "mascota", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Video> videos;

    @OneToMany(mappedBy = "mascota", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HistorialClinico> historialClinico;

    // Lógica de negocio
    public boolean esAptaParaAdopcion() {
        // ejemplo: verificar que no esté ya adoptada
        return true;
    }

    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getEspecie() { return especie; }
    public void setEspecie(String especie) { this.especie = especie; }

    public String getRaza() { return raza; }
    public void setRaza(String raza) { this.raza = raza; }

    public int getEdad() { return edad; }
    public void setEdad(int edad) { this.edad = edad; }

    public String getSexo() { return sexo; }
    public void setSexo(String sexo) { this.sexo = sexo; }

    public String getUbicacion() { return ubicacion; }
    public void setUbicacion(String ubicacion) { this.ubicacion = ubicacion; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Perfil getPerfil() { return perfil; }
    public void setPerfil(Perfil perfil) { this.perfil = perfil; }

    public List<Foto> getFotos() { return fotos; }
    public void setFotos(List<Foto> fotos) { this.fotos = fotos; }

    public List<Video> getVideos() { return videos; }
    public void setVideos(List<Video> videos) { this.videos = videos; }

    public List<HistorialClinico> getHistorialClinico() { return historialClinico; }
    public void setHistorialClinico(List<HistorialClinico> historialClinico) { this.historialClinico = historialClinico; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public boolean isAdoptado() { return adoptado; }
    public void setAdoptado(boolean adoptado) { this.adoptado = adoptado; }
}
