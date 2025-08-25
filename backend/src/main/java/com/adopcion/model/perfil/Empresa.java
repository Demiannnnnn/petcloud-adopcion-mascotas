package com.adopcion.model.perfil;

import com.adopcion.model.documento.Documento;
import com.adopcion.model.filtrodebusqueda.FiltroDeBusqueda;
import com.adopcion.model.mascota.Mascota;
import java.util.List;

public class Empresa extends Perfil {
    private String nombreEmpresa;
    private Documento certificadoLegal;
    private boolean verificado;

    @Override
    public void actualizarDocumentos(Documento d) {
        // Implementación específica para Empresa
    }

    @Override
    public void registrarMascota(Mascota m) {
        // Implementación específica para Empresa
    }

    @Override
    public List<Mascota> buscarMascota(FiltroDeBusqueda filtro) {
        // Implementación específica para Empresa
        return null;
    }

    public String getNombreEmpresa() {
        return nombreEmpresa;
    }

    public void setNombreEmpresa(String nombreEmpresa) {
        this.nombreEmpresa = nombreEmpresa;
    }

    public Documento getCertificadoLegal() {
        return certificadoLegal;
    }

    public void setCertificadoLegal(Documento certificadoLegal) {
        this.certificadoLegal = certificadoLegal;
    }

    public boolean isVerificado() {
        return verificado;
    }

    public void setVerificado(boolean verificado) {
        this.verificado = verificado;
    }

    // Getters y setters
}
