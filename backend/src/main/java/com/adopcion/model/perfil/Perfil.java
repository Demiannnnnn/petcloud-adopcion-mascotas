
package com.adopcion.model.perfil;

import java.util.List;
import com.adopcion.model.documento.Documento;
import com.adopcion.model.mascota.Mascota;
import com.adopcion.model.filtrodebusqueda.FiltroDeBusqueda;

import jakarta.persistence.*;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Perfil {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    protected Long id;
	protected String rut;
	protected String correo;
	protected String contrasena;
    protected String username;
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    protected List<Documento> documentosLegales;
	protected String condicionesHogar;

	//public abstract void actualizarDocumentos(Documento d);
	public abstract void registrarMascota(Mascota m);
	public abstract List<Mascota> buscarMascota(FiltroDeBusqueda filtro);

    public void actualizarDocumentos(com.adopcion.model.documento.Documento d) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'actualizarDocumentos'");
    }

    // Getters y setters
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getRut() {
        return rut;
    }
    public void setRut(String rut) {
        this.rut = rut;
    }
    public String getCorreo() {
        return correo;
    }
    public void setCorreo(String correo) {
        this.correo = correo;
    }
    public String getContrasena() {
        return contrasena;
    }
    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }
    public List<Documento> getDocumentosLegales() {
        return documentosLegales;
    }
    public void setDocumentosLegales(List<Documento> documentosLegales) {
        this.documentosLegales = documentosLegales;
    }
    public String getCondicionesHogar() {
        return condicionesHogar;
    }
    public void setCondicionesHogar(String condicionesHogar) {
        this.condicionesHogar = condicionesHogar;
    }
    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }
}
