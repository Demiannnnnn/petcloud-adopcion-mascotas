package com.adopcion.model.seguimiento;

import java.util.Date;
import java.util.List;
import com.adopcion.model.mascota.Mascota;
import com.adopcion.model.perfil.Perfil;
import com.adopcion.model.mascota.Foto;

public class SeguimientoPostAdopcion {
    private Long id;
    private Mascota mascota;
    private Perfil adoptante;
    private List<Foto> fotosSeguimiento;
    private String reporte;
    private Date fecha;
    // Getters y setters
}
